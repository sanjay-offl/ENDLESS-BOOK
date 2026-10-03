import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { Chapter, api, DEMO_AUTH_TOKEN } from "../../api";
import { useContributor } from "../../hooks/useContributor";
import Button from "../ui/Button";
import MemoryCard from "../ui/MemoryCard";
import TagChip from "../ui/TagChip";

interface SubmitMemoryFormProps {
  initialChapterId?: string;
  initialPageNum?: number;
  availableChapters: Chapter[];
}

export default function SubmitMemoryForm({
  initialChapterId,
  initialPageNum,
  availableChapters,
}: SubmitMemoryFormProps) {
  const { contributor, loading: authLoading } = useContributor();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"continue" | "new">(
    initialChapterId ? "continue" : availableChapters.length > 0 ? "continue" : "new"
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    initialChapterId || (availableChapters[0]?.id ?? "")
  );
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [memoryTitle, setMemoryTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorCity, setAuthorCity] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // Target chapter info
  const targetChapter = availableChapters.find((c) => c.id === selectedChapterId);
  const calculatedPageNum =
    mode === "new"
      ? 1
      : initialPageNum || (targetChapter ? targetChapter.pageCount + 1 : 1);

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTagInput(val);
    const parsed = val
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    setTags(parsed);
  };

  // Release the previous object URL so repeated previews do not leak memory.
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be under 5MB.");
        e.target.value = "";
        return;
      }
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    if (!contributor) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (!memoryTitle.trim()) {
      setError("Please provide a title for your memory.");
      return;
    }

    if (body.trim().length < 100) {
      setError(`Memory body must be at least 100 characters. Currently at ${body.trim().length}.`);
      return;
    }

    if (mode === "new" && !newChapterTitle.trim()) {
      setError("Please enter a title for the new chapter.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // The demo contributor has no Firebase ID token; the API accepts this placeholder
      // only while it is running without credentials.
      const authToken = contributor.token || DEMO_AUTH_TOKEN;
      let chapterId = selectedChapterId;

      // 1. If new chapter, create it first
      if (mode === "new") {
        const createdChapter = await api.createChapter(
          {
            title: newChapterTitle.trim(),
            tags,
          },
          authToken
        );
        chapterId = createdChapter.id;
      }

      // 2. Upload image if selected. Uploading needs a real Firebase session, so the demo
      // contributor keeps the local preview instead.
      let uploadedImageUrl: string | null = null;
      if (imageFile) {
        try {
          if (!contributor.isDemo) {
            const path = `memories/${contributor.uid}/${Date.now()}_${imageFile.name}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, imageFile);
            uploadedImageUrl = await getDownloadURL(storageRef);
          } else {
            throw new Error("Storage upload requires a real Firebase session.");
          }
        } catch (uploadErr) {
          console.warn("Storage upload failed, using local preview url:", uploadErr);
          uploadedImageUrl = imagePreviewUrl;
        }
      }

      // 3. Create memory page
      const createdMemory = await api.createMemory(
        {
          chapterId,
          title: memoryTitle.trim(),
          body: body.trim(),
          authorCity: authorCity.trim(),
          imageUrl: uploadedImageUrl,
          tags,
        },
        authToken
      );

      // Trigger page-flip animation
      setIsFlipping(true);
      setTimeout(() => {
        navigate(`/chapters/${chapterId}/${createdMemory.pageNum || calculatedPageNum}`);
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish page.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <AnimatePresence>
        {isFlipping && (
          <motion.div
            initial={{ rotateY: 0, opacity: 1 }}
            animate={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "var(--color-ink)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-page)",
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-3xl)",
              transformOrigin: "left center",
            }}
          >
            BINDING YOUR PAGE TO THE ENDLESS BOOK...
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "4rem",
          alignItems: "start",
        }}
      >
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
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

          {/* Chapter Selection Mode */}
          {!initialChapterId && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <label
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-xxs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-gold)",
                  fontWeight: 700,
                }}
              >
                DESTINATION CHAPTER
              </label>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-sm)",
                    textTransform: "uppercase",
                  }}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="continue"
                    checked={mode === "continue"}
                    onChange={() => setMode("continue")}
                    style={{ accentColor: "var(--color-ink)" }}
                  />
                  Continue Existing Chapter
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-sm)",
                    textTransform: "uppercase",
                  }}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="new"
                    checked={mode === "new"}
                    onChange={() => setMode("new")}
                    style={{ accentColor: "var(--color-ink)" }}
                  />
                  Start New Chapter
                </label>
              </div>
            </div>
          )}

          {/* If Continuing: Pick Chapter */}
          {mode === "continue" && !initialChapterId && (
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
                SELECT AN OPEN CHAPTER
              </label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="editorial-input"
                style={{ cursor: "pointer" }}
              >
                {availableChapters.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.pageCount >= 3}>
                    Chapter {c.number}: {c.title} ({c.pageCount}/3 pages {c.pageCount >= 3 ? "— FULL" : ""})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* If Starting New: Chapter Title */}
          {mode === "new" && (
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
                NEW CHAPTER TITLE *
              </label>
              <input
                type="text"
                placeholder="e.g. The Treehouse Across The Railway Track"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                required
                className="editorial-input"
              />
            </div>
          )}

          {/* Memory Title */}
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
              PAGE TITLE *
            </label>
            <input
              type="text"
              placeholder="e.g. When the Cicadas Stopped Singing"
              value={memoryTitle}
              onChange={(e) => setMemoryTitle(e.target.value)}
              required
              className="editorial-input"
            />
          </div>

          {/* Memory Body */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                PROSE MEMORY (MINIMUM 100 CHARACTERS) *
              </label>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-xxs)",
                  color: body.trim().length >= 100 ? "var(--color-ink)" : "var(--color-accent)",
                  fontWeight: 700,
                }}
              >
                {body.trim().length} / 100 chars
              </span>
            </div>
            <textarea
              rows={8}
              placeholder="Write the vivid memory of what you saw, smelled, heard, or felt when you were young..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              className="editorial-textarea"
            />
          </div>

          {/* Author Hometown / City */}
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
              YOUR HOMETOWN / CITY
            </label>
            <input
              type="text"
              placeholder="e.g. Kyoto, Japan or Brooklyn, NY"
              value={authorCity}
              onChange={(e) => setAuthorCity(e.target.value)}
              className="editorial-input"
            />
          </div>

          {/* Tags */}
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
              TAGS (COMMA SEPARATED)
            </label>
            <input
              type="text"
              placeholder="Summer, Bicycle, Storms, Secret Places"
              value={tagInput}
              onChange={handleTagsChange}
              className="editorial-input"
            />
            {tags.length > 0 && (
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                {tags.map((t, idx) => (
                  <TagChip key={idx} label={t} />
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
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
              MEMOIR PHOTOGRAPH (OPTIONAL, MAX 5MB)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="editorial-input"
              style={{ paddingBottom: "0.5rem" }}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="filled"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "1.25rem",
              fontSize: "var(--text-sm)",
            }}
          >
            {submitting ? "BINDING YOUR MEMORY..." : "PUBLISH YOUR PAGE"}
          </Button>
        </form>

        {/* Right Column: Live MemoryCard Preview */}
        <div
          style={{
            position: "sticky",
            top: "calc(var(--header-height) + 2rem)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "var(--border-thin) solid var(--color-ink)",
              paddingBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xxs)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-gold)",
                fontWeight: 700,
              }}
            >
              LIVE PAGE PREVIEW
            </span>
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
              PAGE 0{calculatedPageNum}
            </span>
          </div>

          <div
            style={{
              backgroundColor: "var(--color-cream)",
              padding: "1.5rem",
              border: "var(--border-width) solid var(--color-ink)",
            }}
          >
            <MemoryCard
              memoryId="preview-id"
              chapterId={selectedChapterId || "new-chapter"}
              pageNum={calculatedPageNum}
              title={memoryTitle || "Your Memory Title Appears Here"}
              body={
                body ||
                "Your handwritten recollections will be immortalized here in clear, editorial prose. As you type in the editor, your memory takes shape on this page."
              }
              authorName={contributor?.displayName || "Your Name"}
              authorCity={authorCity || "Your City"}
              createdAt={Date.now()}
              imageUrl={imagePreviewUrl}
              tags={tags}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
