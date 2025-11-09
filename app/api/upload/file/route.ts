import { nanoid } from "nanoid";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "company-logos";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided or invalid file" },
        { status: 400 }
      );
    }

    const randomId = nanoid();
    const extName = path.extname(file.name);
    const fileName = `${randomId}${extName}`;

    const storageZone = process.env.BUNNY_STORAGE_ZONE;
    const apiKey = "d6121d88-2677-407a-bffce19bfe16-42c3-4ca9";
    const pullZoneUrl =
      process.env.BUNNY_PULL_ZONE_URL || "https://talentra.b-cdn.net";
    console.log(storageZone, apiKey, pullZoneUrl);
    if (!storageZone || !apiKey) {
      throw new Error("BunnyCDN credentials not set in environment variables");
    }

    const cleanFolder = folder.replace(/^\/|\/$/g, "");
    const uploadUrl = `https://sg.storage.bunnycdn.com/${storageZone}/${cleanFolder}/${fileName}`;

    // Upload to Bunny Storage
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: apiKey,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: await file.arrayBuffer(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed (${response.status}): ${errorText}`);
    }

    return NextResponse.json({
      publicId: fileName,
      url: `${pullZoneUrl}/${cleanFolder}/${fileName}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
