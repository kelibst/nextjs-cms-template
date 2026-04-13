ALTER TABLE "media_files" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "media_files" ADD COLUMN "alt_text" text;--> statement-breakpoint
ALTER TABLE "media_files" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "media_files" ADD COLUMN "duration" integer;--> statement-breakpoint
ALTER TABLE "media_files" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;