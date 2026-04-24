"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, History, LayoutDashboard, Menu, X, Rocket, LogOut } from "lucide-react";
import gsap from "gsap";
import { createClient } from "@/lib/supabase/client";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const navItems = [
    { name: "Analyze", href: "/analyze", icon: LayoutDashboard },
    { name: "History", href: "/history", icon: History },
  ];

  const supabase = createClient();

  // Auth state listener
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    setIsOpen(false);
  };

  useEffect(() => {
    const rootContent = document.getElementById('root-content');
    if (rootContent) {
      if (isOpen) {
        rootContent.classList.add('blur-md', 'brightness-50');
      } else {
        rootContent.classList.remove('blur-md', 'brightness-50');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    gsap.fromTo(".nav-container",
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power4.out" }
    );
  }, []);

  return (
    <nav className="nav-container fixed top-0 left-0 w-full z-[100] transition-all duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl border-b border-white/10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,245,255,0.3)] group-hover:scale-110 transition-transform">
            <Rocket className="w-6 h-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-[family-name:var(--font-syne)] text-xl tracking-tighter uppercase font-bold group-hover:text-[var(--primary)] transition-colors">
          AI Resume Analyzer
            </span>
            <span className="text-[9px] font-[family-name:var(--font-jetbrains)] text-gray-500 tracking-[0.3em] mt-1">NEURAL_NET_V1</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex p-1 bg-black/60 backdrop-blur-3xl rounded-xl border border-white/10 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all
                  ${isActive
                    ? 'bg-[var(--primary)] text-black shadow-[0_0_15px_rgba(0,245,255,0.4)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>


        {/* Desktop Auth */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-500 tracking-widest hidden lg:block truncate max-w-[160px]">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all group"
                >
                  <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-[var(--secondary)] hover:shadow-[0_0_20px_rgba(123,47,255,0.2)] transition-all group"
              >
                <User className="w-5 h-5 text-gray-400 group-hover:text-[var(--secondary)]" />
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-11 h-11 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl"
          >
            {isOpen ? <X className="w-6 h-6 text-[var(--primary)]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`
        fixed inset-0 top-0 bg-black backdrop-blur-3xl z-[150] md:hidden transition-all duration-500 flex flex-col p-8 pt-24 gap-6
        ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}
      `}>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 p-6 rounded-2xl text-lg font-bold uppercase tracking-[0.2em] border ${isActive ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]' : 'border-white/5 text-gray-400'}`}
            >
              <Icon className="w-6 h-6" />
              {item.name}
            </Link>
          );
        })}

        {user ? (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 p-6 rounded-2xl text-lg font-bold uppercase tracking-[0.2em] border border-red-500/30 text-red-400 mt-auto"
          >
            <LogOut className="w-6 h-6" />
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-4 p-6 rounded-2xl text-lg font-bold uppercase tracking-[0.2em] border border-[var(--secondary)]/50 text-[var(--secondary)] mt-auto"
          >
            <User className="w-6 h-6" />
            Operator Profile
          </Link>
        )}
      </div>
    </nav>
  );
};
