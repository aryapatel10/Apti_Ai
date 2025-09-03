import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { 
  ClipboardCheck, 
  Bell, 
  LogOut, 
  BarChart3, 
  ClipboardList, 
  HelpCircle, 
  TrendingUp, 
  Settings 
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3, current: location === "/admin/dashboard" },
    { name: "Assessments", href: "/admin/assessments", icon: ClipboardList, current: location.startsWith("/admin/assessments") },
    { name: "Question Bank", href: "/admin/questions", icon: HelpCircle, current: location === "/admin/questions" },
    { name: "Results", href: "/admin/results", icon: TrendingUp, current: location === "/admin/results" },
    { name: "Settings", href: "/admin/settings", icon: Settings, current: location === "/admin/settings" },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header Navigation */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="text-white" size={20} />
              </div>
              <span className="ml-3 text-xl font-bold text-white">MCQ Platform</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-slate-300 hover:text-white">
                <Bell size={20} />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <span className="text-white">{user.fullName}</span>
                <button 
                  className="text-slate-300 hover:text-white"
                  onClick={logout}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen glass-card m-4 rounded-2xl p-6">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      item.current
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/30"
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
