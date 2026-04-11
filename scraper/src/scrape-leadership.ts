import * as cheerio from 'cheerio';
import * as path from 'path';
import axios from 'axios';
import { fetchPageBySlug, saveJson, downloadImage } from './utils';

const BASE_API = 'https://public-api.wordpress.com/wp/v2/sites/www.gaphto.org';

interface LeadershipMember {
  name: string;
  role: string;
  imageUrl: string | null;
  localImage: string | null;
  bio: string | null;
  facebookUrl: string | null;
  sortOrder: number;
}

// Known executives to validate/match against
const KNOWN_EXECUTIVES = [
  'Mavis M. Fuseini',
  'Saheed Ibrahim',
  'Oswald Dachaga',
  'Benjamin Amoako',
  'Nicholas Nyagblornu',
  'Wilson Addai-Asare',
  'Emmanuel Makino Lapa',
  'Kofi Damoah',
  'Joseph Owusu-Asante',
  'Kofi Asaah',
  'Evans Osei-Owusu',
  'Henreita Ayirebi',
];

async function scrapeLeadershipFromHtml(): Promise<LeadershipMember[]> {
  console.log(`[INFO] Fetching leadership page via REST API (slug: leadership)`);

  const { html } = await fetchPageBySlug('leadership');
  if (!html) {
    console.error(`[ERROR] Could not fetch leadership page`);
    return [];
  }

  const $ = cheerio.load(html);
  const members: LeadershipMember[] = [];

  // Strategy 1: Look for containers holding img + facebook link
  // These are the most reliable anchors
  const facebookContainers: ReturnType<typeof $>[] = [];

  $('a[href*="facebook.com"]').each((_, fbLink) => {
    const $fb = $(fbLink);
    // Walk up the DOM to find the person's container
    const $container = $fb.closest('div, article, section, li, td');
    if ($container.length) {
      facebookContainers.push($container);
    }
  });

  if (facebookContainers.length > 0) {
    console.log(`[INFO] Strategy 1: Found ${facebookContainers.length} facebook-linked containers`);

    facebookContainers.forEach(($container, idx) => {
      const img = $container.find('img').first();
      const imgSrc = img.attr('src') || img.attr('data-src') || null;

      // Name: look for headings or strong text
      const nameEl = $container.find('h1, h2, h3, h4, h5, strong, b, .name').first();
      const name = nameEl.text().trim();
      if (!name) return;

      // Role: look for the next text element, em tags, or spans
      const roleEl = $container.find('em, .role, .position, .title, p').first();
      const role = roleEl.text().trim();

      const facebookUrl = $container.find('a[href*="facebook.com"]').first().attr('href') || null;

      const bioEl = $container.find('p').not(':first-child');
      const bio = bioEl.length > 0 ? bioEl.text().trim() : null;

      const imageFilename = imgSrc ? path.basename(imgSrc.split('?')[0]) : null;
      const localImagePath = imageFilename ? `leadership/${imageFilename}` : null;

      if (!members.find(m => m.name === name)) {
        members.push({
          name,
          role: role || '',
          imageUrl: imgSrc,
          localImage: localImagePath,
          bio: bio || null,
          facebookUrl,
          sortOrder: idx,
        });
      }
    });
  }

  // Strategy 2: team-members plugin pattern — find repeated divs with img + text
  if (members.length === 0) {
    console.log('[INFO] Strategy 2: Looking for team member plugin patterns');

    const entryContent = $('.entry-content, #content, main').first();
    const allImages = entryContent.find('img');

    let sortOrder = 0;
    allImages.each((_, img) => {
      const $img = $(img);
      const src = $img.attr('src') || $img.attr('data-src') || '';
      if (!src) return;

      // Skip tiny images (icons/logos)
      const width = parseInt($img.attr('width') || '0');
      const height = parseInt($img.attr('height') || '0');
      if ((width > 0 && width < 50) || (height > 0 && height < 50)) return;

      // Find the closest container that's likely a person card
      const $parent = $img.closest('div, article, section, li, figure, td');
      if (!$parent.length) return;

      const nameEl = $parent.find('h1, h2, h3, h4, h5, strong, b').first();
      const name = nameEl.text().trim();
      if (!name || name.length < 3) return;

      const roleEl = $parent.find('em, .role, .position, p').first();
      const role = roleEl.text().trim();

      const facebookLink = $parent.find('a[href*="facebook.com"]').first().attr('href') || null;
      const bio = $parent.find('p').not(':first-child').first().text().trim() || null;

      const imageFilename = path.basename(src.split('?')[0]);
      const localImagePath = `leadership/${imageFilename}`;

      if (!members.find(m => m.name === name)) {
        members.push({
          name,
          role: role || '',
          imageUrl: src,
          localImage: localImagePath,
          bio: bio || null,
          facebookUrl: facebookLink,
          sortOrder: sortOrder++,
        });
      }
    });
  }

  // Strategy 3: heading-based structural parsing
  if (members.length === 0) {
    console.log('[INFO] Strategy 3: Heading-based structural parsing');
    const entryContent = $('.entry-content, #content, main').first();
    let sortOrder = 0;

    entryContent.find('h2, h3, h4').each((_, heading) => {
      const $heading = $(heading);
      const name = $heading.text().trim();
      if (!name || name.length < 3) return;

      const $container = $heading.parent();
      const img = $container.find('img').first();
      const imgSrc = img.attr('src') || img.attr('data-src') || null;

      const roleEl = $heading.next('p, em, strong').first();
      const role = roleEl.text().trim();

      const facebookUrl = $container.find('a[href*="facebook.com"]').first().attr('href') || null;
      const bio = $container.find('p').not(':first-child').first().text().trim() || null;

      const imageFilename = imgSrc ? path.basename(imgSrc.split('?')[0]) : null;
      const localImagePath = imageFilename ? `leadership/${imageFilename}` : null;

      if (!members.find(m => m.name === name)) {
        members.push({
          name,
          role: role || '',
          imageUrl: imgSrc,
          localImage: localImagePath,
          bio: bio || null,
          facebookUrl,
          sortOrder: sortOrder++,
        });
      }
    });
  }

  return members;
}

