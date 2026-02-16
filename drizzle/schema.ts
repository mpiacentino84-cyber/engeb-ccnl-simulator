import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  // RBAC roles:
  // - user: basic access
  // - consultant: can manage operational content and handle service requests
  // - admin: full access
  role: mysqlEnum("role", ["user", "consultant", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * CCNL table - stores all collective labor agreements
 */
export const ccnls = mysqlTable("ccnls", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("externalId", { length: 128 }).notNull().unique(), // e.g., "engeb_multisettore"
  name: varchar("name", { length: 500 }).notNull(),
  sector: varchar("sector", { length: 255 }).notNull(),
  sectorCategory: varchar("sectorCategory", { length: 64 }).notNull(),
  issuer: varchar("issuer", { length: 255 }),
  validFrom: varchar("validFrom", { length: 32 }),
  validTo: varchar("validTo", { length: 32 }),
  description: text("description"),
  isENGEB: int("isENGEB").default(0).notNull(),
  isCustom: int("isCustom").default(0).notNull(), // 1 if user-created custom CCNL
  createdBy: int("createdBy"), // user id who created this custom CCNL (null for predefined)
  // CNEL integration fields
  codiceCnel: varchar("codiceCnel", { length: 10 }), // Official CNEL alphanumeric code
  macroSettoreCnel: varchar("macroSettoreCnel", { length: 100 }), // CNEL macro sector
  contraentiDatoriali: text("contraentiDatoriali"), // Employer associations
  contraentiSindacali: text("contraentiSindacali"), // Trade unions
  // Statistical data from INPS-UNIEMENS integration
  numeroLavoratori: int("numeroLavoratori"), // Number of workers covered by this CCNL
  numeroAziende: int("numeroAziende"), // Number of companies applying this CCNL
  fonteDati: varchar("fonteDati", { length: 128 }).default("simulato"), // Data source: "simulato", "inps", "istat"
  dataAggiornamentoDati: timestamp("dataAggiornamentoDati"), // Last update of statistical data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CCNL = typeof ccnls.$inferSelect;
export type InsertCCNL = typeof ccnls.$inferInsert;

/**
 * CCNL Levels table - stores professional levels for each CCNL
 */
export const ccnlLevels = mysqlTable("ccnl_levels", {
  id: int("id").autoincrement().primaryKey(),
  ccnlId: int("ccnlId").notNull(),
  level: varchar("level", { length: 64 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  baseSalaryMonthly: varchar("baseSalaryMonthly", { length: 32 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CCNLLevel = typeof ccnlLevels.$inferSelect;
export type InsertCCNLLevel = typeof ccnlLevels.$inferInsert;

/**
 * CCNL Additional Costs table - stores TFR, social contributions, etc.
 */
export const ccnlAdditionalCosts = mysqlTable("ccnl_additional_costs", {
  id: int("id").autoincrement().primaryKey(),
  ccnlId: int("ccnlId").notNull().unique(),
  tfr: varchar("tfr", { length: 16 }).notNull(), // percentage as string
  socialContributions: varchar("socialContributions", { length: 16 }).notNull(), // percentage as string
  otherBenefits: varchar("otherBenefits", { length: 16 }).notNull(), // percentage as string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CCNLAdditionalCosts = typeof ccnlAdditionalCosts.$inferSelect;
export type InsertCCNLAdditionalCosts = typeof ccnlAdditionalCosts.$inferInsert;

/**
 * CCNL Contributions table - stores specific contributions (ENGEB, COASCO, etc.)
 */
export const ccnlContributions = mysqlTable("ccnl_contributions", {
  id: int("id").autoincrement().primaryKey(),
  ccnlId: int("ccnlId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  percentage: varchar("percentage", { length: 16 }).default("0").notNull(),
  amount: varchar("amount", { length: 16 }).default("0").notNull(),
  isPercentage: int("isPercentage").default(0).notNull(),
  category: mysqlEnum("category", ["bilateral", "pension", "health", "other"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CCNLContribution = typeof ccnlContributions.$inferSelect;
export type InsertCCNLContribution = typeof ccnlContributions.$inferInsert;
/**
 * CCNL Monthly Statistics table - stores monthly aggregated data from INPS-UNIEMENS
 */
export const ccnlMonthlyStats = mysqlTable("ccnl_monthly_stats", {
  id: int("id").autoincrement().primaryKey(),
  ccnlId: int("ccnlId").notNull(),
  referenceMonth: varchar("referenceMonth", { length: 7 }).notNull(), // Format: YYYY-MM
  numCompanies: int("numCompanies").notNull(), // Number of companies applying this CCNL
  numWorkers: int("numWorkers").notNull(), // Total number of workers
  numWorkersMale: int("numWorkersMale"), // Male workers (optional)
  numWorkersFemale: int("numWorkersFemale"), // Female workers (optional)
  dataSource: mysqlEnum("dataSource", ["cnel_inps", "estimate", "manual"]).default("estimate").notNull(),
  notes: text("notes"), // Additional notes or data quality indicators
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CCNLMonthlyStat = typeof ccnlMonthlyStats.$inferSelect;
export type InsertCCNLMonthlyStat = typeof ccnlMonthlyStats.$inferInsert;

/**
 * Normativa & Prassi
 * - Repository di fonti (atti, circolari, prassi, ecc.) con tagging e versioning.
 */
export const legalSources = mysqlTable("legal_sources", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", [
    "law",
    "decree",
    "legislative_decree",
    "circular",
    "practice",
    "jurisprudence",
    "contract",
    "other",
  ]).notNull(),
  title: varchar("title", { length: 600 }).notNull(),
  issuingBody: varchar("issuingBody", { length: 255 }),
  officialUrl: varchar("officialUrl", { length: 1200 }),
  publishedAt: varchar("publishedAt", { length: 32 }), // YYYY-MM-DD or YYYY-MM
  effectiveFrom: varchar("effectiveFrom", { length: 32 }),
  effectiveTo: varchar("effectiveTo", { length: 32 }),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  summary: text("summary"),
  body: text("body"), // markdown/plaintext
  createdBy: int("createdBy"),
  lastReviewedAt: timestamp("lastReviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const legalTags = mysqlTable("legal_tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const legalSourceTags = mysqlTable("legal_source_tags", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull(),
  tagId: int("tagId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const legalSourceVersions = mysqlTable("legal_source_versions", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull(),
  version: varchar("version", { length: 32 }).notNull(),
  changeNote: text("changeNote"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LegalSource = typeof legalSources.$inferSelect;
export type InsertLegalSource = typeof legalSources.$inferInsert;

/**
 * Toolkit consulente: checklist operative + template documentali.
 */
export const checklists = mysqlTable("checklists", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdBy: int("createdBy"),
  lastReviewedAt: timestamp("lastReviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const checklistItems = mysqlTable("checklist_items", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").notNull(),
  position: int("position").notNull(),
  text: varchar("text", { length: 800 }).notNull(),
  notes: text("notes"),
  isRequired: int("isRequired").default(1).notNull(),
  referenceSourceId: int("referenceSourceId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  description: text("description"),
  format: mysqlEnum("format", ["plaintext", "markdown"]).default("markdown").notNull(),
  content: text("content").notNull(), // {{placeholders}}
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdBy: int("createdBy"),
  lastReviewedAt: timestamp("lastReviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const templateFields = mysqlTable("template_fields", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull(),
  name: varchar("name", { length: 80 }).notNull(), // placeholder key
  label: varchar("label", { length: 200 }).notNull(),
  fieldType: mysqlEnum("fieldType", ["text", "date", "number", "email"]).default("text").notNull(),
  required: int("required").default(1).notNull(),
  defaultValue: varchar("defaultValue", { length: 400 }),
  helpText: varchar("helpText", { length: 600 }),
  position: int("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * File registry (uploads). Storage can be local or Manus Forge storage proxy.
 */
export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId"),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  provider: mysqlEnum("provider", ["local", "forge"]).default("local").notNull(),
  storageKey: varchar("storageKey", { length: 1200 }).notNull(),
  purpose: mysqlEnum("purpose", ["service_request", "service_doc", "generic"]).default("generic").notNull(),
  visibility: mysqlEnum("visibility", ["private", "org", "public"]).default("private").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Area Sindacati / Enti bilaterali: servizi + richieste prestazione.
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 300 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  description: text("description"),
  eligibility: text("eligibility"),
  procedure: text("procedure"),
  slaDays: int("slaDays"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const serviceDocuments = mysqlTable("service_documents", {
  id: int("id").autoincrement().primaryKey(),
  serviceId: int("serviceId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  fileId: int("fileId").notNull(),
  isRequired: int("isRequired").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const serviceRequests = mysqlTable("service_requests", {
  id: int("id").autoincrement().primaryKey(),
  serviceId: int("serviceId").notNull(),
  requesterUserId: int("requesterUserId").notNull(),
  subject: varchar("subject", { length: 300 }).notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", [
    "draft",
    "submitted",
    "in_review",
    "needs_info",
    "approved",
    "rejected",
    "closed",
  ])
    .default("draft")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const serviceRequestFiles = mysqlTable("service_request_files", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(),
  fileId: int("fileId").notNull(),
  label: varchar("label", { length: 300 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const serviceRequestEvents = mysqlTable("service_request_events", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(),
  fromStatus: varchar("fromStatus", { length: 32 }),
  toStatus: varchar("toStatus", { length: 32 }).notNull(),
  note: text("note"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
