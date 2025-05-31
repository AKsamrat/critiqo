"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  PenTool,
  Home,
  Sparkles,
} from "lucide-react";
import { getMyProfile, logout } from "@/services/AuthService";
import { useUser } from "@/context/UserContext";
import { IProfile } from "@/types/profile";

import Link from "next/link";
import { protectedRoutes } from "@/app/contants";
import { usePathname, useRouter } from "next/navigation";

const AdminHeader = () => {
  const { user: userInfo, setIsLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [user, setUser] = useState<IProfile | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    logout();
    setIsLoading(true);
    if (protectedRoutes.some((route) => pathname.match(route))) {
      router.push("/");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getMyProfile();
      setUser(userData?.data);
    };
    fetchUser();
  }, []);

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-purple-900/80 to-slate-900/90"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.2),transparent)]"></div>

      <header className="relative backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Sparkles size={20} className="text-purple-400" />
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Dashboard Overview
                </h2>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-purple-400 font-bold">›</span>
                <Link
                  href="/"
                  className="group flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                >
                  <Home className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">Home</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 group"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell size={18} className="text-white/70 group-hover:text-white transition-colors" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                  3
                </span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 backdrop-blur-xl bg-slate-800/80 border border-slate-600/30 rounded-2xl shadow-2xl overflow-hidden z-20">
                  <div className="p-4 border-b border-slate-600/20">
                    <h3 className="font-semibold text-slate-100 flex items-center space-x-2">
                      <Bell size={16} />
                      <span>Notifications</span>
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[
                      { title: "New premium review submitted", time: "10 minutes ago", type: "success" },
                      { title: "5 comments awaiting moderation", time: "1 hour ago", type: "warning" },
                      { title: "Monthly earnings report ready", time: "2 hours ago", type: "info" }
                    ].map((notification, index) => (
                      <div key={index} className="p-4 border-b border-slate-600/10 hover:bg-slate-700/30 transition-colors cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${notification.type === 'success' ? 'bg-green-400' :
                            notification.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                            }`}></div>
                          <div>
                            <p className="text-sm font-medium text-slate-100">{notification.title}</p>
                            <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-slate-600/20 text-center">
                    <button className="text-sm text-purple-300 hover:text-purple-100 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Create Review Button */}
            {userInfo?.role === "GUEST" ? (
              <Link href={"/createReview"}>
                <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/20 hover:scale-105">
                  <PenTool size={16} />
                  <span>Create Review</span>
                </button>
              </Link>
            ) : null}

            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 group"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {user?.name?.[0] ?? "A"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white/20"></div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">{user?.name ?? "Admin"}</p>
                  <p className="text-xs text-white/60">{user?.role ?? "Administrator"}</p>
                </div>
                <ChevronDown size={14} className="text-white/70 group-hover:text-white transition-colors" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 backdrop-blur-xl bg-slate-800/80 border border-slate-600/30 rounded-2xl shadow-2xl overflow-hidden z-20">
                  <div className="p-4 border-b border-slate-600/20">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                        {user?.name?.[0] ?? "A"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-100">{user?.name ?? "Admin"}</p>
                        <p className="text-xs text-slate-400">{user?.email ?? "admin@reviewportal.com"}</p>
                        <p className="text-xs text-purple-300 font-medium mt-1">{user?.role ?? "Administrator"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <Link
                      href={"/profile"}
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-slate-700/30 transition-colors group"
                    >
                      <User size={16} className="mr-3 text-slate-400 group-hover:text-slate-200 transition-colors" />
                      <span className="text-slate-300 group-hover:text-slate-100 transition-colors">Profile Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-red-500/10 transition-colors group"
                    >
                      <LogOut size={16} className="mr-3 text-slate-400 group-hover:text-red-400 transition-colors" />
                      <span className="text-slate-300 group-hover:text-red-400 transition-colors">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default AdminHeader;