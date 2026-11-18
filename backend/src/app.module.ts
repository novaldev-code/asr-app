import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "./auth/auth.js";
import { DatabaseModule } from "./db/index.js";
import { MailModule } from "./mail/mail.module.js";
import { AddressesModule } from "./modules/addresses/addresses.module.js";
import { CartModule } from "./modules/cart/cart.module.js";
import { CategoriesModule } from "./modules/categories/categories.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { OrdersModule } from "./modules/orders/orders.module.js";
import { ProductsModule } from "./modules/products/products.module.js";
import { ShippingModule } from "./modules/shipping/shipping.module.js";
import { UsersModule } from "./modules/users/users.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MailModule,
    AuthModule.forRoot({
      auth,
      bodyParser: {
        json: { limit: "2mb" },
        urlencoded: { extended: true, limit: "2mb" },
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    HealthModule,
    UsersModule,
    AddressesModule,
    CategoriesModule,
    ProductsModule,
    ShippingModule,
    CartModule,
    OrdersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
