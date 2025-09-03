import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Wand2,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { QuestionBankItem } from "@shared/schema";

export default function QuestionBank() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "",
    difficulty: "",
    tags: [] as string[],
  });

  const { data: questions = [], isLoading } = useQuery<QuestionBankItem[]>({
    queryKey: ["/api/questions", { category: categoryFilter, difficulty: difficultyFilter }],
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      await apiRequest("POST", "/api/questions", questionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Success",
        description: "Question added successfully",
      });
      setIsAddDialogOpen(false);
      setNewQuestion({
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        category: "",
        difficulty: "",
        tags: [],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    },
  });

  const filteredQuestions = questions.filter(question =>
    question.questionText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.questionText || !newQuestion.category || !newQuestion.difficulty) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newQuestion.options.some(option => !option.trim())) {
      toast({
        title: "Error",
        description: "Please fill in all answer options",
        variant: "destructive",
      });
      return;
    }

    createQuestionMutation.mutate(newQuestion);
  };

  const handleDeleteQuestion = (id: string, questionText: string) => {
    if (window.confirm(`Are you sure you want to delete this question?`)) {
      deleteQuestionMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Question Bank</h1>
          <p className="text-slate-400">Manage your assessment questions</p>
        </div>
        <div className="flex items-center gap-4">
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700">
            <Wand2 size={16} className="mr-2" />
            AI Generator
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus size={16} className="mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Question</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div>
                  <Label className="text-slate-300">Question Text</Label>
                  <Textarea
                    value={newQuestion.questionText}
                    onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                    placeholder="Enter your question..."
                    className="bg-slate-800/50 border-slate-600 text-white mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {newQuestion.options.map((option, index) => (
                    <div key={index}>
                      <Label className="text-slate-300">Option {String.fromCharCode(65 + index)}</Label>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: newOptions });
                        }}
                        placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                        className="bg-slate-800/50 border-slate-600 text-white mt-1"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <Label className="text-slate-300">Correct Answer</Label>
                  <Select 
                    value={newQuestion.correctAnswer.toString()} 
                    onValueChange={(value) => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white mt-1">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {newQuestion.options.map((option, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          Option {String.fromCharCode(65 + index)}: {option || `Option ${String.fromCharCode(65 + index)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Category</Label>
                    <Select value={newQuestion.category} onValueChange={(value) => setNewQuestion({ ...newQuestion, category: value })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="aptitude">Aptitude</SelectItem>
                        <SelectItem value="logical">Logical Reasoning</SelectItem>
                        <SelectItem value="verbal">Verbal</SelectItem>
                        <SelectItem value="numerical">Numerical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300">Difficulty</Label>
                    <Select value={newQuestion.difficulty} onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white mt-1">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    className="border-slate-600 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createQuestionMutation.isPending}
                    className="btn-primary"
                  >
                    {createQuestionMutation.isPending ? "Adding..." : "Add Question"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <GlassCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="aptitude">Aptitude</SelectItem>
              <SelectItem value="logical">Logical Reasoning</SelectItem>
              <SelectItem value="verbal">Verbal</SelectItem>
              <SelectItem value="numerical">Numerical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600 text-white">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <Database className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No questions found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || categoryFilter || difficultyFilter
                ? "Try adjusting your search or filters"
                : "Start building your question bank"}
            </p>
            <Button className="btn-primary" onClick={() => setIsAddDialogOpen(true)}>
              <Plus size={16} className="mr-2" />
              Add Question
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <GlassCard key={question.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-slate-400 font-mono text-sm">Q{index + 1}</span>
                    <div className="flex gap-2">
                      <Badge 
                        variant="secondary" 
                        className={
                          question.category === 'technical' ? 'bg-blue-500/20 text-blue-400' :
                          question.category === 'aptitude' ? 'bg-purple-500/20 text-purple-400' :
                          question.category === 'logical' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-slate-500/20 text-slate-400'
                        }
                      >
                        {question.category}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={
                          question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                          question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }
                      >
                        {question.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-white mb-4">{question.questionText}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex}
                        className={`p-2 rounded border text-sm ${
                          optionIndex === question.correctAnswer
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                            : 'border-slate-600 bg-slate-800/30 text-slate-300'
                        }`}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + optionIndex)}:</span> {option}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-300">
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDeleteQuestion(question.id, question.questionText)}
                    disabled={deleteQuestionMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
