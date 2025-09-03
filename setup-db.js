import { db } from "./server/lib/supabase.js";
import * as schema from "./shared/schema.js";

async function setupDatabase() {
  try {
    console.log("🔗 Testing database connection...");
    
    // Test connection by creating a demo admin user
    const demoUser = {
      email: "admin@demo.com",
      fullName: "Demo Admin",
      role: "admin"
    };

    console.log("👤 Creating demo admin user...");
    const user = await db.insert(schema.users).values(demoUser).onConflictDoNothing().returning();
    
    if (user.length > 0) {
      console.log("✅ Demo admin user created:", user[0].email);
    } else {
      console.log("ℹ️  Demo admin user already exists");
    }

    // Add some sample questions to the question bank
    const sampleQuestions = [
      {
        questionText: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctAnswer: 1,
        category: "technical",
        difficulty: "medium",
        tags: ["algorithms", "data-structures"]
      },
      {
        questionText: "Which of the following is NOT a programming paradigm?",
        options: ["Object-oriented", "Functional", "Procedural", "Relational"],
        correctAnswer: 3,
        category: "technical", 
        difficulty: "easy",
        tags: ["programming", "concepts"]
      }
    ];

    console.log("📚 Adding sample questions to question bank...");
    for (const question of sampleQuestions) {
      try {
        await db.insert(schema.questionBank).values(question).onConflictDoNothing();
      } catch (err) {
        console.log("Question already exists, skipping...");
      }
    }

    console.log("🎉 Database setup completed successfully!");
    console.log("\n🚀 Your MCQ Assessment Platform is ready!");
    console.log("📧 Demo admin login: admin@demo.com");
    
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    process.exit(1);
  }
}

setupDatabase();