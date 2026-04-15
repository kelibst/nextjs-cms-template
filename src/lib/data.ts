import { getMediaUrl } from '@/lib/media-url';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Post {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  category: "news" | "blog" | "announcement";
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
  price: number;
  status: "upcoming" | "past" | "cancelled";
  featuredImage: string | null;
  sourceUrl: string;
}

export interface Publication {
  id: number;
  slug: string;
  title: string;
  year: string;
  type: "Journal" | "Report" | "Guideline" | "Manual" | "Policy";
  description: string;
  coverImage: string | null;
  fileUrl: string | null;
  isPublic: boolean;
}

// ─── Loaders ──────────────────────────────────────────────────────────────────
// All static JSON data sources have been removed (scraped data deleted).
// The DB path (server-data.ts) is the real data source.
// These functions return empty arrays as safe fallbacks.

export function getNews(): Post[] {
  return [];
}

export function getHealthNews(): Post[] {
  return [];
}

export function getBlogPosts(): Post[] {
  return [];
}

export function getAllPosts(): Post[] {
  return [];
}

export function getPostBySlug(_slug: string): Post | undefined {
  return undefined;
}

export function getPostsByCategory(_category: Post["category"]): Post[] {
  return [];
}

export function getRelatedPosts(_post: Post, _count = 3): Post[] {
  return [];
}

export function getLeadership(): LeadershipMember[] {
  return [];
}

export function getGallery(): GalleryAlbum[] {
  return [];
}

export function getAbout(): About {
  return {
    background: '',
    aimsObjectives: '',
    vision: '',
    mission: '',
    objectives: [],
  };
}

export function getContact(): Contact {
  return {
    phone: '',
    email: 'contact@example.com',
    address: '',
    facebook: '',
    twitter: '',
    youtube: '',
  };
}

export function getGalleryAlbums(): GalleryAlbum[] {
  return [];
}

export function getPracticeAreas(): PracticeArea[] {
  return [];
}

export function getEvents(): Event[] {
  return [];
}

export function getAllPublications(): Publication[] {
  return [];
}

export function getPublicationBySlug(_slug: string): Publication | undefined {
  return undefined;
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

/** Return a public image path for a local image */
export function localImagePath(localPath: string, prefix: "leadership" | "gallery" | "posts"): string {
  const stripped = localPath.startsWith(`${prefix}/`) ? localPath : `${prefix}/${localPath}`;
  return getMediaUrl(`/images/${stripped}`);
}

export function leadershipImagePath(localImage: string): string {
  return getMediaUrl(`/images/${localImage}`);
}

export function galleryImagePath(localPath: string): string {
  return getMediaUrl(`/images/${localPath}`);
}

export function postImagePath(localImage: string): string {
  return getMediaUrl(`/images/${localImage}`);
}

// ─── Page Builder ──────────────────────────────────────────────────────────────

export async function getBlocksForPage(page: string) {
  const { getPageBlocks } = await import('@/app/actions/blocks')
  const blocks = await getPageBlocks(page)
  return blocks.filter(b => b.isVisible).sort((a, b) => a.sortOrder - b.sortOrder)
}
