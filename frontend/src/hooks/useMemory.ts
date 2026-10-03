import { useState, useEffect, useCallback } from "react";
import { api, Memory, NewMemory, DEMO_AUTH_TOKEN } from "../api";
import { useContributor } from "./useContributor";

export function useMemory(id?: string) {
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contributor = useContributor();

  const loadMemory = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMemory(id);
      setMemory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load memory");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMemory();
  }, [loadMemory]);

  const createMemory = async (data: NewMemory) => {
    if (!contributor) {
      throw new Error("Sign in before publishing a page.");
    }
    return api.createMemory(data, contributor.token || DEMO_AUTH_TOKEN);
  };

  return { memory, loading, error, refetch: loadMemory, createMemory };
}

export function useUserMemories(uid?: string) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contributor = useContributor();

  const loadUserMemories = useCallback(async () => {
    if (!uid) {
      setMemories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // The API only serves the caller's own pages, so this must be the signed-in uid.
      const authToken = contributor?.token || DEMO_AUTH_TOKEN;
      const data = await api.getUserMemories(uid, authToken);
      setMemories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load memories");
    } finally {
      setLoading(false);
    }
  }, [uid, contributor?.token]);

  useEffect(() => {
    loadUserMemories();
  }, [loadUserMemories]);

  return { memories, loading, error, refetch: loadUserMemories };
}
