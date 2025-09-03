import React, { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Wand2, Database, Plus } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Question, QuestionBankItem } from "@shared/schema";

interface AIQuestionRequest {
  jobRole: string;
  category: string;
  difficulty: string;
  count: number;
}

export default function CreateAssessment() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jobRole: "",
    totalTime: 45,
    timePerQuestion: 2,
  });

  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Fetch question bank
  const { data: questionBank = [] } = useQuery<QuestionBankItem[]>({
    queryKey: ["/api/questions"],
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: any) => {
      return await apiRequest("POST", "/api/assessments", assessmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({
        title: "Success",
        description: "Assessment created successfully",
      });
      setLocation("/admin/assessments");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create assessment",
        variant: "destructive",
      });
    },
  });

  const generateAIQuestions = async (request: AIQuestionRequest) => {
    setAiGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/ai/generate-questions", request);
      const data = await response.json();
      
      const aiQuestions: Question[] = data.map((q: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        text: q.question,
        options: q.options,
        correctAnswer: q.correct_answer,
        category: q.category,
        difficulty: q.difficulty,
        explanation: q.explanation,
      }));

      setSelectedQuestions(prev => [...prev, ...aiQuestions]);
      
      toast({
        title: "Success",
        description: `Generated ${aiQuestions.length} questions`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI questions",
        variant: "destructive",
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleQuestionToggle = (question: QuestionBankItem, checked: boolean) => {
    if (checked) {
      const newQuestion: Question = {
        id: question.id,
        text: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        category: question.category,
        difficulty: question.difficulty,
      };
      setSelectedQuestions(prev => [...prev, newQuestion]);
    } else {
      setSelectedQuestions(prev => prev.filter(q => q.id !== question.id));
    }
  };

  const handleSubmit = () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question",
        variant: "destructive",
      });
      return;
    }

    createAssessmentMutation.mutate({
      title: formData.title,
      description: formData.description,
      adminId: user?.id,
      totalTime: formData.totalTime,
      timePerQuestion: formData.timePerQuestion,
      questions: selectedQuestions,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/assessments">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Assessment</h1>
          <p className="text-slate-400">Build a comprehensive assessment for your candidates</p>
        </div>
      </div>

      {/* Progress Steps */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? "bg-emerald-500" : "bg-slate-700"
            }`}>
              <span className="text-white text-sm font-medium">1</span>
            </div>
            <span className={`font-medium ${step >= 1 ? "text-white" : "text-slate-400"}`}>
              Basic Details
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-700 mx-4"></div>
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? "bg-emerald-500" : "bg-slate-700"
            }`}>
              <span className={`text-sm font-medium ${step >= 2 ? "text-white" : "text-slate-400"}`}>2</span>
            </div>
            <span className={`font-medium ${step >= 2 ? "text-white" : "text-slate-400"}`}>
              Questions
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-700 mx-4"></div>
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? "bg-emerald-500" : "bg-slate-700"
            }`}>
              <span className={`text-sm font-medium ${step >= 3 ? "text-white" : "text-slate-400"}`}>3</span>
            </div>
            <span className={`font-medium ${step >= 3 ? "text-white" : "text-slate-400"}`}>
              Review
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Step 1: Basic Details */}
      {step === 1 && (
        <GlassCard>
          <h2 className="text-xl font-semibold text-white mb-6">Assessment Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-300 mb-2">Assessment Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Frontend Developer Assessment"
                className="bg-slate-800/50 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-slate-300 mb-2">Job Role</Label>
              <Select value={formData.jobRole} onValueChange={(value) => setFormData({ ...formData, jobRole: value })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select job role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend-developer">Frontend Developer</SelectItem>
                  <SelectItem value="backend-developer">Backend Developer</SelectItem>
                  <SelectItem value="fullstack-developer">Full Stack Developer</SelectItem>
                  <SelectItem value="data-scientist">Data Scientist</SelectItem>
                  <SelectItem value="product-manager">Product Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label className="text-slate-300 mb-2">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the assessment..."
                className="bg-slate-800/50 border-slate-600 text-white h-24"
              />
            </div>

            <div>
              <Label className="text-slate-300 mb-2">Total Assessment Time (minutes)</Label>
              <Input
                type="number"
                value={formData.totalTime}
                onChange={(e) => setFormData({ ...formData, totalTime: parseInt(e.target.value) })}
                className="bg-slate-800/50 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300 mb-2">Time Per Question (minutes)</Label>
              <Input
                type="number"
                value={formData.timePerQuestion}
                onChange={(e) => setFormData({ ...formData, timePerQuestion: parseInt(e.target.value) })}
                className="bg-slate-800/50 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setStep(2)}
              disabled={!formData.title || !formData.jobRole}
              className="btn-primary"
            >
              Next: Add Questions
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Step 2: Questions */}
      {step === 2 && (
        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-6">Question Configuration</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Generation */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <Wand2 className="text-emerald-400 mr-2" size={20} />
                  AI Generated Questions
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300 mb-2">Question Categories</Label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <Checkbox className="mr-2" />
                        <span className="text-slate-300">Technical Skills (10 questions)</span>
                      </label>
                      <label className="flex items-center">
                        <Checkbox className="mr-2" />
                        <span className="text-slate-300">Aptitude (5 questions)</span>
                      </label>
                      <label className="flex items-center">
                        <Checkbox className="mr-2" />
                        <span className="text-slate-300">Logical Reasoning (5 questions)</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-slate-300 mb-2">Difficulty Level</Label>
                    <Select>
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mixed">Mixed (Easy, Medium, Hard)</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    onClick={() => generateAIQuestions({
                      jobRole: formData.jobRole,
                      category: "technical",
                      difficulty: "mixed",
                      count: 10,
                    })}
                    disabled={aiGenerating}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700"
                  >
                    <Wand2 className="mr-2" size={16} />
                    {aiGenerating ? "Generating..." : "Generate Questions"}
                  </Button>
                </div>
              </div>
              
              {/* Question Bank */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <Database className="text-purple-400 mr-2" size={20} />
                  Question Bank
                </h3>
                
                <div className="space-y-4">
                  <Input
                    placeholder="Search questions..."
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {questionBank.map((question) => (
                      <div key={question.id} className="bg-slate-800/30 p-3 rounded-lg border border-slate-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-white text-sm">{question.questionText}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                {question.category}
                              </span>
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                {question.difficulty}
                              </span>
                            </div>
                          </div>
                          <Checkbox
                            checked={selectedQuestions.some(q => q.id === question.id)}
                            onCheckedChange={(checked) => handleQuestionToggle(question, !!checked)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Selected Questions Summary */}
          {selectedQuestions.length > 0 && (
            <GlassCard>
              <h3 className="text-lg font-medium text-white mb-4">
                Selected Questions ({selectedQuestions.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedQuestions.map((question, index) => (
                  <div key={question.id} className="bg-slate-800/30 p-3 rounded-lg border border-slate-700">
                    <p className="text-white text-sm font-medium">
                      Q{index + 1}: {question.text.substring(0, 50)}...
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                        {question.category}
                      </span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        {question.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <div className="flex justify-between">
            <Button onClick={() => setStep(1)} variant="outline" className="border-slate-600 text-slate-300">
              Previous
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={selectedQuestions.length === 0}
              className="btn-primary"
            >
              Next: Review & Save
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-6">Review Assessment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-medium mb-2">Assessment Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">Title:</span> <span className="text-white">{formData.title}</span></p>
                  <p><span className="text-slate-400">Job Role:</span> <span className="text-white">{formData.jobRole}</span></p>
                  <p><span className="text-slate-400">Total Time:</span> <span className="text-white">{formData.totalTime} minutes</span></p>
                  <p><span className="text-slate-400">Time per Question:</span> <span className="text-white">{formData.timePerQuestion} minutes</span></p>
                  <p><span className="text-slate-400">Total Questions:</span> <span className="text-white">{selectedQuestions.length}</span></p>
                </div>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Question Breakdown</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(
                    selectedQuestions.reduce((acc, q) => {
                      acc[q.category] = (acc[q.category] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([category, count]) => (
                    <p key={category}>
                      <span className="text-slate-400">{category}:</span> <span className="text-white">{count} questions</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {formData.description && (
              <div className="mt-6">
                <h3 className="text-white font-medium mb-2">Description</h3>
                <p className="text-slate-300 text-sm">{formData.description}</p>
              </div>
            )}
          </GlassCard>

          <div className="flex justify-between">
            <Button onClick={() => setStep(2)} variant="outline" className="border-slate-600 text-slate-300">
              Previous
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createAssessmentMutation.isPending}
              className="btn-primary"
            >
              {createAssessmentMutation.isPending ? "Creating..." : "Create Assessment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
