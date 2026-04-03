import * as cheerio from 'cheerio';
import * as path from 'path';
import { fetchPage, saveJson, downloadImage, toSlug } from './utils';
import pLimit from 'p-limit';

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

function extractEventDate($: ReturnType<typeof cheerio.load>): string | null {
  const dateEl = $('time, .date, .event-date, [datetime]').first();
  const rawDate = dateEl.attr('datetime') || dateEl.text().trim();
  if (rawDate) {
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    } catch { /* ignore */ }
  }
  const titleText = $('h1, h2').first().text();
  const dateMatch = titleText.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+ \d{1,2},? \d{4}|\d{4}/);
  if (dateMatch) {
    try {
      const d = new Date(dateMatch[0]);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    } catch { /* ignore */ }
  }
  return null;
}

async function scrapeAlbumPage(albumUrl: string, albumTitle: string): Promise<GalleryAlbum | null> {
  console.log(`[INFO] Scraping album: ${albumTitle} at ${albumUrl}`);
  const albumSlug = toSlug(albumTitle);

  let html: string;
  try {
    html = await fetchPage(albumUrl);
  } catch (error: any) {
    console.warn(`[WARN] Could not fetch album ${albumUrl}: ${error.message}`);
    return null;
  }

  const $ = cheerio.load(html);
  const images: GalleryImage[] = [];
  const seenUrls = new Set<string>();
  let sortOrder = 0;

  const eventDate = extractEventDate($);

  // Strategy 1: BWG (Best WordPress Gallery) plugin — confirmed selectors
  // Thumbnail gallery: .bwg-container-1 .bwg-item a (href = full image URL)
  const bwgThumbnails = $('.bwg-container-1 .bwg-item a');
  if (bwgThumbnails.length > 0) {
    console.log(`[INFO] BWG thumbnail gallery: ${bwgThumbnails.length} items`);
    bwgThumbnails.each((_, el) => {
      const $a = $(el);
      let imgUrl = $a.attr('href') || '';
      if (!imgUrl) {
        imgUrl = $a.find('img').attr('src') || '';
      }
      if (!imgUrl || imgUrl === '#') return;
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
      if (!imgUrl.startsWith('http')) return;
      if (seenUrls.has(imgUrl)) return;
      seenUrls.add(imgUrl);

      const caption = $a.find('img').attr('alt') || null;
      const imgFilename = path.basename(imgUrl.split('?')[0]);
      images.push({
        url: imgUrl,
        localPath: `gallery/${albumSlug}/${imgFilename}`,
        caption,
        sortOrder: sortOrder++,
      });
    });
  }

  // Strategy 2: BWG slideshow filmstrip
  if (images.length === 0) {
    const bwgSlideshow = $('.bwg_slideshow_filmstrip_thumbnail_0, .bwg_slideshow_filmstrip_thumbnails_0 img');
    if (bwgSlideshow.length > 0) {
      console.log(`[INFO] BWG slideshow gallery: ${bwgSlideshow.length} items`);
      bwgSlideshow.each((_, el) => {
        const $el = $(el);
        let imgUrl = $el.attr('src') || '';
        if (!imgUrl) return;
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
        if (!imgUrl.startsWith('http')) return;
        if (seenUrls.has(imgUrl)) return;
        seenUrls.add(imgUrl);

        const caption = $el.attr('title') || $el.attr('alt') || null;
        const imgFilename = path.basename(imgUrl.split('?')[0]);
        images.push({
          url: imgUrl,
          localPath: `gallery/${albumSlug}/${imgFilename}`,
          caption,
          sortOrder: sortOrder++,
        });
      });
    }
  }

  // Strategy 3: generic BWG containers by id pattern
  if (images.length === 0) {
    $('[id^="bwg_container"]').each((_, container) => {
      $(container).find('img').each((_, img) => {
        const $img = $(img);
        let imgUrl = $img.attr('src') || $img.attr('data-src') || '';
        if (!imgUrl) return;
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
        if (!imgUrl.startsWith('http')) return;
        if (seenUrls.has(imgUrl)) return;
        seenUrls.add(imgUrl);

        // Check parent <a> for full-size version
        const $parent = $img.parent('a');
        if ($parent.length) {
          const href = $parent.attr('href') || '';
          if (href && href.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) {
            imgUrl = href;
          }
        }

        const caption = $img.attr('alt') || null;
        const imgFilename = path.basename(imgUrl.split('?')[0]);
        images.push({
          url: imgUrl,
          localPath: `gallery/${albumSlug}/${imgFilename}`,
          caption,
          sortOrder: sortOrder++,
        });
      });
    });
  }

  // Strategy 4: standard WordPress gallery blocks / NextGen
  if (images.length === 0) {
    const standardSelectors = [
      '.gallery img',
      '.wp-block-gallery img',
      '.gallery-item img',
      '.ngg-gallery-thumbnail img',
      '.ngg-images img',
      'figure img',
    ];

    for (const selector of standardSelectors) {
      const found = $(selector);
      if (found.length > 0) {
        console.log(`[INFO] Standard gallery selector "${selector}": ${found.length} items`);
        found.each((_, img) => {
          const $img = $(img);
          let imgUrl = $img.attr('data-full-url') || $img.attr('data-src') || $img.attr('src') || '';
          if (!imgUrl) return;
          if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
          if (!imgUrl.startsWith('http')) return;
          if (seenUrls.has(imgUrl)) return;
          seenUrls.add(imgUrl);

          const $parentA = $img.parent('a');
          if ($parentA.length) {
            const href = $parentA.attr('href') || '';
            if (href && (href.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) || href.includes('/wp-content/uploads/'))) {
              imgUrl = href;
            }
          }

          // Skip tiny images
          const width = parseInt($img.attr('width') || '0');
          const height = parseInt($img.attr('height') || '0');
          if ((width > 0 && width < 50) || (height > 0 && height < 50)) return;

          const caption = $img.attr('alt')
            || $img.closest('figure').find('figcaption').text().trim()
            || $img.closest('.gallery-item').find('.gallery-caption, .caption').text().trim()
            || null;

          const imgFilename = path.basename(imgUrl.split('?')[0]);
          images.push({
            url: imgUrl,
            localPath: `gallery/${albumSlug}/${imgFilename}`,
            caption: caption || null,
            sortOrder: sortOrder++,
          });
        });
        if (images.length > 0) break;
      }
    }
  }

  // Fallback: all content images
  if (images.length === 0) {
    console.log('[INFO] Gallery fallback: all content images');
    $('.entry-content img, .post-content img, main img, #content img').each((_, img) => {
      const $img = $(img);
      let imgUrl = $img.attr('src') || '';
      if (!imgUrl) return;
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
      if (!imgUrl.startsWith('http')) return;
      if (seenUrls.has(imgUrl)) return;
      seenUrls.add(imgUrl);

      const width = parseInt($img.attr('width') || '0');
      const height = parseInt($img.attr('height') || '0');
      if ((width > 0 && width < 50) || (height > 0 && height < 50)) return;

      const imgFilename = path.basename(imgUrl.split('?')[0]);
      images.push({
        url: imgUrl,
        localPath: `gallery/${albumSlug}/${imgFilename}`,
        caption: $img.attr('alt') || null,
        sortOrder: sortOrder++,
      });
    });
  }

  // Download all images
  const limit = pLimit(3);
  await Promise.all(
    images.map(img =>
      limit(async () => {
        try {
          await downloadImage(img.url, img.localPath);
        } catch (e: any) {
          console.warn(`[WARN] Failed to download gallery image ${img.url}: ${e.message}`);
        }
      })
    )
  );

  return { albumTitle, albumSlug, eventDate, images };
}

