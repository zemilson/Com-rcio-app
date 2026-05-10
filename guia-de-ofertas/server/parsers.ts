import axios from 'axios';
import * as xml2js from 'xml2js';
import * as cheerio from 'cheerio';

export interface ParsedOffer {
  title: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  source: string;
  sourceUrl: string;
  originalUrl?: string;
  expiresAt?: Date;
}

/**
 * Parser para JSON estruturado
 */
export async function parseJSON(url: string): Promise<ParsedOffer[]> {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data;

    // Assumir que a resposta é um array de ofertas
    const offers = Array.isArray(data) ? data : data.offers || data.items || [];

    return offers.map((item: any) => ({
      title: item.title || item.nome || 'Sem título',
      description: item.description || item.descricao,
      price: parseFloat(item.price || item.preco) || undefined,
      originalPrice: parseFloat(item.originalPrice || item.preco_original) || undefined,
      image: item.image || item.imagem,
      source: item.source || item.fonte || 'JSON API',
      sourceUrl: url,
      originalUrl: item.originalUrl || item.url_original,
      expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
    }));
  } catch (error) {
    throw new Error(`Erro ao fazer parse JSON: ${error}`);
  }
}

/**
 * Parser para RSS/XML
 */
export async function parseRSS(url: string): Promise<ParsedOffer[]> {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);

    const items = result.rss?.channel?.[0]?.item || [];

    return items.map((item: any) => ({
      title: item.title?.[0] || 'Sem título',
      description: item.description?.[0],
      price: parseFloat(item.price?.[0]) || undefined,
      originalPrice: parseFloat(item.originalPrice?.[0]) || undefined,
      image: item.image?.[0] || item.enclosure?.[0]?.$.url,
      source: item.source?.[0] || 'RSS Feed',
      sourceUrl: url,
      originalUrl: item.link?.[0],
      expiresAt: item.expiresAt?.[0] ? new Date(item.expiresAt[0]) : undefined,
    }));
  } catch (error) {
    throw new Error(`Erro ao fazer parse RSS: ${error}`);
  }
}

/**
 * Parser para HTML com CSS Selector
 * Requer um objeto com cssSelectors para cada campo
 */
export async function parseHTML(
  url: string,
  selectors: {
    title: string;
    price?: string;
    description?: string;
    image?: string;
    originalUrl?: string;
  }
): Promise<ParsedOffer[]> {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    const offers: ParsedOffer[] = [];

    // Iterar sobre cada elemento selecionado pelo seletor de título
    $(selectors.title).each((index, element) => {
      const $element = $(element);
      const title = $element.text().trim();

      if (!title) return;

      const offer: ParsedOffer = {
        title,
        description: selectors.description
          ? $element.find(selectors.description).text().trim()
          : undefined,
        price: selectors.price
          ? parseFloat($element.find(selectors.price).text().replace(/[^0-9.,]/g, ''))
          : undefined,
        image: selectors.image
          ? $element.find(selectors.image).attr('src')
          : undefined,
        source: 'Web Scraping',
        sourceUrl: url,
        originalUrl: selectors.originalUrl
          ? $element.find(selectors.originalUrl).attr('href')
          : url,
      };

      offers.push(offer);
    });

    return offers;
  } catch (error) {
    throw new Error(`Erro ao fazer parse HTML: ${error}`);
  }
}

/**
 * Parser para Google Sheets CSV
 * Aceita tanto URL quanto string CSV diretamente
 */
export function parseCSV(data: string): ParsedOffer[] {
  try {
    const lines = data.split('\n');

    if (lines.length < 2) {
      return [];
    }

    // Assumir que a primeira linha é o header
    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
    const offers: ParsedOffer[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map((v: string) => v.trim());
      const offer: any = {};

      headers.forEach((header: string, idx: number) => {
        offer[header] = values[idx];
      });

      offers.push({
        title: offer.title || offer.nome || 'Sem título',
        description: offer.description || offer.descricao,
        price: parseFloat(offer.price || offer.preco) || undefined,
        originalPrice: parseFloat(offer.originalprice || offer.preco_original) || undefined,
        image: offer.image || offer.imagem,
        source: offer.source || offer.fonte || 'Google Sheets',
        sourceUrl: offer.sourceurl || offer.url_fonte || 'CSV',
        originalUrl: offer.originalurl || offer.url_original,
        expiresAt: offer.expiresat || offer.expira ? new Date(offer.expiresat || offer.expira) : undefined,
      });
    }

    return offers;
  } catch (error) {
    throw new Error(`Erro ao fazer parse CSV: ${error}`);
  }
}

/**
 * Parser para Google Sheets CSV via URL
 */
export async function parseCSVFromURL(url: string): Promise<ParsedOffer[]> {
  try {
    // Converter URL de compartilhamento do Google Sheets para export CSV
    let csvUrl = url;
    if (url.includes('docs.google.com/spreadsheets')) {
      const sheetId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (sheetId) {
        csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      }
    }

    const response = await axios.get(csvUrl, { timeout: 10000 });
    return parseCSV(response.data);
  } catch (error) {
    throw new Error(`Erro ao fazer parse CSV: ${error}`);
  }
}

/**
 * Função principal de parse que detecta o tipo de origem
 */
export async function parseOffers(
  url: string,
  parserType: 'json' | 'rss' | 'html' | 'csv',
  selectors?: any
): Promise<ParsedOffer[]> {
  switch (parserType) {
    case 'json':
      return parseJSON(url);
    case 'rss':
      return parseRSS(url);
    case 'html':
      return parseHTML(url, selectors || { title: '.offer-title' });
    case 'csv':
      return parseCSVFromURL(url);
    default:
      throw new Error(`Parser type não suportado: ${parserType}`);
  }
}
