import { Global, Module } from "@nestjs/common";
import { MailerService, mailer } from "./mailer.service.js";

@Global()
@Module({
  providers: [{ provide: MailerService, useValue: mailer }],
  exports: [MailerService],
})
export class MailModule {}
