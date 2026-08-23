CREATE TYPE "public"."alert_type" AS ENUM('geofence', 'severity', 'validation', 'news');--> statement-breakpoint
CREATE TYPE "public"."badge_type" AS ENUM('fire_watcher', 'water_guardian', 'verifier', 'student', 'star', 'environmental_hero');--> statement-breakpoint
CREATE TYPE "public"."occurrence_status" AS ENUM('pending', 'validated', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."occurrence_type" AS ENUM('fire', 'water_pollution', 'air_pollution', 'drought', 'deforestation', 'flooding', 'other');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'moderator', 'admin');--> statement-breakpoint
CREATE TYPE "public"."severity_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."sim_type" AS ENUM('fire', 'water', 'pollution');--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"occurrenceId" integer,
	"type" "alert_type" NOT NULL,
	"severity" "severity_level" NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"badge_type" "badge_type" NOT NULL,
	"earnedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occurrences" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" "occurrence_type" NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"description" text,
	"severity" "severity_level" DEFAULT 'medium' NOT NULL,
	"status" "occurrence_status" DEFAULT 'pending' NOT NULL,
	"validatedBySatellite" boolean DEFAULT false,
	"communityValidations" integer DEFAULT 0,
	"communityRejections" integer DEFAULT 0,
	"physicalParameters" json,
	"riskScore" numeric(5, 2) DEFAULT '0',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"occurrenceId" integer NOT NULL,
	"photoUrl" varchar(512) NOT NULL,
	"uploadedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rankings" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"monthlyPoints" integer DEFAULT 0,
	"totalPoints" integer DEFAULT 0,
	"monthlyRank" integer DEFAULT 0,
	"overallRank" integer DEFAULT 0,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rankings_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "simulations" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" "sim_type" NOT NULL,
	"parameters" json NOT NULL,
	"results" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64),
	"passwordHash" varchar(255),
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"resetToken" varchar(255),
	"resetTokenExpires" timestamp,
	"points" integer DEFAULT 0 NOT NULL,
	"trustScore" numeric(3, 2) DEFAULT '0.50' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "validations" (
	"id" serial PRIMARY KEY NOT NULL,
	"occurrenceId" integer NOT NULL,
	"userId" integer NOT NULL,
	"isValid" boolean NOT NULL,
	"comment" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "alert_user_idx" ON "alerts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "badge_user_idx" ON "badges" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_idx" ON "occurrences" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "type_idx" ON "occurrences" USING btree ("type");--> statement-breakpoint
CREATE INDEX "status_idx" ON "occurrences" USING btree ("status");--> statement-breakpoint
CREATE INDEX "geo_idx" ON "occurrences" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "sim_user_idx" ON "simulations" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "validation_occurrence_idx" ON "validations" USING btree ("occurrenceId");--> statement-breakpoint
CREATE INDEX "validation_user_idx" ON "validations" USING btree ("userId");