import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import slugify from 'slugify';

const OUTPUT_DIR = path.resolve(__dirname, '../output');
const ASSETS_DIR = path.resolve(__dirname, '../../scraped-assets');

const WP_COM_API = 'https://public-api.wordpress.com/wp/v2/sites/www.gaphto.org';

/**
 * Convert a wp-content/uploads URL to the WordPress.com i0.wp.com CDN URL.
 * The CDN proxy is publicly accessible even when the origin returns 403.
 */
export function toWpCdnUrl(url: string): string {
  return url.replace(
    /^https?:\/\/www\.gaphto\.org\/wp-content\/uploads\//,
    'https://i0.wp.com/www.gaphto.org/wp-content/uploads/'
  );
}

/**
 * Fetch a WordPress page's rendered HTML content by its slug via the
 * WordPress.com public REST API. Returns the page title and content.rendered.
 * Returns empty strings if the page is not found.
 */
export async function fetchPageBySlug(slug: string): Promise<{ title: string; html: string }> {
  try {
    const response = await axios.get<Array<{ title: { rendered: string }; content: { rendered: string } }>>(
      `${WP_COM_API}/pages`,
      {
        params: { slug, _fields: 'title,content' },
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GAPHTOScraper/1.0)' },
      }
    );
    const pages = response.data;
    if (!pages || pages.length === 0) {
      console.warn(`[WARN] No page found for slug: ${slug}`);
      return { title: '', html: '' };
    }
    return {
      title: pages[0].title?.rendered || '',
      html: pages[0].content?.rendered || '',
    };
  } catch (error: any) {
    console.warn(`[WARN] fetchPageBySlug("${slug}") failed: ${error.message}`);
    return { title: '', html: '' };
  }
}

// Ensure directories exist
fs.ensureDirSync(OUTPUT_DIR);
fs.ensureDirSync(ASSETS_DIR);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchPage(url: string): Promise<string> {
  const maxAttempts = 3;
  const retryDelay = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await sleep(500); // 500ms delay between requests
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 30000,
      });
      return response.data as string;
    } catch (error: any) {
      if (attempt === maxAttempts) {
        console.warn(`[WARN] Failed to fetch ${url} after ${maxAttempts} attempts: ${error.message}`);
        throw error;
      }
      console.warn(`[WARN] Attempt ${attempt} failed for ${url}, retrying in ${retryDelay}ms...`);
      await sleep(retryDelay);
    }
  }
  throw new Error(`Failed to fetch ${url}`);
}

export async function saveJson(filename: string, data: unknown): Promise<void> {
  const filePath = path.join(OUTPUT_DIR, filename);
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeJson(filePath, data, { spaces: 2 });
  console.log(`[OK] Saved ${filename}`);
}

export async function downloadImage(url: string, localPath: string): Promise<string> {
  // Route through the WP.com CDN proxy to avoid 403s on the origin
  const cdnUrl = toWpCdnUrl(url);

  const fullPath = path.join(ASSETS_DIR, localPath);

  // Skip if already exists
  if (await fs.pathExists(fullPath)) {
    return localPath;
  }

  try {
    await fs.ensureDir(path.dirname(fullPath));
    await sleep(300);

    const response = await axios.get(cdnUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 30000,
    });

    const writer = fs.createWriteStream(fullPath);
    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return localPath;
  } catch (error: any) {
    console.warn(`[WARN] Failed to download image ${url}: ${error.message}`);
    return localPath;
  }
}

export function toSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function getAssetsDir(): string {
  return ASSETS_DIR;
}
