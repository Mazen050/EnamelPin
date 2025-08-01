import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

// const response_0 = await fetch("https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png");
// const exampleImage = await response_0.blob();
						
// const client = await Client.connect("black-forest-labs/FLUX.1-Kontext-Dev");
// const result = await client.predict("/infer", { 
// 				input_image: exampleImage, 		
// 		prompt: "Add a texture", 		
// 		seed: 0, 		
// 		randomize_seed: true, 		
// 		guidance_scale: 1, 		
// 		steps: 1, 
// });

// console.log(result.data);

document.querySelector("#generateBtn").addEventListener("click",generate)
const inp = document.querySelector("#fileInput")

let selectedblob;

inp.addEventListener("change",async (e)=>{
    const img = e.target.files[0]
    if (!img) return;

    selectedblob = img;

})

async function generate(){    

    // const response_0 = await fetch("https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png");
    // const exampleImage = await response_0.blob();
                            
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

    const div = document.querySelector("#imgholder")
    const resultimg=document.createElement("img")
    resultimg.src = result.data[0].url;
    div.appendChild(resultimg);
}