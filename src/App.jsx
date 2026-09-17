import { useEffect, useState } from "react";

import Auth from "./components/Auth";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import JobMatcher from "./pages/JobMatcher";
import SkillGapAnalyzer from "./pages/SkillGapAnalyzer";
import LearningRoadmap from "./pages/LearningRoadmap";
import MockInterview from "./pages/MockInterview";
import InterviewHistory from "./pages/InterviewHistory";

import { supabase } from "./lib/supabaseClient";

import "./App.css";

export default function App() {
  /* =====================================================
     AUTHENTICATION
  ===================================================== */

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const [activePage, setActivePage] =
    useState("Dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /* =====================================================
     CHECK SUPABASE SESSION
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Supabase session error:",
            error
          );

          if (mounted) {
            setUser(null);
          }
        } else {
          if (mounted) {
            setUser(session?.user ?? null);
          }
        }
      } catch (error) {
        console.error(
          "Failed to load authentication session:",
          error
        );

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    }

    loadSession();

    /* ===================================================
       LISTEN FOR LOGIN / LOGOUT
    =================================================== */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(
          "Auth event:",
          event
        );

        if (mounted) {
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =====================================================
     LOGIN HANDLER
  ===================================================== */

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setActivePage("Dashboard");
  }

  /* =====================================================
     NAVIGATION
  ===================================================== */

  function handleNavigate(page) {
    setActivePage(page);
  }

  /* =====================================================
     CLOSE MOBILE SIDEBAR
  ===================================================== */

  useEffect(() => {
    setSidebarOpen(false);
  }, [activePage]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  async function handleLogout() {
    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "Logout error:",
          error
        );
        return;
      }

      setUser(null);
      setActivePage("Dashboard");
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  }

  /* =====================================================
     AUTH LOADING SCREEN
  ===================================================== */

  if (authLoading) {
    return (
      <div className="auth-loading-screen">

        <div className="auth-loading-card">

          <div className="auth-loading-icon">
            ✦
          </div>

          <h2>
            AI Career Copilot
          </h2>

          <p>
            Checking your session...
          </p>

          <div className="auth-loading-spinner" />

        </div>

      </div>
    );
  }

  /* =====================================================
     SHOW LOGIN IF USER IS NOT LOGGED IN
  ===================================================== */

  if (!user) {
    return (
      <Auth
        onLogin={handleLogin}
      />
    );
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
          setActivePage={handleNavigate}
          onLogout={handleLogout}
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
                  !previous
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