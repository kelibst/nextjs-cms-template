import * as cheerio from 'cheerio';
import { fetchPage, saveJson } from './utils';

interface AboutData {
  background: string;
  aimsObjectives: string;
  vision: string;
  mission: string;
  objectives: string[];
}

async function scrapeBackground(): Promise<string> {
  const url = 'https://www.gaphto.org/about-us/background/';
  console.log(`[INFO] Scraping about/background from ${url}`);

  let html: string;
  try {
    html = await fetchPage(url);
  } catch (error: any) {
    console.warn(`[WARN] Could not fetch background page: ${error.message}`);
    return '';
  }

  const $ = cheerio.load(html);

  // Extract main content - avoid nav, footer, header, sidebars
  const contentSelectors = [
    '.entry-content',
    '.post-content',
    'article .content',
    '.page-content',
    '#content .entry',
    'main article',
    '.site-content article',
  ];

  let content = '';
  for (const selector of contentSelectors) {
    const el = $(selector);
    if (el.length > 0) {
      // Remove nav, footer, header elements within content
      el.find('nav, footer, header, .navigation, .breadcrumb, .post-navigation').remove();
      content = el.html() || '';
      if (content.trim()) break;
    }
  }

  if (!content) {
    // Fallback to main content area
    $('nav, footer, header, aside, .sidebar, .widget-area, .navigation').remove();
    content = $('main, #main, #content, body').first().html() || '';
  }

  return content;
}

async function scrapeAimsObjectives(): Promise<{ html: string; vision: string; mission: string; objectives: string[] }> {
  const url = 'https://www.gaphto.org/about-us/aims-objectives/';
  console.log(`[INFO] Scraping aims-objectives from ${url}`);

  let html: string;
  try {
    html = await fetchPage(url);
  } catch (error: any) {
    console.warn(`[WARN] Could not fetch aims-objectives page: ${error.message}`);
    return { html: '', vision: '', mission: '', objectives: [] };
  }

  const $ = cheerio.load(html);

  // Get main content
  const contentSelectors = [
    '.entry-content',
    '.post-content',
    'article .content',
    '.page-content',
    '#content .entry',
    'main article',
  ];

  let contentHtml = '';
  let $content: ReturnType<typeof $> | null = null;

  for (const selector of contentSelectors) {
    const el = $(selector);
    if (el.length > 0) {
      el.find('nav, footer, header, .navigation, .breadcrumb').remove();
      contentHtml = el.html() || '';
      $content = el;
      if (contentHtml.trim()) break;
    }
  }

  if (!contentHtml) {
    $('nav, footer, header, aside, .sidebar').remove();
    const mainEl = $('main, #main, #content, body').first();
    contentHtml = mainEl.html() || '';
    $content = mainEl;
  }

  // Extract vision statement
  let vision = '';
  let mission = '';
  const objectives: string[] = [];

  const fullText = $content ? $content.text() : $('body').text();

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
