import React, { useState } from "react";
import { supabase } from "../lib/supabase";

/* =========================================================
   PRIORITY STYLE
========================================================= */

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

/* =========================================================
   ROADMAP ITEM
========================================================= */

const RoadmapItem = ({ item, index }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "18px",
        position: "relative",
      }}
    >
      {/* Timeline */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: "52px",
        }}
      >
        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "14px",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            color: "#a5b4fc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "13px",
            flexShrink: 0,
          }}
        >
          {item.day || `#${index + 1}`}
        </div>

        {index !== 999 && (
          <div
            style={{
              width: "2px",
              flex: 1,
              minHeight: "30px",
              background: "#1f2937",
              marginTop: "8px",
              marginBottom: "8px",
            }}
          />
        )}
      </div>

      {/* Content */}

      <div
        style={{
          flex: 1,
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "14px",
        }}
      >
        <h3
          style={{
            margin: "0 0 8px",
            color: "#f9fafb",
            fontSize: "18px",
          }}
        >
          {item.title || "Learning Step"}
        </h3>

        <p
          style={{
            margin: 0,
            color: "#9ca3af",
            lineHeight: 1.7,
          }}
        >
          {item.description ||
            "Complete this learning step to improve your career readiness."}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   SKILL CARD
========================================================= */

