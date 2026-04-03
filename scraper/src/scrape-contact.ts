import * as cheerio from 'cheerio';
import { fetchPage, saveJson } from './utils';

interface ContactData {
  phone: string;
  email: string;
  address: string;
  facebook: string;
  twitter: string;
  youtube: string;
}

async function extractContactFromPage(html: string): Promise<Partial<ContactData>> {
  const $ = cheerio.load(html);
  const data: Partial<ContactData> = {};

  // Phone — prefer tel: href, fall back to regex scan
  const telLink = $('a[href^="tel:"]').first();
  if (telLink.length) {
    data.phone = telLink.text().trim() || (telLink.attr('href') || '').replace('tel:', '');
  }
  if (!data.phone) {
    const allText = $('body').text();
    const phoneMatch = allText.match(/(?:\+233|0)[\s\-]?(?:[0-9]{2,3}[\s\-]?){3,4}[0-9]{2,4}/);
    if (phoneMatch) data.phone = phoneMatch[0].trim();
  }

  // Email — prefer mailto: href
  const mailtoLink = $('a[href^="mailto:"]').first();
  if (mailtoLink.length) {
    data.email = mailtoLink.text().trim() || (mailtoLink.attr('href') || '').replace('mailto:', '');
  }
  if (!data.email) {
    const allText = $('body').text();
    const emailMatch = allText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) data.email = emailMatch[0];
  }

  // Address — try semantic elements first, then text after email link
  const addressEl = $('address, .address, .contact-address, [itemprop="address"], .location').first();
  if (addressEl.length) {
    data.address = addressEl.text().trim().replace(/\s+/g, ' ');
  }
  if (!data.address) {
    // Try to find text following the email link in the contact section
    const $emailLink = $('a[href^="mailto:"]').first();
    if ($emailLink.length) {
      const $parent = $emailLink.parent();
      const parentText = $parent.text().trim();
      const emailText = $emailLink.text().trim();
      const afterEmail = parentText.replace(emailText, '').trim();
      if (afterEmail && afterEmail.length > 5) {
        data.address = afterEmail.replace(/\s+/g, ' ').trim();
      }
    }
  }
  if (!data.address) {
    // Broader search in contact content area
    const $content = $('.entry-content, .contact-info, #content, main').first();
    if ($content.length) {
      const text = $content.text().trim();
      // Look for address-like lines (starts with a number or "P.O." or contains "Box")
      const lines = text.split(/\n|\r/).map(l => l.trim()).filter(Boolean);
      const addressLine = lines.find(l =>
        /^P\.?O\.?\s+Box|^P\.?M\.?B|^\d+\s+\w+|Box\s+\d+/i.test(l)
      );
      if (addressLine) data.address = addressLine;
    }
  }

  // Social links
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('facebook.com') && !data.facebook) data.facebook = href;
    if ((href.includes('twitter.com') || href.includes('x.com')) && !data.twitter) data.twitter = href;
    if (href.includes('youtube.com') && !data.youtube) data.youtube = href;
  });

  return data;
}

async function main() {
  const contact: ContactData = {
    phone: '',
    email: '',
    address: '',
    facebook: '',
    twitter: '',
    youtube: '',
  };

  // Primary: contact page
  const contactUrl = 'https://www.gaphto.org/contact-us/';
  console.log(`[INFO] Scraping contact from ${contactUrl}`);

  try {
    const html = await fetchPage(contactUrl);
    const data = await extractContactFromPage(html);
    Object.assign(contact, data);
  } catch (error: any) {
    console.warn(`[WARN] Could not fetch contact page: ${error.message}`);
  }

  // Supplement from homepage (footer often has contact + social links)
  const homeUrl = 'https://www.gaphto.org/';
  console.log(`[INFO] Checking homepage footer for supplemental contact info`);

  try {
    const homeHtml = await fetchPage(homeUrl);
    const $ = cheerio.load(homeHtml);

    // Focus on footer for contact info
    const $footer = $('footer, #footer, .site-footer, .footer').first();
    const footerHtml = $footer.length ? $.html($footer) : homeHtml;
    const footerData = await extractContactFromPage(footerHtml);

    if (!contact.phone && footerData.phone) contact.phone = footerData.phone;
    if (!contact.email && footerData.email) contact.email = footerData.email;
    if (!contact.address && footerData.address) contact.address = footerData.address;
    if (!contact.facebook && footerData.facebook) contact.facebook = footerData.facebook;
    if (!contact.twitter && footerData.twitter) contact.twitter = footerData.twitter;
    if (!contact.youtube && footerData.youtube) contact.youtube = footerData.youtube;

    // Also scan entire homepage for social links
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('facebook.com') && !contact.facebook) contact.facebook = href;
      if ((href.includes('twitter.com') || href.includes('x.com')) && !contact.twitter) contact.twitter = href;
      if (href.includes('youtube.com') && !contact.youtube) contact.youtube = href;
    });
  } catch (error: any) {
    console.warn(`[WARN] Could not fetch homepage: ${error.message}`);
  }

  await saveJson('contact.json', contact);
  console.log(`[DONE] Contact: phone=${contact.phone ? 'yes' : 'no'}, email=${contact.email ? 'yes' : 'no'}, address=${contact.address ? 'yes' : 'no'}`);
  return 1;
}

export { main as scrapeContact };

if (require.main === module) {
  main().catch(console.error);
}
