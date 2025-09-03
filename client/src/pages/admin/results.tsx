import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Search, 
  Eye,
  MessageSquare,
  RefreshCw,
  Mail,
  TrendingUp,
  Users,
  Clock,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Assessment, AssessmentResult, AssessmentLink } from "@shared/schema";

interface ExtendedResult extends AssessmentResult {
  candidateEmail: string;
  candidateName: string;
}

export default function Results() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: assessments = [] } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments", { adminId: user?.id }],
    enabled: !!user?.id,
  });

  const { data: results = [], isLoading } = useQuery<ExtendedResult[]>({
    queryKey: ["/api/results/assessment", selectedAssessment],
    enabled: !!selectedAssessment,
  });

  const { data: links = [] } = useQuery<AssessmentLink[]>({
    queryKey: ["/api/assessments", selectedAssessment, "links"],
    enabled: !!selectedAssessment,
  });

  const selectedAssessmentData = assessments.find(a => a.id === selectedAssessment);
  
  // Calculate metrics
  const totalCandidates = links.length;
  const completedCount = results.length;
  const completionRate = totalCandidates > 0 ? Math.round((completedCount / totalCandidates) * 100) : 0;
  const avgScore = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) / results.length)
    : 0;
  const avgTime = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.timeTaken, 0) / results.length)
    : 0;
  const passRate = results.length > 0
    ? Math.round(results.filter(r => (r.score / r.totalQuestions) * 100 >= 70).length / results.length * 100)
    : 0;

  // Filter results
  const filteredResults = results.filter(result => {
    const matchesSearch = result.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "passed") return matchesSearch && (result.score / result.totalQuestions) * 100 >= 70;
    if (statusFilter === "failed") return matchesSearch && (result.score / result.totalQuestions) * 100 < 70;
    
    return matchesSearch;
  });

  // Get pending candidates
  const pendingCandidates = links.filter(link => 
    !results.some(result => result.assessmentLinkId === link.id) && 
    new Date() < new Date(link.expiresAt)
  );

  const handleExportResults = () => {
    if (!selectedAssessmentData || results.length === 0) return;
    
    // Create CSV content
    const headers = ["Candidate Name", "Email", "Score", "Percentage", "Time Taken", "Completed At", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredResults.map(result => [
        result.candidateName,
        result.candidateEmail,
        `${result.score}/${result.totalQuestions}`,
        `${Math.round((result.score / result.totalQuestions) * 100)}%`,
        `${result.timeTaken}min`,
        new Date(result.completedAt).toLocaleDateString(),
        (result.score / result.totalQuestions) * 100 >= 70 ? "Passed" : "Failed"
      ].join(","))
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedAssessmentData.title}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Results exported successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Assessment Results</h1>
          <p className="text-slate-400">View and analyze candidate performance</p>
        </div>
        {selectedAssessment && results.length > 0 && (
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleExportResults}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </Button>
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700">
              <FileText size={16} className="mr-2" />
              Generate Report
            </Button>
          </div>
        )}
      </div>

      {/* Assessment Selection */}
      <GlassCard>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="Select an assessment to view results" />
              </SelectTrigger>
              <SelectContent>
                {assessments.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>
                    {assessment.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      {!selectedAssessment ? (
        <GlassCard>
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Select an Assessment</h3>
            <p className="text-slate-400">Choose an assessment from the dropdown to view detailed results and analytics</p>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Assessment Overview */}
          <GlassCard>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedAssessmentData?.title}</h2>
                <p className="text-slate-400">{selectedAssessmentData?.description}</p>
                <p className="text-slate-400 text-sm mt-1">
                  Created on {selectedAssessmentData ? new Date(selectedAssessmentData.createdAt).toLocaleDateString() : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{totalCandidates}</p>
                <p className="text-slate-400">Total Candidates</p>
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="text-emerald-400 mr-2" size={20} />
                  <p className="text-2xl font-bold text-emerald-400">{avgScore}%</p>
                </div>
                <p className="text-slate-400">Average Score</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="text-blue-400 mr-2" size={20} />
                  <p className="text-2xl font-bold text-blue-400">{completionRate}%</p>
                </div>
                <p className="text-slate-400">Completion Rate</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="text-purple-400 mr-2" size={20} />
                  <p className="text-2xl font-bold text-purple-400">{avgTime}min</p>
                </div>
                <p className="text-slate-400">Avg Time Taken</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="text-yellow-400 mr-2" size={20} />
                  <p className="text-2xl font-bold text-yellow-400">{passRate}%</p>
                </div>
                <p className="text-slate-400">Pass Rate (≥70%)</p>
              </div>
            </div>
          </GlassCard>

          {/* Search and Filters */}
          <GlassCard>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue placeholder="All Results" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Results</SelectItem>
                  <SelectItem value="passed">Passed (≥70%)</SelectItem>
                  <SelectItem value="failed">Failed (&lt;70%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </GlassCard>

          {/* Results Table */}
          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Candidate Results</h3>
              <div className="text-sm text-slate-400">
                Showing {filteredResults.length} of {results.length} completed assessments
              </div>
            </div>
            
            {filteredResults.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-slate-400">No results found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-slate-400 text-sm border-b border-slate-700">
                      <th className="text-left py-3">Candidate</th>
                      <th className="text-left py-3">Email</th>
                      <th className="text-left py-3">Score</th>
                      <th className="text-left py-3">Time Taken</th>
                      <th className="text-left py-3">Completed</th>
                      <th className="text-left py-3">Status</th>
                      <th className="text-left py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result) => {
                      const percentage = Math.round((result.score / result.totalQuestions) * 100);
                      const passed = percentage >= 70;
                      
                      return (
                        <tr key={result.id} className="border-b border-slate-700 hover:bg-slate-800/20">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {result.candidateName?.split(' ').map(n => n[0]).join('') || 'U'}
                                </span>
                              </div>
                              <span className="text-white font-medium">{result.candidateName}</span>
                            </div>
                          </td>
                          <td className="py-4 text-slate-300">{result.candidateEmail}</td>
                          <td className="py-4">
                            <span className={`font-semibold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                              {percentage}%
                            </span>
                            <span className="text-slate-400 ml-1">({result.score}/{result.totalQuestions})</span>
                          </td>
                          <td className="py-4 text-slate-300">{result.timeTaken}min</td>
                          <td className="py-4 text-slate-300">
                            {new Date(result.completedAt).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <Badge 
                              className={`${
                                passed 
                                  ? 'bg-emerald-500/20 text-emerald-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                                <Eye size={14} />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300">
                                <Download size={14} />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300">
                                <MessageSquare size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

          {/* Pending Candidates */}
          {pendingCandidates.length > 0 && (
            <GlassCard>
              <h3 className="text-xl font-semibold text-white mb-4">Pending Assessments</h3>
              <div className="space-y-3">
                {pendingCandidates.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {link.candidateName?.split(' ').map(n => n[0]).join('') || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{link.candidateName}</p>
                        <p className="text-slate-400 text-sm">{link.candidateEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Expires</p>
                        <p className="text-sm text-white">
                          {new Date(link.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300">
                          <Mail size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                          <RefreshCw size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
}
