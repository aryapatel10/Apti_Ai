import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Link as LinkIcon,
  MoreHorizontal 
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Assessment } from "@shared/schema";

export default function Assessments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: assessments = [], isLoading } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments", { adminId: user?.id }],
    enabled: !!user?.id,
  });

  const deleteAssessmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/assessments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({
        title: "Success",
        description: "Assessment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive",
      });
    },
  });

  const filteredAssessments = assessments.filter(assessment =>
    assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteAssessmentMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading assessments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Assessments</h1>
          <p className="text-slate-400">Manage your assessment portfolio</p>
        </div>
        <Link href="/admin/assessments/create">
          <Button className="btn-primary">
            <Plus size={16} className="mr-2" />
            Create Assessment
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <GlassCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/30">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
      </GlassCard>

      {/* Assessments Grid */}
      {filteredAssessments.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Plus className="text-slate-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No assessments found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first assessment"}
            </p>
            <Link href="/admin/assessments/create">
              <Button className="btn-primary">
                <Plus size={16} className="mr-2" />
                Create Assessment
              </Button>
            </Link>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((assessment) => (
            <GlassCard key={assessment.id} className="relative">
              <div className="absolute top-4 right-4">
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-300">
                  <MoreHorizontal size={16} />
                </Button>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">{assessment.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2">
                  {assessment.description || "No description provided"}
                </p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  {assessment.questions.length} Questions
                </Badge>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                  {assessment.totalTime}min
                </Badge>
              </div>

              <div className="text-xs text-slate-400 mb-4">
                Created {new Date(assessment.createdAt).toLocaleDateString()}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300">
                    <LinkIcon size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                    <Eye size={14} />
                  </Button>
                  <Link href={`/admin/assessments/edit/${assessment.id}`}>
                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-300">
                      <Edit size={14} />
                    </Button>
                  </Link>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300"
                  onClick={() => handleDelete(assessment.id, assessment.title)}
                  disabled={deleteAssessmentMutation.isPending}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
