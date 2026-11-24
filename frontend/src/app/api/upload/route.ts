import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || "20ace126656da7cdfff247412eb326e3";
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "2571b2ab65de33c41eec301fb559b21d";
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "15c2b6c26a9027207add692b81b7927358623dc7de98e8e74a26f839157b0ba3";
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "aveon-spaces-website";
const publicUrl = (process.env.CLOUDFLARE_R2_PUBLIC_URL || "https://pub-a08a00d306ec4358bc32a948ca484d65.r2.dev").replace(/\/+$/, "");
const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;

const s3Client = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize filename & create unique key
    const originalName = file.name || "image.jpg";
    const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
    const safeBaseName = originalName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const uniqueId = crypto.randomBytes(6).toString("hex");
    const key = `uploads/${Date.now()}-${uniqueId}-${safeBaseName}.${extension}`;

    const contentType = file.type || "application/octet-stream";

    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(uploadCommand);

    const fileUrl = `${publicUrl}/${key}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      key,
    });
  } catch (error: any) {
    console.error("Cloudflare R2 upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload file to Cloudflare R2" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Extract object key from URL
    let key = "";
    if (url.includes(".r2.dev/")) {
      key = url.split(".r2.dev/")[1];
    } else if (url.includes(`${bucketName}/`)) {
      key = url.split(`${bucketName}/`)[1];
    } else {
      try {
        const parsed = new URL(url);
        key = parsed.pathname.replace(/^\/+/, "");
      } catch {
        key = url;
      }
    }

    if (!key) {
      return NextResponse.json({ error: "Could not resolve object key" }, { status: 400 });
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(deleteCommand);

    return NextResponse.json({ success: true, deletedKey: key });
  } catch (error: any) {
    console.error("Cloudflare R2 delete error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete file from Cloudflare R2" },
      { status: 500 }
    );
  }
}
