// api/upload.js

import { Client } from "@gradio/client";

// Disable Vercel’s default body parsing so we can get a raw Buffer
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Accumulate raw body chunks into a Buffer
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const imageBuffer = Buffer.concat(chunks);

  // Optional: get content-type header
  const contentType = req.headers["content-type"] || "";

  // Connect to your Gradio model
  const client = await Client.connect("black-forest-labs/FLUX.1-Kontext-Dev");

  // Run inference, passing the raw Buffer as the blob
  const result = await client.predict("/infer", {
    input_image: imageBuffer,
    prompt: "put a texture on this club crest that makes it look like an enamel pin",
    seed: 0,
    randomize_seed: true,
    guidance_scale: 2.5,
    steps: 28,
  });

  // Inspect or log the Gradio result
  console.log("Gradio output:", result.data);

  // Return a JSON result
  return res.status(200).json({
    message: "Inference complete",
    url: result.data[0].url,
    // If result.data contains a URL or base64, include it here:
    output: result.data,
    byteSize: imageBuffer.length,
    contentType,
  });
}
