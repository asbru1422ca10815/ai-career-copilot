import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    loadInterviewHistory();
  }, []);

  async function loadInterviewHistory() {
    setLoading(true);
    setError("");

    try {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      const user = userData?.user;

      if (!user) {
        throw new Error("Please log in to view your interview history.");
      }

      const {
        data,
        error: historyError,
      } = await supabase
        .from("mock_interviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (historyError) {
        throw historyError;
      }

      setInterviews(data || []);
    } catch (err) {
      console.error("Interview history error:", err);

      setError(
        err.message ||
          "Unable to load interview history."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "Unknown date";

    return new Date(dateString).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatTime(dateString) {
    if (!dateString) return "";

    return new Date(dateString).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function getScoreClass(score) {
    if (score >= 80) return "score-high";
    if (score >= 60) return "score-medium";
    return "score-low";
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this interview?"
    );

    if (!confirmed) return;

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("mock_interviews")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setInterviews((previous) =>
        previous.filter(
          (interview) =>
            interview.id !== id
        )
      );

      if (
        selectedInterview?.id === id
      ) {
        setSelectedInterview(null);
      }
    } catch (err) {
      console.error(
        "Delete interview error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete interview."
      );
    }
  }

  return (
    <div className="history-page">

      {/* Header */}

      <div className="history-header">
        <div>
          <div className="history-eyebrow">
            CAREER COPILOT
          </div>

          <h1>Interview History</h1>

          <p>
            Review your previous mock interviews
            and track your interview performance.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadInterviewHistory}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="history-error">
          <span>⚠</span>
          <div>{error}</div>
        </div>
      )}

      {/* Loading */}

      {loading ? (
        <div className="history-loading">
          <div className="loading-spinner"></div>
          <p>Loading interview history...</p>
        </div>
      ) : interviews.length === 0 ? (
        /* Empty State */

        <div className="history-empty">

          <div className="empty-icon">
            🎤
          </div>

          <h2>No interviews yet</h2>

          <p>
            Complete your first mock interview
            to see your results here.
          </p>
        </div>
      ) : (
        <>
          {/* Statistics */}

          <div className="history-stats">

            <div className="stat-card">
              <div className="stat-icon">
                🎤
              </div>

              <div>
                <span>
                  Total Interviews
                </span>

                <strong>
                  {interviews.length}
                </strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                📊
              </div>

              <div>
                <span>
                  Average Score
                </span>

                <strong>
                  {Math.round(
                    interviews.reduce(
                      (sum, item) =>
                        sum +
                        Number(
                          item.overall_score || 0
                        ),
                      0
                    ) /
                      interviews.length
                  )}
                  /100
                </strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                🏆
              </div>

              <div>
                <span>
                  Highest Score
                </span>

                <strong>
                  {Math.max(
                    ...interviews.map(
                      (item) =>
                        Number(
                          item.overall_score || 0
                        )
                    )
                  )}
                  /100
                </strong>
              </div>
            </div>

          </div>

          {/* Interview Cards */}

          <div className="history-list">

            {interviews.map((interview) => {

              const score =
                Number(
                  interview.overall_score || 0
                );

              return (
                <div
                  className="history-card"
                  key={interview.id}
                >

                  <div className="history-card-top">

                    <div>
                      <div className="history-title">
                        Mock Interview
                      </div>

                      <div className="history-date">
                        {formatDate(
                          interview.created_at
                        )}

                        <span>•</span>

                        {formatTime(
                          interview.created_at
                        )}
                      </div>
                    </div>

                    <div
                      className={`history-score ${getScoreClass(
                        score
                      )}`}
                    >
                      <strong>
                        {score}
                      </strong>

                      <span>
                        /100
                      </span>
                    </div>

                  </div>

                  <div className="history-meta">

                    <div className="meta-item">
                      <span>Type</span>
                      <strong>
                        {interview.interview_type ||
                          "Mixed"}
                      </strong>
                    </div>

                    <div className="meta-item">
                      <span>Difficulty</span>
                      <strong>
                        {interview.difficulty ||
                          "Intermediate"}
                      </strong>
                    </div>

                    <div className="meta-item">
                      <span>Questions</span>
                      <strong>
                        {interview.question_count ||
                          0}
                      </strong>
                    </div>

                  </div>

                  {interview.summary && (
                    <p className="history-summary">
                      {interview.summary}
                    </p>
                  )}

                  <div className="history-actions">

                    <button
                      className="view-button"
                      onClick={() =>
                        setSelectedInterview(
                          interview
                        )
                      }
                    >
                      View Details
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(
                          interview.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        </>
      )}

      {/* Details Modal */}

      {selectedInterview && (
        <div
          className="history-modal-overlay"
          onClick={() =>
            setSelectedInterview(null)
          }
        >

          <div
            className="history-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <div className="history-eyebrow">
                  INTERVIEW RESULT
                </div>

                <h2>
                  Interview Details
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedInterview(null)
                }
              >
                ×
              </button>

            </div>

            {/* Score */}

            <div className="modal-score">

              <div
                className={`large-score ${getScoreClass(
                  Number(
                    selectedInterview.overall_score ||
                      0
                  )
                )}`}
              >
                {selectedInterview.overall_score ||
                  0}
                <span>/100</span>
              </div>

              <div>
                <strong>
                  {selectedInterview.interview_type ||
                    "Mixed"}{" "}
                  Interview
                </strong>

                <p>
                  {selectedInterview.difficulty ||
                    "Intermediate"}{" "}
                  difficulty
                </p>

                <small>
                  {formatDate(
                    selectedInterview.created_at
                  )}
                </small>
              </div>

            </div>

            {/* Summary */}

            {selectedInterview.summary && (
              <section className="modal-section">

                <h3>Summary</h3>

                <p>
                  {selectedInterview.summary}
                </p>

              </section>
            )}

            {/* Strengths */}

            {Array.isArray(
              selectedInterview.strengths
            ) &&
              selectedInterview.strengths.length >
                0 && (
                <section className="modal-section">

                  <h3>Strengths</h3>

                  <div className="tag-list">

                    {selectedInterview.strengths.map(
                      (item, index) => (
                        <span key={index}>
                          {item}
                        </span>
                      )
                    )}

                  </div>

                </section>
              )}

            {/* Improvements */}

            {Array.isArray(
              selectedInterview.improvements
            ) &&
              selectedInterview.improvements.length >
                0 && (
                <section className="modal-section">

                  <h3>Areas to Improve</h3>

                  <div className="tag-list">

                    {selectedInterview.improvements.map(
                      (item, index) => (
                        <span key={index}>
                          {item}
                        </span>
                      )
                    )}

                  </div>

                </section>
              )}

            {/* Recommendations */}

            {Array.isArray(
              selectedInterview.recommendations
            ) &&
              selectedInterview.recommendations.length >
                0 && (
                <section className="modal-section">

                  <h3>Recommendations</h3>

                  <ul className="recommendation-list">

                    {selectedInterview.recommendations.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}

                  </ul>

                </section>
              )}

            {/* Questions */}

            {Array.isArray(
              selectedInterview.interview_answers
            ) &&
              selectedInterview.interview_answers.length >
                0 && (
                <section className="modal-section">

                  <h3>
                    Interview Questions
                  </h3>

                  <div className="question-history">

                    {selectedInterview.interview_answers.map(
                      (item, index) => (
                        <div
                          className="question-history-item"
                          key={index}
                        >

                          <div className="question-number">
                            Q{index + 1}
                          </div>

                          <div>

                            <strong>
                              {item.question}
                            </strong>

                            <p>
                              {item.answer}
                            </p>

                            {item.score !==
                              undefined && (
                              <span className="answer-score">
                                Score:{" "}
                                {item.score}/100
                              </span>
                            )}

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </section>
              )}

            <button
              className="modal-done-button"
              onClick={() =>
                setSelectedInterview(null)
              }
            >
              Close
            </button>

          </div>

        </div>
      )}

      <style>{`

        .history-page {
          min-height: 100%;
          padding: 32px;
          color: #f5f5f5;
          background: #0d0d10;
        }

        .history-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .history-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #888892;
          margin-bottom: 8px;
        }

        .history-header h1 {
          margin: 0;
          font-size: 32px;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        .history-header p {
          margin: 10px 0 0;
          color: #92929c;
          font-size: 14px;
        }

        .refresh-button {
          border: 1px solid #303038;
          background: #17171c;
          color: #eeeeef;
          padding: 10px 15px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 13px;
        }

        .refresh-button:hover {
          background: #202027;
        }

        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .history-error {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 13px 15px;
          margin-bottom: 20px;
          border: 1px solid #493333;
          background: #211618;
          color: #e5b7b7;
          border-radius: 10px;
          font-size: 13px;
        }

        .history-loading,
        .history-empty {
          min-height: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 1px solid #25252c;
          background: #121216;
          border-radius: 16px;
        }

        .loading-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #303038;
          border-top-color: #eeeeef;
          border-radius: 50%;
          animation: historySpin 0.8s linear infinite;
        }

        @keyframes historySpin {
          to {
            transform: rotate(360deg);
          }
        }

        .history-loading p {
          color: #898993;
          font-size: 13px;
          margin-top: 14px;
        }

        .empty-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: #1b1b21;
          font-size: 25px;
          margin-bottom: 16px;
        }

        .history-empty h2 {
          margin: 0;
          font-size: 20px;
        }

        .history-empty p {
          margin: 8px 0 0;
          color: #888892;
          font-size: 13px;
        }

        .history-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 17px;
          border: 1px solid #25252c;
          background: #121216;
          border-radius: 13px;
        }

        .stat-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #1b1b21;
          font-size: 18px;
        }

        .stat-card span {
          display: block;
          color: #81818b;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .stat-card strong {
          font-size: 22px;
          letter-spacing: -0.02em;
        }

        .history-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .history-card {
          padding: 20px;
          border: 1px solid #25252c;
          background: #121216;
          border-radius: 15px;
          transition: border-color 0.2s ease;
        }

        .history-card:hover {
          border-color: #3a3a44;
        }

        .history-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
        }

        .history-title {
          font-size: 16px;
          font-weight: 700;
        }

        .history-date {
          display: flex;
          gap: 7px;
          align-items: center;
          margin-top: 6px;
          color: #777781;
          font-size: 11px;
        }

        .history-score {
          display: flex;
          align-items: baseline;
          white-space: nowrap;
        }

        .history-score strong {
          font-size: 26px;
        }

        .history-score span {
          color: #777781;
          font-size: 12px;
        }

        .score-high {
          color: #eeeeef;
        }

        .score-medium {
          color: #d4d4d8;
        }

        .score-low {
          color: #a9a9b1;
        }

        .history-meta {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 20px;
          padding: 12px;
          background: #18181d;
          border-radius: 10px;
        }

        .meta-item span {
          display: block;
          color: #777781;
          font-size: 10px;
          margin-bottom: 4px;
        }

        .meta-item strong {
          font-size: 12px;
          color: #d9d9dd;
        }

        .history-summary {
          color: #92929c;
          font-size: 12px;
          line-height: 1.65;
          margin: 15px 0 0;
        }

        .history-actions {
          display: flex;
          gap: 8px;
          margin-top: 17px;
        }

        .view-button,
        .delete-button {
          padding: 9px 13px;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
        }

        .view-button {
          border: 1px solid #303038;
          background: #eeeeef;
          color: #111115;
        }

        .view-button:hover {
          background: #ffffff;
        }

        .delete-button {
          border: 1px solid #303038;
          background: transparent;
          color: #9b9ba4;
        }

        .delete-button:hover {
          background: #1d1d23;
          color: #eeeeef;
        }

        .history-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.75);
        }

        .history-modal {
          width: min(720px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          background: #121216;
          border: 1px solid #303038;
          border-radius: 17px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 24px;
        }

        .modal-close {
          width: 34px;
          height: 34px;
          border: 1px solid #303038;
          border-radius: 8px;
          background: #1a1a20;
          color: #eeeeef;
          font-size: 20px;
          cursor: pointer;
        }

        .modal-score {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-top: 25px;
          padding: 18px;
          border: 1px solid #25252c;
          background: #18181d;
          border-radius: 13px;
        }

        .large-score {
          font-size: 40px;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .large-score span {
          font-size: 14px;
          color: #777781;
        }

        .modal-score strong {
          font-size: 14px;
        }

        .modal-score p,
        .modal-score small {
          display: block;
          margin: 4px 0 0;
          color: #85858f;
          font-size: 12px;
        }

        .modal-section {
          margin-top: 23px;
        }

        .modal-section h3 {
          margin: 0 0 9px;
          font-size: 13px;
        }

        .modal-section p {
          color: #9999a3;
          font-size: 13px;
          line-height: 1.7;
          margin: 0;
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .tag-list span {
          padding: 7px 10px;
          border: 1px solid #303038;
          background: #19191f;
          border-radius: 7px;
          color: #bdbdc5;
          font-size: 11px;
        }

        .recommendation-list {
          margin: 0;
          padding-left: 19px;
          color: #9999a3;
          font-size: 13px;
          line-height: 1.8;
        }

        .question-history {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .question-history-item {
          display: flex;
          gap: 12px;
          padding: 13px;
          background: #18181d;
          border-radius: 10px;
        }

        .question-number {
          font-size: 11px;
          font-weight: 700;
          color: #777781;
          min-width: 25px;
        }

        .question-history-item strong {
          display: block;
          color: #d5d5da;
          font-size: 12px;
          line-height: 1.5;
        }

        .question-history-item p {
          margin-top: 7px;
          font-size: 12px;
        }

        .answer-score {
          display: inline-block;
          margin-top: 5px;
          color: #aaaab3;
          font-size: 10px;
        }

        .modal-done-button {
          width: 100%;
          margin-top: 24px;
          padding: 11px;
          border: 0;
          border-radius: 9px;
          background: #eeeeef;
          color: #111115;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .history-list {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .history-page {
            padding: 20px 14px;
          }

          .history-header {
            flex-direction: column;
          }

          .history-header h1 {
            font-size: 27px;
          }

          .history-stats {
            grid-template-columns: 1fr;
          }

          .history-meta {
            grid-template-columns: 1fr;
          }

          .history-card-top {
            flex-direction: column;
          }

          .history-modal-overlay {
            padding: 10px;
          }

          .history-modal {
            padding: 18px;
          }
        }

      `}</style>
    </div>
  );
}
