import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { OrdersService } from "./orders.service.js";

@Injectable()
export class OrdersExpiryService {
  private readonly logger = new Logger(OrdersExpiryService.name);
  private running = false;

  constructor(private readonly ordersService: OrdersService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async sweep(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const expired = await this.ordersService.expireOrders();
      if (expired > 0) {
        this.logger.log(`Membatalkan ${expired} pesanan transfer kedaluwarsa.`);
      }
    } catch (error) {
      this.logger.error(
        "Gagal menjalankan pembersihan pesanan kedaluwarsa.",
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.running = false;
    }
  }
}
