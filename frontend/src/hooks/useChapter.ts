import { useState, useEffect, useCallback } from "react";
import { api, Chapter, ChapterDetail, NewChapter, DEMO_AUTH_TOKEN } from "../api";
import { useContributor } from "./useContributor";

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
  const { contributor } = useContributor();

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
    if (!contributor) {
      throw new Error("Sign in before starting a chapter.");
    }
    return api.createChapter(data, contributor.token || DEMO_AUTH_TOKEN);
  };

  return { chapterDetail, loading, error, refetch: loadChapter, createChapter };
}
