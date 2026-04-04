CREATE TABLE "fund_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"applicant_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"region" text NOT NULL,
	"facility" text NOT NULL,
	"loan_amount" numeric(10, 2) NOT NULL,
	"loan_purpose" text NOT NULL,
	"repayment_period_months" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"review_notes" text,
	"submitted_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp,
	"reviewed_by" uuid
);
--> statement-breakpoint
ALTER TABLE "fund_applications" ADD CONSTRAINT "fund_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_applications" ADD CONSTRAINT "fund_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;