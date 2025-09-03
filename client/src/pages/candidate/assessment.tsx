import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AssessmentLayout } from "@/components/layout/assessment-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Question, Answer } from "@shared/schema";

interface AssessmentData {
  assessment: {
    id: string;
    title: string;
    description: string;
    totalTime: number;
    timePerQuestion: number;
    questions: Question[];
  };
  candidate: {
    name: string;
    email: string;
  };
}

export default function CandidateAssessment() {
  const [, params] = useRoute("/take/:token");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0);

  const token = params?.token;

  const { data: assessmentData, isLoading, error } = useQuery<AssessmentData>({
    queryKey: ["/api/take", token],
    enabled: !!token,
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async (submissionData: any) => {
      const response = await apiRequest("POST", `/api/take/${token}/submit`, submissionData);
      return response.json();
    },
    onSuccess: () => {
      setLocation(`/take/${token}/complete`);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit assessment",
        variant: "destructive",
      });
    },
  });

  // Initialize timers when assessment starts
  useEffect(() => {
    if (assessmentData && hasStarted) {
      setTimeLeft(assessmentData.assessment.totalTime * 60); // Convert to seconds
      setQuestionTimeLeft(assessmentData.assessment.timePerQuestion * 60);
    }
  }, [assessmentData, hasStarted]);

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, timeLeft]);

  // Question timer countdown
  useEffect(() => {
    if (!hasStarted || questionTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          handleNextQuestion();
          return assessmentData?.assessment.timePerQuestion * 60 || 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, questionTimeLeft, currentQuestionIndex]);

  const handleStart = () => {
    setHasStarted(true);
    setQuestionStartTime(Date.now());
  };

  const handleAnswerChange = (value: string) => {
    const currentQuestion = assessmentData?.assessment.questions[currentQuestionIndex];
    if (currentQuestion) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: parseInt(value)
      }));
    }
  };

  const handleNextQuestion = () => {
    if (!assessmentData) return;

    const nextIndex = Math.min(currentQuestionIndex + 1, assessmentData.assessment.questions.length - 1);
    
    if (nextIndex === assessmentData.assessment.questions.length - 1 && currentQuestionIndex < nextIndex) {
      // Last question
      setCurrentQuestionIndex(nextIndex);
      setQuestionStartTime(Date.now());
      setQuestionTimeLeft(assessmentData.assessment.timePerQuestion * 60);
    } else if (nextIndex > currentQuestionIndex) {
      setCurrentQuestionIndex(nextIndex);
      setQuestionStartTime(Date.now());
      setQuestionTimeLeft(assessmentData.assessment.timePerQuestion * 60);
    }
  };

  const handlePreviousQuestion = () => {
    const prevIndex = Math.max(currentQuestionIndex - 1, 0);
    setCurrentQuestionIndex(prevIndex);
    setQuestionStartTime(Date.now());
    setQuestionTimeLeft(assessmentData?.assessment.timePerQuestion * 60 || 0);
  };

  const handleAutoSubmit = () => {
    if (!assessmentData) return;
    
    toast({
      title: "Time's Up!",
      description: "Assessment has been automatically submitted",
    });
    
    submitAssessment();
  };

  const submitAssessment = () => {
    if (!assessmentData) return;

    const submissionAnswers: Answer[] = assessmentData.assessment.questions.map(question => ({
      questionId: question.id,
      selectedAnswer: answers[question.id] ?? -1,
      timeSpent: Math.round((Date.now() - startTime) / 1000 / assessmentData.assessment.questions.length), // Average time per question
    }));

    // Calculate score
    const score = assessmentData.assessment.questions.reduce((total, question) => {
      return total + (answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);

    submitAssessmentMutation.mutate({
      answers: submissionAnswers,
      score,
      totalQuestions: assessmentData.assessment.questions.length,
      timeTaken: Math.round((Date.now() - startTime) / 1000 / 60), // Convert to minutes
    });
  };

  const handleSubmit = () => {
    const unansweredCount = assessmentData?.assessment.questions.filter(q => !(q.id in answers)).length || 0;
    
    if (unansweredCount > 0) {
      const confirm = window.confirm(
        `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirm) return;
    }

    submitAssessment();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-white">Loading assessment...</div>
      </div>
    );
  }

  if (error || !assessmentData) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Assessment Not Available</h1>
          <p className="text-slate-400">
            This assessment link is invalid, expired, or has already been used.
          </p>
        </GlassCard>
      </div>
    );
  }

  // Pre-start screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <GlassCard className="max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{assessmentData.assessment.title}</h1>
            <p className="text-slate-300">Welcome, {assessmentData.candidate.name}</p>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Assessment Instructions</h2>
              <div className="bg-slate-800/30 rounded-lg p-4 space-y-2 text-slate-300">
                <p>• Total time: <strong>{assessmentData.assessment.totalTime} minutes</strong></p>
                <p>• Time per question: <strong>{assessmentData.assessment.timePerQuestion} minutes</strong></p>
                <p>• Total questions: <strong>{assessmentData.assessment.questions.length}</strong></p>
                <p>• You cannot pause or restart once you begin</p>
                <p>• Questions will auto-advance when time expires</p>
                <p>• Make sure you have a stable internet connection</p>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="text-yellow-400 mr-3 mt-0.5" size={20} />
                <div>
                  <h3 className="text-yellow-400 font-medium mb-1">Important Notice</h3>
                  <p className="text-slate-300 text-sm">
                    Once you start the assessment, the timer cannot be paused. Please ensure you are in a 
                    quiet environment and ready to complete the entire assessment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleStart}
              className="btn-primary px-8 py-3 text-lg"
            >
              Start Assessment
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  const currentQuestion = assessmentData.assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessmentData.assessment.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === assessmentData.assessment.questions.length - 1;

  return (
    <AssessmentLayout
      assessmentTitle={assessmentData.assessment.title}
      companyName="Assessment Platform"
      questionNumber={currentQuestionIndex + 1}
      totalQuestions={assessmentData.assessment.questions.length}
      questionTime={questionTimeLeft}
      totalTime={timeLeft}
      onQuestionTimeUp={handleNextQuestion}
      onTotalTimeUp={handleAutoSubmit}
    >
      <div className="question-card rounded-2xl p-8">
        {/* Question */}
        <div className="mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium">{currentQuestionIndex + 1}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge 
                  variant="secondary" 
                  className={
                    currentQuestion.category === 'technical' ? 'bg-blue-500/20 text-blue-400' :
                    currentQuestion.category === 'aptitude' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-slate-500/20 text-slate-400'
                  }
                >
                  {currentQuestion.category}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={
                    currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }
                >
                  {currentQuestion.difficulty}
                </Badge>
              </div>
              
              <h2 className="text-xl text-white mb-4">
                {currentQuestion.text}
              </h2>
            </div>
          </div>
        </div>
        
        {/* Answer Options */}
        <div className="mb-8">
          <RadioGroup 
            value={answers[currentQuestion.id]?.toString() || ""} 
            onValueChange={handleAnswerChange}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="glass-card rounded-xl p-4 hover:bg-slate-700/20 transition-all duration-200 border-2 border-transparent hover:border-emerald-500/30">
                <div className="flex items-center space-x-4">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} className="text-emerald-500" />
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{String.fromCharCode(65 + index)}</span>
                  </div>
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="text-white flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-700">
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary px-6 py-3"
          >
            <ChevronLeft size={16} className="mr-2" />
            Previous
          </Button>
          
          <div className="text-center">
            {answers[currentQuestion.id] !== undefined ? (
              <p className="text-emerald-400 text-sm">Answer selected</p>
            ) : (
              <p className="text-slate-400 text-sm">Select an answer to continue</p>
            )}
          </div>
          
          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={submitAssessmentMutation.isPending}
              className="btn-primary px-6 py-3"
            >
              {submitAssessmentMutation.isPending ? "Submitting..." : "Submit Assessment"}
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              className="btn-primary px-6 py-3"
            >
              Next
              <ChevronRight size={16} className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </AssessmentLayout>
  );
}
