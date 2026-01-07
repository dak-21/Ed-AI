
import React from 'react';
import { User, UserRole, ViewType } from '../types';
import { Icons } from './Icons';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  activeRole: UserRole;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeRole, currentView, onViewChange }) => {
  if (!user) return <>{children}</>;

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-rose-500';
      case UserRole.PRINCIPAL: return 'bg-blue-600';
      case UserRole.TEACHER: return 'bg-indigo-600';
      case UserRole.STUDENT: return 'bg-emerald-500';
      default: return 'bg-slate-600';
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', Icon: Icons.Overview },
    { id: 'tools', label: 'AI Hub', Icon: Icons.Tools },
    { id: 'lesson-planner', label: 'Lesson Planner', Icon: Icons.Reports, roles: [UserRole.TEACHER, UserRole.ADMIN, UserRole.PRINCIPAL] },
    { id: 'knowledge-base', label: 'Knowledge Base', Icon: Icons.Sparkles },
    { id: 'presentation', label: activeRole === UserRole.STUDENT ? 'Viewer' : 'Slides Gen', Icon: Icons.Presentation, roles: [UserRole.TEACHER, UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.STUDENT] },
    { id: 'resources', label: 'Resources', Icon: Icons.Resources },
    { id: 'calendar', label: 'Schedule', Icon: Icons.Calendar },
    { id: 'directory', label: 'Directory', Icon: Icons.Directory },
  ];

  return (
    <div className="flex h-screen bg-pink-50/50 overflow-hidden text-slate-900">
      <aside className="w-72 bg-white border-r border-pink-100 flex flex-col hidden md:flex shadow-sm z-30 print:hidden">
        <div className="p-8 flex items-center gap-3">
          <Icons.Logo className="w-10 h-10 shadow-lg" />
          <span className="text-xl font-black tracking-tighter text-slate-900">EduSphere<span className="text-pink-600">AI</span></span>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em] mb-4 px-4 text-center">Academic Command</div>
          {navItems.map(item => {
            if (item.roles && !item.roles.includes(activeRole)) return null;
            if (activeRole === UserRole.STUDENT && item.id === 'presentation' && currentView !== 'presentation') return null;

            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as ViewType)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${
                  isActive 
                    ? 'bg-pink-600 text-white shadow-xl shadow-pink-200 ring-4 ring-pink-50' 
                    : 'text-slate-500 hover:bg-pink-50/50 hover:text-slate-900'
                }`}
              >
                <item.Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-pink-100 bg-pink-50/30">
          <div className="flex items-center gap-3 mb-6 p-1 pr-3 bg-white border border-pink-100 rounded-2xl shadow-sm">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs ${getRoleColor(activeRole)}`}>
               {activeRole[0]}
            </div>
            <div className="flex-1 min-w-0">
               <div className="text-[10px] text-pink-400 font-black uppercase tracking-widest leading-none mb-1">Authenticated</div>
               <div className="text-xs font-bold text-slate-900 truncate">{activeRole}</div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-3 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-pink-200 shadow-sm"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-pink-50/30">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-pink-100 flex items-center justify-between px-8 sticky top-0 z-20 print:hidden">
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm font-bold">
             <span className="text-slate-900 capitalize tracking-tight font-black text-lg">{currentView.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center bg-pink-50 rounded-full px-4 py-2 border border-pink-100">
               <span className="w-2 h-2 rounded-full bg-pink-500 mr-2 animate-pulse"></span>
               <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest">RAG Knowledge Synced</span>
            </div>
            <div className="flex items-center gap-3 pl-2">
              <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} className="w-10 h-10 rounded-2xl bg-pink-100 object-cover ring-2 ring-white shadow-md shadow-pink-100" alt="Profile" />
              <div className="hidden lg:block text-left">
                <div className="text-sm font-black text-slate-900 leading-tight">{user.name}</div>
                <div className="text-[10px] text-pink-400 font-black uppercase tracking-[0.15em]">{user.role}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-0 md:p-10 print:p-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
