import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateEquipmentSupplyDto, UpdateEquipmentSupplyDto } from "./dto/equipment-supply.dto.js";

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
    constructor(private readonly prisma: PrismaService) {}

    private map(row: RawInventoryRow) {
        const prefix = row.item_type === "EQUIPMENT" ? "equipment" : "supply";
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

    private parseId(id: string) {
        const [type, numericId] = id.split("-");
        if (!numericId || !["equipment", "supply"].includes(type)) throw new NotFoundException("Inventory item not found");
        return { type, id: BigInt(numericId) };
    }

    private async resolveCategory(categoryName: string): Promise<bigint> {
        const existing = await this.prisma.$queryRaw<{ id: bigint }[]>(Prisma.sql`SELECT TOP 1 id FROM inventory_categories WHERE category_name = ${categoryName}`);
        if (existing[0]) return BigInt(existing[0].id);
        await this.prisma.$executeRaw(Prisma.sql`INSERT INTO inventory_categories (category_name, description) VALUES (${categoryName}, ${`${categoryName} inventory`})`);
        const created = await this.prisma.$queryRaw<{ id: bigint }[]>(Prisma.sql`SELECT TOP 1 id FROM inventory_categories WHERE category_name = ${categoryName} ORDER BY id DESC`);
        if (!created[0]) throw new NotFoundException("Inventory category could not be created");
        return BigInt(created[0].id);
    }

    private async resolveFacilityId() {
        const rows = await this.prisma.$queryRaw<{ id: bigint | string }[]>(Prisma.sql`SELECT TOP 1 id FROM facilities WHERE is_deleted = 0 ORDER BY id`);
        if (!rows[0]) throw new NotFoundException("No active facility is available");
        return rows[0].id;
    }

    async findAll(search?: string, category?: string, status?: string) {
        const rows = await this.prisma.$queryRaw<RawInventoryRow[]>(Prisma.sql`
            SELECT d.id, d.asset_tag AS code, d.item_name, c.category_name, 'asset' AS unit_name,
                   1 AS quantity_on_hand, 0 AS reorder_threshold, d.status AS item_status,
                   d.updated_at, 'EQUIPMENT' AS item_type
            FROM durable_medical_equipment d
            INNER JOIN inventory_categories c ON c.id = d.category_id
            WHERE d.is_deleted = 0
            UNION ALL
            SELECT s.id, CONCAT('SUP-', s.id) AS code, s.item_name, c.category_name, 'unit' AS unit_name,
                   s.stock_on_hand AS quantity_on_hand, s.reorder_threshold, s.status AS item_status,
                   s.updated_at, 'SUPPLY' AS item_type
            FROM consumable_supplies s
            INNER JOIN inventory_categories c ON c.id = s.category_id
            WHERE s.is_deleted = 0
        `);
        const normalizedSearch = search?.trim().toLowerCase();
        return rows
            .map((row) => this.map(row))
            .filter((item) => {
                const matchesSearch = !normalizedSearch || item.name.toLowerCase().includes(normalizedSearch) || item.code.toLowerCase().includes(normalizedSearch);
                const matchesCategory = !category || category === "all" || item.category === category;
                const matchesStatus = !status || status === "all" || item.status === status;
                return matchesSearch && matchesCategory && matchesStatus;
            });
    }

    async findOne(id: string) {
        const parsed = this.parseId(id);
        const rows =
            parsed.type === "equipment"
                ? await this.prisma.$queryRaw<RawInventoryRow[]>(Prisma.sql`
                  SELECT d.id, d.asset_tag AS code, d.item_name, c.category_name, 'asset' AS unit_name,
                         1 AS quantity_on_hand, 0 AS reorder_threshold, d.status AS item_status,
                         d.updated_at, 'EQUIPMENT' AS item_type
                  FROM durable_medical_equipment d INNER JOIN inventory_categories c ON c.id = d.category_id
                  WHERE d.id = ${parsed.id} AND d.is_deleted = 0
              `)
                : await this.prisma.$queryRaw<RawInventoryRow[]>(Prisma.sql`
                  SELECT s.id, CONCAT('SUP-', s.id) AS code, s.item_name, c.category_name, 'unit' AS unit_name,
                         s.stock_on_hand AS quantity_on_hand, s.reorder_threshold, s.status AS item_status,
                         s.updated_at, 'SUPPLY' AS item_type
                  FROM consumable_supplies s INNER JOIN inventory_categories c ON c.id = s.category_id
                  WHERE s.id = ${parsed.id} AND s.is_deleted = 0
              `);
        if (!rows[0]) throw new NotFoundException("Inventory item not found");
        return this.map(rows[0]);
    }

    async create(dto: CreateEquipmentSupplyDto) {
        const categoryId = await this.resolveCategory(dto.category);
        const facilityId = await this.resolveFacilityId();
        const itemType = dto.itemType ?? (dto.unit.toLowerCase() === "asset" ? "EQUIPMENT" : "SUPPLY");
        if (itemType === "EQUIPMENT") {
            await this.prisma.$executeRaw(Prisma.sql`
                INSERT INTO durable_medical_equipment (item_name, category_id, asset_tag, status, facility_id, unit_value)
                VALUES (${dto.name}, ${categoryId}, ${dto.code}, ${dto.status}, ${facilityId}, ${dto.unitValue ?? 0})
            `);
            const rows = await this.prisma.$queryRaw<{ id: bigint }[]>(Prisma.sql`SELECT TOP 1 id FROM durable_medical_equipment WHERE asset_tag = ${dto.code} ORDER BY id DESC`);
            return this.findOne(`equipment-${rows[0]?.id.toString()}`);
        }
        await this.prisma.$executeRaw(Prisma.sql`
            INSERT INTO consumable_supplies (item_name, category_id, facility_id, stock_on_hand, total, reorder_threshold, unit_cost, private_pay_rate, status)
            VALUES (${dto.name}, ${categoryId}, ${facilityId}, ${dto.quantityOnHand}, ${dto.quantityOnHand}, ${dto.reorderThreshold}, ${dto.unitValue ?? 0}, ${dto.unitValue ?? 0}, ${dto.status})
        `);
        const rows = await this.prisma.$queryRaw<{ id: bigint }[]>(Prisma.sql`SELECT TOP 1 id FROM consumable_supplies WHERE item_name = ${dto.name} ORDER BY id DESC`);
        return this.findOne(`supply-${rows[0]?.id.toString()}`);
    }

    async update(id: string, dto: UpdateEquipmentSupplyDto) {
        const parsed = this.parseId(id);
        const categoryId = await this.resolveCategory(dto.category);
        if (parsed.type === "equipment") {
            await this.prisma.$executeRaw(
                Prisma.sql`UPDATE durable_medical_equipment SET item_name = ${dto.name}, category_id = ${categoryId}, status = ${dto.status}, updated_at = SYSDATETIMEOFFSET() WHERE id = ${parsed.id}`,
            );
        } else {
            await this.prisma.$executeRaw(
                Prisma.sql`UPDATE consumable_supplies SET item_name = ${dto.name}, category_id = ${categoryId}, stock_on_hand = ${dto.quantityOnHand}, reorder_threshold = ${dto.reorderThreshold}, status = ${dto.status}, updated_at = SYSDATETIMEOFFSET() WHERE id = ${parsed.id}`,
            );
        }
        return this.findOne(id);
    }

    async updateStatus(id: string, status: string) {
        const item = await this.findOne(id);
        return this.update(id, { name: item.name, category: item.category, unit: item.unit, quantityOnHand: item.quantityOnHand, reorderThreshold: item.reorderThreshold, status });
    }
}
