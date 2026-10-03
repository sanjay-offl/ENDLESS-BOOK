import { useSyncExternalStore } from "react";
import { useAuth } from "./useAuth";
import { getDemoUser, subscribeToDemoUser } from "../demoSession";

export interface Contributor {
  uid: string;
  displayName: string;
  email: string;
  /** True when the identity is the offline demo contributor rather than a Firebase user. */
  isDemo: boolean;
  /** Bearer token for the API, or null when the demo contributor is signed in. */
  token: string | null;
}

export interface ContributorState {
  /** The signed-in contributor, or null when nobody is signed in. */
  contributor: Contributor | null;
  /** True while the Firebase session is still resolving. */
  loading: boolean;
}

/**
 * Resolves who is contributing, covering both a real Firebase session and the offline
 * demo contributor. Routes that require sign-in use this instead of reading localStorage
 * directly, so the same identity logic is applied everywhere.
 *
 * `loading` is reported separately from `contributor`: a redirect guard must wait while the
 * session resolves, otherwise it would send an authenticated reader back to the login page.
 */
export function useContributor(): ContributorState {
  const { user, token, loading } = useAuth();
  const demoUser = useSyncExternalStore(subscribeToDemoUser, getDemoUser, getDemoUser);

  if (loading) {
    return { contributor: null, loading: true };
  }

  if (user) {
    return {
      contributor: {
        uid: user.uid,
        displayName: user.displayName || user.email || "Contributor",
        email: user.email || "",
        isDemo: false,
        token,
      },
      loading: false,
    };
  }

  if (demoUser) {
    return {
      contributor: {
        // Matches the uid the API assigns to its offline auth mode.
        uid: "demo-user-1",
        displayName: demoUser.displayName,
        email: demoUser.email,
        isDemo: true,
        token: null,
      },
      loading: false,
    };
  }

  return { contributor: null, loading: false };
}
