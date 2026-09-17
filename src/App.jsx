import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import JobMatcher from "./pages/JobMatcher";
import SkillGapAnalyzer from "./pages/SkillGapAnalyzer";
import LearningRoadmap from "./pages/LearningRoadmap";
import MockInterview from "./pages/MockInterview";
import InterviewHistory from "./pages/InterviewHistory";

import "./App.css";

export default function App() {
  const [activePage, setActivePage] =
    useState("Dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /* =====================================================
     CLOSE MOBILE SIDEBAR WHEN PAGE CHANGES
  ===================================================== */

  useEffect(() => {
    setSidebarOpen(false);
  }, [activePage]);

  /* =====================================================
     NAVIGATION
  ===================================================== */

  function handleNavigate(page) {
    setActivePage(page);
  }

  /* =====================================================
     PAGE ROUTER
  ===================================================== */

  function renderPage() {
    switch (activePage) {

      /* =================================================
         DASHBOARD
      ================================================= */

      case "Dashboard":
        return (
          <Dashboard
            onNavigate={handleNavigate}
          />
        );

      /* =================================================
         RESUME ANALYZER
      ================================================= */

      case "Resume Analyzer":
        return <ResumeAnalyzer />;

      /* =================================================
         JOB MATCHER
      ================================================= */

      case "Job Matcher":
        return <JobMatcher />;

      /* =================================================
         SKILL GAP ANALYZER
      ================================================= */

      case "Skill Gap":
        return <SkillGapAnalyzer />;

      /* =================================================
         LEARNING ROADMAP
      ================================================= */

      case "Learning Roadmap":
        return <LearningRoadmap />;

      /* =================================================
         MOCK INTERVIEW
      ================================================= */

      case "Mock Interview":
        return <MockInterview />;

      /* =================================================
         INTERVIEW HISTORY
      ================================================= */

      case "Interview History":
        return <InterviewHistory />;

      /* =================================================
         LINKEDIN ASSISTANT
      ================================================= */

      case "LinkedIn Assistant":
        return (
          <PlaceholderPage
            icon="✨"
            title="LinkedIn Assistant"
            description="Improve your LinkedIn profile, headline, About section and professional content with AI."
            comingSoon
          />
        );

      /* =================================================
         SETTINGS
      ================================================= */

      case "Settings":
        return (
          <PlaceholderPage
            icon="⚙️"
            title="Settings"
            description="Manage your AI Career Copilot preferences and account settings."
            comingSoon
          />
        );

      /* =================================================
         DEFAULT
      ================================================= */

      default:
        return (
          <Dashboard
            onNavigate={handleNavigate}
          />
        );
    }
  }

  /* =====================================================
     MAIN APP
  ===================================================== */

  return (
    <div className="app-shell">

      {/* =================================================
          MOBILE SIDEBAR OVERLAY
      ================================================= */}

      {sidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`app-sidebar ${
          sidebarOpen
            ? "app-sidebar-open"
            : ""
        }`}
      >
        <Sidebar
          activePage={activePage}
          setActivePage={
            handleNavigate
          }
        />
      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="app-main">

        {/* =================================================
            MOBILE TOP BAR
        ================================================= */}

        <div className="mobile-topbar">

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setSidebarOpen(
                (previous) =>
                  !previous,
              )
            }
            aria-label="Open navigation"
            aria-expanded={
              sidebarOpen
            }
          >
            <span />
            <span />
            <span />
          </button>

          {/* MOBILE BRAND */}

          <div className="mobile-brand">

            <div className="mobile-brand-icon">
              ✦
            </div>

            <span>
              AI Career Copilot
            </span>

          </div>

        </div>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <div className="app-content">
          {renderPage()}
        </div>

      </main>

    </div>
  );
}

/* =========================================================
   PLACEHOLDER PAGE
========================================================= */

function PlaceholderPage({
  icon,
  title,
  description,
  comingSoon = false,
}) {
  return (
    <div className="placeholder-page">

      <div className="placeholder-card">

        {/* ICON */}

        <div className="placeholder-icon">
          {icon}
        </div>

        {/* LABEL */}

        <span className="placeholder-label">
          AI CAREER COPILOT
        </span>

        {/* TITLE */}

        <h1>
          {title}
        </h1>

        {/* DESCRIPTION */}

        <p>
          {description}
        </p>

        {/* COMING SOON */}

        {comingSoon && (
          <div className="placeholder-badge">
            Coming next
          </div>
        )}

      </div>

    </div>
  );
}