import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebase";
import { setDemoUser } from "../../demoSession";
import Button from "../ui/Button";

export default function LoginForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = searchParams.get("returnTo") || "/profile";

  const [isRegister, setIsRegister] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = () => {
    navigate(returnTo);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) {
          await updateProfile(userCred.user, { displayName: displayName.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      handleSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      // With no real API key the Firebase SDK rejects the request outright, so point the
      // visitor at the demo path instead of showing a raw SDK error.
      if (msg.includes("api-key") || msg.includes("auth/invalid-api-key") || msg.includes("network")) {
        setError(
          "Firebase Auth is not configured in this environment. Use 'Continue as Demo Contributor' below to explore the book."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      handleSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google Sign-In failed.";
      if (msg.includes("api-key") || msg.includes("popup-closed") || msg.includes("network")) {
        setError(
          "Google sign-in is unavailable in this environment. Use 'Continue as Demo Contributor' below to explore the book."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    // Lets the whole flow be tested without real Firebase credentials. The API only
    // accepts these tokens while it is itself running without credentials.
    setDemoUser({
      displayName: displayName.trim() || "Elena Vance",
      email: email.trim() || "elena@example.com",
    });
    handleSuccess();
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "480px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-4xl)",
            letterSpacing: "-0.02em",
            color: "var(--color-ink)",
          }}
        >
          {isRegister ? "JOIN THE CHRONICLE" : "SIGN IN"}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-editorial)",
            fontStyle: "italic",
            fontSize: "var(--text-sm)",
            color: "var(--color-ink)",
            opacity: 0.8,
          }}
        >
          {isRegister
            ? "Create an identity to contribute your memories to the Endless Book."
            : "Sign in with your email or Google account to continue."}
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "var(--color-cream)",
            border: "var(--border-width) solid var(--color-ink)",
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xs)",
            color: "var(--color-accent)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Google Sign-In Outline Button with Google Logo */}
      <Button
        variant="outline"
        onClick={handleGoogleAuth}
        disabled={loading}
        style={{
          width: "100%",
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>CONTINUE WITH GOOGLE</span>
      </Button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div style={{ flex: 1, borderTop: "var(--border-thin) solid var(--color-ink)" }} />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xxs)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--color-ink)",
            opacity: 0.6,
          }}
        >
          OR WITH EMAIL
        </span>
        <div style={{ flex: 1, borderTop: "var(--border-thin) solid var(--color-ink)" }} />
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <AnimatePresence initial={false}>
          {isRegister && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
            >
              <label
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-xxs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-ink)",
                  opacity: 0.7,
                }}
              >
                AUTHOR DISPLAY NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Thomas Wolfe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={isRegister}
                className="editorial-input"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xxs)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-ink)",
              opacity: 0.7,
            }}
          >
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            placeholder="reader@endlessbook.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="editorial-input"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xxs)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-ink)",
              opacity: 0.7,
            }}
          >
            PASSWORD
          </label>
          <input
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="editorial-input"
          />
        </div>

        <Button
          type="submit"
          variant="filled"
          disabled={loading}
          style={{ width: "100%", padding: "1.1rem", fontSize: "var(--text-sm)" }}
        >
          {loading ? "VERIFYING..." : isRegister ? "CREATE ACCOUNT" : "SIGN IN"}
        </Button>
      </form>

      {/* Toggle Register / Login */}
      <div style={{ textAlign: "center", paddingTop: "0.5rem" }}>
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError(null);
          }}
          className="link-draw"
          style={{
            background: "none",
            border: "none",
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xs)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
            cursor: "pointer",
            color: "var(--color-ink)",
          }}
        >
          {isRegister
            ? "ALREADY HAVE AN ACCOUNT? SIGN IN"
            : "DON'T HAVE AN ACCOUNT? CREATE ONE"}
        </button>
      </div>

      {/* Demo Fallback Access */}
      <div
        style={{
          borderTop: "var(--border-thin) solid var(--color-rule)",
          paddingTop: "1rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <button
          type="button"
          onClick={handleDemoSignIn}
          style={{
            background: "none",
            border: "none",
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xxs)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--color-gold)",
            cursor: "pointer",
          }}
        >
          CONTINUE AS DEMO CONTRIBUTOR
        </button>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontSize: "var(--text-xxs)",
            color: "var(--color-ink)",
            opacity: 0.65,
          }}
        >
          Works without Firebase credentials, but contributions are only stored in memory
          by the local API.{" "}
          <Link to="/chapters" className="link-draw">
            Keep reading
          </Link>
          .
        </span>
      </div>
    </div>
  );
}
