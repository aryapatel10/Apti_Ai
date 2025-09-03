import { sql } from "drizzle-orm";
import { pgTable, uuid, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("admin"), // 'admin' or 'candidate'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assessments = pgTable("assessments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  adminId: uuid("admin_id").references(() => users.id).notNull(),
  totalTime: integer("total_time").notNull(), // in minutes
  timePerQuestion: integer("time_per_question").notNull(), // in minutes
  questions: jsonb("questions").notNull().$type<Question[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assessmentLinks = pgTable("assessment_links", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: uuid("assessment_id").references(() => assessments.id).notNull(),
  candidateEmail: text("candidate_email").notNull(),
  candidateName: text("candidate_name").notNull(),
  linkToken: text("link_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assessmentResults = pgTable("assessment_results", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentLinkId: uuid("assessment_link_id").references(() => assessmentLinks.id).notNull(),
  answers: jsonb("answers").notNull().$type<Answer[]>(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeTaken: integer("time_taken").notNull(), // in minutes
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  feedback: text("feedback"),
});

export const questionBank = pgTable("question_bank", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull().$type<string[]>(),
  correctAnswer: integer("correct_answer").notNull(), // index of correct option
  category: text("category").notNull(), // 'aptitude', 'technical', etc.
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard'
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types for JSON fields
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: string;
  explanation?: string;
}

export interface Answer {
  questionId: string;
  selectedAnswer: number;
  timeSpent: number; // in seconds
}

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentLinkSchema = createInsertSchema(assessmentLinks).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentResultSchema = createInsertSchema(assessmentResults).omit({
  id: true,
  completedAt: true,
});

export const insertQuestionBankSchema = createInsertSchema(questionBank).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

export type AssessmentLink = typeof assessmentLinks.$inferSelect;
export type InsertAssessmentLink = z.infer<typeof insertAssessmentLinkSchema>;

export type AssessmentResult = typeof assessmentResults.$inferSelect;
export type InsertAssessmentResult = z.infer<typeof insertAssessmentResultSchema>;

export type QuestionBankItem = typeof questionBank.$inferSelect;
export type InsertQuestionBankItem = z.infer<typeof insertQuestionBankSchema>;
