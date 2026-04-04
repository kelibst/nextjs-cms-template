import newsData from "@/data/news.json";
import healthNewsData from "@/data/health-news.json";
import blogData from "@/data/blog.json";
import leadershipData from "@/data/leadership.json";
import galleryData from "@/data/gallery.json";
import eventsData from "@/data/events.json";
import aboutData from "@/data/about.json";
import contactData from "@/data/contact.json";
import practiceAreasData from "@/data/practice-areas.json";
import fundData from "@/data/fund.json";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Post {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  category: "gaphto-news" | "health-news" | "blog";
  author: string;
  featuredImage: string;
  localImage: string;
  tags: string[];
  sourceUrl: string;
}

export interface LeadershipMember {
  name: string;
  role: string;
  imageUrl: string;
  localImage: string;
  bio: string | null;
  facebookUrl: string | null;
  sortOrder: number;
}

export interface GalleryImage {
  url: string;
  localPath: string;
  caption: string | null;
  sortOrder: number;
}

export interface GalleryAlbum {
  albumTitle: string;
  albumSlug: string;
  eventDate: string | null;
  images: GalleryImage[];
}

export interface About {
  background: string;
  aimsObjectives: string;
  vision: string;
  mission: string;
  objectives: string[];
}

export interface Contact {
  phone: string;
  email: string;
  address: string;
  facebook: string;
  twitter: string;
  youtube: string;
}

export interface PracticeArea {
  slug: string;
  title: string;
  content: string;
  roles: string[];
}

export interface Event {
  title: string;
  slug: string;
  description: string;
  location: string | null;
  isOnline: boolean;
  startDate: string | null;
  endDate: string | null;
  priceGhs: number;
  status: "upcoming" | "past" | "cancelled";
  featuredImage: string | null;
  sourceUrl: string;
}

export interface Fund {
  description: string;
  pdfUrl: string | null;
  localPdf: string | null;
}

// ─── Loaders ──────────────────────────────────────────────────────────────────

export function getNews(): Post[] {
  return (newsData as Post[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getHealthNews(): Post[] {
  return (healthNewsData as Post[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPosts(): Post[] {
  return (blogData as Post[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllPosts(): Post[] {
  const all = [
    ...(newsData as Post[]),
    ...(healthNewsData as Post[]),
    ...(blogData as Post[]),
  ];
  return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: Post["category"]): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getRelatedPosts(post: Post, count = 3): Post[] {
  return getAllPosts()
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, count);
}

export function getLeadership(): LeadershipMember[] {
  return (leadershipData as LeadershipMember[]).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function getGallery(): GalleryAlbum[] {
  return galleryData as GalleryAlbum[];
}

export function getAbout(): About {
  return aboutData as About;
}

export function getContact(): Contact {
  const c = contactData as Partial<Contact>;
  return {
    phone: c.phone || "030 296 4402",
    email: c.email || "info@gaphto.org",
    address: c.address || "GAPHTO National Secretariat, Accra, Ghana",
    facebook: c.facebook || "https://web.facebook.com/gaphto",
    twitter: c.twitter || "",
    youtube: c.youtube || "",
  };
}

export function getGalleryAlbums(): GalleryAlbum[] {
  return galleryData as GalleryAlbum[];
}

export function getPracticeAreas(): PracticeArea[] {
  return practiceAreasData as PracticeArea[];
}

export function getEvents(): Event[] {
  return eventsData as Event[];
}

export function getFund(): Fund {
  return fundData as Fund;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Decode common HTML entities in a string */
export function decodeEntities(str: string): string {
  return str
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8217;/g, "\u2019");
}

/** Return a public image path for a local scraped image */
export function localImagePath(localPath: string, prefix: "leadership" | "gallery" | "posts"): string {
  // localPath is like "leadership/filename.jpg" or "gallery/album-slug/filename.jpg"
  // public images are at /images/{localPath}
  const stripped = localPath.startsWith(`${prefix}/`) ? localPath : `${prefix}/${localPath}`;
  return `/images/${stripped}`;
}

export function leadershipImagePath(localImage: string): string {
  // localImage is "leadership/filename.jpg"
  return `/images/${localImage}`;
}

export function galleryImagePath(localPath: string): string {
  return `/images/${localPath}`;
}

export function postImagePath(localImage: string): string {
  return `/images/${localImage}`;
}