async function scrapeLeadershipFromApi(): Promise<LeadershipMember[]> {
  console.log('[INFO] Trying REST API fallback for leadership...');

  try {
    // Fetch all pages to find leadership
    const response = await axios.get(`${BASE_API}/pages`, {
      params: { per_page: 50, search: 'leadership' },
      timeout: 30000,
    });

    const pages = response.data as Array<{
      slug: string;
      title: { rendered: string };
      content: { rendered: string };
    }>;

    const leadershipPage = pages.find(p =>
      p.slug === 'leadership' || p.title.rendered.toLowerCase().includes('leadership')
    );

    if (!leadershipPage) {
      console.warn('[WARN] No leadership page found via REST API');
      return [];
    }

    // Parse the content HTML for leadership members
    const $ = cheerio.load(leadershipPage.content.rendered);
    const members: LeadershipMember[] = [];
    let sortOrder = 0;

    // Look for repeated patterns in the rendered content
    $('div, section').each((_, el) => {
      const $el = $(el);
      const img = $el.find('img').first();
      const imgSrc = img.attr('src') || null;

      const nameEl = $el.find('strong, h2, h3, h4').first();
      const name = nameEl.text().trim();
      if (!name || name.length < 3) return;

      // Check against known executives
      const isKnown = KNOWN_EXECUTIVES.some(known =>
        known.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(known.split(' ')[0].toLowerCase())
      );
      if (!isKnown && !imgSrc) return;

      const role = $el.find('em, p').first().text().trim();
      const facebookUrl = $el.find('a[href*="facebook.com"]').first().attr('href') || null;

      const imageFilename = imgSrc ? path.basename(imgSrc.split('?')[0]) : null;

      if (!members.find(m => m.name === name)) {
        members.push({
          name,
          role: role || '',
          imageUrl: imgSrc,
          localImage: imageFilename ? `leadership/${imageFilename}` : null,
          bio: null,
          facebookUrl,
          sortOrder: sortOrder++,
        });
      }
    });

    return members;
  } catch (error: any) {
    console.warn(`[WARN] REST API leadership fallback failed: ${error.message}`);
    return [];
  }
}

async function main() {
  try {
    let members = await scrapeLeadershipFromHtml();

    // Fallback to REST API if HTML scraping found nothing useful
    if (members.length === 0) {
      console.log('[INFO] HTML scraping yielded no results, trying REST API...');
      members = await scrapeLeadershipFromApi();
    }

    // Re-index sort orders
    members.forEach((m, i) => { m.sortOrder = i; });

    console.log(`[INFO] Found ${members.length} leadership members`);

    // Download images
    for (const member of members) {
      if (member.imageUrl && member.localImage) {
        try {
          await downloadImage(member.imageUrl, member.localImage);
        } catch (e: any) {
          console.warn(`[WARN] Could not download image for ${member.name}: ${e.message}`);
        }
      }
    }

    await saveJson('leadership.json', members);
    console.log(`[DONE] Leadership: ${members.length} members scraped`);
    return members.length;
  } catch (error: any) {
    console.error(`[ERROR] Leadership scraper failed: ${error.message}`);
    return 0;
  }
}

export { main as scrapeLeadership };

if (require.main === module) {
  main().catch(console.error);
}
