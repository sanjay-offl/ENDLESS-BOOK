import { useState, useEffect, useCallback } from "react";
import { api, Chapter, ChapterDetail, NewChapter } from "../api";
import { useAuth } from "./useAuth";

export function useChapters() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChapters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getChapters();
      setChapters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chapters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  return { chapters, loading, error, refetch: loadChapters };
}

export function useChapter(id?: string) {
  const [chapterDetail, setChapterDetail] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const loadChapter = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getChapter(id);
      setChapterDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chapter");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  const createChapter = async (data: NewChapter) => {
    const authToken = token || "anonymous-token";
    return await api.createChapter(data, authToken);
  };

  return { chapterDetail, loading, error, refetch: loadChapter, createChapter };
}
