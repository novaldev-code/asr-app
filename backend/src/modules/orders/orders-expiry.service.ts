import { Injectable, Logger } from "@nestjs/common";
import { OrdersService } from "./orders.service.js";

@Injectable()
export class OrdersExpiryService {
  private readonly logger = new Logger(OrdersExpiryService.name);
  private running = false;

  constructor(private readonly ordersService: OrdersService) {}

  async sweep(): Promise<number> {
    if (this.running) return 0;
    this.running = true;
    try {
      const expired = await this.ordersService.expireOrders();
      if (expired > 0) {
        this.logger.log(`Membatalkan ${expired} pesanan transfer kedaluwarsa.`);
      }
      return expired;
    } catch (error) {
      this.logger.error(
        "Gagal menjalankan pembersihan pesanan kedaluwarsa.",
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    } finally {
      this.running = false;
    }
  }
}
