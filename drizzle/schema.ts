import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core'

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum('role', [
  'super_admin',
  'admin',
  'editor',
  'member',
])

export const postCategoryEnum = pgEnum('post_category', [
  'gaphto-news',
  'health-news',
  'blog',
  'announcement',
])

export const postStatusEnum = pgEnum('post_status', [
  'draft',
  'published',
  'archived',
])

export const eventStatusEnum = pgEnum('event_status', [
  'upcoming',
  'ongoing',
  'past',
  'cancelled',
])

export const memberSpecialtyEnum = pgEnum('member_specialty', [
  'disease-control',
  'health-information',
  'nutrition',
])

export const memberStatusEnum = pgEnum('member_status', [
  'active',
  'inactive',
  'suspended',
])

// ─────────────────────────────────────────────────────────────────────────────
// Tables
// ─────────────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  role: roleEnum('role').notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  passwordResetToken: text('password_reset_token'),
  passwordResetTokenExpiry: timestamp('password_reset_token_expiry'),
})

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  category: postCategoryEnum('category').notNull(),
  status: postStatusEnum('status').notNull().default('draft'),
  featuredImage: text('featured_image'),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
})

export const postTags = pgTable(
  'post_tags',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
  ],
)

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  location: text('location'),
  isOnline: boolean('is_online').notNull().default(false),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  registrationDeadline: timestamp('registration_deadline'),
  priceGhs: numeric('price_ghs', { precision: 10, scale: 2 }),
  maxAttendees: integer('max_attendees'),
  status: eventStatusEnum('status').notNull().default('upcoming'),
  featuredImage: text('featured_image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const eventRegistrations = pgTable('event_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  paymentStatus: text('payment_status').notNull().default('pending'),
  paymentReference: text('payment_reference'),
  registeredAt: timestamp('registered_at').notNull().defaultNow(),
})

export const leadership = pgTable('leadership', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  imageUrl: text('image_url'),
  bio: text('bio'),
  facebookUrl: text('facebook_url'),
  twitterUrl: text('twitter_url'),
  email: text('email'),
  sortOrder: integer('sort_order').notNull().default(0),
  termStart: timestamp('term_start'),
  termEnd: timestamp('term_end'),
  isActive: boolean('is_active').notNull().default(true),
})

export const galleryAlbums = pgTable('gallery_albums', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  coverImage: text('cover_image'),
  eventDate: timestamp('event_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const galleryImages = pgTable('gallery_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  albumId: uuid('album_id')
    .notNull()
    .references(() => galleryAlbums.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  caption: text('caption'),
  altText: text('alt_text'),
  sortOrder: integer('sort_order').notNull().default(0),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
})

export const publications = pgTable('publications', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  fileUrl: text('file_url'),
  fileType: text('file_type'),
  isMemberOnly: boolean('is_member_only').notNull().default(false),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  memberNumber: text('member_number').notNull().unique(),
  specialty: memberSpecialtyEnum('specialty'),
  region: text('region'),
  facility: text('facility'),
  joinedDate: timestamp('joined_date'),
  membershipStatus: memberStatusEnum('membership_status').notNull().default('active'),
  duesPaidUntil: timestamp('dues_paid_until'),
})

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isPinned: boolean('is_pinned').notNull().default(false),
  visibleTo: text('visible_to').notNull().default('public'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const contactSubmissions = pgTable('contact_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  isRead: boolean('is_read').notNull().default(false),
})

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const fundApplications = pgTable('fund_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  applicantName: text('applicant_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  region: text('region').notNull(),
  facility: text('facility').notNull(),
  loanAmount: numeric('loan_amount', { precision: 10, scale: 2 }).notNull(),
  loanPurpose: text('loan_purpose').notNull(),
  repaymentPeriodMonths: integer('repayment_period_months').notNull(),
  status: text('status').notNull().default('pending'), // pending | reviewing | approved | rejected
  reviewNotes: text('review_notes'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
})

// ─────────────────────────────────────────────────────────────────────────────
// Type inference helpers
// ─────────────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

export type PostTag = typeof postTags.$inferSelect
export type NewPostTag = typeof postTags.$inferInsert

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert

export type EventRegistration = typeof eventRegistrations.$inferSelect
export type NewEventRegistration = typeof eventRegistrations.$inferInsert

export type Leadership = typeof leadership.$inferSelect
export type NewLeadership = typeof leadership.$inferInsert

export type GalleryAlbum = typeof galleryAlbums.$inferSelect
export type NewGalleryAlbum = typeof galleryAlbums.$inferInsert

export type GalleryImage = typeof galleryImages.$inferSelect
export type NewGalleryImage = typeof galleryImages.$inferInsert

export type Publication = typeof publications.$inferSelect
export type NewPublication = typeof publications.$inferInsert

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert

export type Announcement = typeof announcements.$inferSelect
export type NewAnnouncement = typeof announcements.$inferInsert

export type ContactSubmission = typeof contactSubmissions.$inferSelect
export type NewContactSubmission = typeof contactSubmissions.$inferInsert

export type SiteSetting = typeof siteSettings.$inferSelect
export type NewSiteSetting = typeof siteSettings.$inferInsert

export type FundApplication = typeof fundApplications.$inferSelect
export type NewFundApplication = typeof fundApplications.$inferInsert
