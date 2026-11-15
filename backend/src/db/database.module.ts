import {
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
} from "@nestjs/common";
import { Pool } from "pg";
import { db, pool } from "./database.js";

export const PG_POOL = Symbol("PG_POOL");
export const DB = Symbol("DB");

@Global()
@Module({
  providers: [
    { provide: PG_POOL, useValue: pool },
    { provide: DB, useValue: db },
  ],
  exports: [PG_POOL, DB],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
