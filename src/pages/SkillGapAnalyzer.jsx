import React, { useState } from "react";
import { supabase } from "../lib/supabase";

const getPriorityStyle = (priority) => {
  const value = String(priority || "").toLowerCase();

  if (value.includes("high")) {
    return {
      background: "rgba(239, 68, 68, 0.12)",
      color: "#f87171",
      border: "1px solid rgba(239, 68, 68, 0.25)",
    };
  }

  if (value.includes("medium")) {
    return {
      background: "rgba(245, 158, 11, 0.12)",
      color: "#fbbf24",
      border: "1px solid rgba(245, 158, 11, 0.25)",
    };
  }

  return {
    background: "rgba(34, 197, 94, 0.12)",
    color: "#4ade80",
    border: "1px solid rgba(34, 197, 94, 0.25)",
  };
};

const SkillCard = ({ skill }) => {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: "16px",
        padding: "22px",
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "15px",
          marginBottom: "12px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#f9fafb",
              fontSize: "18px",
            }}
          >
            {skill.skill}
          </h3>

          {skill.category && (
            <p
              style={{
                margin: "6px 0 0",
                color: "#9ca3af",
                fontSize: "13px",
              }}
            >
              {skill.category}
            </p>
          )}
        </div>

        <span
          style={{
            ...getPriorityStyle(skill.priority),
            padding: "6px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {skill.priority || "Medium"} Priority
        </span>
      </div>

      {skill.why_it_matters && (
        <div style={{ marginBottom: "14px" }}>
          <strong style={{ color: "#e5e7eb" }}>
            Why it matters
          </strong>

          <p
            style={{
              color: "#9ca3af",
              lineHeight: 1.6,
              margin: "6px 0 0",
            }}
          >
            {skill.why_it_matters}
          </p>
        </div>
      )}

      {skill.what_to_learn && (
        <div>
          <strong style={{ color: "#e5e7eb" }}>
            What to learn
          </strong>

          <p
            style={{
              color: "#9ca3af",
              lineHeight: 1.6,
              margin: "6px 0 0",
            }}
          >
            {skill.what_to_learn}
          </p>
        </div>
      )}
    </div>
  );
};

const RoadmapCard = ({ item }) => {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "14px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            minWidth: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "rgba(99, 102, 241, 0.15)",
            color: "#a5b4fc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
          }}
        >
          {item.day || "•"}
        </div>

        <div>
          <h3
            style={{
              margin: "0 0 6px",
              color: "#f9fafb",
              fontSize: "16px",
            }}
          >
            {item.title}
          </h3>

          <p
            style={{
              margin: 0,
              color: "#9ca3af",
              lineHeight: 1.6,
            }}
          >
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
};

