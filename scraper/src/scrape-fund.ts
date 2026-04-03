import * as cheerio from 'cheerio';
import * as path from 'path';
import * as fs from 'fs-extra';
import axios from 'axios';
import { fetchPage, saveJson } from './utils';

interface FundData {
  description: string;
  pdfUrl: string | null;
  localPdf: string | null;
}

async function downloadPdf(pdfUrl: string, localPath: string): Promise<string | null> {
  const assetsDir = path.resolve(__dirname, '../../scraped-assets');
  const fullPath = path.join(assetsDir, localPath);

  if (await fs.pathExists(fullPath)) {
    console.log(`[INFO] PDF already exists at ${localPath}`);
    return localPath;
  }

  try {
    await fs.ensureDir(path.dirname(fullPath));
    const response = await axios.get(pdfUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 60000,
    });

    const writer = fs.createWriteStream(fullPath);
    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(`[OK] Downloaded PDF to ${localPath}`);
    return localPath;
  } catch (error: any) {
    console.warn(`[WARN] Failed to download PDF ${pdfUrl}: ${error.message}`);
    return null;
  }
}

async function scrapeFund(): Promise<FundData> {
  const FUND_URL = 'https://www.gaphto.org/gaphto-fund/';
  console.log(`[INFO] Scraping fund from ${FUND_URL}`);

  let html: string;
  try {
    html = await fetchPage(FUND_URL);
  } catch (error: any) {
    console.warn(`[WARN] Could not fetch fund page: ${error.message}`);
    return { description: '', pdfUrl: null, localPdf: null };
  }

  const $ = cheerio.load(html);

  // Extract main content
  const contentSelectors = [
    '.entry-content',
    '.post-content',
    '.page-content',
    'article .content',
    '#content article',
    'main article',
  ];

  let description = '';
  for (const selector of contentSelectors) {
    const el = $(selector);
    if (el.length > 0) {
      el.find('nav, footer, header, .navigation, .breadcrumb').remove();
      description = el.html() || '';
      if (description.trim()) break;
    }
  }

  if (!description) {
    $('nav, footer, header, aside, .sidebar').remove();
    description = $('main, #main, #content, body').first().html() || '';
  }

  // Find PDF link
  let pdfUrl: string | null = null;
  let localPdf: string | null = null;

  $('a').each((i, el) => {
    const href = $(el).attr('href') || '';
    if (href.toLowerCase().includes('.pdf') && !pdfUrl) {
      pdfUrl = href;
      if (!pdfUrl.startsWith('http')) {
        pdfUrl = `https://www.gaphto.org${pdfUrl}`;
      }
    }
  });

  // Also look for links with "download" text or "pdf" text
  if (!pdfUrl) {
    $('a').each((i, el) => {
      const text = $(el).text().toLowerCase();
      const href = $(el).attr('href') || '';
      if ((text.includes('download') || text.includes('pdf') || text.includes('document')) && href && !pdfUrl) {
        pdfUrl = href.startsWith('http') ? href : `https://www.gaphto.org${href}`;
      }
    });
  }

  // Download PDF if found
  if (pdfUrl) {
    console.log(`[INFO] Found PDF: ${pdfUrl}`);
    localPdf = await downloadPdf(pdfUrl, 'documents/gaphto-fund.pdf');
  }

  return { description, pdfUrl, localPdf };
}

async function main() {
  try {
    const fund = await scrapeFund();
    await saveJson('fund.json', fund);
    console.log(`[DONE] Fund: content=${fund.description.length > 0 ? 'yes' : 'no'}, pdf=${fund.pdfUrl ? 'yes' : 'no'}`);
    return 1;
  } catch (error: any) {
    console.error(`[ERROR] Fund scraper failed: ${error.message}`);
    return 0;
  }
}

export { main as scrapeFund };

if (require.main === module) {
  main().catch(console.error);
}
