import { useState } from "react";
import { supabase } from "../lib/supabase";

const INTERVIEW_TYPES = [
  {
    id: "technical",
    icon: "💻",
    title: "Technical Interview",
    description:
      "Practice technical questions based on your skills, projects and target role.",
  },
  {
    id: "hr",
    icon: "👤",
    title: "HR Interview",
    description:
      "Practice common HR and behavioral interview questions.",
  },
  {
    id: "mixed",
    icon: "🤖",
    title: "AI Mixed Interview",
    description:
      "A combination of technical, HR and project-based questions.",
  },
];

const DIFFICULTIES = [
  {
    id: "beginner",
    title: "Beginner",
    description: "Fundamental questions",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "Job-ready questions",
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Challenging questions",
  },
];

function getScoreClass(score) {
  if (score >= 80) return "score-good";
  if (score >= 60) return "score-medium";
  return "score-low";
}

function getScoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Improvement";
  return "Needs More Practice";
}

function safeArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(Boolean);
}

function normalizeQuestion(data) {
  const question =
    data?.question ??
    data?.interview_question ??
    data?.current_question ??
    "";

  return {
    question: String(question),

    category: String(
      data?.category ??
        data?.question_category ??
        "Technical",
    ),

    difficulty: String(
      data?.difficulty ??
        "Intermediate",
    ),

    question_number: Number(
      data?.question_number ??
        1,
    ),

    total_questions: Number(
      data?.total_questions ??
        5,
    ),
  };
}

function normalizeEvaluation(data) {
  let score = Number(
    data?.score ??
      data?.answer_score ??
      data?.overall_score ??
      0,
  );

  if (Number.isNaN(score)) {
    score = 0;
  }

  score = Math.max(
    0,
    Math.min(
      100,
      Math.round(score),
    ),
  );

  return {
    score,

    overall_feedback: String(
      data?.overall_feedback ??
        data?.feedback ??
        data?.summary ??
        "",
    ),

    strengths: safeArray(
      data?.strengths,
    ),

    improvements: safeArray(
      data?.improvements ??
        data?.areas_to_improve,
    ),

    ideal_answer: String(
      data?.ideal_answer ??
        data?.better_answer ??
        "",
    ),

    tips: safeArray(
      data?.tips ??
        data?.recommendations,
    ),
  };
}

function normalizeFinalResult(data) {
  let score = Number(
    data?.overall_score ??
      data?.final_score ??
      data?.score ??
      0,
  );

  if (Number.isNaN(score)) {
    score = 0;
  }

  score = Math.max(
    0,
    Math.min(
      100,
      Math.round(score),
    ),
  );

  return {
    overall_score: score,

    summary: String(
      data?.summary ??
        data?.overall_feedback ??
        "",
    ),

    strengths: safeArray(
      data?.strengths,
    ),

    improvements: safeArray(
      data?.improvements ??
        data?.areas_to_improve,
    ),

    recommendations: safeArray(
      data?.recommendations ??
        data?.next_steps,
    ),

    questions_answered: Number(
      data?.questions_answered ??
        data?.total_questions ??
        0,
    ),
  };
}

