import { BadRequestException, HttpException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { EQUIPMENT_STATUS, ITEM_ID_PREFIX, ITEM_TYPE, SUPPLY_STATUS, type ItemType } from "../constants/inventory.js";
import { CreateEquipmentSupplyDto, UpdateEquipmentSupplyDto } from "./dto/equipmentSupply.dto.js";

interface RawInventoryRow {
    id: bigint | number | string;
    code: string;
    item_name: string;
    category_name: string;
    unit_name: string;
    quantity_on_hand: number;
    reorder_threshold: number;
    item_status: string;
    updated_at: Date | string | null;
    item_type: string;
}

@Injectable()
export class EquipmentSuppliesService {
    private readonly logger = new Logger(EquipmentSuppliesService.name);

    constructor(private readonly prisma: PrismaService) {}

    private map(row: RawInventoryRow) {
        const prefix = row.item_type === ITEM_TYPE.EQUIPMENT ? ITEM_ID_PREFIX.EQUIPMENT : ITEM_ID_PREFIX.SUPPLY;
        return {
            id: `${prefix}-${row.id.toString()}`,
            code: row.code,
            name: row.item_name,
            category: row.category_name,
            unit: row.unit_name,
            quantityOnHand: Number(row.quantity_on_hand),
            reorderThreshold: Number(row.reorder_threshold),
            status: row.item_status,
            itemType: row.item_type,
            lastUpdatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
        };
    }

    private parseId(rawId: string): { itemType: ItemType; id: bigint } {
        const [prefix, numericId] = rawId.split("-");
        const isEquipment = prefix === ITEM_ID_PREFIX.EQUIPMENT;
        const isSupply = prefix === ITEM_ID_PREFIX.SUPPLY;
        if (!numericId || !/^\d+$/.test(numericId) || (!isEquipment && !isSupply)) {
            throw new NotFoundException("Inventory item not found");
        }
        return { itemType: isEquipment ? ITEM_TYPE.EQUIPMENT : ITEM_TYPE.SUPPLY, id: BigInt(numericId) };
    }

    // Status values must match the CHECK constraint of the table for the item type.
    private assertStatusForType(itemType: ItemType, status: string) {
        const allowed: string[] = itemType === ITEM_TYPE.EQUIPMENT ? Object.values(EQUIPMENT_STATUS) : Object.values(SUPPLY_STATUS);
        if (!allowed.includes(status)) {
            throw new BadRequestException(`status must be one of ${allowed.join(", ")} for ${itemType.toLowerCase()} items`);
        }
    }

    // Convert raw-query failures into a 400 instead of leaking a 500 to the client.
    private rethrowAsHttpError(error: unknown): never {
        if (error instanceof HttpException) throw error;
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            this.logger.error(`Inventory raw query failed (${error.code}): ${error.message}`);
            throw new BadRequestException("The inventory request could not be processed. Please verify the submitted data.");
        }
        throw error instanceof Error ? error : new Error(String(error));
    }

    // Shared SELECT fragments so list/detail queries stay in one place.
    private selectEquipmentSql(where: Prisma.Sql): Prisma.Sql {
        return Prisma.sql`
            SELECT d.id, d.asset_tag AS code, d.item_name, c.category_name, 'asset' AS unit_name,
                   1 AS quantity_on_hand, 0 AS reorder_threshold, d.status AS item_status,
                   d.updated_at, ${ITEM_TYPE.EQUIPMENT} AS item_type
            FROM durable_medical_equipment d
            INNER JOIN inventory_categories c ON c.id = d.category_id
            WHERE d.is_deleted = 0 ${where}`;
    }

    private selectSupplySql(where: Prisma.Sql): Prisma.Sql {
        return Prisma.sql`
            SELECT s.id, CONCAT('SUP-', s.id) AS code, s.item_name, c.category_name, 'unit' AS unit_name,
                   s.stock_on_hand AS quantity_on_hand, s.reorder_threshold, s.status AS item_status,
                   s.updated_at, ${ITEM_TYPE.SUPPLY} AS item_type
            FROM consumable_supplies s
            INNER JOIN inventory_categories c ON c.id = s.category_id
            WHERE s.is_deleted = 0 ${where}`;
    }

    // Find-or-create runs inside one transaction so concurrent creates cannot
    // interleave between the SELECT and the INSERT.
    private async resolveCategory(categoryName: string): Promise<bigint> {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.$queryRaw<{ id: bigint }[]>(Prisma.sql`SELECT TOP 1 id FROM inventory_categories WHERE category_name = ${categoryName}`);
            if (existing[0]) return BigInt(existing[0].id);
            const created = await tx.$queryRaw<{ id: bigint }[]>(Prisma.sql`
                INSERT INTO inventory_categories (category_name, description)
                OUTPUT INSERTED.id
                VALUES (${categoryName}, ${`${categoryName} inventory`})`);
            if (!created[0]) throw new BadRequestException("Inventory category could not be created");
            return BigInt(created[0].id);
        });
    }

    private async resolveFacilityId() {
        const rows = await this.prisma.$queryRaw<{ id: bigint | string }[]>(Prisma.sql`SELECT TOP 1 id FROM facilities WHERE is_deleted = 0 ORDER BY id`);
        if (!rows[0]) throw new NotFoundException("No active facility is available");
        return rows[0].id;
    }

    async findAll(search?: string, category?: string, status?: string) {
        // Filters are pushed into the SQL WHERE clause so the database does the
        // work instead of loading every row into memory.
        const pattern = search?.trim() ? `%${search.trim()}%` : null;
        const categoryFilter = category && category.toLowerCase() !== "all" ? category : null;
        const statusFilter = status && status.toLowerCase() !== "all" ? status : null;

        const equipmentWhere = Prisma.sql`
            ${pattern ? Prisma.sql`AND (d.item_name LIKE ${pattern} OR d.asset_tag LIKE ${pattern})` : Prisma.empty}
            ${categoryFilter ? Prisma.sql`AND c.category_name = ${categoryFilter}` : Prisma.empty}
            ${statusFilter ? Prisma.sql`AND d.status = ${statusFilter}` : Prisma.empty}`;
        const supplyWhere = Prisma.sql`
            ${pattern ? Prisma.sql`AND (s.item_name LIKE ${pattern} OR CONCAT('SUP-', s.id) LIKE ${pattern})` : Prisma.empty}
            ${categoryFilter ? Prisma.sql`AND c.category_name = ${categoryFilter}` : Prisma.empty}
            ${statusFilter ? Prisma.sql`AND s.status = ${statusFilter}` : Prisma.empty}`;

        try {
            const rows = await this.prisma.$queryRaw<RawInventoryRow[]>(Prisma.sql`
                ${this.selectEquipmentSql(equipmentWhere)}
                UNION ALL
                ${this.selectSupplySql(supplyWhere)}`);
            return rows.map((row) => this.map(row));
        } catch (error) {
            this.rethrowAsHttpError(error);
        }
    }

    async findOne(id: string) {
        const parsed = this.parseId(id);
        try {
            const rows =
                parsed.itemType === ITEM_TYPE.EQUIPMENT
                    ? await this.prisma.$queryRaw<RawInventoryRow[]>(this.selectEquipmentSql(Prisma.sql`AND d.id = ${parsed.id}`))
                    : await this.prisma.$queryRaw<RawInventoryRow[]>(this.selectSupplySql(Prisma.sql`AND s.id = ${parsed.id}`));
            if (!rows[0]) throw new NotFoundException("Inventory item not found");
            return this.map(rows[0]);
        } catch (error) {
            this.rethrowAsHttpError(error);
        }
    }

    async create(dto: CreateEquipmentSupplyDto) {
        this.assertStatusForType(dto.itemType, dto.status);
        try {
            const categoryId = await this.resolveCategory(dto.category);
            const facilityId = await this.resolveFacilityId();

            if (dto.itemType === ITEM_TYPE.EQUIPMENT) {
                const created = await this.prisma.$queryRaw<{ id: bigint }[]>(Prisma.sql`
                    INSERT INTO durable_medical_equipment (item_name, category_id, asset_tag, status, facility_id, unit_value)
                    OUTPUT INSERTED.id
                    VALUES (${dto.name}, ${categoryId}, ${dto.code}, ${dto.status}, ${facilityId}, ${dto.unitValue ?? 0})`);
                return await this.findOne(`${ITEM_ID_PREFIX.EQUIPMENT}-${created[0]?.id.toString()}`);
            }

            const created = await this.prisma.$queryRaw<{ id: bigint }[]>(Prisma.sql`
                INSERT INTO consumable_supplies (item_name, category_id, facility_id, stock_on_hand, total, reorder_threshold, unit_cost, private_pay_rate, status)
                OUTPUT INSERTED.id
                VALUES (${dto.name}, ${categoryId}, ${facilityId}, ${dto.quantityOnHand ?? 0}, ${dto.quantityOnHand ?? 0}, ${dto.reorderThreshold ?? 0}, ${dto.unitValue ?? 0}, ${dto.unitValue ?? 0}, ${dto.status})`);
            return await this.findOne(`${ITEM_ID_PREFIX.SUPPLY}-${created[0]?.id.toString()}`);
        } catch (error) {
            this.rethrowAsHttpError(error);
        }
    }

    async update(id: string, dto: UpdateEquipmentSupplyDto) {
        const parsed = this.parseId(id);
        const current = await this.findOne(id);
        this.assertStatusForType(parsed.itemType, dto.status);
        try {
            const categoryId = await this.resolveCategory(dto.category);
            if (parsed.itemType === ITEM_TYPE.EQUIPMENT) {
                await this.prisma.$executeRaw(Prisma.sql`
                    UPDATE durable_medical_equipment
                    SET item_name = ${dto.name}, category_id = ${categoryId}, status = ${dto.status}, updated_at = SYSDATETIMEOFFSET()
                    WHERE id = ${parsed.id}`);
            } else {
                await this.prisma.$executeRaw(Prisma.sql`
                    UPDATE consumable_supplies
                    SET item_name = ${dto.name}, category_id = ${categoryId},
                        stock_on_hand = ${dto.quantityOnHand ?? current.quantityOnHand},
                        reorder_threshold = ${dto.reorderThreshold ?? current.reorderThreshold},
                        status = ${dto.status}, updated_at = SYSDATETIMEOFFSET()
                    WHERE id = ${parsed.id}`);
            }
            return await this.findOne(id);
        } catch (error) {
            this.rethrowAsHttpError(error);
        }
    }

    async updateStatus(id: string, status: string) {
        const parsed = this.parseId(id);
        await this.findOne(id);
        this.assertStatusForType(parsed.itemType, status);
        try {
            if (parsed.itemType === ITEM_TYPE.EQUIPMENT) {
                await this.prisma.$executeRaw(Prisma.sql`UPDATE durable_medical_equipment SET status = ${status}, updated_at = SYSDATETIMEOFFSET() WHERE id = ${parsed.id}`);
            } else {
                await this.prisma.$executeRaw(Prisma.sql`UPDATE consumable_supplies SET status = ${status}, updated_at = SYSDATETIMEOFFSET() WHERE id = ${parsed.id}`);
            }
            return await this.findOne(id);
        } catch (error) {
            this.rethrowAsHttpError(error);
        }
    }
}
