// URL pública da API do WordPress
const WP_API_URL = "https://seujoelho.com/wp-json/wp/v2";

export interface WPPost {
  id: number;
  date: string;
  link: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  _embedded?: {
      'wp:featuredmedia'?: Array<{
          source_url: string;
      }>;
  };
}

// Função para buscar posts (Leitura pública não requer autenticação)
export const getWordPressPosts = async (searchQuery: string = ''): Promise<WPPost[]> => {
  // Adiciona _embed para trazer imagens destacadas se houver
  const endpoint = searchQuery 
    ? `${WP_API_URL}/posts?search=${encodeURIComponent(searchQuery)}&per_page=10&_embed`
    : `${WP_API_URL}/posts?per_page=10&_embed`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dados do seujoelho.com');
    }

    const data = await response.json();
    return data as WPPost[];
  } catch (error) {
    console.error("Erro WordPress:", error);
    throw error;
  }
};