const SimpleList = ({ title, items }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: "16px",
        padding: "22px",
        marginBottom: "18px",
      }}
    >
      <h2
        style={{
          margin: "0 0 14px",
          color: "#f9fafb",
          fontSize: "18px",
        }}
      >
        {title}
      </h2>

      <div style={{ display: "grid", gap: "10px" }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              padding: "12px 14px",
              background: "#0b1220",
              borderRadius: "10px",
              color: "#d1d5db",
              lineHeight: 1.5,
            }}
          >
            {typeof item === "string"
              ? item
              : item?.question ||
                item?.title ||
                JSON.stringify(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SkillGapAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      console.log("Starting Skill Gap Analysis...");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Please log in again.");
      }

      console.log("Authenticated user:", session.user.id);

      const { data, error: functionError } =
        await supabase.functions.invoke("dynamic-service", {
          body: {
            action: "skill-gap-analysis",
          },
        });

      console.log("Skill gap response:", data);
      console.log("Skill gap error:", functionError);

      if (functionError) {
        throw new Error(
          functionError.message ||
            "Failed to connect to Skill Gap Analyzer."
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error ||
            "Skill Gap Analysis failed."
        );
      }

      setResult(data.analysis);
    } catch (err) {
      console.error("Skill Gap Analyzer error:", err);

      setError(
        err?.message ||
          "Something went wrong while analyzing your skill gaps."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "30px",
        color: "#f9fafb",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "7px 12px",
            borderRadius: "999px",
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            color: "#a5b4fc",
            fontSize: "12px",
            fontWeight: 700,
            marginBottom: "14px",
          }}
        >
          AI CAREER INTELLIGENCE
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            fontWeight: 800,
            letterSpacing: "-0.8px",
          }}
        >
          Skill Gap Analyzer
        </h1>

        <p
          style={{
            color: "#9ca3af",
            maxWidth: "720px",
            lineHeight: 1.6,
            marginTop: "10px",
          }}
        >
          Discover the skills you need to improve based on your
          analyzed resume and target career opportunities.
        </p>
      </div>

      {/* ACTION CARD */}

      <div
        style={{
          background:
            "linear-gradient(135deg, #111827 0%, #0f172a 100%)",
          border: "1px solid #1f2937",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
              }}
            >
              Analyze My Skill Gaps
            </h2>

            <p
              style={{
                margin: "7px 0 0",
                color: "#9ca3af",
              }}
            >
              We'll compare your latest resume analysis with
              your career profile and identify what you should
              learn next.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            {result && (
              <button
                onClick={handleClear}
                style={{
                  border: "1px solid #374151",
                  background: "#111827",
                  color: "#d1d5db",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Clear
              </button>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                border: "none",
                background: loading
                  ? "#4b5563"
                  : "#6366f1",
                color: "white",
                padding: "12px 20px",
                borderRadius: "10px",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: 700,
              }}
            >
              {loading
                ? "Analyzing..."
                : "Analyze Skill Gaps"}
            </button>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "16px",
            padding: "40px",
            textAlign: "center",
            color: "#9ca3af",
          }}
        >
          <div
            style={{
              fontSize: "30px",
              marginBottom: "12px",
            }}
          >
            ✨
          </div>

          <h3
            style={{
              color: "#f9fafb",
              margin: "0 0 8px",
            }}
          >
            AI is analyzing your career gaps
          </h3>

          <p style={{ margin: 0 }}>
            Comparing your resume profile and identifying the
            most valuable skills to learn...
          </p>
        </div>
      )}

      {/* RESULTS */}

      {result && !loading && (
        <>
          {/* TOP SUMMARY */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "16px",
              marginBottom: "22px",
            }}
          >
            <div
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: "16px",
                padding: "22px",
              }}
            >
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                Skill Readiness
              </div>

              <div
                style={{
                  fontSize: "34px",
                  fontWeight: 800,
                  marginTop: "8px",
                  color: "#a5b4fc",
                }}
              >
                {result.skill_readiness ?? 0}%
              </div>
            </div>

            <div
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: "16px",
                padding: "22px",
              }}
            >
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                Skill Gaps
              </div>

              <div
                style={{
                  fontSize: "34px",
                  fontWeight: 800,
                  marginTop: "8px",
                  color: "#f87171",
                }}
              >
                {Array.isArray(result.skill_gaps)
                  ? result.skill_gaps.length
                  : 0}
              </div>
            </div>

            <div
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: "16px",
                padding: "22px",
              }}
            >
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                Priority Skills
              </div>

              <div
                style={{
                  fontSize: "34px",
                  fontWeight: 800,
                  marginTop: "8px",
                  color: "#fbbf24",
                }}
              >
                {Array.isArray(result.priority_skills)
                  ? result.priority_skills.length
                  : 0}
              </div>
            </div>
          </div>

          {/* SUMMARY */}

          {result.summary && (
            <div
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: "16px",
                padding: "22px",
                marginBottom: "22px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: "19px",
                }}
              >
                Career Gap Summary
              </h2>

              <p
                style={{
                  color: "#9ca3af",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {result.summary}
              </p>
            </div>
          )}

          {/* SKILLS */}

          {Array.isArray(result.skill_gaps) &&
            result.skill_gaps.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h2
                  style={{
                    margin: "0 0 14px",
                    fontSize: "22px",
                  }}
                >
                  Skills You Should Learn
                </h2>

                {result.skill_gaps.map((skill, index) => (
                  <SkillCard
                    key={index}
                    skill={skill}
                  />
                ))}
              </div>
            )}

          {/* ROADMAP */}

          {Array.isArray(result.learning_roadmap) &&
            result.learning_roadmap.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h2
                  style={{
                    margin: "0 0 14px",
                    fontSize: "22px",
                  }}
                >
                  Personalized Learning Roadmap
                </h2>

                {result.learning_roadmap.map(
                  (item, index) => (
                    <RoadmapCard
                      key={index}
                      item={item}
                    />
                  )
                )}
              </div>
            )}

          {/* MINI PROJECT */}

          {result.mini_project && (
            <div
              style={{
                background:
                  "linear-gradient(135deg, #111827, #0f172a)",
                border: "1px solid #312e81",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "22px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: "21px",
                }}
              >
                🛠️ Recommended Mini Project
              </h2>

              <p
                style={{
                  color: "#c7d2fe",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {typeof result.mini_project === "string"
                  ? result.mini_project
                  : result.mini_project?.description ||
                    result.mini_project?.title ||
                    JSON.stringify(result.mini_project)}
              </p>
            </div>
          )}

          {/* OTHER SECTIONS */}

          <SimpleList
            title="Recommended Resources"
            items={result.resources}
          />

          <SimpleList
            title="Interview Questions to Practice"
            items={result.interview_questions}
          />

          <SimpleList
            title="Next Steps"
            items={result.next_steps}
          />
        </>
      )}
    </div>
  );
}