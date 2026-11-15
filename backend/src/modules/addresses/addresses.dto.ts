import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  recipientName!: string;

  @ApiProperty({ example: "081234567890" })
  @IsString()
  @Matches(/^[0-9+\-\s]+$/)
  @MinLength(9)
  @MaxLength(16)
  phone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(300)
  addressLine!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  province!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d{5}$/, { message: "Kode pos harus 5 digit." })
  postalCode!: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  recipientName?: string;

  @ApiPropertyOptional()
  @IsString()
  @Matches(/^[0-9+\-\s]+$/)
  @MinLength(9)
  @MaxLength(16)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(300)
  @IsOptional()
  addressLine?: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  province?: string;

  @ApiPropertyOptional()
  @IsString()
  @Matches(/^\d{5}$/)
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
