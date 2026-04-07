CREATE TYPE "public"."block_type" AS ENUM('hero', 'stats_bar', 'rich_text', 'objectives_list', 'timeline', 'practice_areas_grid', 'news_preview', 'events_preview', 'leadership_preview', 'gallery_teaser', 'fund_cta', 'image_banner');--> statement-breakpoint
CREATE TABLE "page_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page" text NOT NULL,
	"type" "block_type" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"content" text DEFAULT '{}' NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
