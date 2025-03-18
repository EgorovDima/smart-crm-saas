
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Truck, 
  Mail, 
  FileText, 
  Database, 
  MessageSquareText,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type SidebarItem = {
  title: string;
  icon: React.ElementType;
  path: string;
};

const sidebarItems: SidebarItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { title: 'Task Management', icon: ClipboardList, path: '/tasks' },
  { title: 'Clients', icon: Users, path: '/clients' },
  { title: 'Carriers', icon: Truck, path: '/carriers' },
  { title: 'Gmail Integration', icon: Mail, path: '/gmail' },
  { title: 'Invoice Creation', icon: FileText, path: '/invoices' },
  { title: 'Transportation Expenses', icon: FileText, path: '/expenses' },
  { title: 'Database', icon: Database, path: '/database' },
  { title: 'AI Chat', icon: MessageSquareText, path: '/ai-chat' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          {!collapsed && (
            <span className="text-xl font-semibold text-brand-blue animate-fade-in">
              AI Smart Logistics
            </span>
          )}
          {collapsed && (
            <div className="w-10 h-10 flex items-center justify-center">
              <div className="text-brand-blue font-bold text-xl">AI</div>
            </div>
          )}
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-brand-blue text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center"
          )} 
          onClick={() => signOut()}
        >
          <LogOut size={20} className="mr-2" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};
