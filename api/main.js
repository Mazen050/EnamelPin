import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";


exports.handler = async (event) => {
  // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
        statusCode: 405,
        headers: { 'Allow': 'POST' },
        body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }


    const bodyBase64 = event.isBase64Encoded
    ? event.body
    : Buffer.from(event.body, 'utf8').toString('base64');

  // Decode the image into a Buffer
    //   const imageBuffer = Buffer.from(bodyBase64, 'base64');

    const client = await Client.connect("black-forest-labs/FLUX.1-Kontext-Dev");
    const result = await client.predict("/infer", { 
                    input_image: selectedblob, 		
            prompt: "put a texture on this club crest that makes it look like an enamel pin", 		
            seed: 0, 		
            randomize_seed: true, 		
            guidance_scale: 2.5, 		
            steps: 28, 
    });

    console.log(result.data);
  // ── YOUR IMAGE HANDLING HERE ──
  // e.g., upload to S3, run through a vision API, etc.
  // For demo, we'll just echo back the size:
    const byteSize = imageBuffer.length;

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        message: 'Image received successfully',
        contentType,
        byteSize
        })
    };
};
