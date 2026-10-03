/**
 * Access for the offline demo contributor.
 *
 * The demo sign-in button stores a profile in localStorage instead of creating a real
 * Firebase user. Because that write happens outside React, the value is published through
 * a tiny store so subscribed components re-render the moment it changes, and a redirect
 * guard can never act on a stale "signed out" read.
 */
const STORAGE_KEY = "endless_book_demo_user";

export interface DemoUser {
  displayName: string;
  email: string;
}

const listeners = new Set<() => void>();
let snapshot: DemoUser | null | undefined;

function read(): DemoUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DemoUser>;
    return {
      displayName: parsed.displayName || "Elena Vance",
      email: parsed.email || "elena@example.com",
    };
  } catch {
    // Corrupted or unreadable storage is treated as "not signed in".
    return null;
  }
}

/** Returns the cached demo profile, reading storage on first use. */
function getSnapshot(): DemoUser | null {
  if (snapshot === undefined) {
    snapshot = read();
  }
  return snapshot;
}

function emit(): void {
  snapshot = read();
  listeners.forEach((listener) => listener());
}

/** Subscribes to sign-in and sign-out; returns the unsubscribe function. */
export function subscribeToDemoUser(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Returns the demo profile, or `null` when the visitor is not signed in as the demo user. */
export function getDemoUser(): DemoUser | null {
  return getSnapshot();
}

export function setDemoUser(user: DemoUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  emit();
}

export function clearDemoUser(): void {
  localStorage.removeItem(STORAGE_KEY);
  emit();
}
