
/**
 * Instagram API requires a *public* URL for images. 
 * Since our Gemini images are Base64, we must upload them to a host first.
 * This service uses ImgBB (Free API) for demonstration.
 */

// NOTE: In a real production app, you should use your own S3/Firebase bucket.
// This is a demo key. For production, replace with process.env.IMGBB_API_KEY
const IMGBB_API_KEY = '6d207e02198a847aa98d0a2a901485a5'; 

export const uploadImageToPublicHost = async (base64Image: string): Promise<string> => {
  try {
    // 1. Remove the Data URI prefix if present (e.g., "data:image/png;base64,")
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    // 2. Prepare FormData
    const formData = new FormData();
    formData.append("image", base64Data);

    // 3. Send to ImgBB
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error("Falha no upload da imagem: " + (data.error?.message || "Erro desconhecido"));
    }

    // Return the direct link to the image
    return data.data.url;

  } catch (error) {
    console.error("Image Host Error:", error);
    throw error;
  }
};
