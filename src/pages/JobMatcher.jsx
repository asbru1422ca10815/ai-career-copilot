import React, { useState } from "react";
import { supabase } from "../lib/supabase";

function getScoreColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getScoreLabel(score) {
  if (score >= 80) return "Excellent Match";
  if (score >= 60) return "Strong Match";
  if (score >= 40) return "Moderate Match";
  return "Low Match";
}

function formatValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${formatValue(val)}`)
      .join(", ");
  }

  return String(value);
}

function SkillBadge({ children, type = "default" }) {
  const styles = {
    default: {
      background: "#1e293b",
      color: "#cbd5e1",
      border: "1px solid #334155",
    },
    success: {
      background: "rgba(34, 197, 94, 0.12)",
      color: "#4ade80",
      border: "1px solid rgba(34, 197, 94, 0.25)",
    },
    danger: {
      background: "rgba(239, 68, 68, 0.12)",
      color: "#f87171",
      border: "1px solid rgba(239, 68, 68, 0.25)",
    },
    warning: {
      background: "rgba(245, 158, 11, 0.12)",
      color: "#fbbf24",
      border: "1px solid rgba(245, 158, 11, 0.25)",
    },
    blue: {
      background: "rgba(59, 130, 246, 0.12)",
      color: "#60a5fa",
      border: "1px solid rgba(59, 130, 246, 0.25)",
    },
  };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "7px 11px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 500,
        margin: "4px",
        ...styles[type],
      }}
    >
      {formatValue(children)}
    </span>
  );
}

function ResultCard({ title, icon, children }) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: "16px",
        padding: "22px",
        marginBottom: "18px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <span style={{ fontSize: "20px" }}>{icon}</span>

        <h3
          style={{
            margin: 0,
            color: "#f8fafc",
            fontSize: "17px",
            fontWeight: 650,
          }}
        >
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}

function ListSection({
  title,
  icon,
  items,
  type = "default",
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <ResultCard title={title} icon={icon}>
      <div>
        {items.map((item, index) => (
          <SkillBadge key={`${title}-${index}`} type={type}>
            {item}
          </SkillBadge>
        ))}
      </div>
    </ResultCard>
  );
}

export default function JobMatcher() {
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setError("");
    setAnalysis(null);

    const cleanedDescription = jobDescription.trim();

    if (!cleanedDescription) {
      setError("Please paste a job description first.");
      return;
    }

    if (cleanedDescription.length < 30) {
      setError(
        "Please provide a more complete job description for accurate matching."
      );
      return;
    }

    if (cleanedDescription.length > 30000) {
      setError(
        "Job description is too long. Please keep it below 30,000 characters."
      );
      return;
    }

    try {
      setLoading(true);

      console.log("Starting Job Matcher...");
      console.log(
        "Job description length:",
        cleanedDescription.length
      );

      /*
       * IMPORTANT:
       * The Supabase dashboard shows the function title as
       * "match-job", but its actual deployed endpoint is
       * "dynamic-service".
       *
       * Therefore we MUST invoke "dynamic-service".
       */

      const { data, error: functionError } =
        await supabase.functions.invoke("dynamic-service", {
          body: {
            jobDescription: cleanedDescription,
          },
        });

      console.log("Job Matcher function response:", data);
      console.log(
        "Job Matcher function error:",
        functionError
      );

      if (functionError) {
        console.error(
          "match-job function error:",
          functionError
        );

        throw new Error(
          functionError.message ||
            "Failed to send request to the Job Matcher function."
        );
      }

      if (!data) {
        throw new Error(
          "No response was received from the Job Matcher function."
        );
      }

      /*
       * The Edge Function returns:
       *
       * {
       *   success: true,
       *   analysis: {...},
       *   model: "..."
       * }
       */

      if (data.success === false) {
        throw new Error(
          data.error ||
            data.details ||
            "The Job Matcher could not analyze this job description."
        );
      }

      if (!data.analysis) {
        console.error(
          "Unexpected Job Matcher response:",
          data
        );

        throw new Error(
          "The AI returned an unexpected response format."
        );
      }

      console.log(
        "Job Matcher analysis:",
        data.analysis
      );

      setAnalysis(data.analysis);
    } catch (err) {
      console.error("Job Matcher Error:", err);

      setError(
        err?.message ||
          "Something went wrong while analyzing the job description."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setJobDescription("");
    setAnalysis(null);
    setError("");
  };

  const score = Math.max(
    0,
    Math.min(100, Number(analysis?.match_score ?? 0))
  );

  const scoreColor = getScoreColor(score);

  const matchLevel =
    analysis?.match_level || getScoreLabel(score);

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "28px",
        background: "#0b1120",
        color: "#e5e7eb",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 12px",
              borderRadius: "999px",
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#a5b4fc",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "14px",
            }}
          >
            ✨ AI Career Intelligence
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: 750,
              color: "#f8fafc",
              letterSpacing: "-0.5px",
            }}
          >
            Job Matcher
          </h1>

          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: "#94a3b8",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Compare a job description with your career profile
            and discover the skills you need to improve.
          </p>
        </div>

        {/* Input Card */}
        <div
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 10px 35px rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <label
              htmlFor="job-description"
              style={{
                color: "#f8fafc",
                fontSize: "16px",
                fontWeight: 650,
              }}
            >
              Job Description
            </label>

            <span
              style={{
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              {jobDescription.length.toLocaleString()} / 30,000
            </span>
          </div>

          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              if (error) {
                setError("");
              }
            }}
            placeholder={`Paste the complete job description here...

