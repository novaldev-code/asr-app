import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { get, put } from "@vercel/blob";
import { env } from "../../config/env.js";

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

@Injectable()
export class UploadsService {
  async saveProductImage(file: Express.Multer.File): Promise<string> {
    this.validateImage(file);
    const name = `${randomUUID()}${this.extensionFor(file)}`;
    const blob = await put(`products/${name}`, file.buffer, {
      access: "public",
      contentType: file.mimetype,
      token: this.token("BLOB_PRODUCTS_READ_WRITE_TOKEN"),
    });
    return blob.url;
  }

  async savePaymentProof(file: Express.Multer.File): Promise<string> {
    this.validateImage(file);
    const name = `${randomUUID()}${this.extensionFor(file)}`;
    const blob = await put(`proofs/${name}`, file.buffer, {
      access: "private",
      contentType: file.mimetype,
      token: this.token("BLOB_PROOFS_READ_WRITE_TOKEN"),
    });
    return blob.pathname;
  }

  async readPaymentProof(pathname: string): Promise<Buffer> {
    const safePath = this.safeProofPath(pathname);
    const result = await get(safePath, {
      access: "private",
      token: this.token("BLOB_PROOFS_READ_WRITE_TOKEN"),
    });
    if (!result) {
      throw new NotFoundException("Bukti pembayaran tidak ditemukan.");
    }
    return Buffer.from(await new Response(result.stream).arrayBuffer());
  }

  private token(
    name: "BLOB_PRODUCTS_READ_WRITE_TOKEN" | "BLOB_PROOFS_READ_WRITE_TOKEN",
  ): string {
    const value = env[name];
    if (!value) {
      throw new ServiceUnavailableException(
        `Penyimpanan file belum dikonfigurasi: ${name} tidak diisi.`,
      );
    }
    return value;
  }

  private safeProofPath(pathname: string): string {
    if (!pathname.startsWith("proofs/")) {
      throw new BadRequestException("Lokasi bukti pembayaran tidak valid.");
    }
    const safeName = pathname.slice("proofs/".length);
    if (
      !safeName ||
      safeName.includes("/") ||
      safeName.includes("\\") ||
      safeName.includes("..")
    ) {
      throw new BadRequestException("Lokasi bukti pembayaran tidak valid.");
    }
    return pathname;
  }

  private validateImage(file: Express.Multer.File | undefined): void {
    if (!file) {
      throw new BadRequestException("File gambar wajib diunggah.");
    }
    if (!ALLOWED_MIME[file.mimetype]) {
      throw new BadRequestException("Format gambar harus JPG, PNG, atau WebP.");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException("Ukuran gambar maksimal 2 MB.");
    }
  }

  private extensionFor(file: Express.Multer.File): string {
    const fromName = extname(file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp"].includes(fromName)) {
      return fromName === ".jpeg" ? ".jpg" : fromName;
    }
    return ALLOWED_MIME[file.mimetype];
  }
}