async function scrapeGallery(): Promise<GalleryAlbum[]> {
  const GALLERY_URL = 'https://www.gaphto.org/gallery/';
  console.log(`[INFO] Scraping gallery from ${GALLERY_URL}`);

  let html: string;
  try {
    html = await fetchPage(GALLERY_URL);
  } catch (error: any) {
    console.error(`[ERROR] Could not fetch gallery page: ${error.message}`);
    return [];
  }

  const $ = cheerio.load(html);
  const albums: GalleryAlbum[] = [];
  const processedUrls = new Set<string>();

  // BWG album/gallery listing selectors
  const albumSelectors = [
    // BWG plugin album list
    '[id^="bwg_container"] a',
    '.bwg-container a',
    // NextGen gallery
    '.ngg-album-galleryoverview a',
    '.gallery-album a',
    '.album a',
    // Generic
    'a[href*="/gallery/"]',
  ];

  const albumLinks: { url: string; title: string }[] = [];

  for (const selector of albumSelectors) {
    $(selector).each((_, el) => {
      const href = $(el).attr('href') || '';
      if (!href || href === GALLERY_URL || href === '#') return;
      if (!href.includes('gaphto.org') && !href.startsWith('/') && !href.startsWith('https://www.gaphto.org')) return;

      const fullUrl = href.startsWith('http') ? href : `https://www.gaphto.org${href}`;
      if (processedUrls.has(fullUrl)) return;

      // Only include sub-gallery pages, not external links
      if (!fullUrl.includes('gaphto.org')) return;

      const title = $(el).find('img').attr('alt')
        || $(el).find('.album-title, h2, h3, h4, .title, .bwg-album-title').text().trim()
        || $(el).attr('title')
        || $(el).text().trim()
        || `Album ${albumLinks.length + 1}`;

      processedUrls.add(fullUrl);
      albumLinks.push({ url: fullUrl, title: title.trim() });
    });

    if (albumLinks.length > 0) break;
  }

  // Also check for heading + gallery container structure on the main gallery page
  // BWG often renders everything on one page
  if (albumLinks.length === 0) {
    // Look for multiple BWG gallery containers with headings nearby
    $('[id^="bwg_container"]').each((idx, container) => {
      const $container = $(container);
      const nearbyHeading = $container.prev('h1, h2, h3, h4').first();
      const title = nearbyHeading.text().trim() || `Gallery ${idx + 1}`;
      // The gallery container IS the album — treat gallery URL as the album URL
      // but we'll scrape images directly from the page below
      console.log(`[INFO] Found BWG container on main gallery page: ${title}`);
    });
  }

  console.log(`[INFO] Found ${albumLinks.length} album links`);

  if (albumLinks.length === 0) {
    // Gallery is on the main page itself
    console.log('[INFO] No sub-album links found, treating gallery page as single album');
    const singleAlbum = await scrapeAlbumPage(GALLERY_URL, 'Gallery');
    if (singleAlbum) albums.push(singleAlbum);
  } else {
    for (const { url, title } of albumLinks) {
      const album = await scrapeAlbumPage(url, title);
      if (album) albums.push(album);
    }
  }

  return albums;
}

async function main() {
  try {
    const albums = await scrapeGallery();
    const totalImages = albums.reduce((sum, a) => sum + a.images.length, 0);
    await saveJson('gallery.json', albums);
    console.log(`[DONE] Gallery: ${albums.length} albums, ${totalImages} total images`);
    return { albums: albums.length, images: totalImages };
  } catch (error: any) {
    console.error(`[ERROR] Gallery scraper failed: ${error.message}`);
    return { albums: 0, images: 0 };
  }
}

export { main as scrapeGallery };

if (require.main === module) {
  main().catch(console.error);
}
