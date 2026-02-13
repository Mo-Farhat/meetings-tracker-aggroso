"use client";

import { useState } from "react";

interface TranscriptInputProps {
  onExtracted: (data: TranscriptResponse) => void;
}

export interface TranscriptResponse {
  id: string;
  text: string;
  createdAt: string;
  actionItems: ActionItemData[];
}

export interface ActionItemData {
  id: string;
  transcriptId: string | null;
  task: string;
  owner: string | null;
  dueDate: string | null;
  done: boolean;
  tags: string[];
  createdAt: string;
}

export default function TranscriptInput({ onExtracted }: TranscriptInputProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please paste a meeting transcript first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract action items");
      }

      onExtracted(data);
      setText("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
        Paste Meeting Transcript
      </h2>
      <textarea
        className="textarea"
        placeholder="Paste your meeting transcript here..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError(null);
        }}
        disabled={loading}
      />
      {error && <div className="error-message fade-in">{error}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          {text.length.toLocaleString()} characters
        </span>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Extracting...
            </>
          ) : (
            "Extract Action Items"
          )}
        </button>
      </div>
    </div>
  );
}