Example:
We are looking for a Junior AI Engineer.

Requirements:
- Python
- Generative AI
- Machine Learning
- REST APIs
- Git and GitHub
- SQL
- Cloud Computing

Responsibilities:
- Build AI-powered applications
- Work with LLM APIs
- Develop Python applications
- Integrate APIs
- Deploy applications to cloud platforms`}
            disabled={loading}
            style={{
              width: "100%",
              minHeight: "280px",
              boxSizing: "border-box",
              resize: "vertical",
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "16px",
              color: "#e2e8f0",
              fontSize: "14px",
              lineHeight: 1.65,
              outline: "none",
              fontFamily: "inherit",
            }}
          />

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: "14px",
                padding: "13px 15px",
                borderRadius: "10px",
                background: "rgba(239,68,68,0.10)",
                border:
                  "1px solid rgba(239,68,68,0.25)",
                color: "#fca5a5",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                border: "none",
                borderRadius: "10px",
                padding: "12px 20px",
                background: loading
                  ? "#374151"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#ffffff",
                fontWeight: 650,
                fontSize: "14px",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "⏳ Analyzing..."
                : "✨ Analyze Job"}
            </button>

            <button
              onClick={handleClear}
              disabled={loading && !jobDescription}
              style={{
                border: "1px solid #334155",
                borderRadius: "10px",
                padding: "12px 18px",
                background: "#0f172a",
                color: "#cbd5e1",
                fontWeight: 550,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "16px",
              padding: "28px",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "30px",
                marginBottom: "10px",
              }}
            >
              🤖
            </div>

            <h3
              style={{
                margin: "0 0 7px",
                color: "#f8fafc",
              }}
            >
              AI is analyzing the job
            </h3>

            <p
              style={{
                margin: 0,
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              Extracting skills, requirements and interview
              topics...
            </p>
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div>
            {/* Score */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(220px, 0.8fr) minmax(300px, 1.2fr)",
                gap: "18px",
                marginBottom: "18px",
              }}
            >
              {/* Score Card */}
              <div
                style={{
                  background: "#111827",
                  border: "1px solid #1f2937",
                  borderRadius: "18px",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    border: `8px solid ${scoreColor}`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "16px",
                    boxShadow: `0 0 35px ${scoreColor}22`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "42px",
                      lineHeight: 1,
                      fontWeight: 800,
                      color: "#f8fafc",
                    }}
                  >
                    {score}
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      marginTop: "5px",
                    }}
                  >
                    / 100
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: scoreColor,
                  }}
                >
                  {matchLevel}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  AI Job Match Score
                </div>
              </div>

              {/* Summary */}
              <div
                style={{
                  background: "#111827",
                  border: "1px solid #1f2937",
                  borderRadius: "18px",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    marginBottom: "15px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>
                    📊
                  </span>

                  <h3
                    style={{
                      margin: 0,
                      color: "#f8fafc",
                      fontSize: "17px",
                    }}
                  >
                    Match Summary
                  </h3>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: "#cbd5e1",
                    lineHeight: 1.75,
                    fontSize: "14px",
                  }}
                >
                  {formatValue(
                    analysis.summary
                  ) ||
                    "The AI has analyzed this job description and identified the key matching areas."}
                </p>
              </div>
            </div>

            {/* Skills */}
            <ListSection
              title="Matched Skills"
              icon="✅"
              items={analysis.matched_skills}
              type="success"
            />

            <ListSection
              title="Missing Skills"
              icon="⚠️"
              items={analysis.missing_skills}
              type="danger"
            />

            <ListSection
              title="Required Skills"
              icon="🎯"
              items={analysis.required_skills}
              type="blue"
            />

            <ListSection
              title="Preferred Skills"
              icon="⭐"
              items={analysis.preferred_skills}
              type="warning"
            />

            <ListSection
              title="Important Keywords"
              icon="🔑"
              items={analysis.keywords}
              type="default"
            />

            <ListSection
              title="Your Strengths"
              icon="💪"
              items={analysis.strengths}
              type="success"
            />

            {/* Recommendations */}
            {Array.isArray(
              analysis.recommendations
            ) &&
              analysis.recommendations.length > 0 && (
                <ResultCard
                  title="AI Recommendations"
                  icon="🚀"
                >
                  <div>
                    {analysis.recommendations.map(
                      (item, index) => (
                        <div
                          key={`recommendation-${index}`}
                          style={{
                            display: "flex",
                            gap: "12px",
                            padding: "13px 0",
                            borderBottom:
                              index !==
                              analysis
                                .recommendations
                                .length -
                                1
                                ? "1px solid #1f2937"
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              minWidth: "27px",
                              height: "27px",
                              borderRadius: "50%",
                              background:
                                "rgba(99,102,241,0.15)",
                              color: "#a5b4fc",
                              display: "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            {index + 1}
                          </div>

                          <div
                            style={{
                              color: "#cbd5e1",
                              fontSize: "14px",
                              lineHeight: 1.6,
                            }}
                          >
                            {formatValue(item)}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </ResultCard>
              )}

            {/* Interview Topics */}
            {Array.isArray(
              analysis.interview_topics
            ) &&
              analysis.interview_topics.length > 0 && (
                <ResultCard
                  title="Interview Topics to Prepare"
                  icon="🎤"
                >
                  <div>
                    {analysis.interview_topics.map(
                      (item, index) => (
                        <div
                          key={`interview-${index}`}
                          style={{
                            padding: "13px 15px",
                            marginBottom: "8px",
                            background: "#0f172a",
                            border:
                              "1px solid #1e293b",
                            borderRadius: "10px",
                            color: "#cbd5e1",
                            fontSize: "14px",
                            lineHeight: 1.5,
                          }}
                        >
                          <strong
                            style={{
                              color: "#818cf8",
                              marginRight: "8px",
                            }}
                          >
                            {index + 1}.
                          </strong>

                          {formatValue(item)}
                        </div>
                      )
                    )}
                  </div>
                </ResultCard>
              )}

            {/* Bottom message */}
            <div
              style={{
                marginTop: "10px",
                marginBottom: "30px",
                padding: "18px",
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(139,92,246,0.08))",
                border:
                  "1px solid rgba(99,102,241,0.20)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#a5b4fc",
                  fontWeight: 650,
                  fontSize: "14px",
                }}
              >
                💡 Career Copilot Insight
              </div>

              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                  marginTop: "5px",
                }}
              >
                Use the missing skills and interview topics
                above to prepare specifically for this role.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}