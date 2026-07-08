import { LogIn, LogOut, Mail } from "lucide-react";
import { useState } from "react";
import type { AuthSessionState } from "../auth/supabaseAuthClient";

interface AuthPanelProps {
  session: AuthSessionState;
  onSendMagicLink: (email: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function AuthPanel({ session, onSendMagicLink, onSignOut }: AuthPanelProps) {
  const [email, setEmail] = useState(session.email ?? "");
  const [status, setStatus] = useState(
    session.isSignedIn ? `Signed in as ${session.email}` : "Supabase account not connected",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitMagicLink() {
    if (!email.trim()) {
      setStatus("Enter an email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSendMagicLink(email.trim());
      setStatus("Magic link sent");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Magic link failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signOut() {
    setIsSubmitting(true);
    try {
      await onSignOut();
      setStatus("Signed out");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sign out failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="content-panel auth-panel">
      <div className="section-heading">
        <Mail size={20} aria-hidden="true" />
        <h2>Supabase Account</h2>
      </div>

      {session.isSignedIn ? (
        <div className="auth-status-row">
          <p>{session.email}</p>
          <button type="button" className="secondary-action" onClick={signOut} disabled={isSubmitting}>
            <LogOut size={18} aria-hidden="true" />
            Sign out
          </button>
        </div>
      ) : (
        <div className="auth-form">
          <label className="text-control">
            <span>Email</span>
            <input
              aria-label="Supabase account email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="primary-action full-width-action"
            onClick={submitMagicLink}
            disabled={isSubmitting}
          >
            <LogIn size={18} aria-hidden="true" />
            Send magic link
          </button>
        </div>
      )}

      <p className="auth-status">{status}</p>
    </article>
  );
}
