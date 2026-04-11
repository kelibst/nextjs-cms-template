/**
 * GAPHTO WXR Parser
 *
 * Parses the WordPress XML export (gaphto.WordPress.2026-04-10.xml) as the
 * authoritative data source. Extracts all content types the REST API cannot
 * reach — leadership (TMM plugin), publications (WP Download Manager),
 * gallery structure (BWG), events (MEP), and every historical post — then
 * downloads all 159 referenced images via the WordPress.com Photon CDN.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import pLimit from 'p-limit';
import slugify from 'slugify';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const phpUnserialize = require('php-unserialize');

import { saveJson, downloadImage, toWpCdnUrl } from './utils';

const XML_PATH = path.resolve(__dirname, '../gaphto.WordPress.2026-04-10.xml');
const OUTPUT_DIR = path.resolve(__dirname, '../output');
const ASSETS_DIR = path.resolve(__dirname, '../../scraped-assets');

fs.ensureDirSync(OUTPUT_DIR);
fs.ensureDirSync(ASSETS_DIR);

// ─── Slug helper ─────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}

// ─── XML field extractors ─────────────────────────────────────────────────────

/** Extract content from a CDATA section: <tag><![CDATA[...]]></tag> */
function cdata(block: string, tag: string): string {
  // Handle namespace tags like content:encoded, dc:creator, wp:post_id
  const escaped = tag.replace(':', '\\s*:\\s*');
  const re = new RegExp(
    `<${escaped}(?:\\s[^>]*)?><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${escaped}>`,
    'i'
  );
  const m = block.match(re);
  return m ? m[1].trim() : '';
}

/** Extract plain text (no CDATA): <tag>text</tag> */
function plain(block: string, tag: string): string {
  const escaped = tag.replace(':', '\\s*:\\s*');
  const re = new RegExp(`<${escaped}(?:\\s[^>]*)?>(.*?)<\\/${escaped}>`, 'is');
  const m = block.match(re);
  return m ? m[1].trim() : '';
}

/** Try CDATA first, then fall back to plain text */
function field(block: string, tag: string): string {
  return cdata(block, tag) || plain(block, tag);
}

/** Extract all postmeta key→value pairs from an item block */
function extractMeta(block: string): Record<string, string> {
  const meta: Record<string, string> = {};
  // Match both CDATA and non-CDATA meta values
  const re =
    /<wp:meta_key><!\[CDATA\[(.*?)\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    meta[m[1]] = m[2];
  }
  return meta;
}

/** Extract category nicenames from a post item */
function extractCategories(block: string): string[] {
  const re = /<category[^>]+domain="category"[^>]+nicename="([^"]+)"/gi;
  const cats: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    cats.push(m[1]);
  }
  return cats;
}

// ─── Item type ───────────────────────────────────────────────────────────────

interface WxrItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;         // 'YYYY-MM-DD HH:MM:SS'
  status: string;       // publish | draft | inherit | private
  postType: string;     // post | page | attachment | tmm | wpdmpro | mep_events | bwg_gallery
  parentId: string;
  attachmentUrl: string;
  categories: string[];
  meta: Record<string, string>;
  creator: string;
  link: string;
}

// ─── Parse all <item> blocks ─────────────────────────────────────────────────

function parseItems(xml: string): WxrItem[] {
  const items: WxrItem[] = [];
  // Use a global regex to find all <item>…</item> blocks
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;

  while ((m = re.exec(xml)) !== null) {
    const b = m[1];
    items.push({
      id:            field(b, 'wp:post_id'),
      title:         field(b, 'title'),
      slug:          field(b, 'wp:post_name'),
      content:       cdata(b, 'content:encoded'),
      excerpt:       cdata(b, 'excerpt:encoded'),
      date:          field(b, 'wp:post_date'),
      status:        field(b, 'wp:status'),
      postType:      field(b, 'wp:post_type'),
      parentId:      field(b, 'wp:post_parent'),
      attachmentUrl: field(b, 'wp:attachment_url'),
      categories:    extractCategories(b),
      meta:          extractMeta(b),
      creator:       field(b, 'dc:creator'),
      link:          field(b, 'link'),
    });
  }

  console.log(`[INFO] Parsed ${items.length} total XML items`);
  return items;
}

