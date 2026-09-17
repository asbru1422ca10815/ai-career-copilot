import { useRef, useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  X,
  CheckCircle2,
  ShieldCheck,
  Target,
  ArrowRight,
  Loader2,
  Brain,
  BriefcaseBusiness,
  GraduationCap,
  FolderKanban,
  Award,
  AlertTriangle,
  Lightbulb,
  Wrench,
} from "lucide-react";

import { supabase } from "../lib/supabase";


// --------------------------------------------------
// Helper functions
// --------------------------------------------------

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}


function formatAIValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatAIValue(item))
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
          .replace(/^./, (char) => char.toUpperCase());

        return `${label}: ${formatAIValue(item)}`;
      })
      .join(" • ");
  }

  return String(value);
}


// --------------------------------------------------
// Main component
// --------------------------------------------------

export default function ResumeAnalyzer() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);


  // ------------------------------------------------
  // File validation
  // ------------------------------------------------

  function handleFile(file) {
    setError("");
    setStatus("");
    setAnalysis(null);

    if (!file) {
      return;
    }

    const isPDF =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPDF) {
      setError("Please upload a PDF resume.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Resume must be smaller than 10 MB.");
      return;
    }

    setSelectedFile(file);
    setStatus("Resume selected successfully.");
  }


  // ------------------------------------------------
  // File input
  // ------------------------------------------------

  function handleInputChange(event) {
    const file = event.target.files?.[0];

    handleFile(file);

    // Allow selecting the same file again later
    event.target.value = "";
  }


  // ------------------------------------------------
  // Drag & Drop
  // ------------------------------------------------

  function handleDragOver(event) {
    event.preventDefault();
    setDragging(true);
  }


  function handleDragLeave(event) {
    event.preventDefault();
    setDragging(false);
  }


  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    handleFile(file);
  }


  // ------------------------------------------------
  // Remove selected file
  // ------------------------------------------------

  function removeFile() {
    setSelectedFile(null);
    setAnalysis(null);
    setError("");
    setStatus("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }


  // ------------------------------------------------
  // Analyze resume with Gemini
  // ------------------------------------------------

  async function analyzeResume() {
    if (!selectedFile) {
      setError("Please upload a PDF resume first.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setStatus("Uploading resume and starting AI analysis...");

    try {
      // --------------------------------------------
      // Step 1: Send PDF to Supabase Edge Function
      // --------------------------------------------

      const formData = new FormData();

      formData.append("resume", selectedFile);

      const {
        data,
        error: functionError,
      } = await supabase.functions.invoke("analyze-resume", {
        body: formData,
      });

      if (functionError) {
        console.error(
          "Supabase Edge Function error:",
          functionError
        );

        throw new Error(
          functionError.message ||
            "Resume analysis service failed."
        );
      }

      if (!data) {
        throw new Error(
          "No response was received from the AI analysis service."
        );
      }

      if (!data.success) {
        throw new Error(
          data.error ||
            "AI could not analyze the resume."
        );
      }


      // --------------------------------------------
      // Step 2: Get Gemini analysis
      // --------------------------------------------

      const result = data.analysis;

      console.log("AI Resume Analysis:", result);

      if (!result || typeof result !== "object") {
        throw new Error(
          "The AI returned an invalid analysis format."
        );
      }


      // --------------------------------------------
      // Step 3: Display analysis immediately
      // --------------------------------------------

      setAnalysis(result);

      setStatus(
        "AI analysis completed. Saving your career profile..."
      );


      // --------------------------------------------
      // Step 4: Get currently logged-in user
      // --------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Supabase user error:",
          userError
        );

        throw new Error(
          "Could not verify your logged-in account."
        );
      }

      if (!user) {
        throw new Error(
          "You must be logged in to save your resume analysis."
        );
      }


      // --------------------------------------------
      // Step 5: Prepare arrays safely
      // --------------------------------------------

      const targetRoles = safeArray(
        result.targetRoles
      );

      const technicalSkills = safeArray(
        result.skills?.technical
      );

      const softSkills = safeArray(
        result.skills?.soft
      );

      const tools = safeArray(
        result.skills?.tools
      );

      const strengths = safeArray(
        result.strengths
      );

      const weaknesses = safeArray(
        result.weaknesses
      );

      const skillGaps = safeArray(
        result.skillGaps
      );

      const recommendations = safeArray(
        result.recommendations
      );

      const education = safeArray(
        result.education
      );

      const projects = safeArray(
        result.projects
      );

      const certifications = safeArray(
        result.certifications
      );

      const keywords = safeArray(
        result.keywords
      );


      // --------------------------------------------
      // Step 6: Save analysis to Supabase
      // --------------------------------------------

      const { error: saveError } = await supabase
        .from("resume_analyses")
        .insert({
          user_id: user.id,

          resume_name: selectedFile.name,

          candidate_name:
            result.candidateName || "",

          professional_summary:
            result.professionalSummary || "",

          ats_score:
            Number(result.atsScore) || 0,

          career_readiness:
            Number(result.careerReadiness) || 0,

          experience_level:
            result.experienceLevel || "",

          target_roles:
            targetRoles,

          technical_skills:
            technicalSkills,

          soft_skills:
            softSkills,

          tools:
            tools,

          strengths:
            strengths,

          weaknesses:
            weaknesses,

          skill_gaps:
            skillGaps,

          recommendations:
            recommendations,

          education:
            education,

          projects:
            projects,

          certifications:
            certifications,

          keywords:
            keywords,
        });


      // --------------------------------------------
      // Step 7: Check database save
      // --------------------------------------------

      if (saveError) {
        console.error(
          "Supabase save error:",
          saveError
        );

        throw new Error(
          `Analysis completed, but saving failed: ${saveError.message}`
        );
      }


      // --------------------------------------------
      // Step 8: Success
      // --------------------------------------------

      setStatus(
        "Resume analyzed and saved successfully."
      );

    } catch (err) {
      console.error(
        "Resume analysis error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while analyzing the resume."
      );

    } finally {
      setAnalyzing(false);
    }
  }


  // ------------------------------------------------
  // Score helper
  // ------------------------------------------------

  function scoreClass(score) {
    if (score >= 80) {
      return "score-high";
    }

    if (score >= 60) {
      return "score-medium";
    }

    return "score-low";
  }


  // ------------------------------------------------
  // UI
  // ------------------------------------------------

  return (
    <div className="resume-analyzer-page">

      {/* ============================================
          HEADER
      ============================================ */}

      <div className="resume-page-header">

        <div>
          <div className="resume-eyebrow">
            <Sparkles size={15} />
            AI CAREER INTELLIGENCE
          </div>

          <h1>
            Resume Analyzer
          </h1>

          <p>
            Upload your resume and let AI evaluate
            your career profile, skills and job readiness.
          </p>
        </div>

        <div className="resume-security-badge">
          <ShieldCheck size={17} />
          Secure AI Analysis
        </div>

      </div>


      {/* ============================================
          ERROR
      ============================================ */}

      {error && (
        <div className="resume-alert resume-alert-error">
          <AlertTriangle size={19} />

          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}


      {/* ============================================
          STATUS
      ============================================ */}

      {status && !error && (
        <div className="resume-alert resume-alert-success">
          <CheckCircle2 size={19} />

          <span>{status}</span>
        </div>
      )}


      {/* ============================================
          UPLOAD SECTION
      ============================================ */}

      {!analysis && (
        <div
          className={`resume-upload-card ${
            dragging ? "resume-upload-dragging" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >

          <div className="resume-upload-icon">
            <Upload size={30} />
          </div>

          <h2>
            Upload your resume
          </h2>

          <p>
            Drag and drop your PDF here, or choose
            a file from your computer.
          </p>

          <button
            type="button"
            className="resume-upload-button"
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            <Upload size={18} />
            Choose PDF Resume
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            style={{ display: "none" }}
          />

          <div className="resume-upload-meta">
            <span>PDF only</span>
            <span>Maximum 10 MB</span>
            <span>AI powered</span>
          </div>

        </div>
      )}


      {/* ============================================
          SELECTED FILE
      ============================================ */}

      {selectedFile && !analysis && (
        <div className="selected-resume-card">

          <div className="selected-file-left">

            <div className="selected-file-icon">
              <FileText size={23} />
            </div>

            <div>
              <strong>
                {selectedFile.name}
              </strong>

              <span>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>

          </div>

          <button
            type="button"
            className="remove-resume-button"
            onClick={removeFile}
            disabled={analyzing}
          >
            <X size={18} />
          </button>

        </div>
      )}


      {/* ============================================
          ANALYZE BUTTON
      ============================================ */}

      {selectedFile && !analysis && (
        <div className="resume-analyze-action">

          <button
            type="button"
            className="resume-analyze-button"
            onClick={analyzeResume}
            disabled={analyzing}
          >

            {analyzing ? (
              <>
                <Loader2
                  size={19}
                  className="resume-spinner"
                />

                Analyzing Resume...
              </>
            ) : (
              <>
                <Sparkles size={19} />

                Analyze Resume with AI

                <ArrowRight size={18} />
              </>
            )}

          </button>

          <p>
            Gemini AI will analyze your resume and
            save your career profile securely.
          </p>

        </div>
      )}


      {/* ============================================
          ANALYSIS RESULTS
      ============================================ */}

      {analysis && (
        <div className="resume-results">


          {/* ----------------------------------------
              PROFILE HEADER
          ---------------------------------------- */}

          <div className="resume-profile-card">

            <div className="resume-profile-icon">
              <Brain size={28} />
            </div>

            <div className="resume-profile-content">

              <span className="resume-result-label">
                AI ANALYSIS COMPLETE
              </span>

              <h2>
                {analysis.candidateName ||
                  "Career Profile"}
              </h2>

              <p>
                Here is what Gemini AI found
                in your resume.
              </p>

            </div>

            <div className="resume-profile-status">
              <CheckCircle2 size={18} />
              Saved
            </div>

          </div>


          {/* ----------------------------------------
              SCORE CARDS
          ---------------------------------------- */}

          <div className="resume-score-grid">

            <div className="resume-score-card">

              <div className="resume-score-top">
                <span>ATS SCORE</span>
                <Target size={20} />
              </div>

              <div
                className={`resume-score-number ${scoreClass(
                  Number(analysis.atsScore) || 0
                )}`}
              >
                {Number(analysis.atsScore) || 0}
                <small>/100</small>
              </div>

              <p>
                Resume compatibility
              </p>

            </div>


            <div className="resume-score-card">

              <div className="resume-score-top">
                <span>CAREER READINESS</span>
                <BriefcaseBusiness size={20} />
              </div>

              <div
                className={`resume-score-number ${scoreClass(
                  Number(analysis.careerReadiness) || 0
                )}`}
              >
                {Number(analysis.careerReadiness) || 0}
                <small>/100</small>
              </div>

              <p>
                Overall career readiness
              </p>

            </div>


            <div className="resume-score-card">

              <div className="resume-score-top">
                <span>EXPERIENCE</span>
                <GraduationCap size={20} />
              </div>

              <div className="resume-experience-value">
                {analysis.experienceLevel ||
                  "Not detected"}
              </div>

              <p>
                Detected experience level
              </p>

            </div>

          </div>


          {/* ----------------------------------------
              PROFESSIONAL SUMMARY
          ---------------------------------------- */}

          {analysis.professionalSummary && (
            <section className="resume-result-section">

              <div className="resume-section-heading">
                <div className="resume-section-icon">
                  <Sparkles size={19} />
                </div>

                <div>
                  <h3>
                    Professional Summary
                  </h3>

                  <span>
                    AI-generated profile overview
                  </span>
                </div>
              </div>

              <div className="resume-summary-box">
                {formatAIValue(
                  analysis.professionalSummary
                )}
              </div>

            </section>
          )}


          {/* ----------------------------------------
              TARGET ROLES
          ---------------------------------------- */}

          {safeArray(analysis.targetRoles).length > 0 && (
            <section className="resume-result-section">

              <div className="resume-section-heading">
                <div className="resume-section-icon">
                  <BriefcaseBusiness size={19} />
                </div>

                <div>
                  <h3>
                    Target Roles
                  </h3>

                  <span>
                    Roles matching your profile
                  </span>
                </div>
              </div>

              <div className="resume-chip-list">

                {safeArray(
                  analysis.targetRoles
                ).map((role, index) => (
                  <span
                    className="resume-chip"
                    key={index}
                  >
                    {formatAIValue(role)}
                  </span>
                ))}

              </div>

            </section>
          )}


          {/* ----------------------------------------
              SKILLS
          ---------------------------------------- */}

          <section className="resume-result-section">

            <div className="resume-section-heading">
              <div className="resume-section-icon">
                <Wrench size={19} />
              </div>

              <div>
                <h3>
                  Skills & Technologies
                </h3>

                <span>
                  Capabilities identified in your resume
                </span>
              </div>
            </div>


            <div className="resume-skill-grid">

              {safeArray(
                analysis.skills?.technical
              ).length > 0 && (
                <div className="resume-skill-box">

                  <h4>
                    Technical Skills
                  </h4>

                  <div className="resume-chip-list">

                    {safeArray(
                      analysis.skills?.technical
                    ).map((item, index) => (
                      <span
                        className="resume-chip"
                        key={index}
                      >
                        {formatAIValue(item)}
                      </span>
                    ))}

                  </div>

                </div>
              )}


              {safeArray(
                analysis.skills?.tools
              ).length > 0 && (
                <div className="resume-skill-box">

                  <h4>
                    Tools & Technologies
                  </h4>

                  <div className="resume-chip-list">

                    {safeArray(
                      analysis.skills?.tools
                    ).map((item, index) => (
                      <span
                        className="resume-chip"
                        key={index}
                      >
                        {formatAIValue(item)}
                      </span>
                    ))}

                  </div>

                </div>
              )}


              {safeArray(
                analysis.skills?.soft
              ).length > 0 && (
                <div className="resume-skill-box">

                  <h4>
                    Soft Skills
                  </h4>

                  <div className="resume-chip-list">

                    {safeArray(
                      analysis.skills?.soft
                    ).map((item, index) => (
                      <span
                        className="resume-chip"
                        key={index}
                      >
                        {formatAIValue(item)}
                      </span>
                    ))}

                  </div>

                </div>
              )}

            </div>

          </section>


          {/* ----------------------------------------
              STRENGTHS + WEAKNESSES
          ---------------------------------------- */}

          <div className="resume-two-column">


            {safeArray(
              analysis.strengths
            ).length > 0 && (
              <section className="resume-result-section">

                <div className="resume-section-heading">
                  <div className="resume-section-icon">
                    <CheckCircle2 size={19} />
                  </div>

                  <div>
                    <h3>
                      Profile Strengths
                    </h3>

                    <span>
                      What your resume does well
                    </span>
                  </div>
                </div>

                <div className="resume-list">

                  {safeArray(
                    analysis.strengths
                  ).map((item, index) => (
                    <div
                      className="resume-list-item"
                      key={index}
                    >
                      <CheckCircle2 size={17} />
                      <span>
                        {formatAIValue(item)}
                      </span>
                    </div>
                  ))}

                </div>

              </section>
            )}


            {safeArray(
              analysis.weaknesses
            ).length > 0 && (
              <section className="resume-result-section">

                <div className="resume-section-heading">
                  <div className="resume-section-icon">
                    <AlertTriangle size={19} />
                  </div>

                  <div>
                    <h3>
                      Weaknesses
                    </h3>

                    <span>
                      Areas that need attention
                    </span>
                  </div>
                </div>

                <div className="resume-list">

                  {safeArray(
                    analysis.weaknesses
                  ).map((item, index) => (
                    <div
                      className="resume-list-item"
                      key={index}
                    >
                      <AlertTriangle size={17} />
                      <span>
                        {formatAIValue(item)}
                      </span>
                    </div>
                  ))}

                </div>

              </section>
            )}

          </div>


          {/* ----------------------------------------
              SKILL GAPS
          ---------------------------------------- */}

          {safeArray(
            analysis.skillGaps
          ).length > 0 && (
            <section className="resume-result-section">

              <div className="resume-section-heading">
                <div className="resume-section-icon">
                  <Target size={19} />
                </div>

                <div>
                  <h3>
                    Skill Gaps
                  </h3>

                  <span>
                    Skills that could improve your career opportunities
                  </span>
                </div>
              </div>

              <div className="resume-list">

                {safeArray(
                  analysis.skillGaps
                ).map((item, index) => (
                  <div
                    className="resume-list-item"
                    key={index}
                  >
                    <Target size={17} />

                    <span>
                      {formatAIValue(item)}
                    </span>
                  </div>
                ))}

              </div>

            </section>
          )}


          {/* ----------------------------------------
              RECOMMENDATIONS
          ---------------------------------------- */}

          {safeArray(
            analysis.recommendations
          ).length > 0 && (
            <section className="resume-result-section">

              <div className="resume-section-heading">
                <div className="resume-section-icon">
                  <Lightbulb size={19} />
                </div>

                <div>
                  <h3>
                    AI Recommendations
                  </h3>

                  <span>
                    Suggested actions to improve your profile
                  </span>
                </div>
              </div>

              <div className="resume-list">

                {safeArray(
                  analysis.recommendations
                ).map((item, index) => (
                  <div
                    className="resume-list-item"
                    key={index}
                  >
                    <div className="resume-number">
                      {index + 1}
                    </div>

                    <span>
                      {formatAIValue(item)}
                    </span>
                  </div>
                ))}

              </div>

            </section>
          )}


          {/* ----------------------------------------
              EDUCATION
          ---------------------------------------- */}

          {safeArray(
            analysis.education
          ).length > 0 && (
            <section className="resume-result-section">

              <div className="resume-section-heading">
                <div className="resume-section-icon">
                  <GraduationCap size={19} />
                </div>

                <div>
                  <h3>
                    Education
                  </h3>

                  <span>
                    Education details found in your resume
                  </span>
                </div>
              </div>

              <div className="resume-detail-list">

                {safeArray(
                  analysis.education
                ).map((item, index) => (
                  <div
                    className="resume-detail-card"
                    key={index}
                  >
                    <div className="resume-detail-icon">
                      <GraduationCap size={19} />
                    </div>

                    <div>
                      <strong>
                        {formatAIValue(item)}
                      </strong>
                    </div>
                  </div>
                ))}

              </div>

            </section>
          )}


          {/* ----------------------------------------
              PROJECTS
          ---------------------------------------- */}

          {safeArray(
            analysis.projects
          ).length > 0 && (
            <section className="resume-result-section">

              <div className="resume-section-heading">
                <div className="resume-section-icon">
                  <FolderKanban size={19} />
                </div>

                <div>
                  <h3>
                    Projects
                  </h3>

                  <span>
                    Projects identified in your resume
                  </span>
                </div>
              </div>

              <div className="resume-detail-list">

                {safeArray(
                  analysis.projects
                ).map((item, index) => (
                  <div
                    className="resume-detail-card"
                    key={index}
                  >
                    <div className="resume-detail-icon">
                      <FolderKanban size={19} />
                    </div>

                    <div>
                      <strong>
                        {formatAIValue(item)}
                      </strong>
                    </div>
                  </div>
                ))}

              </div>

            </section>
          )}


          {/* ----------------------------------------
              CERTIFICATIONS
          ---------------------------------------- */}

          {safeArray(
            analysis.certifications
          ).length > 0 && (
            <section className="resume-result-section">

              <div className="resume-section-heading">
                <div className="resume-section-icon">
                  <Award size={19} />
                </div>

                <div>
                  <h3>
                    Certifications
                  </h3>

                  <span>
                    Certifications found in your resume
                  </span>
                </div>
              </div>

              <div className="resume-detail-list">

                {safeArray(
                  analysis.certifications
                ).map((item, index) => (
                  <div
                    className="resume-detail-card"
                    key={index}
                  >
                    <div className="resume-detail-icon">
                      <Award size={19} />
                    </div>

                    <div>
                      <strong>
                        {formatAIValue(item)}
                      </strong>
                    </div>
                  </div>
                ))}

              </div>

            </section>
          )}


          {/* ----------------------------------------
              KEYWORDS
          ---------------------------------------- */}

          {safeArray(
            analysis.keywords
          ).length > 0 && (
            <section className="resume-result-section">

              <div className="resume-section-heading">
                <div className="resume-section-icon">
                  <Target size={19} />
                </div>

                <div>
                  <h3>
                    Keywords
                  </h3>

                  <span>
                    Important resume keywords detected by AI
                  </span>
                </div>
              </div>

              <div className="resume-chip-list">

                {safeArray(
                  analysis.keywords
                ).map((item, index) => (
                  <span
                    className="resume-chip"
                    key={index}
                  >
                    {formatAIValue(item)}
                  </span>
                ))}

              </div>

            </section>
          )}


          {/* ----------------------------------------
              ANALYZE ANOTHER RESUME
          ---------------------------------------- */}

          <div className="resume-another-action">

            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setAnalysis(null);
                setStatus("");
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