import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";
import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const setStoreUser = useAuthStore((s) => s.setUser);
  const setStoreToken = useAuthStore((s) => s.setToken);
  const setStoreLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setStoreUser(u);
      if (u) {
        try {
          const t = await u.getIdToken();
          setToken(t);
          setStoreToken(t);
        } catch {
          setToken("mock-token");
          setStoreToken("mock-token");
        }
      } else {
        setToken(null);
        setStoreToken(null);
      }
      setLoading(false);
      setStoreLoading(false);
    });

    return () => unsubscribe();
  }, [setStoreUser, setStoreToken, setStoreLoading]);

  return { user, loading, token };
}
