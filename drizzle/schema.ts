import { decimal, integer, serial, pgEnum, pgTable, text, timestamp, varchar, json, boolean, index } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "moderator", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  resetToken: varchar("resetToken", { length: 255 }),
  resetTokenExpires: timestamp("resetTokenExpires"),
  points: integer("points").default(0).notNull(),
  trustScore: decimal("trustScore", { precision: 3, scale: 2 }).default("0.50").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  roleIdx: index("role_idx").on(table.role),
  emailIdx: index("email_idx").on(table.email),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const occurrenceTypeEnum = pgEnum("occurrence_type", [
  "fire",
  "water_pollution",
  "air_pollution",
  "drought",
  "deforestation",
  "flooding",
  "other"
]);

export const severityLevelEnum = pgEnum("severity_level", [
  "low",
  "medium",
  "high",
  "critical"
]);

export const occurrenceStatusEnum = pgEnum("occurrence_status", ["pending", "validated", "rejected", "archived"]);

export const occurrences = pgTable("occurrences", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: occurrenceTypeEnum("type").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  description: text("description"),
  severity: severityLevelEnum("severity").default("medium").notNull(),
  status: occurrenceStatusEnum("status").default("pending").notNull(),
  validatedBySatellite: boolean("validatedBySatellite").default(false),
  communityValidations: integer("communityValidations").default(0),
  communityRejections: integer("communityRejections").default(0),
  physicalParameters: json("physicalParameters"),
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  typeIdx: index("type_idx").on(table.type),
  statusIdx: index("status_idx").on(table.status),
  geoIdx: index("geo_idx").on(table.latitude, table.longitude),
}));

export type Occurrence = typeof occurrences.$inferSelect;
export type InsertOccurrence = typeof occurrences.$inferInsert;

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  occurrenceId: integer("occurrenceId").notNull(),
  photoUrl: varchar("photoUrl", { length: 512 }).notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;

export const validations = pgTable("validations", {
  id: serial("id").primaryKey(),
  occurrenceId: integer("occurrenceId").notNull(),
  userId: integer("userId").notNull(),
  isValid: boolean("isValid").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  occurrenceIdx: index("validation_occurrence_idx").on(table.occurrenceId),
  userIdx: index("validation_user_idx").on(table.userId),
}));

export type Validation = typeof validations.$inferSelect;
export type InsertValidation = typeof validations.$inferInsert;

export const simTypeEnum = pgEnum("sim_type", ["fire", "water", "pollution"]);

export const simulations = pgTable("simulations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: simTypeEnum("type").notNull(),
  parameters: json("parameters").notNull(),
  results: json("results").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("sim_user_idx").on(table.userId),
}));

export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = typeof simulations.$inferInsert;

export const alertTypeEnum = pgEnum("alert_type", ["geofence", "severity", "validation", "news"]);

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  occurrenceId: integer("occurrenceId"),
  type: alertTypeEnum("type").notNull(),
  severity: severityLevelEnum("severity").notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("alert_user_idx").on(table.userId),
}));

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

export const badgeTypeEnum = pgEnum("badge_type", [
  "fire_watcher",
  "water_guardian",
  "verifier",
  "student",
  "star",
  "environmental_hero"
]);

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  badgeType: badgeTypeEnum("badge_type").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("badge_user_idx").on(table.userId),
}));

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

export const rankings = pgTable("rankings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  monthlyPoints: integer("monthlyPoints").default(0),
  totalPoints: integer("totalPoints").default(0),
  monthlyRank: integer("monthlyRank").default(0),
  overallRank: integer("overallRank").default(0),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Ranking = typeof rankings.$inferSelect;
export type InsertRanking = typeof rankings.$inferInsert;
