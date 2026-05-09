import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
  boolean,
} from "drizzle-orm/pg-core";

// ── Students ──────────────────────────────────────────────────────────────
export const students = pgTable(
  "students",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name"),
    locale: text("locale").default("en"),
    timezone: text("timezone").default("UTC"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [uniqueIndex("students_email_key").on(table.email)]
);

// ── Users (NextAuth) ──────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  isOperator: boolean("is_operator").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => [
    uniqueIndex("accounts_provider_provider_account_id_key").on(
      table.provider,
      table.providerAccountId
    ),
  ]
);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("session_token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("verification_tokens_identifier_token_key").on(
      table.identifier,
      table.token
    ),
  ]
);

// ── Intake Tokens (one-time, HMAC + 7 day expiry) ─────────────────────────
export const intakeTokens = pgTable("intake_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  courseId: uuid("course_id"),
  usedAt: timestamp("used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Courses ───────────────────────────────────────────────────────────────
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id),
  userId: uuid("user_id").references(() => users.id),
  goal: text("goal").notNull(),
  levelContext: text("level_context"),
  locale: text("locale").default("en").notNull(),
  status: text("status")
    .default("draft").notNull()
    .$type<
      | "draft"
      | "syllabus_pending"
      | "syllabus_approved"
      | "active"
      | "paused"
      | "completed"
      | "refunded"
    >(),
  nModules: integer("n_modules"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
});

// ── Modules ───────────────────────────────────────────────────────────────
export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  idx: integer("idx").notNull(),
  title: text("title").notNull(),
  readings: jsonb("readings").$type<
    {
      citation: string;
      source: "crossref" | "openlibrary" | "github" | "manual";
      url?: string;
      verifiedAt?: string;
    }[]
  >(),
  exerciseMd: text("exercise_md"),
  rubric: jsonb("rubric").$type<{ criterion: string; weight: number }[]>(),
});

// ── Drips ─────────────────────────────────────────────────────────────────
export const drips = pgTable(
  "drips",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    status: text("status")
      .default("pending")
      .$type<"pending" | "sent" | "delivery_blocked">(),
  },
  (table) => [
    index("drips_scheduled_at_idx").on(table.scheduledAt),
    index("drips_status_idx").on(table.status),
  ]
);

// ── Submissions ───────────────────────────────────────────────────────────
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  dripId: uuid("drip_id")
    .notNull()
    .references(() => drips.id, { onDelete: "cascade" }),
  artifactUrl: text("artifact_url"),
  rawText: text("raw_text"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
});

// ── Grades ────────────────────────────────────────────────────────────────
export const grades = pgTable("grades", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  score: integer("score"),
  perCriterion: jsonb("per_criterion"),
  confidence: integer("confidence"),
  status: text("status")
    .default("auto")
    .$type<"auto" | "operator_reviewed" | "flagged">(),
  gradedAt: timestamp("graded_at", { withTimezone: true }).defaultNow(),
});

// ── Orders ────────────────────────────────────────────────────────────────
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").references(() => courses.id),
    invoiceId: text("invoice_id"),
    paymentId: text("payment_id"),
    plan: text("plan").$type<"studio" | "studio_plus" | "studio_bespoke">(),
    amountCents: integer("amount_cents"),
    currency: text("currency"),
    status: text("status")
      .default("pending")
      .$type<"pending" | "paid" | "paid_manual" | "refunded">(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("orders_invoice_payment_key").on(
      table.invoiceId,
      table.paymentId
    ),
  ]
);

// ── Audit Log ─────────────────────────────────────────────────────────────
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: text("action").notNull(),
  actorId: uuid("actor_id"),
  targetType: text("target_type"),
  targetId: uuid("target_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
