"use client";
import React, { useState } from "react";
import {
  Home,
  CheckCircle,
  XCircle,
  BarChart2,
  ChevronRight,
  LayoutDashboard,
  UsersRound,
  Star,
} from "lucide-react";
import Link from "next/link";

const AdminSideBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const navItems = [
    {
      id: "Home",
      label: "Home",
      icon: <Home size={20} />,
      link: "/",
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      link: "/admin",
    },
    {
      id: "user",
      label: "All user",
      icon: <UsersRound size={20} />,
      link: "/admin/user",
    },
    {
      id: "Reviews-Management",
      label: "Reviews Management",
      icon: <Star size={18} />,
      link: "/admin/reviews",
    },
    {
      id: "published-reviews",
      label: "Published Reviews",
      icon: <CheckCircle size={18} />,
      link: "/admin/aPublished",
    },
    {
      id: "unpublished-reviews",
      label: "Unpublished Reviews",
      icon: <XCircle size={18} />,
      link: "/admin/aUnpublished",
    },
    {
      id: "Category",
      label: "Create Category",
      icon: <BarChart2 size={20} />,
      link: "/admin/createcategory",
    },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="relative h-screen">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 opacity-90"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>

      <div
        className={`${sidebarOpen ? "w-72" : "w-20"
          } relative h-full backdrop-blur-xl bg-white/5 border-r border-white/10 shadow-2xl transition-all duration-500 ease-out flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
              <Star size={16} className="text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-white">Review Portal</h1>
                <p className="text-xs text-white/60">Admin Dashboard</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 group"
          >
            <ChevronRight
              size={16}
              className={`text-white/70 group-hover:text-white transition-all duration-300 ${sidebarOpen ? "rotate-180" : ""
                }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((item) => (
            <Link href={item.link} key={item.id}>
              <div
                onClick={() => setActiveTab(item.id)}
                className={`group relative flex items-center ${sidebarOpen ? "px-4 py-3" : "px-3 py-3 justify-center"
                  } rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${activeTab === item.id
                    ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 shadow-lg shadow-purple-500/10"
                    : "hover:bg-white/5 border border-transparent hover:border-white/10"
                  }`}
              >
                {/* Active background glow */}
                {activeTab === item.id && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-sm"></div>
                )}

                {/* Icon */}
                <div className={`relative z-10 flex items-center justify-center ${activeTab === item.id ? "text-purple-300" : "text-white/70 group-hover:text-white"
                  } transition-all duration-200 ${sidebarOpen ? "mr-3" : ""
                  } group-hover:scale-110`}>
                  {item.icon}
                </div>

                {/* Label */}
                {sidebarOpen && (
                  <span className={`relative z-10 font-medium transition-all duration-200 ${activeTab === item.id ? "text-white" : "text-white/80 group-hover:text-white"
                    }`}>
                    {item.label}
                  </span>
                )}

                {/* Active indicator dot */}
                {!sidebarOpen && activeTab === item.id && (
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
                )}

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-white/5 to-transparent transition-opacity duration-300"></div>
              </div>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className={`flex items-center ${sidebarOpen ? "space-x-3" : "justify-center"}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-white/60">System Administrator</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSideBar;