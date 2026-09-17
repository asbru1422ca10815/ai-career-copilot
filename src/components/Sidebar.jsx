import { useState } from "react";
import {
  LayoutDashboard,
  FileSearch,
  BriefcaseBusiness,
  Target,
  Map,
  Mic2,
  History,
  Sparkles,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";

export default function Sidebar({ activePage, setActivePage }) {
  const [collapsed, setCollapsed] = useState(false);

  const navigationItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Resume Analyzer",
      icon: FileSearch,
    },
    {
      label: "Job Matcher",
      icon: BriefcaseBusiness,
    },
    {
      label: "Skill Gap",
      icon: Target,
    },
    {
      label: "Learning Roadmap",
      icon: Map,
    },
    {
      label: "Mock Interview",
      icon: Mic2,
    },
    {
      label: "Interview History",
      icon: History,
    },
  ];

  const bottomItems = [
    {
      label: "LinkedIn Assistant",
      icon: Sparkles,
    },
    {
      label: "Settings",
      icon: Settings,
    },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function handleNavigation(page) {
    setActivePage(page);
  }

  return (
    <div className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>
      {/* HEADER */}
      <div className="sidebar-header">
        <div className="brand-section">
          <div className="brand-icon">
            ✦
          </div>

          {!collapsed && (
            <div className="brand-text">
              <h2>AI Career</h2>
              <span>Copilot</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="collapse-button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* MAIN NAVIGATION */}
      <nav className="sidebar-navigation">
        <div className="navigation-label">
          {!collapsed && "WORKSPACE"}
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.label;

          return (
            <button
              key={item.label}
              type="button"
              className={`sidebar-item ${
                isActive ? "active" : ""
              }`}
              onClick={() => handleNavigation(item.label)}
              title={collapsed ? item.label : ""}
            >
              <Icon size={19} strokeWidth={2} />

              {!collapsed && (
                <span>{item.label}</span>
              )}

              {isActive && (
                <div className="active-indicator" />
              )}
            </button>
          );
        })}
      </nav>

      {/* BOTTOM NAVIGATION */}
      <div className="sidebar-bottom">
        <div className="navigation-label">
          {!collapsed && "TOOLS"}
        </div>

        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.label;

          return (
            <button
              key={item.label}
              type="button"
              className={`sidebar-item ${
                isActive ? "active" : ""
              }`}
              onClick={() => handleNavigation(item.label)}
              title={collapsed ? item.label : ""}
            >
              <Icon size={19} strokeWidth={2} />

              {!collapsed && (
                <span>{item.label}</span>
              )}

              {isActive && (
                <div className="active-indicator" />
              )}
            </button>
          );
        })}

        {/* LOGOUT */}
        <button
          type="button"
          className="sidebar-item logout-item"
          onClick={handleLogout}
          title={collapsed ? "Logout" : ""}
        >
          <LogOut size={19} strokeWidth={2} />

          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* SIDEBAR CSS */}
      <style>{`
        .sidebar-container {
          width: 260px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0b0f19;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
          transition: width 0.25s ease;
          overflow: hidden;
          box-sizing: border-box;
        }

        .sidebar-container.collapsed {
          width: 78px;
        }

        .sidebar-header {
          height: 82px;
          padding: 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          box-sizing: border-box;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #6366f1,
            #8b5cf6
          );
          color: white;
          font-size: 22px;
          font-weight: 700;
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.25);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
          white-space: nowrap;
        }

        .brand-text h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
        }

        .brand-text span {
          margin-top: 3px;
          font-size: 12px;
          color: #8b92a7;
        }

        .collapse-button {
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #8f96aa;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .collapse-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .sidebar-navigation {
          flex: 1;
          padding: 20px 12px;
          overflow-y: auto;
        }

        .navigation-label {
          padding: 0 12px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #596176;
          white-space: nowrap;
        }

        .sidebar-item {
          position: relative;
          width: 100%;
          height: 46px;
          margin-bottom: 5px;
          padding: 0 13px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #8d95a9;
          display: flex;
          align-items: center;
          gap: 13px;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          transition:
            background 0.2s ease,
            color 0.2s ease;
          box-sizing: border-box;
        }

        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.055);
          color: #ffffff;
        }

        .sidebar-item.active {
          background: rgba(99, 102, 241, 0.14);
          color: #a5b4fc;
        }

        .sidebar-item.active svg {
          color: #818cf8;
        }

        .sidebar-item span {
          white-space: nowrap;
        }

        .active-indicator {
          position: absolute;
          right: 0;
          top: 9px;
          bottom: 9px;
          width: 3px;
          border-radius: 3px 0 0 3px;
          background: #818cf8;
        }

        .sidebar-container.collapsed
          .sidebar-header {
          padding: 0 19px;
          justify-content: center;
        }

        .sidebar-container.collapsed
          .brand-section {
          justify-content: center;
        }

        .sidebar-container.collapsed
          .collapse-button {
          position: absolute;
          right: -1px;
          top: 8px;
          width: 25px;
          height: 25px;
          border-radius: 7px;
        }

        .sidebar-container.collapsed
          .sidebar-navigation,
        .sidebar-container.collapsed
          .sidebar-bottom {
          padding-left: 12px;
          padding-right: 12px;
        }

        .sidebar-container.collapsed
          .sidebar-item {
          justify-content: center;
          padding: 0;
        }

        .sidebar-bottom {
          padding: 14px 12px 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .logout-item {
          margin-top: 10px;
          color: #8d95a9;
        }

        .logout-item:hover {
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
        }

        @media (max-width: 900px) {
          .sidebar-container {
            width: 260px;
          }

          .sidebar-container.collapsed {
            width: 260px;
          }

          .sidebar-container.collapsed
            .brand-text,
          .sidebar-container.collapsed
            .navigation-label,
          .sidebar-container.collapsed
            .sidebar-item span {
            display: block;
          }

          .sidebar-container.collapsed
            .sidebar-item {
            justify-content: flex-start;
            padding: 0 13px;
          }

          .sidebar-container.collapsed
            .collapse-button {
            position: static;
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </div>
  );
}