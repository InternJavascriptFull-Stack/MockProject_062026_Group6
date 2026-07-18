import { Type } from "class-transformer";
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateIf } from "class-validator";
import { EQUIPMENT_STATUS, ITEM_TYPE, SUPPLY_STATUS, type ItemType } from "../../constants/inventory.js";

const ALL_STATUSES = [...Object.values(EQUIPMENT_STATUS), ...Object.values(SUPPLY_STATUS)];

export class CreateEquipmentSupplyDto {
    @IsIn(Object.values(ITEM_TYPE))
    itemType!: ItemType;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    category!: string;

    // Asset tag — required for durable equipment only; supplies get a generated code.
    @ValidateIf((dto: CreateEquipmentSupplyDto) => dto.itemType === ITEM_TYPE.EQUIPMENT)
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    code?: string;

    // Stock fields — required for consumable supplies only.
    @ValidateIf((dto: CreateEquipmentSupplyDto) => dto.itemType === ITEM_TYPE.SUPPLY)
    @IsString()
    @IsNotEmpty()
    unit?: string;

    @ValidateIf((dto: CreateEquipmentSupplyDto) => dto.itemType === ITEM_TYPE.SUPPLY)
    @Type(() => Number)
    @IsInt()
    @Min(0)
    quantityOnHand?: number;

    @ValidateIf((dto: CreateEquipmentSupplyDto) => dto.itemType === ITEM_TYPE.SUPPLY)
    @Type(() => Number)
    @IsInt()
    @Min(0)
    reorderThreshold?: number;

    // Per-type membership (equipment vs supply) is enforced in the service.
    @IsIn(ALL_STATUSES)
    status!: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    unitValue?: number;
}

export class UpdateEquipmentSupplyDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    category!: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    quantityOnHand?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    reorderThreshold?: number;

    @IsIn(ALL_STATUSES)
    status!: string;
}

export class UpdateEquipmentSupplyStatusDto {
    @IsIn(ALL_STATUSES)
    status!: string;
}
