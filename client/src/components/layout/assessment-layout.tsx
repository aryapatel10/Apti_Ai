import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Timer } from "@/components/ui/timer";

interface AssessmentLayoutProps {
  children: React.ReactNode;
  assessmentTitle: string;
  companyName?: string;
  questionNumber: number;
  totalQuestions: number;
  questionTime?: number;
  totalTime?: number;
  onQuestionTimeUp?: () => void;
  onTotalTimeUp?: () => void;
}

export function AssessmentLayout({
  children,
  assessmentTitle,
  companyName = "Company",
  questionNumber,
  totalQuestions,
  questionTime,
  totalTime,
  onQuestionTimeUp,
  onTotalTimeUp,
}: AssessmentLayoutProps) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Assessment Header */}
      <header className="glass-nav">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-white">{assessmentTitle}</h1>
              <p className="text-slate-400">{companyName}</p>
            </div>
            
            {/* Timer Display */}
            <div className="flex items-center space-x-6">
              {questionTime && (
                <Timer
                  initialTime={questionTime}
                  onTimeUp={onQuestionTimeUp}
                  variant="question"
                />
              )}
              {totalTime && (
                <Timer
                  initialTime={totalTime}
                  onTimeUp={onTotalTimeUp}
                  variant="total"
                />
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">
                Question {questionNumber} of {totalQuestions}
              </span>
              <span className="text-sm text-slate-400">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="max-w-4xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
