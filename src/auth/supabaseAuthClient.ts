import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

export interface AuthSessionState {
  user: User | null;
  email: string | null;
  isSignedIn: boolean;
}

export interface SupabaseAuthClient {
  getSessionState(): Promise<AuthSessionState>;
  getAccessToken(): Promise<string | null>;
  sendMagicLink(email: string, redirectTo: string): Promise<void>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (state: AuthSessionState) => void): () => void;
}

function toSessionState(session: Session | null): AuthSessionState {
  return {
    user: session?.user ?? null,
    email: session?.user.email ?? null,
    isSignedIn: Boolean(session?.user),
  };
}

function throwIfSupabaseError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

export function createSupabaseAuthClient(client: SupabaseClient): SupabaseAuthClient {
  return {
    async getSessionState() {
      const { data, error } = await client.auth.getSession();
      throwIfSupabaseError(error);
      return toSessionState(data.session);
    },

    async getAccessToken() {
      const { data, error } = await client.auth.getSession();
      throwIfSupabaseError(error);
      return data.session?.access_token ?? null;
    },

    async sendMagicLink(email, redirectTo) {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      throwIfSupabaseError(error);
    },

    async signOut() {
      const { error } = await client.auth.signOut();
      throwIfSupabaseError(error);
    },

    onAuthStateChange(callback) {
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        callback(toSessionState(session));
      });

      return () => data.subscription.unsubscribe();
    },
  };
}
