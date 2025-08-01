// api/main.js

import { Client } from "@gradio/client";
import Busboy from "busboy";
import fetch from "node-fetch";   // npm install node-fetch@2

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1) parse multipart form
  const bb = Busboy({ headers: req.headers });
  let imageBuffer = null, uploadMime = "";
  await new Promise((resolve, reject) => {
    bb.on("file", (field, stream, info) => {
      uploadMime = info.mimeType;
      const parts = [];
      stream.on("data", (c) => parts.push(c));
      stream.on("end", () => {
        imageBuffer = Buffer.concat(parts);
        resolve();
      });
    });
    bb.on("error", reject);
    req.pipe(bb);
  });
  if (!imageBuffer) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  // 2) run Gradio inference
  const client = await Client.connect("black-forest-labs/FLUX.1-Kontext-Dev");
  const { data } = await client.predict("/infer", {
    input_image: imageBuffer,
    prompt: "put a texture on this club crest that makes it look like an enamel pin",
    seed: 0,
    randomize_seed: true,
    guidance_scale: 2.5,
    steps: 28,
  });

  // 3) data[0].url is the ephemeral URL — fetch it right away
  const imgUrl = data?.[0]?.url;
  if (!imgUrl) {
    return res.status(500).json({ error: "No image URL from Gradio" });
  }

  const fetchResp = await fetch(imgUrl);
  if (!fetchResp.ok) {
    return res.status(502).json({ error: "Failed fetching Gradio image" });
  }
  const arrayBuffer = await fetchResp.arrayBuffer();
  const outBuffer = Buffer.from(arrayBuffer);
  const b64 = outBuffer.toString("base64");
  const contentType = fetchResp.headers.get("content-type") || "image/png";

  // 4) respond with a data-URI that never expires
  return res.status(200).json({
    message: "Inference complete",
    imageDataURI: `data:${contentType};base64,${b64}`,
    byteSize: outBuffer.length,
  });
}