const SkillCard = ({ skill }) => {
  return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid #1f2937",
        borderRadius: "14px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "10px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#f9fafb",
              fontSize: "16px",
            }}
          >
            {skill.skill || skill.title || skill}
          </h3>

          {skill.category && (
            <p
              style={{
                margin: "5px 0 0",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              {skill.category}
            </p>
          )}
        </div>

        {skill.priority && (
          <span
            style={{
              ...getPriorityStyle(skill.priority),
              padding: "5px 9px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {skill.priority}
          </span>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   RESOURCE LIST
========================================================= */

const ResourceList = ({ resources }) => {
  if (!Array.isArray(resources) || resources.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: "16px",
        padding: "22px",
        marginBottom: "20px",
      }}
    >
      <h2
        style={{
          margin: "0 0 14px",
          color: "#f9fafb",
          fontSize: "20px",
        }}
      >
        📚 Recommended Resources
      </h2>

      <div
        style={{
          display: "grid",
          gap: "10px",
        }}
      >
        {resources.map((resource, index) => (
          <div
            key={index}
            style={{
              background: "#0b1220",
              border: "1px solid #1f2937",
              borderRadius: "10px",
              padding: "13px 15px",
              color: "#d1d5db",
              lineHeight: 1.5,
            }}
          >
            {typeof resource === "string"
              ? resource
              : resource?.title ||
                resource?.name ||
                JSON.stringify(resource)}
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   SIMPLE LIST
========================================================= */

const SimpleList = ({ title, icon, items }) => {
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
        marginBottom: "20px",
      }}
    >
      <h2
        style={{
          margin: "0 0 14px",
          color: "#f9fafb",
          fontSize: "20px",
        }}
      >
        {icon} {title}
      </h2>

      <div
        style={{
          display: "grid",
          gap: "10px",
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "10px",
              background: "#0b1220",
              borderRadius: "10px",
              padding: "13px 15px",
              color: "#d1d5db",
              lineHeight: 1.6,
            }}
          >
            <span
              style={{
                color: "#818cf8",
                fontWeight: 800,
              }}
            >
              {index + 1}.
            </span>

            <span>
              {typeof item === "string"
                ? item
                : item?.question ||
                  item?.title ||
                  item?.description ||
                  JSON.stringify(item)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function LearningRoadmap() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  /* =======================================================
     GENERATE ROADMAP
  ======================================================= */

  const handleGenerateRoadmap = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      console.log("Starting Learning Roadmap...");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Please log in again.");
      }

      console.log(
        "Authenticated user:",
        session.user.id
      );

      const { data, error: functionError } =
        await supabase.functions.invoke(
          "dynamic-service",
          {
            body: {
              action: "learning-roadmap",
            },
          }
        );

      console.log(
        "Learning roadmap response:",
        data
      );

      console.log(
        "Learning roadmap error:",
        functionError
      );

      if (functionError) {
        throw new Error(
          functionError.message ||
            "Failed to connect to Learning Roadmap."
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error ||
            "Learning Roadmap generation failed."
        );
      }

      setResult(data.roadmap || data.analysis);
    } catch (err) {
      console.error(
        "Learning Roadmap error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while generating your roadmap."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     CLEAR
  ======================================================= */

  const handleClear = () => {
    setResult(null);
    setError("");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "30px",
        color: "#f9fafb",
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

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
            border:
              "1px solid rgba(99, 102, 241, 0.25)",
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
          Learning Roadmap
        </h1>

        <p
          style={{
            color: "#9ca3af",
            maxWidth: "720px",
            lineHeight: 1.6,
            marginTop: "10px",
          }}
        >
          Get a personalized step-by-step learning plan
          based on your resume, skill gaps, target roles,
          and career goals.
        </p>
      </div>

      {/* ===================================================
          ACTION CARD
      =================================================== */}

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
              Build My Learning Plan
            </h2>

            <p
              style={{
                margin: "7px 0 0",
                color: "#9ca3af",
              }}
            >
              AI will analyze your latest resume and create
              a practical roadmap for becoming job-ready.
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
              onClick={handleGenerateRoadmap}
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
                ? "Generating..."
                : "Generate Roadmap"}
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border:
              "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ===================================================
          LOADING
      =================================================== */}

      {loading && (
        <div
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "16px",
            padding: "45px",
            textAlign: "center",
            color: "#9ca3af",
          }}
        >
          <div
            style={{
              fontSize: "34px",
              marginBottom: "12px",
            }}
          >
            🧠
          </div>

          <h3
            style={{
              color: "#f9fafb",
              margin: "0 0 8px",
            }}
          >
            AI is building your learning roadmap
          </h3>

          <p style={{ margin: 0 }}>
            Analyzing your skills, gaps, target roles and
            career readiness...
          </p>
        </div>
      )}

      {/* ===================================================
          RESULTS
      =================================================== */}

      {result && !loading && (
        <>
          {/* ===============================================
              TOP STATS
          =============================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "16px",
              marginBottom: "22px",
            }}
          >
            {/* Duration */}

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
                Roadmap Duration
              </div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  marginTop: "8px",
                  color: "#a5b4fc",
                }}
              >
                {result.duration ||
                  result.total_duration ||
                  "14 Days"}
              </div>
            </div>

            {/* Learning Steps */}

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
                Learning Steps
              </div>

              <div
                style={{
                  fontSize: "34px",
                  fontWeight: 800,
                  marginTop: "8px",
                  color: "#4ade80",
                }}
              >
                {Array.isArray(
                  result.roadmap ||
                    result.learning_roadmap
                )
                  ? (
                      result.roadmap ||
                      result.learning_roadmap
                    ).length
                  : 0}
              </div>
            </div>

            {/* Skills */}

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
                Focus Skills
              </div>

              <div
                style={{
                  fontSize: "34px",
                  fontWeight: 800,
                  marginTop: "8px",
                  color: "#fbbf24",
                }}
              >
                {Array.isArray(result.focus_skills)
                  ? result.focus_skills.length
                  : Array.isArray(result.skills)
                  ? result.skills.length
                  : 0}
              </div>
            </div>
          </div>

          {/* ===============================================
              SUMMARY
          =============================================== */}

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
                  fontSize: "20px",
                }}
              >
                🎯 Your Learning Strategy
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

          {/* ===============================================
              FOCUS SKILLS
          =============================================== */}

          {Array.isArray(result.focus_skills) &&
            result.focus_skills.length > 0 && (
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
                    margin: "0 0 14px",
                    fontSize: "20px",
                  }}
                >
                  🚀 Skills to Focus On
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {result.focus_skills.map(
                    (skill, index) => (
                      <SkillCard
                        key={index}
                        skill={skill}
                      />
                    )
                  )}
                </div>
              </div>
            )}

          {/* ===============================================
              ROADMAP
          =============================================== */}

          {Array.isArray(
            result.roadmap ||
              result.learning_roadmap
          ) &&
            (
              result.roadmap ||
              result.learning_roadmap
            ).length > 0 && (
              <div
                style={{
                  marginBottom: "24px",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 16px",
                    fontSize: "23px",
                  }}
                >
                  🗺️ Your Personalized Roadmap
                </h2>

                <div>
                  {(
                    result.roadmap ||
                    result.learning_roadmap
                  ).map((item, index, array) => (
                    <RoadmapItem
                      key={index}
                      item={item}
                      index={
                        index === array.length - 1
                          ? 999
                          : index
                      }
                    />
                  ))}
                </div>
              </div>
            )}

          {/* ===============================================
              MINI PROJECT
          =============================================== */}

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
                🛠️ Capstone / Mini Project
              </h2>

              {typeof result.mini_project ===
              "string" ? (
                <p
                  style={{
                    color: "#c7d2fe",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {result.mini_project}
                </p>
              ) : (
                <>
                  {result.mini_project.title && (
                    <h3
                      style={{
                        color: "#f9fafb",
                        margin: "0 0 8px",
                      }}
                    >
                      {result.mini_project.title}
                    </h3>
                  )}

                  {result.mini_project.description && (
                    <p
                      style={{
                        color: "#c7d2fe",
                        lineHeight: 1.7,
                        margin: "0 0 14px",
                      }}
                    >
                      {result.mini_project.description}
                    </p>
                  )}

                  {Array.isArray(
                    result.mini_project
                      .skills_practiced
                  ) &&
                    result.mini_project
                      .skills_practiced.length >
                      0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {result.mini_project.skills_practiced.map(
                          (skill, index) => (
                            <span
                              key={index}
                              style={{
                                padding:
                                  "6px 10px",
                                borderRadius:
                                  "999px",
                                background:
                                  "rgba(99, 102, 241, 0.12)",
                                border:
                                  "1px solid rgba(99, 102, 241, 0.25)",
                                color:
                                  "#a5b4fc",
                                fontSize:
                                  "12px",
                              }}
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    )}
                </>
              )}
            </div>
          )}

          {/* ===============================================
              RESOURCES
          =============================================== */}

          <ResourceList
            resources={result.resources}
          />

          {/* ===============================================
              INTERVIEW QUESTIONS
          =============================================== */}

          <SimpleList
            title="Interview Questions to Practice"
            icon="🎤"
            items={result.interview_questions}
          />

          {/* ===============================================
              NEXT STEPS
          =============================================== */}

          <SimpleList
            title="Next Steps"
            icon="✅"
            items={result.next_steps}
          />
        </>
      )}
    </div>
  );
}