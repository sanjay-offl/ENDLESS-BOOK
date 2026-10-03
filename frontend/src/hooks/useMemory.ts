import { useState, useEffect, useCallback } from "react";
import { api, Memory, NewMemory } from "../api";
import { useAuth } from "./useAuth";

export function useMemory(id?: string) {
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

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
    const authToken = token || "anonymous-token";
    return await api.createMemory(data, authToken);
  };

  return { memory, loading, error, refetch: loadMemory, createMemory };
}

export function useUserMemories(uid?: string) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const loadUserMemories = useCallback(async () => {
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const authToken = token || "anonymous-token";
      const data = await api.getUserMemories(uid, authToken);
      setMemories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load memories");
    } finally {
      setLoading(false);
    }
  }, [uid, token]);

  useEffect(() => {
    loadUserMemories();
  }, [loadUserMemories]);

  return { memories, loading, error, refetch: loadUserMemories };
}
