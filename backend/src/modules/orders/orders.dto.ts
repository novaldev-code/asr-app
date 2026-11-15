import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { PaginationQueryDto } from "../../common/pagination.js";
import type { OrderStatus, PaymentStatus } from "../../db/schema/index.js";

export class ShippingSnapshotDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  recipientName!: string;

  @ApiProperty()
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
  @Matches(/^\d{5}$/)
  postalCode!: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  addressId?: string;

  @ApiProperty({ type: ShippingSnapshotDto })
  @ValidateNested()
  @Type(() => ShippingSnapshotDto)
  shipping!: ShippingSnapshotDto;

  @ApiProperty({ enum: ["cod", "bank_transfer"] })
  @IsEnum(["cod", "bank_transfer"])
  paymentMethod!: "cod" | "bank_transfer";

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string;
}

export class OrderQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ["pending", "processing", "shipped", "completed", "cancelled"],
  })
  @IsEnum(["pending", "processing", "shipped", "completed", "cancelled"])
  @IsOptional()
  status?: OrderStatus;
}

export class AdminOrderQueryDto extends OrderQueryDto {
  @ApiPropertyOptional({
    enum: ["unpaid", "waiting_verification", "paid", "rejected"],
  })
  @IsEnum(["unpaid", "waiting_verification", "paid", "rejected"])
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  to?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: ["processing", "shipped", "completed", "cancelled"],
  })
  @IsIn(["processing", "shipped", "completed", "cancelled"])
  status!: "processing" | "shipped" | "completed" | "cancelled";

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  note?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ enum: ["paid", "rejected"] })
  @IsIn(["paid", "rejected"])
  decision!: "paid" | "rejected";
}

export class CancelOrderDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  note?: string;
}
