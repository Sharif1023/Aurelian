import React, { useEffect, useState } from "react";
import {
  Lock as LockIcon,
  Key as KeyIcon,
  ArrowRight,
  User as UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  adminLogin,
  getAdminToken,
  getCurrentAdmin,
  logoutAdmin,
} from "../lib/api";
import { useProducts } from "../context/ProductContext";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { refreshData } = useProducts();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAdminToken();

      if (!token) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      try {
        await getCurrentAdmin();
        setIsAuthenticated(true);
      } catch {
        logoutAdmin();
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    try {
      setIsLoggingIn(true);

      await adminLogin(username.trim(), password);
      await refreshData();

      setIsAuthenticated(true);
      toast.success("Welcome back, Admin!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Invalid login credentials";

      toast.error(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isChecking) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-black/5">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-black/5 rounded-[1.5rem] flex items-center justify-center mb-6">
              <LockIcon className="w-10 h-10 text-black" />
            </div>

            <h1 className="text-3xl font-bold text-black mb-3">
              Admin Access
            </h1>

            <p className="text-black/40 text-sm font-medium">
              Please enter your admin username and password to access the
              management dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20 group-focus-within:text-black transition-colors" />

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email"
                className="w-full bg-black/5 border-none rounded-2xl py-5 pl-14 pr-5 text-sm font-bold placeholder:text-black/20 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="relative group">
              <KeyIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20 group-focus-within:text-black transition-colors" />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-black/5 border-none rounded-2xl py-5 pl-14 pr-5 text-sm font-bold placeholder:text-black/20 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-black text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-black/90 transition-all active:scale-[0.98] shadow-xl shadow-black/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? "Checking..." : "Unlock Dashboard"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-black/5 text-center">
            <p className="text-[10px] font-display font-black uppercase tracking-[0.3em] text-black/20">
              Aurelian Luxe Atelier • Secure Access
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}