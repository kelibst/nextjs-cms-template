import * as cheerio from 'cheerio';
import { fetchPageBySlug, saveJson } from './utils';

interface AboutData {
  background: string;
  aimsObjectives: string;
  vision: string;
  mission: string;
  objectives: string[];
}

async function scrapeBackground(): Promise<string> {
  console.log(`[INFO] Scraping about/background via REST API (slug: background)`);

  const { html } = await fetchPageBySlug('background');
  if (!html) {
    console.warn(`[WARN] Could not fetch background page`);
    return '';
  }

  // content.rendered is the page body HTML — use it directly
  return html;
}

async function scrapeAimsObjectives(): Promise<{ html: string; vision: string; mission: string; objectives: string[] }> {
  console.log(`[INFO] Scraping aims-objectives via REST API (slug: aims-objectives)`);

  const { html } = await fetchPageBySlug('aims-objectives');
  if (!html) {
    console.warn(`[WARN] Could not fetch aims-objectives page`);
    return { html: '', vision: '', mission: '', objectives: [] };
  }

  // content.rendered is the page body HTML — parse directly
  const $ = cheerio.load(html);
  const contentHtml = html;

  // Extract vision statement
  let vision = '';
  let mission = '';
  const objectives: string[] = [];

  const fullText = $('body').text();

  // Look for vision
  const visionMatch = fullText.match(/vision[:\s]*([^\.]+\.)/i);
  if (visionMatch) {
    vision = visionMatch[1].trim();
  }

  // Also look for headings containing "vision"
  $('h1, h2, h3, h4, h5, strong, b').each((i, el) => {
    const text = $(el).text().toLowerCase();
    if (text.includes('vision')) {
      const nextEl = $(el).next('p, div');
      if (nextEl.length) {
        vision = nextEl.text().trim();
      } else {
        // Check if content follows on same line
        const parentText = $(el).parent().text();
        const afterHeading = parentText.replace($(el).text(), '').trim();
        if (afterHeading) vision = afterHeading;
      }
    }
    if (text.includes('mission')) {
      const nextEl = $(el).next('p, div');
      if (nextEl.length) {
        mission = nextEl.text().trim();
      }
    }
  });

  // Extract mission
  if (!mission) {
    const missionMatch = fullText.match(/mission[:\s]*([^\.]+\.)/i);
    if (missionMatch) {
      mission = missionMatch[1].trim();
    }
  }

  // Extract objectives - look for numbered/bulleted list after "objectives" heading
  let inObjectives = false;
  $('*').each((i, el) => {
    const $el = $(el);
    const tagName = ('tagName' in el ? (el as { tagName: string }).tagName : '').toLowerCase();
    const text = $el.text().trim();

    if ((tagName === 'h2' || tagName === 'h3' || tagName === 'h4' || tagName === 'strong') &&
      text.toLowerCase().includes('objective')) {
      inObjectives = true;
      return;
    }

    if (inObjectives && (tagName === 'li' || tagName === 'p')) {
      if (text && text.length > 10) {
        objectives.push(text);
      }
    }

    // Stop at next major heading
    if (inObjectives && (tagName === 'h2' || tagName === 'h3') && !text.toLowerCase().includes('objective')) {
      inObjectives = false;
    }
  });

  // Fallback: look for list items in the page
  if (objectives.length === 0) {
    $('ol li, ul li').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 20) {
        objectives.push(text);
      }
    });
  }

  return { html: contentHtml, vision, mission, objectives };
}

async function main() {
  try {
    const background = await scrapeBackground();
    const aims = await scrapeAimsObjectives();

    const aboutData: AboutData = {
      background,
      aimsObjectives: aims.html,
      vision: aims.vision,
      mission: aims.mission,
      objectives: aims.objectives,
    };

    await saveJson('about.json', aboutData);
    console.log(`[DONE] About: background=${background.length > 0 ? 'yes' : 'no'}, vision=${aims.vision ? 'yes' : 'no'}, objectives=${aims.objectives.length}`);
    return 1;
  } catch (error: any) {
    console.error(`[ERROR] About scraper failed: ${error.message}`);
    return 0;
  }
}

export { main as scrapeAbout };

if (require.main === module) {
  main().catch(console.error);
}
