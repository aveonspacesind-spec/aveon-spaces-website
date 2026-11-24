import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary is not configured correctly on the server" },
        { status: 500 }
      );
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Sort parameters alphabetically to sign
    const signatureString = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", base64File);
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", timestamp.toString());
    cloudinaryFormData.append("signature", signature);

    const requestedResourceType = formData.get("resource_type") as string;
    const isImage = requestedResourceType === "image" || (file.type && file.type.startsWith("image/")) || /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file.name || "");
    const endpoint = isImage ? "image/upload" : "auto/upload";

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Cloudinary upload error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ url: data.secure_url });
  } catch (error: any) {
    console.error("Server upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
