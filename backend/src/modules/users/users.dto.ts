import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UsersUpdateInput {
  @ApiPropertyOptional({ minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: "081234567890" })
  @IsString()
  @Matches(/^[0-9+\-\s]+$/, {
    message: "Nomor telepon hanya boleh berisi angka, spasi, +, atau -.",
  })
  @MinLength(9)
  @MaxLength(16)
  @IsOptional()
  phone?: string;
}
