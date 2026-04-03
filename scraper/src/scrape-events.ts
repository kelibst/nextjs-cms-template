import * as cheerio from 'cheerio';
import * as path from 'path';
import { fetchPage, saveJson, toSlug } from './utils';

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

function determineStatus(startDate: string | null, endDate: string | null): 'upcoming' | 'past' | 'cancelled' {
  const now = new Date();

  if (!startDate) return 'past';

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;

  if (isNaN(start.getTime())) return 'past';

  if (end < now) return 'past';
  if (start > now) return 'upcoming';
  return 'upcoming'; // currently ongoing
}

async function scrapeEventPage(url: string): Promise<Event | null> {
  console.log(`[INFO] Scraping event: ${url}`);

  let html: string;
  try {
    html = await fetchPage(url);
  } catch (error: any) {
    console.warn(`[WARN] Could not fetch event page ${url}: ${error.message}`);
    return null;
  }

  const $ = cheerio.load(html);

  // Extract title
  const title = $('h1.entry-title, h1.page-title, h1').first().text().trim()
    || $('title').text().replace(/ [-|].*$/, '').trim()
    || 'GAPHTO Event';

  // Extract description/content
  const contentSelectors = ['.entry-content', '.post-content', '.page-content', 'article .content'];
  let description = '';
  for (const selector of contentSelectors) {
    const el = $(selector);
    if (el.length > 0) {
      el.find('nav, footer, .navigation').remove();
      description = el.html() || '';
      if (description.trim()) break;
    }
  }

  if (!description) {
    $('nav, footer, header, aside').remove();
    description = $('main, #main, article, body').first().html() || '';
  }

  // Extract location
  let location: string | null = null;
  const locationSelectors = ['.location', '.venue', '.event-location', '[itemprop="location"]'];
  for (const sel of locationSelectors) {
    const el = $(sel).first();
    if (el.length) {
      location = el.text().trim();
      break;
    }
  }

  // Also try to find location in text
  if (!location) {
    const bodyText = $('body').text();
    const locationMatch = bodyText.match(/(?:venue|location|place|held at)[:\s]+([^\n\.]+)/i);
    if (locationMatch) location = locationMatch[1].trim();
  }

  // Check if online
  const bodyText = $('body').text().toLowerCase();
  const isOnline = bodyText.includes('online') || bodyText.includes('virtual') || bodyText.includes('zoom') || bodyText.includes('webinar');

  // Extract dates
  let startDate: string | null = null;
  let endDate: string | null = null;

  const dateEl = $('time[datetime], .event-date, .start-date, [itemprop="startDate"]').first();
  const rawStartDate = dateEl.attr('datetime') || dateEl.text().trim();
  if (rawStartDate) {
    try {
      const d = new Date(rawStartDate);
      if (!isNaN(d.getTime())) startDate = d.toISOString();
    } catch { /* ignore */ }
  }

  const endDateEl = $('.end-date, [itemprop="endDate"]').first();
  const rawEndDate = endDateEl.attr('datetime') || endDateEl.text().trim();
  if (rawEndDate) {
    try {
      const d = new Date(rawEndDate);
      if (!isNaN(d.getTime())) endDate = d.toISOString();
    } catch { /* ignore */ }
  }

  // Try to find dates in content text
  if (!startDate) {
    const allText = $('body').text();
    const datePatterns = [
      /(?:date|when|on)[:\s]+(\w+ \d{1,2},?\s*\d{4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
      /(\w+ \d{1,2}(?:st|nd|rd|th)?,?\s*\d{4})/i,
    ];

    for (const pattern of datePatterns) {
      const match = allText.match(pattern);
      if (match) {
        try {
          const d = new Date(match[1]);
          if (!isNaN(d.getTime())) {
            startDate = d.toISOString();
            break;
          }
        } catch { /* ignore */ }
      }
    }
  }

  // Extract price
  let priceGhs = 0;
  const priceSelectors = ['.price, .cost, .fee, .registration-fee'];
  for (const sel of priceSelectors) {
    const el = $(sel).first();
    if (el.length) {
      const priceText = el.text();
      const priceMatch = priceText.match(/[\d,]+(?:\.\d{2})?/);
      if (priceMatch) {
        priceGhs = parseFloat(priceMatch[0].replace(',', ''));
        break;
      }
    }
  }

  // Also check in body text for price
  if (priceGhs === 0) {
    const allText = $('body').text();
    const priceMatch = allText.match(/(?:GHS?|Ghana Cedis?|¢|price|fee|cost)[:\s]+([0-9,]+(?:\.\d{2})?)/i);
    if (priceMatch) {
      priceGhs = parseFloat(priceMatch[1].replace(',', ''));
    }
  }

  // Featured image
  const featuredImage = $('meta[property="og:image"]').attr('content')
    || $('.wp-post-image, .featured-image img').first().attr('src')
    || null;

  // Slug from URL
  const urlParts = url.replace(/\/$/, '').split('/');
  const slug = urlParts[urlParts.length - 1] || toSlug(title);

  const status = determineStatus(startDate, endDate);

  return {
    title,
    slug,
    description,
    location: location || null,
    isOnline,
    startDate,
    endDate,
    priceGhs,
    status,
    featuredImage: featuredImage || null,
    sourceUrl: url,
  };
}

async function main() {
  const eventUrls = [
    'https://www.gaphto.org/cpd-registration/',
  ];

  const events: Event[] = [];

  for (const url of eventUrls) {
    try {
      const event = await scrapeEventPage(url);
      if (event) events.push(event);
    } catch (error: any) {
      console.warn(`[WARN] Failed to scrape event ${url}: ${error.message}`);
    }
  }

  await saveJson('events.json', events);
  console.log(`[DONE] Events: ${events.length} events scraped`);
  return events.length;
}

export { main as scrapeEvents };

if (require.main === module) {
  main().catch(console.error);
}
