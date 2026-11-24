import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const test = searchParams.get("test");

  const startTime = Date.now();

  try {
    // 1. Test Resend External API
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
        
        // If Resend returns "This API key is restricted to only send emails",
        // that confirms the key is 100% valid and authenticated with Email Sending permissions!
        if (
          errData.message && 
          (errData.message.includes("restricted to only send emails") || errData.message.includes("restricted"))
        ) {
          return NextResponse.json({
            success: true,
            status: 200,
            latency,
            message: "Resend API key is verified & operational (Permission: Email Sending).",
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

    // 2. Test Cloudflare R2 Storage (Direct S3-compatible API ping)
    if (test === "r2" || test === "r2-storage") {
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

      // Test listing with max 1 object to verify bucket read permission
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 1,
      });

      await s3Client.send(command);
      const latency = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        status: 200,
        latency,
        message: `Cloudflare R2 bucket '${bucketName}' is connected and responding via S3 API.`,
      });
    }

    // 3. Test Cloudflare R2 Public CDN URL
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
      message: "Health check route is online. Pass ?test=resend | r2 | r2-public to test specific services.",
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
