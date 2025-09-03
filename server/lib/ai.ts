interface AIQuestionRequest {
  jobRole: string;
  category: string;
  difficulty: string;
  count: number;
}

interface AIQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  category: string;
  difficulty: string;
}

class AIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
  }

  async generateQuestions(request: AIQuestionRequest): Promise<AIQuestion[]> {
    if (!this.apiKey) {
      throw new Error("AI API key not configured");
    }

    const prompt = `Generate ${request.count} multiple choice questions for a ${request.jobRole} position.
    Category: ${request.category}
    Difficulty: ${request.difficulty}
    
    Requirements:
    - Each question should have exactly 4 options (A, B, C, D)
    - Only one correct answer per question
    - Include a brief explanation for the correct answer
    - Questions should be relevant to ${request.jobRole} role
    - Focus on ${request.category} skills
    - Difficulty level: ${request.difficulty}
    
    Return the response as a JSON array with this exact structure:
    [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": 0,
        "explanation": "Explanation for why this answer is correct",
        "category": "${request.category}",
        "difficulty": "${request.difficulty}"
      }
    ]`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert technical interviewer and assessment creator. Generate high-quality, professional multiple choice questions."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content received from AI API");
      }

      // Parse the JSON response
      const questions = JSON.parse(content);
      
      if (!Array.isArray(questions)) {
        throw new Error("Invalid response format from AI API");
      }

      return questions;
    } catch (error) {
      console.error("AI question generation error:", error);
      throw new Error("Failed to generate questions using AI");
    }
  }
}

export const aiService = new AIService();
