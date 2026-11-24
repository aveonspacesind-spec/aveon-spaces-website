import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || "";
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";
const publicUrl = (process.env.CLOUDFLARE_R2_PUBLIC_URL || "").replace(/\/+$/, "");
const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");

function getS3Client() {
  if (!accessKeyId || !secretAccessKey || !endpoint) {
    return null;
  }
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

// Health check endpoint (GET /api/upload)
export async function GET() {
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return NextResponse.json(
      {
        success: false,
        error: "Cloudflare R2 credentials missing: CLOUDFLARE_R2_ACCOUNT_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY, or BUCKET_NAME not set.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Media upload route (/api/upload) is active and connected to Cloudflare R2 bucket '${bucketName}'.`,
  });
}

// Upload file to Cloudflare R2 (POST /api/upload)
export async function POST(request: Request) {
  try {
    const s3Client = getS3Client();
    if (!s3Client || !bucketName) {
      return NextResponse.json(
        { error: "Cloudflare R2 is not configured on the server. Please check environment variables." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize filename & create unique key
    const originalName = file.name || "media.jpg";
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
      { error: error.message || "Failed to upload file to Cloudflare R2 storage." },
      { status: 500 }
    );
  }
}
