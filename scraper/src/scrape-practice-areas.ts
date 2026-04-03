import * as cheerio from 'cheerio';
import { fetchPage, saveJson, toSlug } from './utils';

interface PracticeArea {
  slug: string;
  title: string;
  content: string;
  roles: string[];
}

const PRACTICE_AREA_URLS = [
  { url: 'https://www.gaphto.org/disease-control-prevention/', slug: 'disease-control-prevention' },
  { url: 'https://www.gaphto.org/health-information-management/', slug: 'health-information-management' },
  { url: 'https://www.gaphto.org/nutrition/', slug: 'nutrition' },
];

async function scrapePracticeArea(url: string, slug: string): Promise<PracticeArea | null> {
  console.log(`[INFO] Scraping practice area: ${url}`);

  let html: string;
  try {
    html = await fetchPage(url);
  } catch (error: any) {
    console.warn(`[WARN] Could not fetch ${url}: ${error.message}`);
    return null;
  }

  const $ = cheerio.load(html);

  // Extract title
  const title = $('h1.entry-title, h1.page-title, h1').first().text().trim()
    || $('title').text().replace(/ [-|].*$/, '').trim();

  // Extract main content
  const contentSelectors = [
    '.entry-content',
    '.post-content',
    '.page-content',
    'article .content',
    '#content article',
    'main article',
  ];

  let content = '';
  let $content: ReturnType<typeof $> | null = null;

  for (const selector of contentSelectors) {
    const el = $(selector);
    if (el.length > 0) {
      el.find('nav, footer, header, .navigation, .breadcrumb, .post-navigation').remove();
      content = el.html() || '';
      $content = el;
      if (content.trim()) break;
    }
  }

  if (!content) {
    $('nav, footer, header, aside, .sidebar, .widget-area').remove();
    const mainEl = $('main, #main, #content, body').first();
    content = mainEl.html() || '';
    $content = mainEl;
  }

  // Extract professional roles - look for list items describing job titles
  const roles: string[] = [];
  const roleKeywords = ['officer', 'technician', 'specialist', 'manager', 'coordinator', 'analyst', 'administrator', 'health', 'nurse', 'doctor', 'physician', 'supervisor', 'director', 'professional'];

  const $el = $content || $('body');
  $el.find('li').each((i, el) => {
    const text = $(el).text().trim();
    const lowerText = text.toLowerCase();
    if (text.length > 5 && text.length < 200 && roleKeywords.some(kw => lowerText.includes(kw))) {
      roles.push(text);
    }
  });

  // Also check for role-like items in paragraphs
  if (roles.length === 0) {
    $el.find('p, td').each((i, el) => {
      const text = $(el).text().trim();
      const lowerText = text.toLowerCase();
      if (text.length > 5 && text.length < 150 && roleKeywords.some(kw => lowerText.includes(kw))) {
        roles.push(text);
      }
    });
  }

  return {
    slug,
    title,
    content,
    roles: [...new Set(roles)], // deduplicate
  };
}

async function main() {
  try {
    const practiceAreas: PracticeArea[] = [];

    for (const { url, slug } of PRACTICE_AREA_URLS) {
      const area = await scrapePracticeArea(url, slug);
      if (area) {
        practiceAreas.push(area);
      }
    }

    await saveJson('practice-areas.json', practiceAreas);
    console.log(`[DONE] Practice areas: ${practiceAreas.length} pages scraped`);
    return practiceAreas.length;
  } catch (error: any) {
    console.error(`[ERROR] Practice areas scraper failed: ${error.message}`);
    return 0;
  }
}

export { main as scrapePracticeAreas };

if (require.main === module) {
  main().catch(console.error);
}
