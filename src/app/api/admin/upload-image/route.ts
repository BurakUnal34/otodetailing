import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminSession, unauthorizedJson } from "@/lib/admin-api";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function isVercelBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

async function trySharpWebpBuffer(buf: Buffer): Promise<Buffer | null> {
  try {
    const { default: sharp } = await import("sharp");
    return await sharp(buf)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedJson();

  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json({ error: "multipart/form-data bekleniyor." }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Form verisi okunamadı." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya seçilmedi." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Yalnızca JPEG, PNG, WebP veya GIF yükleyin." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Dosya en fazla 5 MB olabilir." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const base = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const ext = MIME_EXT[file.type] ?? "bin";

  if (isVercelBlobConfigured()) {
    try {
      const { put } = await import("@vercel/blob");
      if (file.type === "image/gif") {
        const key = `products/${base}.gif`;
        const blob = await put(key, buf, { access: "public", contentType: "image/gif" });
        return NextResponse.json({ url: blob.url });
      }
      const webpBuf = await trySharpWebpBuffer(buf);
      if (webpBuf) {
        const key = `products/${base}.webp`;
        const blob = await put(key, webpBuf, { access: "public", contentType: "image/webp" });
        return NextResponse.json({ url: blob.url });
      }
      const key = `products/${base}.${ext}`;
      const blob = await put(key, buf, { access: "public", contentType: file.type });
      return NextResponse.json({
        url: blob.url,
        warning: "Görsel sıkıştırılamadı; orijinal dosya yüklendi.",
      });
    } catch {
      return NextResponse.json(
        { error: "Bulut depolamaya yüklenemedi. BLOB_READ_WRITE_TOKEN veya ağı kontrol edin." },
        { status: 502 },
      );
    }
  }

  const dir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(dir, { recursive: true });

  if (file.type === "image/gif") {
    const filename = `${base}.gif`;
    await writeFile(path.join(dir, filename), buf);
    return NextResponse.json({ url: `/uploads/products/${filename}` });
  }

  const webpBuf = await trySharpWebpBuffer(buf);
  if (webpBuf) {
    const filename = `${base}.webp`;
    await writeFile(path.join(dir, filename), webpBuf);
    return NextResponse.json({ url: `/uploads/products/${filename}` });
  }

  const rawName = `${base}.${ext}`;
  try {
    await writeFile(path.join(dir, rawName), buf);
    return NextResponse.json({
      url: `/uploads/products/${rawName}`,
      warning: "Görsel sıkıştırılamadı; orijinal dosya kaydedildi.",
    });
  } catch {
    return NextResponse.json(
      { error: "Dosya yazılamadı (disk izni veya yol hatası)." },
      { status: 500 },
    );
  }
}
