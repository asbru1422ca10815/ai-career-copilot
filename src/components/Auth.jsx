import { useState } from "react";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  FileText,
  Target,
  BriefcaseBusiness,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";

function Auth({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (data?.user) {
          if (data.session) {
            onLogin(data.user);
          } else {
            setSuccess(
              "Account created. Please check your email to confirm your account."
            );
          }
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) {
          setError(error.message);
          return;
        }

        if (data?.user) {
          onLogin(data.user);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsSignUp((value) => !value);

    setEmail("");
    setPassword("");

    setError("");
    setSuccess("");
  }

  async function handleForgotPassword() {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}`,
          }
        );

      if (error) {
        setError(error.message);
      } else {
        setSuccess(
          "Password reset email sent. Check your inbox."
        );
      }
    } catch (err) {
      console.error(err);
      setError("Unable to send password reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dark-auth-page">

      {/* Background effects */}

      <div className="auth-bg-glow auth-bg-glow-one"></div>
      <div className="auth-bg-glow auth-bg-glow-two"></div>

      <div className="auth-background-grid"></div>


      {/* Main container */}

      <div className="dark-auth-container">

        {/* ================= BRAND ================= */}

        <div className="dark-auth-brand">

          <div className="dark-brand-icon">
            <Sparkles size={22} />
          </div>

          <div>
            <h1>Career Copilot</h1>
            <span>AI Career Assistant</span>
          </div>

        </div>


        {/* ================= LOGIN CARD ================= */}

        <div className="dark-auth-card">

          {/* Top glow */}

          <div className="card-top-glow"></div>


          {/* Header */}

          <div className="dark-auth-header">

            <div className="auth-title-icon">
              <Sparkles size={19} />
            </div>

            <h2>
              {isSignUp
                ? "Create your account"
                : "Welcome back"}
            </h2>

            <p>
              {isSignUp
                ? "Start your AI-powered career journey."
                : "Continue your career journey with AI."}
            </p>

          </div>


          {/* Small feature row */}

          <div className="auth-mini-features">

            <div>
              <FileText size={13} />
              <span>Resume AI</span>
            </div>

            <div>
              <Target size={13} />
              <span>Skill Analysis</span>
            </div>

            <div>
              <BriefcaseBusiness size={13} />
              <span>Job Matching</span>
            </div>

          </div>


          {/* Form */}

          <form
            className="dark-auth-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="dark-field">

              <label htmlFor="auth-email">
                Email address
              </label>

              <div className="dark-input-wrapper">

                <Mail
                  size={18}
                  className="dark-input-icon"
                />

                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="dark-field">

              <div className="dark-password-header">

                <label htmlFor="auth-password">
                  Password
                </label>

                {!isSignUp && (
                  <button
                    type="button"
                    className="dark-forgot"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                )}

              </div>

              <div className="dark-input-wrapper">

                <Lock
                  size={18}
                  className="dark-input-icon"
                />

                <input
                  id="auth-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete={
                    isSignUp
                      ? "new-password"
                      : "current-password"
                  }
                />

                <button
                  type="button"
                  className="dark-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>


            {/* ERROR */}

            {error && (
              <div className="dark-message dark-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}


            {/* SUCCESS */}

            {success && (
              <div className="dark-message dark-success">
                <ShieldCheck size={17} />
                <p>{success}</p>
              </div>
            )}


            {/* BUTTON */}

            <button
              type="submit"
              className="dark-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="dark-spinner"></span>

                  {isSignUp
                    ? "Creating account..."
                    : "Signing in..."}
                </>
              ) : (
                <>
                  {isSignUp
                    ? "Create account"
                    : "Sign in"}

                  <ArrowRight size={18} />
                </>
              )}

            </button>

          </form>


          {/* Switch */}

          <div className="dark-auth-switch">

            <span>
              {isSignUp
                ? "Already have an account?"
                : "Don't have an account?"}
            </span>

            <button
              type="button"
              onClick={switchMode}
            >
              {isSignUp
                ? "Sign in"
                : "Create account"}
            </button>

          </div>


          {/* Security */}

          <div className="dark-security">

            <ShieldCheck size={14} />

            <span>
              Secure authentication powered by Supabase
            </span>

          </div>

        </div>


        {/* Bottom */}

        <div className="dark-auth-footer">

          <span>© 2026 Career Copilot</span>

          <span className="footer-dot">•</span>

          <span>AI-powered career growth</span>

        </div>

      </div>

    </div>
  );
}

export default Auth;