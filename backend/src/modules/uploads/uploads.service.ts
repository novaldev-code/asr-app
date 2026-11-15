import { BadRequestException, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
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
  private readonly root = join(process.cwd(), env.UPLOAD_DIR);

  async saveProductImage(file: Express.Multer.File): Promise<string> {
    this.validateImage(file);
    const name = `${randomUUID()}${this.extensionFor(file)}`;
    const directory = join(this.root, "products");
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, name), file.buffer);
    return `/uploads/products/${name}`;
  }

  async savePaymentProof(file: Express.Multer.File): Promise<string> {
    this.validateImage(file);
    const name = `${randomUUID()}${this.extensionFor(file)}`;
    const directory = join(this.root, "proofs");
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, name), file.buffer);
    return `proofs/${name}`;
  }

  async readPaymentProof(relativePath: string): Promise<Buffer> {
    const safeName = relativePath.replace(/^proofs\//, "");
    if (safeName.includes("/") || safeName.includes("\\") || safeName.includes("..")) {
      throw new BadRequestException("Lokasi bukti pembayaran tidak valid.");
    }
    return readFile(join(this.root, "proofs", safeName));
  }

  paymentProofAbsolutePath(relativePath: string): string {
    const safeName = relativePath.replace(/^proofs\//, "");
    if (safeName.includes("/") || safeName.includes("\\") || safeName.includes("..")) {
      throw new BadRequestException("Lokasi bukti pembayaran tidak valid.");
    }
    return join(this.root, "proofs", safeName);
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
