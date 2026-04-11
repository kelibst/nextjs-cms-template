import axios from 'axios';
import * as path from 'path';
import { saveJson, downloadImage } from './utils';
import pLimit from 'p-limit';

const BASE_API = 'https://public-api.wordpress.com/wp/v2/sites/www.gaphto.org';

interface WpPost {
  id: number;
  slug: string;
  link: string;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  categories: number[];
  featured_media: number;
  author: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

interface WpCategory {
  id: number;
  slug: string;
  name: string;
}

interface Post {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  category: string;
  author: string;
  featuredImage: string | null;
  localImage: string | null;
  tags: string[];
  sourceUrl: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extract the first image URL from post HTML content — used as a fallback
 * when the embedded featured media is unavailable.
 */
function extractFirstImageUrl(html: string): string | null {
  const match = html.match(/src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|gif|webp)[^"]*)"/i);
  return match ? match[1] : null;
}

async function fetchAllPosts(): Promise<WpPost[]> {
  const allPosts: WpPost[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    console.log(`[INFO] Fetching posts page ${page}/${totalPages}...`);
    const response = await axios.get<WpPost[]>(`${BASE_API}/posts`, {
      // _embed includes wp:featuredmedia so we never need a separate /media/{id} call
      params: { per_page: 100, page, _embed: true },
      timeout: 30000,
    });

    const tp = parseInt(response.headers['x-wp-totalpages'] || '1', 10);
    if (!isNaN(tp) && tp > 0) totalPages = tp;

    allPosts.push(...response.data);
    page++;
  }

  console.log(`[INFO] Fetched ${allPosts.length} total posts`);
  return allPosts;
}

async function fetchCategories(): Promise<Map<number, string>> {
  const response = await axios.get<WpCategory[]>(`${BASE_API}/categories`, {
    params: { per_page: 100 },
    timeout: 30000,
  });
  const map = new Map<number, string>();
  for (const cat of response.data) {
    map.set(cat.id, cat.slug);
  }
  return map;
}

function mapCategorySlug(categorySlug: string): string {
  const CATEGORY_MAP: Record<string, string> = {
    'gaphto-news': 'gaphto-news',
    'health-news': 'health-news',
    'blog': 'blog',
    'announcements-events': 'gaphto-news',
  };
  return CATEGORY_MAP[categorySlug] || 'blog';
}

export async function scrapeNews(): Promise<Record<string, number>> {
  console.log('\n[INFO] === Scraping news via WordPress REST API ===');

  const results: Record<string, number> = { news: 0, 'health-news': 0, blog: 0 };

  let categoryMap: Map<number, string>;
  let allPosts: WpPost[];

  try {
    categoryMap = await fetchCategories();
    console.log(`[INFO] Loaded ${categoryMap.size} categories`);
  } catch (error: any) {
    console.error(`[ERROR] Failed to fetch categories: ${error.message}`);
    return results;
  }

  try {
    allPosts = await fetchAllPosts();
  } catch (error: any) {
    console.error(`[ERROR] Failed to fetch posts: ${error.message}`);
    return results;
  }

  // Process posts into category buckets
  const newsPosts: Post[] = [];
  const healthNewsPosts: Post[] = [];
  const blogPosts: Post[] = [];

  const limit = pLimit(5);

  await Promise.all(allPosts.map(wpPost => limit(async () => {
    // Determine category
    let resolvedCategory = 'blog';
    for (const catId of wpPost.categories) {
      const catSlug = categoryMap.get(catId);
      if (catSlug) {
        const mapped = mapCategorySlug(catSlug);
        if (mapped !== 'blog') {
          resolvedCategory = mapped;
          break;
        }
        resolvedCategory = mapped;
      }
    }

    // Build post fields
    const title = stripHtml(wpPost.title.rendered);
    const content = wpPost.content.rendered;
    const rawExcerpt = stripHtml(wpPost.excerpt.rendered);
    const excerpt = rawExcerpt.length > 300 ? rawExcerpt.substring(0, 300) : rawExcerpt;
    const date = wpPost.date ? wpPost.date.split('T')[0] : '';

    // Featured image: prefer _embedded (no extra API call), fall back to content scan
    const featuredImage =
      wpPost._embedded?.['wp:featuredmedia']?.[0]?.source_url
      ?? extractFirstImageUrl(content)
      ?? null;

    // Download featured image (downloadImage auto-rewrites to i0.wp.com CDN)
    let localImage: string | null = null;
    if (featuredImage) {
      const imgFilename = path.basename(featuredImage.split('?')[0]);
      localImage = `posts/${imgFilename}`;
      try {
        await downloadImage(featuredImage, localImage);
      } catch (e: any) {
        console.warn(`[WARN] Could not download image for post ${wpPost.slug}: ${e.message}`);
      }
    }

    const post: Post = {
      slug: wpPost.slug,
      title,
      content,
      excerpt,
      date,
      category: resolvedCategory,
      author: 'GAPHTO',
      featuredImage,
      localImage,
      tags: [],
      sourceUrl: wpPost.link,
    };

    if (resolvedCategory === 'gaphto-news') {
      newsPosts.push(post);
    } else if (resolvedCategory === 'health-news') {
      healthNewsPosts.push(post);
    } else {
      blogPosts.push(post);
    }
  })));

  try {
    await saveJson('news.json', newsPosts);
    results['news'] = newsPosts.length;
    console.log(`[DONE] GAPHTO News: ${newsPosts.length} posts`);
  } catch (error: any) {
    console.error(`[ERROR] Failed to save news.json: ${error.message}`);
  }

  try {
    await saveJson('health-news.json', healthNewsPosts);
    results['health-news'] = healthNewsPosts.length;
    console.log(`[DONE] Health News: ${healthNewsPosts.length} posts`);
  } catch (error: any) {
    console.error(`[ERROR] Failed to save health-news.json: ${error.message}`);
  }

  try {
    await saveJson('blog.json', blogPosts);
    results['blog'] = blogPosts.length;
    console.log(`[DONE] Blog: ${blogPosts.length} posts`);
  } catch (error: any) {
    console.error(`[ERROR] Failed to save blog.json: ${error.message}`);
  }

  return results;
}

if (require.main === module) {
  scrapeNews().catch(console.error);
}
