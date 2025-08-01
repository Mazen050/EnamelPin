import { Client } from "@gradio/client";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false, // we’ll handle the multipart ourselves
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Parse the multipart form to pull out the file buffer
  const bb = Busboy({ headers: req.headers });
  let imageBuffer = null;
  let contentType = "";

  await new Promise((resolve, reject) => {
    bb.on("file", (fieldname, fileStream, info) => {
      const { filename, mimeType } = info;
      contentType = mimeType;
      const chunks = [];
      fileStream.on("data", (chunk) => chunks.push(chunk));
      fileStream.on("end", () => {
        imageBuffer = Buffer.concat(chunks);
        resolve();
      });
    });

    bb.on("error", reject);
    req.pipe(bb);
  });

  if (!imageBuffer) {
    return res.status(400).json({ error: "No image file uploaded" });
  }

  // Connect to your Gradio model
  const client = await Client.connect("black-forest-labs/FLUX.1-Kontext-Dev");

  // Run inference
  const result = await client.predict("/infer", {
    input_image: imageBuffer,
    prompt: "put a texture on this club crest that makes it look like an enamel pin",
    seed: 0,
    randomize_seed: true,
    guidance_scale: 2.5,
    steps: 28,
  });

  console.log("Gradio output:", result.data);

  // Return the URL (or base64) that Gradio gave you
  return res.status(200).json({
    message: "Inference complete",
    url: result.data?.[0]?.url ?? null,
    output: result.data,
    byteSize: imageBuffer.length,
    contentType,
  });
}
