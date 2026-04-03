import { scrapeLeadership } from './scrape-leadership';
import { scrapeNews } from './scrape-news';
import { scrapeAbout } from './scrape-about';
import { scrapePracticeAreas } from './scrape-practice-areas';
import { scrapeGallery } from './scrape-gallery';
import { scrapeEvents } from './scrape-events';
import { scrapeContact } from './scrape-contact';
import { scrapeFund } from './scrape-fund';

interface ScraperResult {
  name: string;
  status: 'success' | 'failed';
  count: number | Record<string, number> | { albums: number; images: number };
  error?: string;
  duration: number;
}

async function runScraper<T>(
  name: string,
  fn: () => Promise<T>,
  getCount: (result: T) => number | Record<string, number> | { albums: number; images: number }
): Promise<ScraperResult> {
  const startTime = Date.now();
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Starting: ${name}`);
    console.log('='.repeat(60));
    const result = await fn();
    const duration = Date.now() - startTime;
    const count = getCount(result);
    console.log(`\n[DONE] ${name} completed in ${(duration / 1000).toFixed(1)}s`);
    return { name, status: 'success', count, duration };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`\n[FAIL] ${name} failed: ${error.message}`);
    return { name, status: 'failed', count: 0, error: error.message, duration };
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('GAPHTO SCRAPER - Master Runner');
  console.log('='.repeat(60));
  console.log(`Start time: ${new Date().toISOString()}`);

  const results: ScraperResult[] = [];

  // Run scrapers in sequence to be polite to the server
  results.push(await runScraper('Leadership', scrapeLeadership, (count) => count as number));
  results.push(await runScraper('News', scrapeNews, (counts) => counts as Record<string, number>));
  results.push(await runScraper('About', scrapeAbout, (count) => count as number));
  results.push(await runScraper('Practice Areas', scrapePracticeAreas, (count) => count as number));
  results.push(await runScraper('Gallery', scrapeGallery, (result) => result as { albums: number; images: number }));
  results.push(await runScraper('Events', scrapeEvents, (count) => count as number));
  results.push(await runScraper('Contact', scrapeContact, (count) => count as number));
  results.push(await runScraper('Fund', scrapeFund, (count) => count as number));

  // Print final report
  console.log('\n\n' + '='.repeat(60));
  console.log('FINAL SCRAPE REPORT');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');

  console.log(`\nSuccessful: ${successful.length}/${results.length}`);
  console.log(`Failed: ${failed.length}/${results.length}\n`);

  for (const result of results) {
    const status = result.status === 'success' ? '[OK]  ' : '[FAIL]';
    const duration = `${(result.duration / 1000).toFixed(1)}s`;

    let countStr = '';
    if (typeof result.count === 'number') {
      countStr = `${result.count} items`;
    } else if (typeof result.count === 'object' && result.count !== null) {
      if ('albums' in result.count) {
        const gc = result.count as { albums: number; images: number };
        countStr = `${gc.albums} albums, ${gc.images} images`;
      } else {
        const counts = result.count as Record<string, number>;
        countStr = Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(', ');
      }
    }

    console.log(`${status} ${result.name.padEnd(20)} ${countStr.padEnd(30)} (${duration})`);
    if (result.error) {
      console.log(`       Error: ${result.error}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`End time: ${new Date().toISOString()}`);
  console.log('='.repeat(60) + '\n');
}

main().catch((error) => {
  console.error('Fatal error in master runner:', error);
  process.exit(1);
});
