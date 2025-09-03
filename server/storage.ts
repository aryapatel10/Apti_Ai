import { eq, desc, and, gte } from "drizzle-orm";
import { db } from "./lib/supabase";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  Assessment,
  InsertAssessment,
  AssessmentLink,
  InsertAssessmentLink,
  AssessmentResult,
  InsertAssessmentResult,
  QuestionBankItem,
  InsertQuestionBankItem,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Assessments
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessmentsByAdminId(adminId: string): Promise<Assessment[]>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  updateAssessment(id: string, assessment: Partial<InsertAssessment>): Promise<Assessment>;
  deleteAssessment(id: string): Promise<void>;

  // Assessment Links
  createAssessmentLink(link: InsertAssessmentLink): Promise<AssessmentLink>;
  getAssessmentLinkByToken(token: string): Promise<AssessmentLink | undefined>;
  getAssessmentLinksByAssessmentId(assessmentId: string): Promise<AssessmentLink[]>;
  markLinkAsUsed(id: string): Promise<void>;

  // Assessment Results
  createAssessmentResult(result: InsertAssessmentResult): Promise<AssessmentResult>;
  getResultsByAssessmentId(assessmentId: string): Promise<AssessmentResult[]>;
  getResultByLinkId(linkId: string): Promise<AssessmentResult | undefined>;

  // Question Bank
  getQuestions(category?: string, difficulty?: string): Promise<QuestionBankItem[]>;
  createQuestion(question: InsertQuestionBankItem): Promise<QuestionBankItem>;
  updateQuestion(id: string, question: Partial<InsertQuestionBankItem>): Promise<QuestionBankItem>;
  deleteQuestion(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  // Assessments
  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db.insert(schema.assessments).values({
      ...assessment,
      questions: assessment.questions as any
    }).returning();
    return newAssessment;
  }

  async getAssessmentsByAdminId(adminId: string): Promise<Assessment[]> {
    return await db
      .select()
      .from(schema.assessments)
      .where(eq(schema.assessments.adminId, adminId))
      .orderBy(desc(schema.assessments.createdAt));
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(schema.assessments).where(eq(schema.assessments.id, id));
    return assessment;
  }

  async updateAssessment(id: string, assessment: Partial<InsertAssessment>): Promise<Assessment> {
    const updateData: any = { ...assessment, updatedAt: new Date() };
    if (assessment.questions) {
      updateData.questions = assessment.questions as any;
    }
    const [updatedAssessment] = await db
      .update(schema.assessments)
      .set(updateData)
      .where(eq(schema.assessments.id, id))
      .returning();
    return updatedAssessment;
  }

  async deleteAssessment(id: string): Promise<void> {
    await db.delete(schema.assessments).where(eq(schema.assessments.id, id));
  }

  // Assessment Links
  async createAssessmentLink(link: InsertAssessmentLink): Promise<AssessmentLink> {
    const [newLink] = await db.insert(schema.assessmentLinks).values(link).returning();
    return newLink;
  }

  async getAssessmentLinkByToken(token: string): Promise<AssessmentLink | undefined> {
    const [link] = await db
      .select()
      .from(schema.assessmentLinks)
      .where(
        and(
          eq(schema.assessmentLinks.linkToken, token),
          gte(schema.assessmentLinks.expiresAt, new Date())
        )
      );
    return link;
  }

  async getAssessmentLinksByAssessmentId(assessmentId: string): Promise<AssessmentLink[]> {
    return await db
      .select()
      .from(schema.assessmentLinks)
      .where(eq(schema.assessmentLinks.assessmentId, assessmentId))
      .orderBy(desc(schema.assessmentLinks.createdAt));
  }

  async markLinkAsUsed(id: string): Promise<void> {
    await db
      .update(schema.assessmentLinks)
      .set({ isUsed: true })
      .where(eq(schema.assessmentLinks.id, id));
  }

  // Assessment Results
  async createAssessmentResult(result: InsertAssessmentResult): Promise<AssessmentResult> {
    const [newResult] = await db.insert(schema.assessmentResults).values({
      ...result,
      answers: result.answers as any
    }).returning();
    return newResult;
  }

  async getResultsByAssessmentId(assessmentId: string): Promise<AssessmentResult[]> {
    return await db
      .select({
        result: schema.assessmentResults,
        link: schema.assessmentLinks,
      })
      .from(schema.assessmentResults)
      .innerJoin(schema.assessmentLinks, eq(schema.assessmentResults.assessmentLinkId, schema.assessmentLinks.id))
      .where(eq(schema.assessmentLinks.assessmentId, assessmentId))
      .orderBy(desc(schema.assessmentResults.completedAt))
      .then(rows => rows.map(row => ({ ...row.result, candidateEmail: row.link.candidateEmail, candidateName: row.link.candidateName })));
  }

  async getResultByLinkId(linkId: string): Promise<AssessmentResult | undefined> {
    const [result] = await db
      .select()
      .from(schema.assessmentResults)
      .where(eq(schema.assessmentResults.assessmentLinkId, linkId));
    return result;
  }

  // Question Bank
  async getQuestions(category?: string, difficulty?: string): Promise<QuestionBankItem[]> {
    let query = db.select().from(schema.questionBank);
    
    if (category || difficulty) {
      const conditions = [];
      if (category) conditions.push(eq(schema.questionBank.category, category));
      if (difficulty) conditions.push(eq(schema.questionBank.difficulty, difficulty));
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(schema.questionBank.createdAt));
  }

  async createQuestion(question: InsertQuestionBankItem): Promise<QuestionBankItem> {
    const [newQuestion] = await db.insert(schema.questionBank).values({
      ...question,
      options: question.options as any,
      tags: question.tags as any
    }).returning();
    return newQuestion;
  }

  async updateQuestion(id: string, question: Partial<InsertQuestionBankItem>): Promise<QuestionBankItem> {
    const updateData: any = { ...question };
    if (question.options) {
      updateData.options = question.options as any;
    }
    if (question.tags) {
      updateData.tags = question.tags as any;
    }
    const [updatedQuestion] = await db
      .update(schema.questionBank)
      .set(updateData)
      .where(eq(schema.questionBank.id, id))
      .returning();
    return updatedQuestion;
  }

  async deleteQuestion(id: string): Promise<void> {
    await db.delete(schema.questionBank).where(eq(schema.questionBank.id, id));
  }
}

export const storage = new DatabaseStorage();
