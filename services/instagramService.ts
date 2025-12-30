
import { InstagramConfig, InstagramPublishResult } from '../types';
import { uploadImageToPublicHost } from './imageHostService';

const GRAPH_API_URL = 'https://graph.facebook.com/v18.0';

/**
 * Publishes a photo post to Instagram Business Account.
 * 
 * Flow:
 * 1. Upload Base64 image to public host (ImgBB) to get a URL.
 * 2. POST /{account_id}/media -> Creates a media container.
 * 3. POST /{account_id}/media_publish -> Publishes the container.
 */
export const publishToInstagram = async (
  config: InstagramConfig,
  base64Image: string,
  caption: string
): Promise<InstagramPublishResult> => {
  
  if (!config.accessToken || !config.accountId) {
    return { success: false, error: "Credenciais do Instagram não configuradas." };
  }

  try {
    // Step 1: Get Public Image URL
    console.log("1. Uploading image to public host...");
    const imageUrl = await uploadImageToPublicHost(base64Image);
    console.log("   Image URL:", imageUrl);

    // Step 2: Create Media Container
    console.log("2. Creating Instagram Media Container...");
    const containerUrl = `${GRAPH_API_URL}/${config.accountId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${config.accessToken}`;
    
    const containerRes = await fetch(containerUrl, { method: 'POST' });
    const containerData = await containerRes.json();

    if (containerData.error) {
      throw new Error(`Erro Container IG: ${containerData.error.message}`);
    }

    const creationId = containerData.id;

    // Step 3: Publish Media
    console.log("3. Publishing Media...");
    const publishUrl = `${GRAPH_API_URL}/${config.accountId}/media_publish?creation_id=${creationId}&access_token=${config.accessToken}`;
    
    const publishRes = await fetch(publishUrl, { method: 'POST' });
    const publishData = await publishRes.json();

    if (publishData.error) {
      throw new Error(`Erro Publicação IG: ${publishData.error.message}`);
    }

    return { success: true, postId: publishData.id };

  } catch (error: any) {
    console.error("Instagram Publish Error:", error);
    return { success: false, error: error.message || "Erro desconhecido ao publicar." };
  }
};

// Helper to save/load config from LocalStorage
export const getStoredInstagramConfig = (): InstagramConfig => {
  const saved = localStorage.getItem('medisocial_ig_config');
  if (saved) return JSON.parse(saved);
  return { accessToken: '', accountId: '', isConnected: false };
};

export const saveInstagramConfig = (config: InstagramConfig) => {
  localStorage.setItem('medisocial_ig_config', JSON.stringify({ ...config, isConnected: true }));
};

export const disconnectInstagram = () => {
  localStorage.removeItem('medisocial_ig_config');
};