export default function MockInterview() {
  const [stage, setStage] =
    useState("setup");

  const [interviewType, setInterviewType] =
    useState("mixed");

  const [difficulty, setDifficulty] =
    useState("intermediate");

  const [questionCount, setQuestionCount] =
    useState(5);

  const [question, setQuestion] =
    useState(null);

  const [answer, setAnswer] =
    useState("");

  const [evaluation, setEvaluation] =
    useState(null);

  const [finalResult, setFinalResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [saveStatus, setSaveStatus] =
    useState("");

  const [questionNumber, setQuestionNumber] =
    useState(1);

  const [answers, setAnswers] =
    useState([]);

  async function callInterview(action, extra = {}) {
    const {
      data,
      error: functionError,
    } =
      await supabase.functions.invoke(
        "dynamic-service",
        {
          body: {
            action,
            interview_type:
              interviewType,
            difficulty,
            question_count:
              questionCount,
            question_number:
              questionNumber,
            ...extra,
          },
        },
      );

    if (functionError) {
      throw new Error(
        functionError.message ||
          "Unable to connect to AI interview service.",
      );
    }

    if (!data) {
      throw new Error(
        "No response received from AI interview service.",
      );
    }

    if (
      data.success === false
    ) {
      throw new Error(
        data.error ||
          data.message ||
          "AI interview request failed.",
      );
    }

    return data;
  }

  async function handleStartInterview() {
    setLoading(true);
    setError("");
    setSaveStatus("");
    setAnswer("");
    setEvaluation(null);
    setFinalResult(null);
    setAnswers([]);
    setQuestionNumber(1);

    try {
      const data =
        await callInterview(
          "start-interview",
        );

      const rawQuestion =
        data.question ??
        data.analysis ??
        data;

      const normalized =
        normalizeQuestion(
          rawQuestion,
        );

      if (!normalized.question) {
        throw new Error(
          "AI did not return an interview question.",
        );
      }

      setQuestion(
        normalized,
      );

      setStage("question");
    } catch (err) {
      console.error(
        "Start interview error:",
        err,
      );

      setError(
        err.message ||
          "Unable to start interview.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!answer.trim()) {
      setError(
        "Please enter your answer before submitting.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data =
        await callInterview(
          "evaluate-answer",
          {
            question:
              question?.question ??
              "",

            answer:
              answer.trim(),
          },
        );

      const rawEvaluation =
        data.evaluation ??
        data.analysis ??
        data;

      const normalized =
        normalizeEvaluation(
          rawEvaluation,
        );

      setEvaluation(
        normalized,
      );

      setAnswers(
        (previous) => [
          ...previous,
          {
            question:
              question?.question ??
              "",
            answer:
              answer.trim(),
            score:
              normalized.score,
          },
        ],
      );

      setStage("feedback");
    } catch (err) {
      console.error(
        "Answer evaluation error:",
        err,
      );

      setError(
        err.message ||
          "Unable to evaluate your answer.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleNextQuestion() {
    if (
      questionNumber >=
      questionCount
    ) {
      await handleFinishInterview();
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");
    setEvaluation(null);

    const nextNumber =
      questionNumber + 1;

    try {
      const data =
        await callInterview(
          "next-question",
          {
            previous_question:
              question?.question ??
              "",

            previous_answer:
              answer.trim(),

            previous_score:
              evaluation?.score ??
              0,

            question_number:
              nextNumber,
          },
        );

      const rawQuestion =
        data.question ??
        data.analysis ??
        data;

      const normalized =
        normalizeQuestion(
          rawQuestion,
        );

      if (!normalized.question) {
        throw new Error(
          "AI did not return the next interview question.",
        );
      }

      setQuestionNumber(
        nextNumber,
      );

      setQuestion(
        normalized,
      );

      setStage("question");
    } catch (err) {
      console.error(
        "Next question error:",
        err,
      );

      setError(
        err.message ||
          "Unable to generate the next question.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleFinishInterview() {
    setLoading(true);
    setError("");
    setSaveStatus("");

    try {
      const data =
        await callInterview(
          "finish-interview",
          {
            interview_answers:
              answers,

            latest_score:
              evaluation?.score ??
              0,
          },
        );

      const rawResult =
        data.final_result ??
        data.analysis ??
        data;

      const normalized =
        normalizeFinalResult(
          rawResult,
        );

      if (
        normalized.questions_answered ===
        0
      ) {
        normalized.questions_answered =
          answers.length;
      }

      setFinalResult(
        normalized,
      );

      /*
       * Save the completed interview to Supabase.
       * The RLS policy only allows the logged-in
       * user to insert their own record.
       */
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(
          userError.message ||
            "Unable to identify the logged-in user.",
        );
      }

      const user = userData?.user;

      if (!user) {
        throw new Error(
          "Your session has expired. Please log in again.",
        );
      }

      const {
        error: saveError,
      } = await supabase
        .from("mock_interviews")
        .insert({
          user_id: user.id,
          interview_type: interviewType,
          difficulty,
          question_count: questionCount,
          overall_score:
            normalized.overall_score,
          summary:
            normalized.summary,
          strengths:
            normalized.strengths,
          improvements:
            normalized.improvements,
          recommendations:
            normalized.recommendations,
          interview_answers:
            answers,
        });

      if (saveError) {
        console.error(
          "Mock interview save error:",
          saveError,
        );

        throw new Error(
          saveError.message ||
            "Interview completed, but it could not be saved.",
        );
      }

      setSaveStatus(
        "Interview saved successfully to your career history.",
      );

      setStage("complete");
    } catch (err) {
      console.error(
        "Finish interview error:",
        err,
      );

      setError(
        err.message ||
          "Unable to generate or save the final interview report.",
      );

      /*
       * If the AI report was already created before
       * the database save failed, still show the
       * final report instead of losing the result.
       */
      if (finalResult) {
        setStage("complete");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleRestart() {
    setStage("setup");
    setQuestion(null);
    setAnswer("");
    setEvaluation(null);
    setFinalResult(null);
    setError("");
    setSaveStatus("");
    setQuestionNumber(1);
    setAnswers([]);
  }

  return (
    <div className="mock-interview-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mock-header">

        <div>

          <div className="mock-eyebrow">
            AI CAREER COPILOT
          </div>

          <h1>
            AI Mock Interview
          </h1>

          <p>
            Practice personalized interview questions
            based on your resume and career profile.
          </p>

        </div>

        {stage !== "setup" &&
          stage !== "complete" && (
            <div className="mock-progress">

              <span>
                Question {questionNumber}
                {" / "}
                {questionCount}
              </span>

              <div className="mock-progress-track">
                <div
                  className="mock-progress-fill"
                  style={{
                    width: `${
                      (questionNumber /
                        questionCount) *
                      100
                    }%`,
                  }}
                />
              </div>

            </div>
          )}

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mock-error">

          <span>
            ⚠️
          </span>

          <div>
            {error}
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>
      )}

      {/* =================================================
          SETUP
      ================================================= */}

      {stage === "setup" && (
        <div className="mock-setup">

          <div className="mock-section-title">
            <span className="mock-section-icon">
              🎯
            </span>

            <div>
              <h2>
                Configure your interview
              </h2>

              <p>
                Choose the interview format and
                difficulty level.
              </p>
            </div>
          </div>

          {/* Interview Type */}

          <div className="mock-field">

            <label>
              Interview Type
            </label>

            <div className="interview-type-grid">

              {INTERVIEW_TYPES.map(
                (type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={`interview-type-card ${
                      interviewType ===
                      type.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setInterviewType(
                        type.id,
                      )
                    }
                  >

                    <div className="type-icon">
                      {type.icon}
                    </div>

                    <div className="type-content">

                      <h3>
                        {type.title}
                      </h3>

                      <p>
                        {type.description}
                      </p>

                    </div>

                    <div className="selection-indicator">
                      {interviewType ===
                      type.id
                        ? "✓"
                        : ""}
                    </div>

                  </button>
                ),
              )}

            </div>

          </div>

          {/* Difficulty */}

          <div className="mock-field">

            <label>
              Difficulty
            </label>

            <div className="difficulty-grid">

              {DIFFICULTIES.map(
                (item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`difficulty-card ${
                      difficulty ===
                      item.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setDifficulty(
                        item.id,
                      )
                    }
                  >

                    <strong>
                      {item.title}
                    </strong>

                    <span>
                      {item.description}
                    </span>

                  </button>
                ),
              )}

            </div>

          </div>

          {/* Question Count */}

          <div className="mock-field">

            <label>
              Number of Questions
            </label>

            <div className="question-count-row">

              {[5, 7, 10].map(
                (count) => (
                  <button
                    key={count}
                    type="button"
                    className={`question-count-button ${
                      questionCount ===
                      count
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setQuestionCount(
                        count,
                      )
                    }
                  >
                    {count}
                  </button>
                ),
              )}

            </div>

          </div>

          {/* Start */}

          <button
            type="button"
            className="start-interview-button"
            onClick={
              handleStartInterview
            }
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="button-spinner" />
                Preparing Interview...
              </>
            ) : (
              <>
                🎤
                Start AI Interview
              </>
            )}

          </button>

          <div className="mock-info-box">

            <span>
              💡
            </span>

            <p>
              Your questions will be personalized
              using the latest resume analysis stored
              in your AI Career Copilot profile.
            </p>

          </div>

        </div>
      )}

      {/* =================================================
          QUESTION
      ================================================= */}

      {stage === "question" &&
        question && (
          <div className="question-stage">

            <div className="question-meta">

              <span className="question-category">
                {question.category}
              </span>

              <span className="question-difficulty">
                {question.difficulty}
              </span>

            </div>

            <div className="question-card">

              <div className="question-number">
                Q{questionNumber}
              </div>

              <h2>
                {question.question}
              </h2>

            </div>

            <div className="answer-card">

              <div className="answer-header">

                <div>
                  <h3>
                    Your Answer
                  </h3>

                  <p>
                    Explain your answer clearly
                    and give examples when possible.
                  </p>
                </div>

                <span className="answer-counter">
                  {answer.length}
                  {" / 3000"}
                </span>

              </div>

              <textarea
                value={answer}
                onChange={(event) =>
                  setAnswer(
                    event.target.value.slice(
                      0,
                      3000,
                    ),
                  )
                }
                placeholder="Type your answer here..."
                rows={9}
                disabled={loading}
              />

              <div className="answer-actions">

                <span>
                  💬 Take your time and answer
                  naturally.
                </span>

                <button
                  type="button"
                  onClick={
                    handleSubmitAnswer
                  }
                  disabled={
                    loading ||
                    !answer.trim()
                  }
                >
                  {loading ? (
                    <>
                      <span className="button-spinner" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      Submit Answer →
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =================================================
          FEEDBACK
      ================================================= */}

      {stage === "feedback" &&
        evaluation && (
          <div className="feedback-stage">

            <div className="feedback-top">

              <div>

                <span className="mock-eyebrow">
                  AI EVALUATION
                </span>

                <h2>
                  Your answer has been evaluated
                </h2>

              </div>

              <div
                className={`answer-score ${getScoreClass(
                  evaluation.score,
                )}`}
              >

                <strong>
                  {evaluation.score}
                </strong>

                <span>
                  / 100
                </span>

                <small>
                  {getScoreLabel(
                    evaluation.score,
                  )}
                </small>

              </div>

            </div>

            {/* Feedback */}

            <div className="feedback-card">

              <div className="feedback-card-title">
                <span>
                  🤖
                </span>

                <h3>
                  AI Feedback
                </h3>
              </div>

              <p>
                {evaluation.overall_feedback ||
                  "Good effort. Continue practicing to improve your interview performance."}
              </p>

            </div>

            {/* Strengths */}

            {evaluation.strengths.length >
              0 && (
              <div className="feedback-card">

                <div className="feedback-card-title">
                  <span>
                    ✅
                  </span>

                  <h3>
                    What You Did Well
                  </h3>
                </div>

                <ul>
                  {evaluation.strengths.map(
                    (
                      item,
                      index,
                    ) => (
                      <li key={index}>
                        {item}
                      </li>
                    ),
                  )}
                </ul>

              </div>
            )}

            {/* Improvements */}

            {evaluation.improvements
              .length > 0 && (
              <div className="feedback-card">

                <div className="feedback-card-title">
                  <span>
                    📈
                  </span>

                  <h3>
                    Areas to Improve
                  </h3>
                </div>

                <ul>
                  {evaluation.improvements.map(
                    (
                      item,
                      index,
                    ) => (
                      <li key={index}>
                        {item}
                      </li>
                    ),
                  )}
                </ul>

              </div>
            )}

            {/* Ideal Answer */}

            {evaluation.ideal_answer && (
              <div className="feedback-card ideal-answer-card">

                <div className="feedback-card-title">
                  <span>
                    💡
                  </span>

                  <h3>
                    Stronger Answer Example
                  </h3>
                </div>

                <p>
                  {evaluation.ideal_answer}
                </p>

              </div>
            )}

            {/* Tips */}

            {evaluation.tips.length >
              0 && (
              <div className="feedback-card">

                <div className="feedback-card-title">
                  <span>
                    🚀
                  </span>

                  <h3>
                    Interview Tips
                  </h3>

                </div>

                <ul>
                  {evaluation.tips.map(
                    (
                      item,
                      index,
                    ) => (
                      <li key={index}>
                        {item}
                      </li>
                    ),
                  )}
                </ul>

              </div>
            )}

            {/* Actions */}

            <div className="feedback-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setStage("question");
                  setEvaluation(null);
                }}
              >
                ← Review Answer
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={
                  handleNextQuestion
                }
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="button-spinner" />
                    Preparing...
                  </>
                ) : questionNumber >=
                  questionCount ? (
                  <>
                    Finish Interview →
                  </>
                ) : (
                  <>
                    Next Question →
                  </>
                )}
              </button>

            </div>

          </div>
        )}

      {/* =================================================
          COMPLETE
      ================================================= */}

      {stage === "complete" &&
        finalResult && (
          <div className="complete-stage">

            <div className="completion-hero">

              <div className="completion-icon">
                🏆
              </div>

              <span className="mock-eyebrow">
                INTERVIEW COMPLETE
              </span>

              <h2>
                Great work!
              </h2>

              <p>
                Here is your personalized AI
                interview performance report.
              </p>

            </div>

            {saveStatus && (
              <div className="mock-save-success">
                <span>✓</span>
                <div>{saveStatus}</div>
              </div>
            )}

            {/* Final Score */}

            <div className="final-score-card">

              <div className="final-score-circle">

                <strong>
                  {finalResult.overall_score}
                </strong>

                <span>
                  /100
                </span>

              </div>

              <div className="final-score-info">

                <span>
                  Overall Interview Score
                </span>

                <h3>
                  {getScoreLabel(
                    finalResult.overall_score,
                  )}
                </h3>

                <p>
                  {finalResult.summary ||
                    "Keep practicing and continue improving your interview skills."}
                </p>

              </div>

            </div>

            {/* Strengths */}

            {finalResult.strengths
              .length > 0 && (
              <div className="feedback-card">

                <div className="feedback-card-title">
                  <span>
                    🌟
                  </span>

                  <h3>
                    Your Strengths
                  </h3>
                </div>

                <ul>
                  {finalResult.strengths.map(
                    (
                      item,
                      index,
                    ) => (
                      <li key={index}>
                        {item}
                      </li>
                    ),
                  )}
                </ul>

              </div>
            )}

            {/* Improvements */}

            {finalResult.improvements
              .length > 0 && (
              <div className="feedback-card">

                <div className="feedback-card-title">
                  <span>
                    📚
                  </span>

                  <h3>
                    Focus Areas
                  </h3>
                </div>

                <ul>
                  {finalResult.improvements.map(
                    (
                      item,
                      index,
                    ) => (
                      <li key={index}>
                        {item}
                      </li>
                    ),
                  )}
                </ul>

              </div>
            )}

            {/* Recommendations */}

            {finalResult
              .recommendations.length >
              0 && (
              <div className="feedback-card">

                <div className="feedback-card-title">
                  <span>
                    🚀
                  </span>

                  <h3>
                    Next Steps
                  </h3>

                </div>

                <ul>
                  {finalResult.recommendations.map(
                    (
                      item,
                      index,
                    ) => (
                      <li key={index}>
                        {item}
                      </li>
                    ),
                  )}
                </ul>

              </div>
            )}

            <div className="completion-actions">

              <button
                type="button"
                className="primary-button"
                onClick={
                  handleRestart
                }
              >
                🔄 Start New Interview
              </button>

            </div>

          </div>
        )}

      {/* =================================================
          INLINE STYLES
      ================================================= */}

      <style>{`
        .mock-interview-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 10px 4px 50px;
          color: #f4f4f5;
        }

        .mock-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          margin-bottom: 30px;
        }

        .mock-eyebrow {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.8px;
          color: #8b8b96;
          margin-bottom: 9px;
        }

        .mock-header h1 {
          margin: 0;
          font-size: 34px;
          line-height: 1.15;
          font-weight: 750;
          letter-spacing: -1px;
        }

        .mock-header p {
          margin: 10px 0 0;
          color: #9999a5;
          font-size: 14px;
          line-height: 1.6;
          max-width: 650px;
        }

        .mock-progress {
          width: 220px;
          flex-shrink: 0;
        }

        .mock-progress > span {
          display: block;
          text-align: right;
          font-size: 12px;
          color: #a1a1aa;
          margin-bottom: 8px;
        }

        .mock-progress-track {
          width: 100%;
          height: 5px;
          background: #25252d;
          border-radius: 999px;
          overflow: hidden;
        }

        .mock-progress-fill {
          height: 100%;
          background: #f4f4f5;
          border-radius: 999px;
          transition: width .3s ease;
        }

        .mock-error {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 15px;
          margin-bottom: 20px;
          border: 1px solid #4a2929;
          background: #211719;
          border-radius: 12px;
          color: #f0b5b5;
          font-size: 13px;
        }

        .mock-error button {
          margin-left: auto;
          background: none;
          border: 0;
          color: #aaa;
          font-size: 20px;
          cursor: pointer;
        }

        .mock-setup,
        .question-stage,
        .feedback-stage,
        .complete-stage {
          background: #111116;
          border: 1px solid #25252d;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 18px 50px rgba(0,0,0,.16);
        }

        .mock-section-title {
          display: flex;
          gap: 15px;
          align-items: center;
          padding-bottom: 25px;
          border-bottom: 1px solid #24242c;
          margin-bottom: 28px;
        }

        .mock-section-icon {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #1d1d25;
          font-size: 21px;
        }

        .mock-section-title h2 {
          margin: 0 0 5px;
          font-size: 20px;
        }

        .mock-section-title p {
          margin: 0;
          color: #888893;
          font-size: 13px;
        }

        .mock-field {
          margin-bottom: 28px;
        }

        .mock-field > label {
          display: block;
          margin-bottom: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #d5d5da;
        }

        .interview-type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .interview-type-card {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 13px;
          text-align: left;
          padding: 17px;
          min-height: 130px;
          background: #17171d;
          border: 1px solid #292931;
          border-radius: 14px;
          color: #eee;
          cursor: pointer;
          transition: .2s ease;
        }

        .interview-type-card:hover {
          border-color: #44444e;
          transform: translateY(-1px);
        }

        .interview-type-card.selected {
          border-color: #8b8b96;
          background: #1d1d24;
        }

        .type-icon {
          font-size: 24px;
        }

        .type-content h3 {
          margin: 0 0 7px;
          font-size: 14px;
        }

        .type-content p {
          margin: 0;
          color: #8f8f9a;
          font-size: 12px;
          line-height: 1.55;
        }

        .selection-indicator {
          position: absolute;
          top: 12px;
          right: 13px;
          width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f4f4f5;
          color: #111;
          font-size: 12px;
          font-weight: 800;
        }

        .difficulty-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .difficulty-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
          padding: 15px;
          background: #17171d;
          border: 1px solid #292931;
          border-radius: 12px;
          color: #ddd;
          text-align: left;
          cursor: pointer;
        }

        .difficulty-card.selected {
          border-color: #777782;
          background: #1d1d24;
        }

        .difficulty-card strong {
          font-size: 13px;
        }

        .difficulty-card span {
          color: #858590;
          font-size: 11px;
        }

        .question-count-row {
          display: flex;
          gap: 10px;
        }

        .question-count-button {
          width: 60px;
          height: 42px;
          border: 1px solid #292931;
          background: #17171d;
          color: #bbb;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .question-count-button.selected {
          background: #f4f4f5;
          color: #111;
          border-color: #f4f4f5;
        }

        .start-interview-button,
        .primary-button {
          width: 100%;
          border: 0;
          background: #f4f4f5;
          color: #111;
          border-radius: 11px;
          min-height: 48px;
          padding: 0 20px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }

        .start-interview-button:disabled,
        .primary-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .mock-info-box {
          display: flex;
          gap: 10px;
          margin-top: 16px;
          padding: 13px 15px;
          background: #17171d;
          border: 1px solid #25252d;
          border-radius: 11px;
        }

        .mock-info-box p {
          margin: 0;
          color: #858590;
          font-size: 12px;
          line-height: 1.6;
        }

        .question-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 15px;
        }

        .question-category,
        .question-difficulty {
          padding: 6px 10px;
          border-radius: 999px;
          background: #202027;
          color: #b7b7c0;
          font-size: 11px;
          font-weight: 700;
        }

        .question-card {
          padding: 30px;
          border: 1px solid #292931;
          background: #17171d;
          border-radius: 16px;
          margin-bottom: 15px;
        }

        .question-number {
          color: #777782;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .question-card h2 {
          margin: 0;
          font-size: 24px;
          line-height: 1.45;
          letter-spacing: -.3px;
        }

        .answer-card {
          border: 1px solid #292931;
          background: #141419;
          border-radius: 16px;
          padding: 20px;
        }

        .answer-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 13px;
        }

        .answer-header h3 {
          margin: 0 0 5px;
          font-size: 14px;
        }

        .answer-header p {
          margin: 0;
          color: #777782;
          font-size: 12px;
        }

        .answer-counter {
          color: #666672;
          font-size: 11px;
          white-space: nowrap;
        }

        .answer-card textarea {
          width: 100%;
          box-sizing: border-box;
          resize: vertical;
          min-height: 190px;
          padding: 15px;
          border: 1px solid #292931;
          background: #0e0e12;
          border-radius: 11px;
          color: #eee;
          outline: none;
          font-family: inherit;
          font-size: 13px;
          line-height: 1.7;
        }

        .answer-card textarea:focus {
          border-color: #55555f;
        }

        .answer-card textarea::placeholder {
          color: #555560;
        }

        .answer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-top: 14px;
        }

        .answer-actions > span {
          color: #696974;
          font-size: 11px;
        }

        .answer-actions button,
        .secondary-button {
          min-height: 43px;
          padding: 0 17px;
          border-radius: 10px;
          border: 1px solid #303039;
          background: #1c1c23;
          color: #eee;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
        }

        .answer-actions button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .feedback-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 25px;
          margin-bottom: 22px;
        }

        .feedback-top h2 {
          margin: 0;
          font-size: 22px;
        }

        .answer-score {
          min-width: 110px;
          padding: 14px 17px;
          border: 1px solid #303039;
          border-radius: 14px;
          text-align: center;
          background: #18181f;
        }

        .answer-score strong {
          font-size: 31px;
        }

        .answer-score > span {
          color: #777782;
          font-size: 12px;
        }

        .answer-score small {
          display: block;
          margin-top: 3px;
          color: #9999a3;
          font-size: 10px;
          font-weight: 700;
        }

        .score-good {
          border-color: #435246;
        }

        .score-medium {
          border-color: #514b39;
        }

        .score-low {
          border-color: #543d3d;
        }

        .feedback-card {
          padding: 20px;
          margin-bottom: 13px;
          background: #17171d;
          border: 1px solid #292931;
          border-radius: 14px;
        }

        .feedback-card-title {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 12px;
        }

        .feedback-card-title h3 {
          margin: 0;
          font-size: 14px;
        }

        .feedback-card p {
          margin: 0;
          color: #aaaab3;
          font-size: 13px;
          line-height: 1.75;
        }

        .feedback-card ul {
          margin: 0;
          padding-left: 20px;
        }

        .feedback-card li {
          color: #aaaab3;
          font-size: 13px;
          line-height: 1.65;
          margin-bottom: 7px;
        }

        .ideal-answer-card {
          border-color: #38383f;
        }

        .feedback-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .feedback-actions .primary-button {
          width: auto;
          min-width: 160px;
        }

        .feedback-actions .secondary-button {
          background: transparent;
        }

        .completion-hero {
          text-align: center;
          padding: 20px 0 30px;
        }

        .completion-icon {
          width: 68px;
          height: 68px;
          display: grid;
          place-items: center;
          margin: 0 auto 17px;
          background: #202027;
          border-radius: 20px;
          font-size: 31px;
        }

        .completion-hero h2 {
          margin: 0;
          font-size: 28px;
        }

        .completion-hero p {
          margin: 9px auto 0;
          color: #858590;
          font-size: 13px;
        }

        .final-score-card {
          display: flex;
          align-items: center;
          gap: 25px;
          padding: 24px;
          margin-bottom: 15px;
          background: #18181f;
          border: 1px solid #2c2c34;
          border-radius: 16px;
        }

        .final-score-circle {
          width: 110px;
          height: 110px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 5px solid #45454e;
          border-radius: 50%;
        }

        .final-score-circle strong {
          font-size: 29px;
          line-height: 1;
        }

        .final-score-circle span {
          color: #777782;
          font-size: 10px;
          margin-top: 3px;
        }

        .final-score-info > span {
          color: #777782;
          font-size: 11px;
        }

        .final-score-info h3 {
          margin: 5px 0 7px;
          font-size: 18px;
        }

        .final-score-info p {
          margin: 0;
          color: #9a9aa4;
          font-size: 13px;
          line-height: 1.65;
        }

        .mock-save-success {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: fit-content;
          max-width: 100%;
          margin: 0 auto 18px;
          padding: 10px 14px;
          border: 1px solid #303039;
          background: #17171d;
          border-radius: 10px;
          color: #b8b8c2;
          font-size: 12px;
          line-height: 1.5;
          text-align: center;
        }

        .mock-save-success span {
          display: grid;
          place-items: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f4f4f5;
          color: #111;
          font-size: 11px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .completion-actions {
          margin-top: 20px;
        }

        .completion-actions .primary-button {
          max-width: 240px;
          margin: 0 auto;
        }

        .button-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid #777;
          border-top-color: transparent;
          border-radius: 50%;
          animation: mock-spin .7s linear infinite;
        }

        @keyframes mock-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 800px) {
          .mock-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .mock-progress {
            width: 100%;
          }

          .mock-progress > span {
            text-align: left;
          }

          .interview-type-grid,
          .difficulty-grid {
            grid-template-columns: 1fr;
          }

          .mock-setup,
          .question-stage,
          .feedback-stage,
          .complete-stage {
            padding: 20px;
          }
        }

        @media (max-width: 560px) {
          .mock-header h1 {
            font-size: 27px;
          }

          .question-card h2 {
            font-size: 19px;
          }

          .answer-actions,
          .feedback-top,
          .final-score-card {
            flex-direction: column;
            align-items: stretch;
          }

          .answer-actions button {
            width: 100%;
          }

          .feedback-actions {
            flex-direction: column;
          }

          .feedback-actions .primary-button,
          .feedback-actions .secondary-button {
            width: 100%;
          }

          .final-score-circle {
            margin: 0 auto;
          }

          .final-score-info {
            text-align: center;
          }
        }
      `}</style>

    </div>
  );
}