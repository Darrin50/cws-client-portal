import https from "https";

interface ScreenshotOptions {
  width?: number;
  height?: number;
  fullPage?: boolean;
  delay?: number;
  format?: "png" | "jpg";
}

export async function captureScreenshot(
  url: string,
  options: ScreenshotOptions = {}
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      access_key: process.env.SCREENSHOT_ONE_API_KEY || "",
      url,
      width: String(options.width || 1280),
      height: String(options.height || 720),
      full_page: String(options.fullPage || false),
      delay: String(options.delay || 1000),
      format: options.format || "png",
    });

    const apiUrl = `https://api.screenshotone.com/take?${params.toString()}`;

    https
      .get(apiUrl, (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          if (response.statusCode === 200) {
            resolve(Buffer.concat(chunks));
          } else {
            reject(
              new Error(
                `Screenshot API returned status ${response.statusCode}`
              )
            );
          }
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

export async function captureScreenshotAndUpload(
  url: string,
  folder: string,
  options: ScreenshotOptions = {}
): Promise<string> {
  try {
    const buffer = await captureScreenshot(url, options);
    const { uploadFile } = await import("./upload");

    const file = new File([buffer as unknown as BlobPart], "screenshot.png", {
      type: "image/png",
    });

    const uploadedUrl = await uploadFile(file, folder);
    return uploadedUrl;
  } catch (error) {
    console.error("Error capturing and uploading screenshot:", error);
    throw error;
  }
}
