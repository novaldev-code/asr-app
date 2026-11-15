import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { PaginationQueryDto } from "../../common/pagination.js";

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  return value === "true" || value === "1";
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MinLength(3)
  @MaxLength(140)
  @IsOptional()
  slug?: string;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: 45000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ default: true })
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  featured?: boolean;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MinLength(3)
  @MaxLength(140)
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  featured?: boolean;
}

export class ProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ description: "Slug kategori" })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({
    enum: ["newest", "price_asc", "price_desc", "name_asc"],
    default: "newest",
  })
  @IsIn(["newest", "price_asc", "price_desc", "name_asc"])
  @IsOptional()
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
}

export class AdminProductQueryDto extends ProductQueryDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
