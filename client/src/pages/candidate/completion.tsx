import React from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Target, Mail, AlertTriangle } from "lucide-react";

interface CompletionData {
  result: {
    id: string;
    score: number;
    totalQuestions: number;
    timeTaken: number;
    completedAt: string;
  };
  assessment: {
    title: string;
    description: string;
  };
  candidate: {
    name: string;
    email: string;
  };
}

export default function AssessmentCompletion() {
  const [, params] = useRoute("/take/:token/complete");
  const token = params?.token;

  const { data: completionData, isLoading, error } = useQuery<CompletionData>({
    queryKey: ["/api/take", token, "result"],
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-white">Loading results...</div>
      </div>
    );
  }

  if (error || !completionData) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Results Not Available</h1>
          <p className="text-slate-400">
            Unable to load assessment results. Please contact support if this issue persists.
          </p>
        </GlassCard>
      </div>
    );
  }

  const percentage = Math.round((completionData.result.score / completionData.result.totalQuestions) * 100);
  const passed = percentage >= 70;

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Success Header */}
        <GlassCard className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="text-3xl text-white" size={40} />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Assessment Completed!</h1>
          <p className="text-slate-300 mb-2">
            Thank you for completing the <strong>{completionData.assessment.title}</strong>.
          </p>
          <p className="text-slate-400">
            Your responses have been submitted successfully and are being reviewed.
          </p>
        </GlassCard>

        {/* Performance Summary */}
        <GlassCard>
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Your Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="text-emerald-400 mr-2" size={24} />
                <p className="text-2xl font-bold text-emerald-400">
                  {completionData.result.score}/{completionData.result.totalQuestions}
                </p>
              </div>
              <p className="text-slate-400">Questions Correct</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-6 h-6 rounded-full mr-2 ${passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <p className={`text-2xl font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                  {percentage}%
                </p>
              </div>
              <p className="text-slate-400">Overall Score</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="text-purple-400 mr-2" size={24} />
                <p className="text-2xl font-bold text-purple-400">
                  {completionData.result.timeTaken}min
                </p>
              </div>
              <p className="text-slate-400">Time Taken</p>
            </div>
          </div>

          {/* Score Badge */}
          <div className="text-center mt-6">
            <Badge 
              className={`text-lg px-4 py-2 ${
                passed 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {passed ? 'Passed' : 'Needs Improvement'}
            </Badge>
          </div>
        </GlassCard>

        {/* Next Steps */}
        <GlassCard>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Mail className="mr-2 text-blue-400" size={20} />
              What happens next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <p className="text-slate-300">
                  Our recruitment team will review your assessment results within the next 2-3 business days
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <p className="text-slate-300">
                  You'll receive detailed feedback and next steps via email at{" "}
                  <span className="text-emerald-400">{completionData.candidate.email}</span>
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <p className="text-slate-300">
                  If you meet our requirements, we'll contact you to schedule the next interview round
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <p className="text-slate-300">
                  Feel free to reach out if you have any questions about your application status
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Assessment Details */}
        <GlassCard>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-3">Assessment Details</h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-400">
                <span className="text-slate-300">Assessment:</span> {completionData.assessment.title}
              </p>
              <p className="text-slate-400">
                <span className="text-slate-300">Completed on:</span>{" "}
                {new Date(completionData.result.completedAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-slate-400">
                <span className="text-slate-300">Candidate:</span> {completionData.candidate.name}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Contact Information */}
        <div className="text-center pt-6 border-t border-slate-700">
          <p className="text-slate-400 text-sm">
            Questions about your assessment or application?{" "}
            <br className="md:hidden" />
            Contact us at{" "}
            <a 
              href="mailto:hiring@company.com" 
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              hiring@company.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
