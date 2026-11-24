import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const test = searchParams.get("test");

  const startTime = Date.now();

  try {
    // ─────────────────────────────────────────────────────────────
    // 1. Resend API Authentication & Send Permissions
    // ─────────────────────────────────────────────────────────────
    if (test === "resend") {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { success: false, error: "RESEND_API_KEY is not configured in server environment variables." },
          { status: 500 }
        );
      }

      const res = await fetch("https://api.resend.com/api-keys", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const latency = Date.now() - startTime;

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        
        // If Resend returns 403 with "restricted to only send emails",
        // that confirms the key is authentic and active for email sending!
        if (
          errData.message && 
          (errData.message.includes("restricted to only send emails") || errData.message.includes("restricted"))
        ) {
          return NextResponse.json({
            success: true,
            status: 200,
            latency,
            message: "Resend API key is verified and operational with active Email-Sending permissions.",
          });
        }

        return NextResponse.json(
          {
            success: false,
            status: res.status,
            latency,
            error: errData.message || `Resend API returned HTTP ${res.status} (${res.statusText})`,
          },
          { status: res.status }
        );
      }

      return NextResponse.json({
        success: true,
        status: 200,
        latency,
        message: "Resend Email API is connected and API key is valid.",
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Cloudflare R2 - Read / Bucket Connection (ListObjects)
    // ─────────────────────────────────────────────────────────────
    if (test === "r2-read") {
      const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
      const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
      const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
      const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
      const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");

      if (!accessKeyId || !secretAccessKey || !endpoint || !bucketName) {
        return NextResponse.json(
          {
            success: false,
            error: "Cloudflare R2 credentials missing: CLOUDFLARE_R2_ACCOUNT_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY, or BUCKET_NAME not set.",
          },
          { status: 500 }
        );
      }

      const s3Client = new S3Client({
        region: "auto",
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 2,
      });

      const output = await s3Client.send(command);
      const latency = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        status: 200,
        latency,
        message: `Cloudflare R2 bucket '${bucketName}' read query successful. Total key sample count: ${output.KeyCount ?? 0}.`,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Cloudflare R2 - Write & Delete Operation (PutObject + DeleteObject)
    // ─────────────────────────────────────────────────────────────
    if (test === "r2-write") {
      const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
      const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
      const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
      const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
      const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");

      if (!accessKeyId || !secretAccessKey || !endpoint || !bucketName) {
        return NextResponse.json(
          {
            success: false,
            error: "Cloudflare R2 credentials missing: CLOUDFLARE_R2_ACCOUNT_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY, or BUCKET_NAME not set.",
          },
          { status: 500 }
        );
      }

      const s3Client = new S3Client({
        region: "auto",
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const testKey = `uploads/.health-probe-${Date.now()}.tmp`;

      // 1. Put temporary test object
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: testKey,
        Body: Buffer.from("probe"),
        ContentType: "text/plain",
      });
      await s3Client.send(putCommand);

      // 2. Immediately delete test object (leaving zero junk files behind)
      const delCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: testKey,
      });
      await s3Client.send(delCommand);

      const latency = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        status: 200,
        latency,
        message: `R2 write and delete operations completed successfully in bucket '${bucketName}'. Full write permissions verified.`,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Cloudflare R2 - Public CDN Asset Delivery (HEAD public URL)
    // ─────────────────────────────────────────────────────────────
    if (test === "r2-public") {
      const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
      if (!publicUrl) {
        return NextResponse.json(
          { success: false, error: "CLOUDFLARE_R2_PUBLIC_URL is not set in environment variables." },
          { status: 500 }
        );
      }

      const res = await fetch(publicUrl, { method: "HEAD" }).catch(() => null);
      const latency = Date.now() - startTime;

      if (!res) {
        return NextResponse.json(
          { success: false, latency, error: `Could not reach Cloudflare R2 public URL: ${publicUrl}` },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        status: res.status,
        latency,
        message: `Cloudflare R2 public CDN is reachable (${publicUrl}).`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Health check route is online. Pass ?test=resend | r2-read | r2-write | r2-public to test specific operations.",
    });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return NextResponse.json(
      {
        success: false,
        latency,
        error: error.message || "Unexpected internal error during health probe.",
      },
      { status: 500 }
    );
  }
}
