import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateShippingRateDto {
  @ApiProperty({ example: "Jawa Barat" })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  province!: string;

  @ApiProperty({ example: 20000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cost!: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateShippingRateDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @IsOptional()
  province?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class ShippingQuoteQueryDto {
  @ApiProperty({ example: "Jawa Barat" })
  @IsString()
  @MinLength(2)
  province!: string;
}
