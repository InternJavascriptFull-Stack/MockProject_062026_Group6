import { Type } from "class-transformer";
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateEquipmentSupplyDto {
    @IsString()
    @IsNotEmpty()
    code!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    category!: string;

    @IsString()
    @IsNotEmpty()
    unit!: string;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    quantityOnHand!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    reorderThreshold!: number;

    @IsString()
    @IsNotEmpty()
    status!: string;

    @IsOptional()
    @IsIn(["EQUIPMENT", "SUPPLY"])
    itemType?: "EQUIPMENT" | "SUPPLY";

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    unitValue?: number;
}

export class UpdateEquipmentSupplyDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    category!: string;

    @IsString()
    @IsNotEmpty()
    unit!: string;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    quantityOnHand!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    reorderThreshold!: number;

    @IsString()
    @IsNotEmpty()
    status!: string;
}

export class UpdateEquipmentSupplyStatusDto {
    @IsString()
    @IsNotEmpty()
    status!: string;
}
