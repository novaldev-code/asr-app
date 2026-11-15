import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";

export class MailerService {
  private readonly transporter: Transporter | null;

  constructor() {
    if (env.MAIL_TRANSPORT === "smtp") {
      if (!env.SMTP_HOST) {
        throw new Error("SMTP_HOST is required when MAIL_TRANSPORT=smtp");
      }
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth:
          env.SMTP_USER && env.SMTP_PASS
            ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
            : undefined,
      });
    } else {
      this.transporter = null;
    }
  }

  async sendVerificationEmail(to: string, url: string): Promise<void> {
    await this.send(
      to,
      "Verifikasi email Mocha & Co.",
      `Verifikasi email Anda dengan membuka tautan berikut:\n\n${url}\n`,
    );
  }

  async sendPasswordResetEmail(to: string, url: string): Promise<void> {
    await this.send(
      to,
      "Reset password Mocha & Co.",
      `Reset password Anda dengan membuka tautan berikut:\n\n${url}\n`,
    );
  }

  private async send(to: string, subject: string, text: string): Promise<void> {
    if (!this.transporter) {
      console.log(
        `[mail:console] to=${to} subject="${subject}"\n${text}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: env.MAIL_FROM,
      to,
      subject,
      text,
    });
  }
}

export const mailer = new MailerService();
