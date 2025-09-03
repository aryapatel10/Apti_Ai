import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./lib/email";
import { aiService } from "./lib/ai";
import { randomUUID } from "crypto";
import { z } from "zod";
import { insertAssessmentSchema, insertAssessmentLinkSchema, insertAssessmentResultSchema, insertQuestionBankSchema } from "@shared/schema";

// Middleware for JSON parsing
function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: any) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: "Invalid request body", details: error });
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Simple auth check - in production, use proper password hashing
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.role !== "admin") {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Assessment routes
  app.post("/api/assessments", validateBody(insertAssessmentSchema), async (req: Request, res: Response) => {
    try {
      const assessment = await storage.createAssessment(req.body);
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create assessment" });
    }
  });

  app.get("/api/assessments", async (req: Request, res: Response) => {
    try {
      const adminId = req.query.adminId as string;
      if (!adminId) {
        return res.status(400).json({ error: "Admin ID required" });
      }
      
      const assessments = await storage.getAssessmentsByAdminId(adminId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assessments" });
    }
  });

  app.get("/api/assessments/:id", async (req: Request, res: Response) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assessment" });
    }
  });

  app.put("/api/assessments/:id", validateBody(insertAssessmentSchema.partial()), async (req: Request, res: Response) => {
    try {
      const assessment = await storage.updateAssessment(req.params.id, req.body);
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update assessment" });
    }
  });

  app.delete("/api/assessments/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteAssessment(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete assessment" });
    }
  });

  // Assessment link generation
  app.post("/api/assessments/:id/generate-link", async (req: Request, res: Response) => {
    try {
      const { candidateEmail, candidateName } = req.body;
      const assessmentId = req.params.id;
      
      const assessment = await storage.getAssessment(assessmentId);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      const linkToken = randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours from now

      const link = await storage.createAssessmentLink({
        assessmentId,
        candidateEmail,
        candidateName,
        linkToken,
        expiresAt,
      });

      // Generate the assessment URL
      const assessmentUrl = `${req.protocol}://${req.get('host')}/take/${linkToken}`;

      // Send invitation email
      try {
        await emailService.sendAssessmentInvitation(
          candidateEmail,
          candidateName,
          assessment.title,
          assessmentUrl,
          48
        );
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't fail the request if email fails
      }

      res.json({ 
        link, 
        assessmentUrl,
        message: "Assessment link generated and invitation email sent"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate assessment link" });
    }
  });

  // Question bank routes
  app.get("/api/questions", async (req: Request, res: Response) => {
    try {
      const { category, difficulty } = req.query;
      const questions = await storage.getQuestions(
        category as string,
        difficulty as string
      );
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  app.post("/api/questions", validateBody(insertQuestionBankSchema), async (req: Request, res: Response) => {
    try {
      const question = await storage.createQuestion(req.body);
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: "Failed to create question" });
    }
  });

  app.put("/api/questions/:id", validateBody(insertQuestionBankSchema.partial()), async (req: Request, res: Response) => {
    try {
      const question = await storage.updateQuestion(req.params.id, req.body);
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: "Failed to update question" });
    }
  });

  app.delete("/api/questions/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteQuestion(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete question" });
    }
  });

  // AI question generation
  app.post("/api/ai/generate-questions", async (req: Request, res: Response) => {
    try {
      const { jobRole, category, difficulty, count } = req.body;
      
      if (!jobRole || !category || !difficulty || !count) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const questions = await aiService.generateQuestions({
        jobRole,
        category,
        difficulty,
        count: parseInt(count),
      });

      res.json(questions);
    } catch (error) {
      console.error("AI question generation error:", error);
      res.status(500).json({ error: "Failed to generate questions" });
    }
  });

  // Candidate assessment routes
  app.get("/api/take/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      const link = await storage.getAssessmentLinkByToken(token);
      if (!link) {
        return res.status(404).json({ error: "Invalid or expired assessment link" });
      }

      if (link.isUsed) {
        return res.status(400).json({ error: "Assessment link has already been used" });
      }

      const assessment = await storage.getAssessment(link.assessmentId);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Check if result already exists
      const existingResult = await storage.getResultByLinkId(link.id);
      if (existingResult) {
        return res.status(400).json({ error: "Assessment already completed" });
      }

      res.json({
        assessment: {
          id: assessment.id,
          title: assessment.title,
          description: assessment.description,
          totalTime: assessment.totalTime,
          timePerQuestion: assessment.timePerQuestion,
          questions: assessment.questions,
        },
        candidate: {
          name: link.candidateName,
          email: link.candidateEmail,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assessment" });
    }
  });

  app.post("/api/take/:token/submit", validateBody(insertAssessmentResultSchema), async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      const link = await storage.getAssessmentLinkByToken(token);
      if (!link) {
        return res.status(404).json({ error: "Invalid or expired assessment link" });
      }

      // Check if already submitted
      const existingResult = await storage.getResultByLinkId(link.id);
      if (existingResult) {
        return res.status(400).json({ error: "Assessment already submitted" });
      }

      const result = await storage.createAssessmentResult({
        ...req.body,
        assessmentLinkId: link.id,
      });

      // Mark link as used
      await storage.markLinkAsUsed(link.id);

      // Send completion email
      try {
        await emailService.sendCompletionConfirmation(
          link.candidateEmail,
          link.candidateName,
          "Assessment", // You might want to fetch the assessment title
          result.score,
          result.totalQuestions
        );
      } catch (emailError) {
        console.error("Completion email failed:", emailError);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit assessment" });
    }
  });

  // Results routes
  app.get("/api/results/assessment/:assessmentId", async (req: Request, res: Response) => {
    try {
      const results = await storage.getResultsByAssessmentId(req.params.assessmentId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // Dashboard stats
  app.get("/api/stats/:adminId", async (req: Request, res: Response) => {
    try {
      const adminId = req.params.adminId;
      const assessments = await storage.getAssessmentsByAdminId(adminId);
      
      let totalLinks = 0;
      let completedCount = 0;
      let totalScore = 0;
      let totalCandidates = 0;

      for (const assessment of assessments) {
        const links = await storage.getAssessmentLinksByAssessmentId(assessment.id);
        const results = await storage.getResultsByAssessmentId(assessment.id);
        
        totalLinks += links.length;
        completedCount += results.length;
        
        results.forEach(result => {
          totalScore += (result.score / result.totalQuestions) * 100;
          totalCandidates++;
        });
      }

      const avgScore = totalCandidates > 0 ? Math.round(totalScore / totalCandidates) : 0;

      res.json({
        totalAssessments: assessments.length,
        activeLinks: totalLinks - completedCount,
        completed: completedCount,
        avgScore: `${avgScore}%`,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
