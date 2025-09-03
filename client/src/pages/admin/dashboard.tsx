import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Link as LinkIcon, 
  CheckCircle, 
  Star,
  Plus,
  Wand2,
  BarChart3,
  Eye,
  Edit,
  MoreHorizontal
} from "lucide-react";
import { Link } from "wouter";

interface Stats {
  totalAssessments: number;
  activeLinks: number;
  completed: number;
  avgScore: string;
}

interface Assessment {
  id: string;
  title: string;
  createdAt: string;
  candidateCount?: number;
  completionRate?: number;
  avgScore?: number;
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats", user?.id],
    enabled: !!user?.id,
  });

  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments", { adminId: user?.id }],
    enabled: !!user?.id,
  });

  const recentAssessments = assessments.slice(0, 5);

  if (statsLoading || assessmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Assessments</p>
              <p className="text-2xl font-bold text-white">{stats?.totalAssessments || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ClipboardList className="text-blue-400 text-xl" size={24} />
            </div>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Links</p>
              <p className="text-2xl font-bold text-white">{stats?.activeLinks || 0}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <LinkIcon className="text-emerald-400 text-xl" size={24} />
            </div>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-white">{stats?.completed || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-purple-400 text-xl" size={24} />
            </div>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Score</p>
              <p className="text-2xl font-bold text-white">{stats?.avgScore || "0%"}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Star className="text-yellow-400 text-xl" size={24} />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/assessments/create">
            <Button className="w-full btn-primary p-4 h-auto flex flex-col items-center space-y-2">
              <Plus size={24} />
              <span className="font-medium">Create Assessment</span>
            </Button>
          </Link>
          <Link href="/admin/questions">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 h-auto flex flex-col items-center space-y-2 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200">
              <Wand2 size={24} />
              <span className="font-medium">AI Questions</span>
            </Button>
          </Link>
          <Link href="/admin/results">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 h-auto flex flex-col items-center space-y-2 hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200">
              <BarChart3 size={24} />
              <span className="font-medium">View Results</span>
            </Button>
          </Link>
        </div>
      </GlassCard>

      {/* Recent Assessments */}
      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Assessments</h2>
          <Link href="/admin/assessments">
            <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
              View All
            </Button>
          </Link>
        </div>
        
        {recentAssessments.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-400">No assessments created yet</p>
            <Link href="/admin/assessments/create">
              <Button className="mt-4 btn-primary">
                <Plus size={16} className="mr-2" />
                Create Your First Assessment
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-slate-400 text-sm">
                  <th className="text-left py-3">Assessment</th>
                  <th className="text-left py-3">Candidates</th>
                  <th className="text-left py-3">Completion</th>
                  <th className="text-left py-3">Avg Score</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {recentAssessments.map((assessment) => (
                  <tr key={assessment.id} className="border-t border-slate-700">
                    <td className="py-4">
                      <div>
                        <p className="text-white font-medium">{assessment.title}</p>
                        <p className="text-slate-400 text-sm">
                          Created {new Date(assessment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">{assessment.candidateCount || 0}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{ width: `${assessment.completionRate || 0}%` }}
                          />
                        </div>
                        <span className="text-slate-300 text-sm">{assessment.completionRate || 0}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">{assessment.avgScore || 0}%</td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          <LinkIcon size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-slate-300"
                        >
                          <Edit size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
