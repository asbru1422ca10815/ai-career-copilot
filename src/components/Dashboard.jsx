import { useEffect, useState } from "react";
import {
  Sparkles,
  Target,
  TrendingUp,
  FileText,
  BriefcaseBusiness,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Brain,
  RefreshCw,
  GraduationCap,
} from "lucide-react";

import { supabase } from "../lib/supabase";


// --------------------------------------------------
// Helpers
// --------------------------------------------------

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}


function formatValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item))
      .filter(Boolean)
      .join(" • ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .filter(
        ([, item]) =>
          item !== null &&
          item !== undefined &&
          String(item).trim() !== ""
      )
      .map(([key, item]) => {
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (char) =>
            char.toUpperCase()
          );

        return `${label}: ${formatValue(item)}`;
      })
      .join(" • ");
  }

  return String(value);
}


function getScoreClass(score) {
  if (score >= 80) {
    return "dashboard-score-high";
  }

  if (score >= 60) {
    return "dashboard-score-medium";
  }

  return "dashboard-score-low";
}


// --------------------------------------------------
// Dashboard
// --------------------------------------------------

export default function Dashboard({
  onNavigate,
}) {
  const [analysis, setAnalysis] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ------------------------------------------------
  // Fetch latest resume analysis
  // ------------------------------------------------

  async function loadLatestAnalysis() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setAnalysis(null);
        return;
      }


      const {
        data,
        error: analysisError,
      } = await supabase
        .from("resume_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();


      if (analysisError) {
        console.error(
          "Dashboard analysis error:",
          analysisError
        );

        throw analysisError;
      }

      setAnalysis(data || null);

    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your career profile."
      );

    } finally {
      setLoading(false);
    }
  }


  // ------------------------------------------------
  // Load on page open
  // ------------------------------------------------

  useEffect(() => {
    loadLatestAnalysis();
  }, []);


  // ------------------------------------------------
  // Navigation helper
  // ------------------------------------------------

  function navigateTo(page) {
    if (typeof onNavigate === "function") {
      onNavigate(page);
    }
  }


  // ------------------------------------------------
  // Loading
  // ------------------------------------------------

  if (loading) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-loading">

          <div className="dashboard-loading-icon">
            <RefreshCw
              size={28}
              className="dashboard-spin"
            />
          </div>

          <h2>
            Loading your career profile...
          </h2>

          <p>
            Fetching your latest AI resume analysis.
          </p>

        </div>

      </div>
    );
  }


  // ------------------------------------------------
  // Error
  // ------------------------------------------------

  if (error) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-error">

          <AlertTriangle size={28} />

          <h2>
            Unable to load dashboard
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={loadLatestAnalysis}
          >
            <RefreshCw size={17} />
            Try Again
          </button>

        </div>

      </div>
    );
  }


  // ------------------------------------------------
  // No analysis yet
  // ------------------------------------------------

  if (!analysis) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-empty">

          <div className="dashboard-empty-icon">
            <FileText size={34} />
          </div>

          <span className="dashboard-eyebrow">
            AI CAREER COPILOT
          </span>

          <h1>
            Build your career profile
          </h1>

          <p>
            Upload your resume to generate your
            personalized AI career profile, ATS score,
            skill gaps and career recommendations.
          </p>

          <button
            type="button"
            className="dashboard-primary-button"
            onClick={() =>
              navigateTo("Resume Analyzer")
            }
          >
            <Sparkles size={18} />
            Analyze My Resume
            <ArrowRight size={18} />
          </button>

        </div>

      </div>
    );
  }


  // ------------------------------------------------
  // Data
  // ------------------------------------------------

  const atsScore =
    Number(analysis.ats_score) || 0;

  const careerReadiness =
    Number(analysis.career_readiness) || 0;

  const targetRoles =
    safeArray(analysis.target_roles);

  const technicalSkills =
    safeArray(analysis.technical_skills);

  const softSkills =
    safeArray(analysis.soft_skills);

  const tools =
    safeArray(analysis.tools);

  const strengths =
    safeArray(analysis.strengths);

  const weaknesses =
    safeArray(analysis.weaknesses);

  const skillGaps =
    safeArray(analysis.skill_gaps);

  const recommendations =
    safeArray(analysis.recommendations);


  // ------------------------------------------------
  // Date
  // ------------------------------------------------

  const analysisDate = analysis.created_at
    ? new Date(
        analysis.created_at
      ).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "Recently";


  // ------------------------------------------------
  // Main UI
  // ------------------------------------------------

  return (
    <div className="dashboard-page">


      {/* ============================================
          HEADER
      ============================================ */}

      <div className="dashboard-header">

        <div>

          <div className="dashboard-eyebrow">
            <Sparkles size={15} />
            AI CAREER COPILOT
          </div>

          <h1>
            Welcome back
            {analysis.candidate_name
              ? `, ${analysis.candidate_name}`
              : ""}
          </h1>

          <p>
            Here is your latest AI-powered career
            profile and readiness overview.
          </p>

        </div>


        <div className="dashboard-header-actions">

          <button
            type="button"
            className="dashboard-refresh-button"
            onClick={loadLatestAnalysis}
            title="Refresh dashboard"
          >
            <RefreshCw size={17} />
          </button>

          <button
            type="button"
            className="dashboard-primary-button"
            onClick={() =>
              navigateTo("Resume Analyzer")
            }
          >
            <Sparkles size={17} />
            Re-analyze Resume
          </button>

        </div>

      </div>


      {/* ============================================
          PROFILE INFO
      ============================================ */}

      <div className="dashboard-profile-banner">

        <div className="dashboard-profile-left">

          <div className="dashboard-profile-avatar">
            <Brain size={27} />
          </div>

          <div>

            <span>
              LATEST RESUME ANALYSIS
            </span>

            <h3>
              {analysis.resume_name ||
                "Resume Analysis"}
            </h3>

            <p>
              Analyzed on {analysisDate}
            </p>

          </div>

        </div>


        <div className="dashboard-saved-status">
          <CheckCircle2 size={17} />
          Saved to your profile
        </div>

      </div>


      {/* ============================================
          SCORE CARDS
      ============================================ */}

      <div className="dashboard-stat-grid">


        {/* ATS */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-top">

            <div className="dashboard-stat-icon">
              <FileText size={20} />
            </div>

            <span>
              ATS SCORE
            </span>

          </div>

          <div
            className={`dashboard-big-score ${getScoreClass(
              atsScore
            )}`}
          >
            {atsScore}
            <small>/100</small>
          </div>

          <p>
            Resume compatibility
          </p>

        </div>


        {/* READINESS */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-top">

            <div className="dashboard-stat-icon">
              <TrendingUp size={20} />
            </div>

            <span>
              CAREER READINESS
            </span>

          </div>

          <div
            className={`dashboard-big-score ${getScoreClass(
              careerReadiness
            )}`}
          >
            {careerReadiness}
            <small>/100</small>
          </div>

          <p>
            Overall career readiness
          </p>

        </div>


        {/* EXPERIENCE */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-top">

            <div className="dashboard-stat-icon">
              <GraduationCap size={20} />
            </div>

            <span>
              EXPERIENCE
            </span>

          </div>

          <div className="dashboard-experience">
            {analysis.experience_level ||
              "Fresher"}
          </div>

          <p>
            Detected experience level
          </p>

        </div>


        {/* SKILL GAPS */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-top">

            <div className="dashboard-stat-icon">
              <Target size={20} />
            </div>

            <span>
              SKILL GAPS
            </span>

          </div>

          <div className="dashboard-big-score dashboard-score-medium">
            {skillGaps.length}
          </div>

          <p>
            Areas to improve
          </p>

        </div>

      </div>


      {/* ============================================
          TWO COLUMN AREA
      ============================================ */}

      <div className="dashboard-main-grid">


        {/* ------------------------------------------
            LEFT
        ------------------------------------------ */}

        <div className="dashboard-main-column">


          {/* TARGET ROLES */}

          <section className="dashboard-section-card">

            <div className="dashboard-section-header">

              <div>

                <span className="dashboard-section-label">
                  CAREER DIRECTION
                </span>

                <h2>
                  Target Roles
                </h2>

              </div>

              <div className="dashboard-section-icon">
                <BriefcaseBusiness size={20} />
              </div>

            </div>


            {targetRoles.length > 0 ? (
              <div className="dashboard-role-list">

                {targetRoles
                  .slice(0, 6)
                  .map((role, index) => (

                    <div
                      className="dashboard-role-item"
                      key={index}
                    >

                      <div className="dashboard-role-number">
                        {index + 1}
                      </div>

                      <span>
                        {formatValue(role)}
                      </span>

                      <ArrowRight size={17} />

                    </div>

                  ))}

              </div>
            ) : (
              <div className="dashboard-no-data">
                No target roles detected.
              </div>
            )}

          </section>


          {/* SKILLS */}

          <section className="dashboard-section-card">

            <div className="dashboard-section-header">

              <div>

                <span className="dashboard-section-label">
                  YOUR PROFILE
                </span>

                <h2>
                  Skills & Technologies
                </h2>

              </div>

              <div className="dashboard-section-icon">
                <Brain size={20} />
              </div>

            </div>


            <div className="dashboard-skill-groups">


              {technicalSkills.length > 0 && (
                <div>

                  <h4>
                    Technical Skills
                  </h4>

                  <div className="dashboard-chips">

                    {technicalSkills
                      .slice(0, 12)
                      .map((skill, index) => (

                        <span
                          className="dashboard-chip"
                          key={index}
                        >
                          {formatValue(skill)}
                        </span>

                      ))}

                  </div>

                </div>
              )}


              {tools.length > 0 && (
                <div>

                  <h4>
                    Tools & Technologies
                  </h4>

                  <div className="dashboard-chips">

                    {tools
                      .slice(0, 10)
                      .map((tool, index) => (

                        <span
                          className="dashboard-chip dashboard-chip-tool"
                          key={index}
                        >
                          {formatValue(tool)}
                        </span>

                      ))}

                  </div>

                </div>
              )}


              {softSkills.length > 0 && (
                <div>

                  <h4>
                    Soft Skills
                  </h4>

                  <div className="dashboard-chips">

                    {softSkills
                      .slice(0, 8)
                      .map((skill, index) => (

                        <span
                          className="dashboard-chip dashboard-chip-soft"
                          key={index}
                        >
                          {formatValue(skill)}
                        </span>

                      ))}

                  </div>

                </div>
              )}

            </div>

          </section>


          {/* PROFESSIONAL SUMMARY */}

          {analysis.professional_summary && (
            <section className="dashboard-section-card">

              <div className="dashboard-section-header">

                <div>

                  <span className="dashboard-section-label">
                    AI PROFILE
                  </span>

                  <h2>
                    Professional Summary
                  </h2>

                </div>

                <div className="dashboard-section-icon">
                  <Sparkles size={20} />
                </div>

              </div>

              <p className="dashboard-summary">
                {formatValue(
                  analysis.professional_summary
                )}
              </p>

            </section>
          )}

        </div>


        {/* ------------------------------------------
            RIGHT
        ------------------------------------------ */}

        <div className="dashboard-side-column">


          {/* SKILL GAPS */}

          <section className="dashboard-section-card">

            <div className="dashboard-section-header">

              <div>

                <span className="dashboard-section-label">
                  IMPROVEMENT
                </span>

                <h2>
                  Skill Gaps
                </h2>

              </div>

              <div className="dashboard-section-icon dashboard-warning-icon">
                <AlertTriangle size={20} />
              </div>

            </div>


            {skillGaps.length > 0 ? (
              <div className="dashboard-gap-list">

                {skillGaps
                  .slice(0, 6)
                  .map((gap, index) => (

                    <div
                      className="dashboard-gap-item"
                      key={index}
                    >

                      <div className="dashboard-gap-dot" />

                      <span>
                        {formatValue(gap)}
                      </span>

                    </div>

                  ))}

              </div>
            ) : (
              <div className="dashboard-no-data">
                No major skill gaps detected.
              </div>
            )}


            <button
              type="button"
              className="dashboard-outline-button"
              onClick={() =>
                navigateTo("Skill Gap")
              }
            >
              Explore Skill Gaps
              <ArrowRight size={16} />
            </button>

          </section>


          {/* STRENGTHS */}

          <section className="dashboard-section-card">

            <div className="dashboard-section-header">

              <div>

                <span className="dashboard-section-label">
                  WHAT YOU DO WELL
                </span>

                <h2>
                  Strengths
                </h2>

              </div>

              <div className="dashboard-section-icon dashboard-success-icon">
                <CheckCircle2 size={20} />
              </div>

            </div>


            {strengths.length > 0 ? (
              <div className="dashboard-strength-list">

                {strengths
                  .slice(0, 5)
                  .map((strength, index) => (

                    <div
                      className="dashboard-strength-item"
                      key={index}
                    >

                      <CheckCircle2 size={16} />

                      <span>
                        {formatValue(strength)}
                      </span>

                    </div>

                  ))}

              </div>
            ) : (
              <div className="dashboard-no-data">
                No strengths detected.
              </div>
            )}

          </section>


          {/* RECOMMENDATIONS */}

          <section className="dashboard-section-card">

            <div className="dashboard-section-header">

              <div>

                <span className="dashboard-section-label">
                  AI GUIDANCE
                </span>

                <h2>
                  Recommendations
                </h2>

              </div>

              <div className="dashboard-section-icon">
                <Sparkles size={20} />
              </div>

            </div>


            {recommendations.length > 0 ? (
              <div className="dashboard-recommendation-list">

                {recommendations
                  .slice(0, 4)
                  .map((recommendation, index) => (

                    <div
                      className="dashboard-recommendation-item"
                      key={index}
                    >

                      <div className="dashboard-recommendation-number">
                        {index + 1}
                      </div>

                      <span>
                        {formatValue(
                          recommendation
                        )}
                      </span>

                    </div>

                  ))}

              </div>
            ) : (
              <div className="dashboard-no-data">
                No recommendations available.
              </div>
            )}

          </section>


          {/* QUICK ACTIONS */}

          <section className="dashboard-section-card dashboard-quick-actions">

            <div className="dashboard-section-header">

              <div>

                <span className="dashboard-section-label">
                  NEXT STEPS
                </span>

                <h2>
                  Career Tools
                </h2>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                navigateTo("Job Matcher")
              }
            >
              <BriefcaseBusiness size={18} />
              Job Matcher
              <ArrowRight size={16} />
            </button>


            <button
              type="button"
              onClick={() =>
                navigateTo("Skill Gap")
              }
            >
              <Target size={18} />
              Skill Gap Analysis
              <ArrowRight size={16} />
            </button>


            <button
              type="button"
              onClick={() =>
                navigateTo("Learning Roadmap")
              }
            >
              <GraduationCap size={18} />
              Learning Roadmap
              <ArrowRight size={16} />
            </button>


            <button
              type="button"
              onClick={() =>
                navigateTo("Mock Interview")
              }
            >
              <Brain size={18} />
              Mock Interview
              <ArrowRight size={16} />
            </button>

          </section>

        </div>

      </div>


      {/* ============================================
          BOTTOM CTA
      ============================================ */}

      <div className="dashboard-bottom-cta">

        <div className="dashboard-cta-icon">
          <Sparkles size={25} />
        </div>

        <div>

          <span>
            YOUR NEXT CAREER MOVE
          </span>

          <h2>
            Turn your skill gaps into a roadmap.
          </h2>

          <p>
            Use your AI career profile to discover
            what to learn next and prepare for your
            target roles.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigateTo("Learning Roadmap")
          }
        >
          Build Learning Roadmap
          <ArrowRight size={17} />
        </button>

      </div>

    </div>
  );
}