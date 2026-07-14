import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CompleteCareTaskDto {
    @IsOptional()
    @IsBoolean()
    abnormal?: boolean;

    @IsOptional()
    @IsString()
    notes?: string;
}