// ─── Media index: post_id → attachment URL ───────────────────────────────────

function buildMediaIndex(items: WxrItem[]): Map<string, string> {
  const index = new Map<string, string>();
  for (const item of items) {
    if (item.postType === 'attachment' && item.attachmentUrl) {
      index.set(item.id, item.attachmentUrl);
    }
    // Also index by thumbnail meta in case parent posts reference them
    if (item.meta['_thumbnail_id']) {
      // Store reverse: the parent post id → thumbnail attachment id
      // (resolved later when we have the full index)
    }
  }
  return index;
}

// ─── Category → bucket mapping ───────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  'gaphto-news':          'gaphto-news',
  'latest-news':          'gaphto-news',
  'news':                 'gaphto-news',
  'notice':               'gaphto-news',
  'conference-reports':   'gaphto-news',
  'health-news':          'health-news',
  'our-team':             'gaphto-news',
  'leadership':           'gaphto-news',
  'services':             'gaphto-news',
  'others':               'blog',
};

function resolveCategory(cats: string[]): 'gaphto-news' | 'health-news' | 'blog' | 'announcement' {
  for (const c of cats) {
    const mapped = CATEGORY_MAP[c.toLowerCase()];
    if (mapped && mapped !== 'blog') return mapped as 'gaphto-news' | 'health-news';
    if (mapped) return 'blog';
  }
  return 'blog';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── 1. Posts ────────────────────────────────────────────────────────────────

interface Post {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  category: string;
  status: string;
  author: string;
  featuredImage: string | null;
  localImage: string | null;
  tags: string[];
  sourceUrl: string;
}

async function extractPosts(
  items: WxrItem[],
  mediaIndex: Map<string, string>
): Promise<{ news: Post[]; healthNews: Post[]; blog: Post[] }> {
  const posts = items.filter(i => i.postType === 'post');
  console.log(`[INFO] Found ${posts.length} posts`);

  const news: Post[] = [];
  const healthNews: Post[] = [];
  const blog: Post[] = [];

  const limit = pLimit(5);

  await Promise.all(posts.map(item => limit(async () => {
    const category = resolveCategory(item.categories);
    const rawExcerpt = item.excerpt ? stripHtml(item.excerpt) : stripHtml(item.content).substring(0, 300);

    // Featured image: resolve from thumbnail meta → media index
    const thumbnailId = item.meta['_thumbnail_id'];
    let featuredImage: string | null = null;
    if (thumbnailId && mediaIndex.has(thumbnailId)) {
      featuredImage = mediaIndex.get(thumbnailId)!;
    }
    // Fallback: first image in content
    if (!featuredImage) {
      const imgMatch = item.content.match(/src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|gif|webp)[^"]*)"/i);
      if (imgMatch) featuredImage = imgMatch[1];
    }

    let localImage: string | null = null;
    if (featuredImage) {
      const filename = path.basename(featuredImage.split('?')[0]);
      localImage = `posts/${filename}`;
      try {
        await downloadImage(featuredImage, localImage);
      } catch (e: any) {
        console.warn(`[WARN] Could not download post image ${filename}: ${e.message}`);
      }
    }

    const post: Post = {
      slug:         item.slug || toSlug(item.title),
      title:        item.title,
      content:      item.content,
      excerpt:      rawExcerpt.length > 300 ? rawExcerpt.substring(0, 300) : rawExcerpt,
      date:         item.date ? item.date.split(' ')[0] : '',
      category,
      status:       item.status === 'publish' ? 'published' : 'draft',
      author:       item.creator || 'GAPHTO',
      featuredImage,
      localImage,
      tags:         [],
      sourceUrl:    item.link,
    };

    if (category === 'gaphto-news') news.push(post);
    else if (category === 'health-news') healthNews.push(post);
    else blog.push(post);
  })));

  // Sort by date descending
  const byDate = (a: Post, b: Post) => (b.date > a.date ? 1 : -1);
  news.sort(byDate); healthNews.sort(byDate); blog.sort(byDate);

  return { news, healthNews, blog };
}

// ─── 2. Pages ────────────────────────────────────────────────────────────────

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  parentId: string;
  status: string;
  date: string;
}

