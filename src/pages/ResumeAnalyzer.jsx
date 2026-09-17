import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Target,
  Briefcase,
  GraduationCap,
  Award,
  Wrench,
  Lightbulb,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

function formatAIValue(value) {
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
      .map((item) => formatAIValue(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, val]) => {
        const formattedKey = key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return `${formattedKey}: ${formatAIValue(val)}`;
      })
      .join(" • ");
  }

  return String(value);
}

function normalizeArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
}

export default function ResumeAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const handleFileSelect = (file) => {
    setError("");
    setSuccess("");
    setAnalysis(null);

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF resume only.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Resume file must be smaller than 10 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
    setSuccess("");
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please upload your resume first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setAnalysis(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error("Please login before analyzing your resume.");
      }

      console.log("Starting resume analysis...");
      console.log("User:", user.id);
      console.log("File:", selectedFile.name);
      console.log("File size:", selectedFile.size);

      const formData = new FormData();

      formData.append("resume", selectedFile);

      const { data, error: functionError } =
        await supabase.functions.invoke("analyze-resume", {
          body: formData,
        });

      console.log("Resume function response:", data);
      console.log("Resume function error:", functionError);

      /*
       * IMPORTANT:
       * Supabase may return a FunctionsHttpError when the Edge Function
       * returns a non-2xx status.
       */

      if (functionError) {
        console.error("Edge Function error:", functionError);

        let detailedMessage = functionError.message;

        /*
         * Try to read the actual response body returned by the Edge Function.
         */
        try {
          if (functionError.context) {
            const response = functionError.context;

            if (response instanceof Response) {
              const text = await response.text();

              console.error(
                "Edge Function response body:",
                text
              );

              if (text) {
                try {
                  const parsed = JSON.parse(text);

                  detailedMessage =
                    parsed.details ||
                    parsed.error ||
                    detailedMessage;
                } catch {
                  detailedMessage = text;
                }
              }
            }
          }
        } catch (readError) {
          console.error(
            "Could not read function error response:",
            readError
          );
        }

        throw new Error(
          detailedMessage ||
            "Failed to connect to the resume analysis service."
        );
      }

      if (!data) {
        throw new Error(
          "The resume analysis service returned no response."
        );
      }

      console.log("Parsed function data:", data);

      /*
       * The updated Edge Function returns HTTP 200 even when Gemini
       * itself reports an error.
       */
      if (!data.success) {
        throw new Error(
          data.details ||
            data.error ||
            "Resume analysis failed."
        );
      }

      const result = data.analysis || data.data;

      if (!result) {
        throw new Error(
          "Resume analysis completed but no analysis data was returned."
        );
      }

      console.log("AI analysis result:", result);

      /*
       * Save the analysis into Supabase.
       */

      const insertData = {
        user_id: user.id,

        resume_name:
          result.resume_name ||
          result.resumeName ||
          selectedFile.name,

        candidate_name:
          result.candidate_name ||
          result.candidateName ||
          "",

        professional_summary:
          result.professional_summary ||
          result.professionalSummary ||
          "",

        ats_score: Number(
          result.ats_score ??
            result.atsScore ??
            0
        ),

        career_readiness: Number(
          result.career_readiness ??
            result.careerReadiness ??
            0
        ),

        experience_level:
          result.experience_level ||
          result.experienceLevel ||
          "",

        target_roles: normalizeArray(
          result.target_roles ||
            result.targetRoles
        ),

        technical_skills: normalizeArray(
          result.technical_skills ||
            result.technicalSkills
        ),

        soft_skills: normalizeArray(
          result.soft_skills ||
            result.softSkills
        ),

        tools: normalizeArray(
          result.tools
        ),

        strengths: normalizeArray(
          result.strengths
        ),

        weaknesses: normalizeArray(
          result.weaknesses
        ),

        skill_gaps: normalizeArray(
          result.skill_gaps ||
            result.skillGaps
        ),

        recommendations: normalizeArray(
          result.recommendations
        ),

        education: normalizeArray(
          result.education
        ),

        projects: normalizeArray(
          result.projects
        ),

        certifications: normalizeArray(
          result.certifications
        ),

        keywords: normalizeArray(
          result.keywords
        ),
      };

      console.log(
        "Saving analysis to Supabase:",
        insertData
      );

      const { error: saveError } = await supabase
        .from("resume_analyses")
        .insert(insertData);

      if (saveError) {
        console.error(
          "Supabase save error:",
          saveError
        );

        throw new Error(
          `Analysis completed, but saving failed: ${saveError.message}`
        );
      }

      /*
       * Display result.
       */

      setAnalysis(result);

      setSuccess(
        "Resume analyzed and saved successfully."
      );

    } catch (err) {
      console.error(
        "Resume analysis failed:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while analyzing your resume."
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return "score-high";
    if (score >= 60) return "score-medium";
    return "score-low";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Improvement";
    return "Low";
  };

  const renderList = (items) => {
    const list = normalizeArray(items);

    if (list.length === 0) {
      return (
        <p className="empty-text">
          No information available.
        </p>
      );
    }

    return (
      <div className="result-list">
        {list.map((item, index) => (
          <div
            className="result-list-item"
            key={index}
          >
            <span className="result-bullet">
              •
            </span>

            <span>
              {formatAIValue(item)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="resume-analyzer-page">

      {/* Header */}

      <div className="resume-header">

        <div>
          <div className="page-title-row">

            <div className="title-icon">
              <Sparkles size={24} />
            </div>

            <div>
              <h1>
                AI Resume Analyzer
              </h1>

              <p>
                Analyze your resume with AI and discover
                your career readiness.
              </p>
            </div>

          </div>
        </div>

        <div className="secure-badge">
          <ShieldCheck size={16} />
          Secure AI Analysis
        </div>

      </div>


      {/* Error */}

      {error && (
        <div className="alert error-alert">

          <AlertCircle size={20} />

          <div>
            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            className="alert-close"
            onClick={() => setError("")}
          >
            <X size={18} />
          </button>

        </div>
      )}


      {/* Success */}

      {success && (
        <div className="alert success-alert">

          <CheckCircle2 size={20} />

          <div>
            <strong>
              Analysis Complete
            </strong>

            <p>
              {success}
            </p>
          </div>

        </div>
      )}


      {/* Upload Card */}

      {!analysis && (
        <div className="upload-card">

          <div className="upload-card-header">

            <div>
              <h2>
                Upload Your Resume
              </h2>

              <p>
                Upload your latest resume in PDF format.
              </p>
            </div>

            <FileText size={30} />

          </div>


          <div
            className={`drop-zone ${
              dragActive
                ? "drag-active"
                : ""
            } ${
              selectedFile
                ? "file-selected"
                : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >

            {!selectedFile ? (
              <>
                <div className="upload-icon">
                  <Upload size={32} />
                </div>

                <h3>
                  Drag & Drop your resume
                </h3>

                <p>
                  or choose a PDF file from your computer
                </p>

                <label className="choose-file-button">
                  Choose PDF
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleInputChange}
                    hidden
                  />
                </label>

                <span className="upload-hint">
                  Maximum file size: 10 MB
                </span>
              </>
            ) : (
              <div className="selected-file">

                <div className="selected-file-icon">
                  <FileText size={28} />
                </div>

                <div className="selected-file-info">

                  <strong>
                    {selectedFile.name}
                  </strong>

                  <span>
                    {(
                      selectedFile.size /
                      (1024 * 1024)
                    ).toFixed(2)}{" "}
                    MB
                  </span>

                </div>

                <button
                  className="remove-file"
                  onClick={removeFile}
                  disabled={loading}
                >
                  <X size={20} />
                </button>

              </div>
            )}

          </div>


          <div className="analysis-action">

            <button
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={
                !selectedFile ||
                loading
              }
            >

              {loading ? (
                <>
                  <Loader2
                    size={20}
                    className="spin"
                  />

                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles size={20} />

                  Analyze Resume
                </>
              )}

            </button>

            {loading && (
              <p className="processing-text">
                AI is reviewing your resume. This may take
                a few seconds...
              </p>
            )}

          </div>

        </div>
      )}


      {/* Results */}

      {analysis && (
        <div className="analysis-results">

          {/* Top Summary */}

          <div className="result-top-grid">

            {/* ATS */}

            <div className="score-card">

              <div className="score-card-header">
                <span>
                  ATS Score
                </span>

                <Target size={22} />
              </div>

              <div
                className={`score-number ${
                  getScoreClass(
                    Number(
                      analysis.ats_score ??
                        analysis.atsScore ??
                        0
                    )
                  )
                }`}
              >
                {Number(
                  analysis.ats_score ??
                    analysis.atsScore ??
                    0
                )}
                <span>/100</span>
              </div>

              <div className="score-label">
                {getScoreLabel(
                  Number(
                    analysis.ats_score ??
                      analysis.atsScore ??
                      0
                  )
                )}
              </div>

            </div>


            {/* Career Readiness */}

            <div className="score-card">

              <div className="score-card-header">
                <span>
                  Career Readiness
                </span>

                <TrendingUp size={22} />
              </div>

              <div
                className={`score-number ${
                  getScoreClass(
                    Number(
                      analysis.career_readiness ??
                        analysis.careerReadiness ??
                        0
                    )
                  )
                }`}
              >
                {Number(
                  analysis.career_readiness ??
                    analysis.careerReadiness ??
                    0
                )}
                <span>/100</span>
              </div>

              <div className="score-label">
                {getScoreLabel(
                  Number(
                    analysis.career_readiness ??
                      analysis.careerReadiness ??
                      0
                  )
                )}
              </div>

            </div>


            {/* Experience */}

            <div className="info-card">

              <div className="info-card-icon">
                <Briefcase size={22} />
              </div>

              <div>
                <span>
                  Experience Level
                </span>

                <strong>
                  {formatAIValue(
                    analysis.experience_level ||
                      analysis.experienceLevel ||
                      "Not specified"
                  )}
                </strong>
              </div>

            </div>

          </div>


          {/* Candidate */}

          {(analysis.candidate_name ||
            analysis.candidateName) && (
            <div className="candidate-card">

              <div className="candidate-avatar">
                {formatAIValue(
                  analysis.candidate_name ||
                    analysis.candidateName
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <span>
                  Candidate
                </span>

                <h2>
                  {formatAIValue(
                    analysis.candidate_name ||
                      analysis.candidateName
                  )}
                </h2>
              </div>

            </div>
          )}


          {/* Professional Summary */}

          <section className="result-section">

            <div className="section-heading">

              <div className="section-icon">
                <Sparkles size={20} />
              </div>

              <div>
                <h2>
                  Professional Summary
                </h2>

                <p>
                  AI-generated overview of your profile
                </p>
              </div>

            </div>

            <div className="summary-box">
              {formatAIValue(
                analysis.professional_summary ||
                  analysis.professionalSummary ||
                  "No summary available."
              )}
            </div>

          </section>


          {/* Target Roles */}

          <section className="result-section">

            <div className="section-heading">

              <div className="section-icon">
                <Target size={20} />
              </div>

              <div>
                <h2>
                  Target Roles
                </h2>

                <p>
                  Recommended career roles
                </p>
              </div>

            </div>

            <div className="tag-container">

              {normalizeArray(
                analysis.target_roles ||
                  analysis.targetRoles
              ).map((role, index) => (
                <span
                  className="result-tag"
                  key={index}
                >
                  {formatAIValue(role)}
                </span>
              ))}

            </div>

          </section>


          {/* Skills */}

          <div className="two-column-grid">

            <section className="result-section">

              <div className="section-heading">

                <div className="section-icon">
                  <Wrench size={20} />
                </div>

                <div>
                  <h2>
                    Technical Skills
                  </h2>

                  <p>
                    Technical capabilities detected
                  </p>
                </div>

              </div>

              {renderList(
                analysis.technical_skills ||
                  analysis.technicalSkills
              )}

            </section>


            <section className="result-section">

              <div className="section-heading">

                <div className="section-icon">
                  <Sparkles size={20} />
                </div>

                <div>
                  <h2>
                    Soft Skills
                  </h2>

                  <p>
                    Professional and interpersonal skills
                  </p>
                </div>

              </div>

              {renderList(
                analysis.soft_skills ||
                  analysis.softSkills
              )}

            </section>

          </div>


          {/* Tools */}

          <section className="result-section">

            <div className="section-heading">

              <div className="section-icon">
                <Wrench size={20} />
              </div>

              <div>
                <h2>
                  Tools & Technologies
                </h2>

                <p>
                  Tools identified in your resume
                </p>
              </div>

            </div>

            <div className="tag-container">

              {normalizeArray(
                analysis.tools
              ).map((tool, index) => (
                <span
                  className="result-tag"
                  key={index}
                >
                  {formatAIValue(tool)}
                </span>
              ))}

            </div>

          </section>


          {/* Strengths & Weaknesses */}

          <div className="two-column-grid">

            <section className="result-section">

              <div className="section-heading">

                <div className="section-icon">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <h2>
                    Strengths
                  </h2>

                  <p>
                    Your strongest areas
                  </p>
                </div>

              </div>

              {renderList(
                analysis.strengths
              )}

            </section>


            <section className="result-section">

              <div className="section-heading">

                <div className="section-icon">
                  <AlertCircle size={20} />
                </div>

                <div>
                  <h2>
                    Areas to Improve
                  </h2>

                  <p>
                    Areas that need attention
                  </p>
                </div>

              </div>

              {renderList(
                analysis.weaknesses
              )}

            </section>

          </div>


          {/* Skill Gaps */}

          <section className="result-section">

            <div className="section-heading">

              <div className="section-icon">
                <TrendingUp size={20} />
              </div>

              <div>
                <h2>
                  Skill Gaps
                </h2>

                <p>
                  Skills you should consider learning
                </p>
              </div>

            </div>

            {renderList(
              analysis.skill_gaps ||
                analysis.skillGaps
            )}

          </section>


          {/* Recommendations */}

          <section className="result-section">

            <div className="section-heading">

              <div className="section-icon">
                <Lightbulb size={20} />
              </div>

              <div>
                <h2>
                  AI Recommendations
                </h2>

                <p>
                  Personalized suggestions to improve your career profile
                </p>
              </div>

            </div>

            {renderList(
              analysis.recommendations
            )}

          </section>


          {/* Education */}

          <section className="result-section">

            <div className="section-heading">

              <div className="section-icon">
                <GraduationCap size={20} />
              </div>

              <div>
                <h2>
                  Education
                </h2>

                <p>
                  Academic background detected from your resume
                </p>
              </div>

            </div>

            {renderList(
              analysis.education
            )}

          </section>


          {/* Projects */}

          <section className="result-section">

            <div className="section-heading">

              <div className="section-icon">
                <Briefcase size={20} />
              </div>

              <div>
                <h2>
                  Projects
                </h2>

                <p>
                  Projects identified in your resume
                </p>
              </div>

            </div>

            {renderList(
              analysis.projects
            )}

          </section>


          {/* Certifications */}

          <section className="result-section">

            <div className="section-heading">

              <div className="section-icon">
                <Award size={20} />
              </div>

              <div>
                <h2>
                  Certifications
                </h2>

                <p>
                  Certifications identified in your resume
                </p>
              </div>

            </div>

            {renderList(
              analysis.certifications
            )}

          </section>


          {/* Keywords */}

          <section className="result-section">

            <div className="section-heading">

              <div className="section-icon">
                <Target size={20} />
              </div>

              <div>
                <h2>
                  Important Keywords
                </h2>

                <p>
                  Keywords that can improve ATS visibility
                </p>
              </div>

            </div>

            <div className="tag-container">

              {normalizeArray(
                analysis.keywords
              ).map((keyword, index) => (
                <span
                  className="result-tag"
                  key={index}
                >
                  {formatAIValue(keyword)}
                </span>
              ))}

            </div>

          </section>


          {/* Analyze Another */}

          <div className="new-analysis-container">

            <button
              className="analyze-again-button"
              onClick={() => {
                setAnalysis(null);
                setSelectedFile(null);
                setSuccess("");
                setError("");
              }}
            >
              <Upload size={18} />

              Analyze Another Resume
            </button>

          </div>

        </div>
      )}

    </div>
  );
}