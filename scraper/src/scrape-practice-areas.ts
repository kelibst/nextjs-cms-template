import * as cheerio from 'cheerio';
import { fetchPageBySlug, saveJson } from './utils';

interface PracticeArea {
  slug: string;
  title: string;
  content: string;
  roles: string[];
}

const PRACTICE_AREAS = [
  { slug: 'disease-control-prevention', title: 'Disease Control & Prevention' },
  { slug: 'health-information-management', title: 'Health Information Management' },
  { slug: 'nutrition', title: 'Nutrition' },
];

async function scrapePracticeArea(slug: string, fallbackTitle: string): Promise<PracticeArea | null> {
  console.log(`[INFO] Scraping practice area via REST API (slug: ${slug})`);

  const { title: apiTitle, html } = await fetchPageBySlug(slug);
  if (!html) {
    console.warn(`[WARN] Could not fetch practice area: ${slug}`);
    return null;
  }

  const title = apiTitle || fallbackTitle;

  // content.rendered is the page body — use it directly
  const content = html;

  const $ = cheerio.load(html);

  // Extract professional roles - look for list items describing job titles
  const roles: string[] = [];
  const roleKeywords = ['officer', 'technician', 'specialist', 'manager', 'coordinator', 'analyst', 'administrator', 'health', 'nurse', 'doctor', 'physician', 'supervisor', 'director', 'professional'];

  const $el = $('body');
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

    for (const { slug, title } of PRACTICE_AREAS) {
      const area = await scrapePracticeArea(slug, title);
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
