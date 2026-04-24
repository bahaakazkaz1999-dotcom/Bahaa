import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User as AppUser } from '../types';
import { Home, Search, PlusCircle, User, LogOut, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  user: FirebaseUser | null;
  userData: AppUser | null;
}

export default function Layout({ user, userData }: LayoutProps) {
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    { label: 'الحالات المتاحة', path: '/cases', icon: Search, show: !!userData },
    { label: 'الدعم المنجز', path: '/completed', icon: CheckCircle, show: !!userData },
    { label: 'تقديم دعم', path: '/create-case', icon: PlusCircle, show: userData?.role === 'beneficiary' },
    { label: 'الملف الشخصي', path: '/profile', icon: User, show: !!userData },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans" dir="rtl">
      {/* Sidebar - Desktop */}
      <aside className="w-72 bg-white border-l border-slate-200 hidden lg:flex flex-col p-6 h-full shadow-sm sticky top-0">
        <div className="mb-10 flex items-center gap-3">
          <Link to="/" className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl transition-transform hover:scale-110">
            س
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">سند</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              location.pathname === "/" 
                ? "bg-primary-light text-primary shadow-sm" 
                : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <Home className="w-5 h-4" />
            الرئيسية
          </Link>
          {navItems.filter(i => i.show).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                location.pathname === item.path 
                  ? "bg-primary-light text-primary shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <item.icon className="w-5 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {userData && (
          <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-primary overflow-hidden">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{userData.name}</p>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  {userData.verificationStatus === 'verified' ? 'موثق' : 'قيد التدقيق'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 justify-center py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              تسجيل الخروج
            </button>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shadow-sm sticky top-0 z-40 lg:bg-white/90 lg:backdrop-blur-md">
          <div className="flex items-center gap-4">
             {/* Mobile Brand */}
             <Link to="/" className="lg:hidden w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">س</Link>
             <h2 className="hidden sm:block text-slate-900 font-bold">
               {userData?.role === 'donor' ? 'وضعية الداعم' : 'وضعية المستفيد'}
             </h2>
          </div>

          <div className="flex items-center gap-4">
            {userData?.role === 'donor' && (
              <div className="text-left ml-4 hidden sm:block">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">إجمالي تبرعاتك</p>
                <p className="text-lg font-black text-primary">{userData.totalDonated || 0} ريال</p>
              </div>
            )}
            <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
            <button
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors lg:hidden"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
          <Outlet />
        </main>
        
        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl flex justify-around items-center px-2 z-50">
          <Link to="/" className={cn("p-3 rounded-xl transition-colors", location.pathname === '/' ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-slate-400")}>
            <Home className="w-6 h-6" />
          </Link>
          {navItems.filter(i => i.show).map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={cn("p-3 rounded-xl transition-colors", location.pathname === item.path ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-slate-400")}
            >
              <item.icon className="w-6 h-6" />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
