
import { PubMedArticle } from '../types';

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/**
 * Searches PubMed for articles matching the query.
 * Uses esearch.fcgi to get IDs and then efetch.fcgi to get details + abstract.
 */
export const searchPubMed = async (query: string): Promise<PubMedArticle[]> => {
  try {
    // 1. Search for IDs (Recent 5 articles, sorted by date)
    const searchUrl = `${BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=5&sort=date`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) throw new Error('Falha na busca do PubMed');
    
    const searchData = await searchResponse.json();
    const ids = searchData.esearchresult?.idlist;

    if (!ids || ids.length === 0) {
      return [];
    }

    // 2. Fetch Details via EFETCH (Returns XML with Abstract)
    const idsString = ids.join(',');
    const fetchUrl = `${BASE_URL}/efetch.fcgi?db=pubmed&id=${idsString}&retmode=xml`;
    const fetchResponse = await fetch(fetchUrl);

    if (!fetchResponse.ok) throw new Error('Falha nos detalhes do PubMed');

    const xmlText = await fetchResponse.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const articles = xmlDoc.getElementsByTagName("PubmedArticle");

    const parsedArticles: PubMedArticle[] = [];

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        
        // Extract basic fields
        const uid = article.getElementsByTagName("PMID")[0]?.textContent || "";
        const title = article.getElementsByTagName("ArticleTitle")[0]?.textContent || "Sem título";
        
        // Extract Journal/Source
        const journalTitle = article.getElementsByTagName("Title")[0]?.textContent || "";
        const journalIso = article.getElementsByTagName("ISOAbbreviation")[0]?.textContent || "";
        const source = journalIso || journalTitle || "Journal";

        // Extract Date
        const pubDateNode = article.getElementsByTagName("PubDate")[0];
        let year = "";
        if (pubDateNode) {
            year = pubDateNode.getElementsByTagName("Year")[0]?.textContent || "";
        }
        
        // Extract Authors
        const authorList = article.getElementsByTagName("Author");
        const authors = [];
        for (let j = 0; j < Math.min(authorList.length, 3); j++) {
            const lastName = authorList[j].getElementsByTagName("LastName")[0]?.textContent || "";
            const initials = authorList[j].getElementsByTagName("Initials")[0]?.textContent || "";
            if (lastName) authors.push({ name: `${lastName} ${initials}` });
        }

        // Extract Abstract (Crucial for RAG)
        let abstractText = "";
        const abstractNode = article.getElementsByTagName("Abstract")[0];
        if (abstractNode) {
            const abstractTexts = abstractNode.getElementsByTagName("AbstractText");
            for (let k = 0; k < abstractTexts.length; k++) {
                const label = abstractTexts[k].getAttribute("Label");
                const text = abstractTexts[k].textContent;
                if (label) {
                    abstractText += `**${label}**: ${text}\n`;
                } else {
                    abstractText += `${text}\n`;
                }
            }
        }

        parsedArticles.push({
            uid,
            title,
            source,
            pubdate: year,
            authors,
            volume: "",
            url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
            abstract: abstractText.trim()
        });
    }

    return parsedArticles;

  } catch (error) {
    console.error("PubMed API Error:", error);
    return [];
  }
};
