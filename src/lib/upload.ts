import { put, del } from "@vercel/blob";

export async function uploadFile(
  file: File,
  folder: string
): Promise<string> {
  try {
    const filename = `${folder}/${Date.now()}-${file.name}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return blob.url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file");
  }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error("Error deleting file:", error);
    // Don't throw - deletion failures shouldn't stop the process
  }
}

export async function getSignedUrl(
  url: string,
  expiresIn: number = 3600
): Promise<string> {
  // Vercel Blob URLs are already public by default
  // This is a placeholder for future use if private URLs needed
  return url;
}