function extractPages(items: WxrItem[]): Page[] {
  return items
    .filter(i => i.postType === 'page')
    .map(i => ({
      id:       i.id,
      slug:     i.slug || toSlug(i.title),
      title:    i.title,
      content:  i.content,
      parentId: i.parentId,
      status:   i.status,
      date:     i.date ? i.date.split(' ')[0] : '',
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

// ─── 3. Leadership (TMM plugin) ───────────────────────────────────────────────

interface LeadershipMember {
  name: string;
  role: string;
  imageUrl: string | null;
  localImage: string | null;
  bio: string | null;
  facebookUrl: string | null;
  sortOrder: number;
}

async function extractLeadership(items: WxrItem[]): Promise<LeadershipMember[]> {
  const tmmItem = items.find(i => i.postType === 'tmm');
  if (!tmmItem) {
    console.warn('[WARN] No TMM item found — no leadership data');
    return [];
  }

  const serialized = tmmItem.meta['_tmm_head'];
  if (!serialized) {
    console.warn('[WARN] TMM item has no _tmm_head meta');
    return [];
  }

  // PHP unserialize the array of member objects
  let members: unknown;
  try {
    members = phpUnserialize.unserialize(serialized);
  } catch (e: any) {
    console.error(`[ERROR] PHP unserialize failed: ${e.message}`);
    return [];
  }

  if (!Array.isArray(members)) {
    console.warn('[WARN] Unserialized TMM data is not an array');
    return [];
  }

  console.log(`[INFO] Found ${members.length} leadership members from TMM`);

  const limit = pLimit(3);
  const results: LeadershipMember[] = [];

  await Promise.all(
    (members as Record<string, string>[]).map((m, idx) =>
      limit(async () => {
        const firstName = (m['_tmm_firstname'] || '').trim();
        const lastName  = (m['_tmm_lastname']  || '').trim();
        const name      = `${firstName} ${lastName}`.trim();
        const role      = (m['_tmm_job']        || '').trim();
        const imageUrl  = (m['_tmm_photo']      || '').trim() || null;
        const facebook  = (m['_tmm_sc_type1'] === 'facebook' ? m['_tmm_sc_url1'] : '') || null;
        const desc      = (m['_tmm_desc']        || '').trim() || null;

        if (!name) return;

        let localImage: string | null = null;
        if (imageUrl) {
          const filename = path.basename(imageUrl.split('?')[0]);
          localImage = `leadership/${filename}`;
          try {
            await downloadImage(imageUrl, localImage);
          } catch (e: any) {
            console.warn(`[WARN] Could not download leadership image for ${name}: ${e.message}`);
          }
        }

        results.push({
          name,
          role,
          imageUrl,
          localImage,
          bio:        desc,
          facebookUrl: facebook && facebook !== 'https://web.facebook.com' && facebook !== ''
            ? facebook
            : null,
          sortOrder: idx,
        });
      })
    )
  );

  return results;
}

// ─── 4. Publications (WP Download Manager) ───────────────────────────────────

interface Publication {
  slug: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  type: string | null;
  year: string | null;
  isPublic: boolean;
}

function extractPublications(items: WxrItem[]): Publication[] {
  const pubs = items.filter(i => i.postType === 'wpdmpro');
  console.log(`[INFO] Found ${pubs.length} publications (WP Download Manager)`);

  return pubs.map(item => {
    // __wpdm_files is a PHP-serialized array like a:1:{i:0;s:28:"Tamale Conference Report.pdf";}
    let fileUrl: string | null = null;
    const filesRaw = item.meta['__wpdm_files'];
    if (filesRaw) {
      try {
        const files = phpUnserialize.unserialize(filesRaw);
        if (Array.isArray(files) && files.length > 0) {
          // WP Download Manager stores files relative to uploads directory
          fileUrl = files[0] as string;
        }
      } catch { /* ignore */ }
    }

    // Try to determine year from the date
    const year = item.date ? item.date.substring(0, 4) : null;

    return {
      slug:        item.slug || toSlug(item.title),
      title:       item.title,
      description: item.content ? stripHtml(item.content).substring(0, 500) : null,
      fileUrl,
      type:        fileUrl?.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Document',
      year,
      isPublic:    item.status === 'publish',
    };
  });
}

// ─── 5. Gallery ───────────────────────────────────────────────────────────────

interface GalleryImage {
  url: string;
  localPath: string;
  caption: string | null;
  sortOrder: number;
}

interface GalleryAlbum {
  albumTitle: string;
  albumSlug: string;
  eventDate: string | null;
  images: GalleryImage[];
}

async function extractGallery(items: WxrItem[]): Promise<GalleryAlbum[]> {
  // Group attachment items by parent post (gallery albums)
  const attachments = items.filter(i => i.postType === 'attachment');
  const pages       = items.filter(i => i.postType === 'page');

  console.log(`[INFO] Found ${attachments.length} attachments for gallery grouping`);

  // Build parent id → title map
  const parentTitle = new Map<string, string>();
  for (const p of [...pages, ...items.filter(i => i.postType === 'post')]) {
    parentTitle.set(p.id, p.title);
  }

  // Group attachments by parent
  const albumMap = new Map<string, { title: string; date: string; images: GalleryImage[] }>();

  // Process image attachments only (skip PDFs and other files)
  const imageAttachments = attachments.filter(a =>
    a.attachmentUrl && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(a.attachmentUrl)
  );

  const limit = pLimit(5);

  await Promise.all(imageAttachments.map((att, idx) => limit(async () => {
    const url = att.attachmentUrl;
    if (!url || url.includes('demo.wenthemes.com')) return;

    // Determine album: use parent page title, or year from URL as fallback
    let albumTitle: string;
    let albumDate: string | null = null;

    if (att.parentId && att.parentId !== '0' && parentTitle.has(att.parentId)) {
      albumTitle = parentTitle.get(att.parentId)!;
    } else {
      // Group by year extracted from URL path
      const yearMatch = url.match(/\/(\d{4})\/\d{2}\//);
      albumTitle = yearMatch ? `${yearMatch[1]} Gallery` : 'GAPHTO Gallery';
    }

    // Date from attachment's post date
    albumDate = att.date ? att.date.split(' ')[0] : null;

    const filename = path.basename(url.split('?')[0]);
    const albumSlug = toSlug(albumTitle);
    const localPath = `gallery/${albumSlug}/${filename}`;

    try {
      await downloadImage(url, localPath);
    } catch (e: any) {
      console.warn(`[WARN] Could not download gallery image ${filename}: ${e.message}`);
    }

    if (!albumMap.has(albumTitle)) {
      albumMap.set(albumTitle, { title: albumTitle, date: albumDate || '', images: [] });
    }
    albumMap.get(albumTitle)!.images.push({
      url,
      localPath,
      caption: att.title || null,
      sortOrder: idx,
    });
  })));

  // Convert map to albums array, fix sort orders per album
  return Array.from(albumMap.entries()).map(([title, album]) => {
    album.images.forEach((img, i) => { img.sortOrder = i; });
    return {
      albumTitle: title,
      albumSlug:  toSlug(title),
      eventDate:  album.date || null,
      images:     album.images,
    };
  });
}

// ─── 6. Events (MEP plugin + CPD page) ───────────────────────────────────────

interface Event {
  title: string;
  slug: string;
  description: string;
  location: string | null;
  isOnline: boolean;
  startDate: string | null;
  endDate: string | null;
  priceGhs: number;
  status: 'upcoming' | 'past' | 'cancelled';
  featuredImage: string | null;
  sourceUrl: string;
}

function determineEventStatus(startDate: string | null): 'upcoming' | 'past' | 'cancelled' {
  if (!startDate) return 'past';
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return 'past';
  return start > new Date() ? 'upcoming' : 'past';
}

function extractEvents(items: WxrItem[]): Event[] {
  const eventItems = [
    ...items.filter(i => i.postType === 'mep_events'),
    // Also treat pages whose slug contains 'cpd' or 'event' as events
    ...items.filter(i =>
      i.postType === 'page' &&
      (i.slug.includes('cpd') || i.slug.includes('event') || i.slug.includes('registration'))
    ),
  ];

  console.log(`[INFO] Found ${eventItems.length} event items`);

  return eventItems.map(item => {
    // MEP plugin stores dates in postmeta
    const startRaw = item.meta['mep_start_date'] || item.meta['mep_event_start_date'] || null;
    const endRaw   = item.meta['mep_end_date']   || item.meta['mep_event_end_date']   || null;
    const location = item.meta['mep_event_venue'] || item.meta['mep_location'] || null;
    const priceRaw = item.meta['mep_event_cost']  || item.meta['mep_cost'] || '0';
    const price    = parseFloat(priceRaw.replace(/[^0-9.]/g, '')) || 0;

    // Fallback: extract date from content text
    let startDate: string | null = null;
    if (startRaw) {
      try {
        startDate = new Date(startRaw).toISOString();
      } catch { /* ignore */ }
    }
    if (!startDate) {
      const dateMatch = item.content.match(/(?:date|when|on)[:\s]+(\w+ \d{1,2},?\s*\d{4})/i);
      if (dateMatch) {
        try { startDate = new Date(dateMatch[1]).toISOString(); } catch { /* ignore */ }
      }
    }

    return {
      title:        item.title,
      slug:         item.slug || toSlug(item.title),
      description:  item.content,
      location:     location || null,
      isOnline:     item.content.toLowerCase().includes('online') ||
                    item.content.toLowerCase().includes('webinar') ||
                    item.content.toLowerCase().includes('zoom'),
      startDate,
      endDate:      endRaw ? (() => { try { return new Date(endRaw).toISOString(); } catch { return null; } })() : null,
      priceGhs:     price,
      status:       determineEventStatus(startDate),
      featuredImage: null,
      sourceUrl:    item.link,
    };
  });
}

// ─── 7. Download all images referenced in XML ─────────────────────────────────

async function downloadAllImages(xml: string): Promise<number> {
  console.log(`\n[INFO] Scanning XML for all gaphto.org image URLs...`);

  // Extract every gaphto.org/wp-content/uploads URL in the XML
  const urlSet = new Set<string>();
  const re = /https?:\/\/www\.gaphto\.org\/wp-content\/uploads\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp|pdf)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    // Strip size suffixes like -150x150, -300x200 — only keep originals
    const url = m[0].replace(/-\d+x\d+(\.\w+)$/, '$1');
    urlSet.add(url);
  }

  const urls = [...urlSet].filter(u => !u.includes('demo.wenthemes.com'));
  console.log(`[INFO] Found ${urls.length} unique gaphto.org asset URLs to download`);

  let downloaded = 0;
  let skipped = 0;
  const limit = pLimit(5);

  await Promise.all(urls.map(url => limit(async () => {
    // Preserve the year/month directory structure from the URL
    const uploadPathMatch = url.match(/\/wp-content\/uploads\/(\d{4}\/\d{2}\/.+)$/i);
    if (!uploadPathMatch) return;

    const relativePath = `uploads/${uploadPathMatch[1]}`;
    const fullPath = path.join(ASSETS_DIR, relativePath);

    if (await fs.pathExists(fullPath)) {
      skipped++;
      return;
    }

    try {
      await downloadImage(url, relativePath);
      downloaded++;
    } catch (e: any) {
      console.warn(`[WARN] Could not download ${path.basename(url)}: ${e.message}`);
    }
  })));

  console.log(`[INFO] Images: ${downloaded} downloaded, ${skipped} already existed`);
  return downloaded + skipped;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('GAPHTO WXR Parser — Authoritative Data Extraction');
  console.log('='.repeat(60));

  // Read XML (37MB — fine for Node.js/Bun heap)
  console.log(`\n[INFO] Reading ${XML_PATH}...`);
  const xml = await fs.readFile(XML_PATH, 'utf-8');
  console.log(`[INFO] Loaded ${(xml.length / 1024 / 1024).toFixed(1)}MB`);

  // Parse all items
  const items = parseItems(xml);

  // Print item type summary
  const typeCounts = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.postType] = (acc[i.postType] || 0) + 1;
    return acc;
  }, {});
  console.log('\n[INFO] Item types:');
  Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => {
    console.log(`  ${t.padEnd(25)} ${c}`);
  });

  // Build media index for featured image resolution
  const mediaIndex = buildMediaIndex(items);
  console.log(`\n[INFO] Media index: ${mediaIndex.size} attachments indexed`);

  const summary: Record<string, number> = {};

  // ── 1. Posts ────────────────────────────────────────────────────────────────
  console.log('\n[INFO] Extracting posts...');
  const { news, healthNews, blog } = await extractPosts(items, mediaIndex);
  await saveJson('news.json',        news);
  await saveJson('health-news.json', healthNews);
  await saveJson('blog.json',        blog);
  summary['posts:gaphto-news']  = news.length;
  summary['posts:health-news']  = healthNews.length;
  summary['posts:blog']         = blog.length;
  console.log(`[OK] Posts: ${news.length} news, ${healthNews.length} health-news, ${blog.length} blog`);

  // ── 2. Pages ────────────────────────────────────────────────────────────────
  console.log('\n[INFO] Extracting pages...');
  const pages = extractPages(items);
  await saveJson('pages.json', pages);
  summary['pages'] = pages.length;
  console.log(`[OK] Pages: ${pages.length}`);

  // ── 3. Leadership ───────────────────────────────────────────────────────────
  console.log('\n[INFO] Extracting leadership from TMM plugin data...');
  const leadership = await extractLeadership(items);
  await saveJson('leadership.json', leadership);
  summary['leadership'] = leadership.length;
  console.log(`[OK] Leadership: ${leadership.length} members`);
  leadership.forEach(m => console.log(`  - ${m.name} (${m.role})`));

  // ── 4. Publications ──────────────────────────────────────────────────────────
  console.log('\n[INFO] Extracting publications from WP Download Manager...');
  const publications = extractPublications(items);
  await saveJson('publications.json', publications);
  summary['publications'] = publications.length;
  console.log(`[OK] Publications: ${publications.length}`);

  // ── 5. Gallery ───────────────────────────────────────────────────────────────
  console.log('\n[INFO] Extracting gallery from attachments...');
  const gallery = await extractGallery(items);
  await saveJson('gallery.json', gallery);
  summary['gallery:albums'] = gallery.length;
  summary['gallery:images'] = gallery.reduce((t, a) => t + a.images.length, 0);
  console.log(`[OK] Gallery: ${gallery.length} albums, ${summary['gallery:images']} images`);

  // ── 6. Events ────────────────────────────────────────────────────────────────
  console.log('\n[INFO] Extracting events...');
  const events = extractEvents(items);
  await saveJson('events.json', events);
  summary['events'] = events.length;
  console.log(`[OK] Events: ${events.length}`);

  // ── 7. Full image download ───────────────────────────────────────────────────
  console.log('\n[INFO] Downloading all referenced images...');
  const imgCount = await downloadAllImages(xml);
  summary['images:total'] = imgCount;

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n\n' + '='.repeat(60));
  console.log('WXR PARSE SUMMARY');
  console.log('='.repeat(60));
  for (const [key, count] of Object.entries(summary)) {
    console.log(`  ${key.padEnd(30)} ${count}`);
  }
  console.log('='.repeat(60) + '\n');
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
