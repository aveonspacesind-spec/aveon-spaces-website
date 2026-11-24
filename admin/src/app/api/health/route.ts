import { NextResponse } from "next/server";

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

    // 2. Test Cloudinary External API
    if (test === "cloudinary") {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        return NextResponse.json(
          {
            success: false,
            error: "Cloudinary credentials missing: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET not set.",
          },
          { status: 500 }
        );
      }

      // Ping Cloudinary ping endpoint with Basic auth
      const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/ping`, {
        headers: {
          Authorization: authHeader,
        },
      });

      const latency = Date.now() - startTime;

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        return NextResponse.json(
          {
            success: false,
            status: res.status,
            latency,
            error: errText || `Cloudinary ping returned HTTP ${res.status}`,
          },
          { status: res.status }
        );
      }

      return NextResponse.json({
        success: true,
        status: 200,
        latency,
        message: `Cloudinary media service is operational for cloud '${cloudName}'.`,
      });
    }

    // 3. Test Cloudflare R2 (Public URL availability)
    if (test === "r2") {
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
          { success: false, latency, error: `Could not reach Cloudflare R2 URL: ${publicUrl}` },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        status: res.status,
        latency,
        message: `Cloudflare R2 CDN is reachable (${publicUrl}).`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Health check route is online. Pass ?test=resend | cloudinary | r2 to test specific services.",
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
