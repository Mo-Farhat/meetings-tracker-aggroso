"use client";

import { useEffect, useState } from "react";
import type { ActionItemData } from "@/components/transcript-input";
import ActionItemList from "@/components/action-item-list";

interface TranscriptSummary {
  id: string;
  snippet: string;
  createdAt: string;
  itemCount: number;
}

interface TranscriptDetail {
  id: string;
  text: string;
  createdAt: string;
  actionItems: ActionItemData[];
}

export default function HistoryPage() {
  const [transcripts, setTranscripts] = useState<TranscriptSummary[]>([]);
  const [selected, setSelected] = useState<TranscriptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setTranscripts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const loadTranscript = async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/transcripts/${id}`);
      if (!res.ok) throw new Error("Failed to load transcript");
      const data = await res.json();
      setSelected(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transcript");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdate = (updated: ActionItemData) => {
    if (!selected) return;
    setSelected({
      ...selected,
      actionItems: selected.actionItems.map((item) =>
        item.id === updated.id ? updated : item
      ),
    });
  };

  const handleDelete = (id: string) => {
    if (!selected) return;
    setSelected({
      ...selected,
      actionItems: selected.actionItems.filter((item) => item.id !== id),
    });
  };

  const handleAdd = (item: ActionItemData) => {
    if (!selected) return;
    setSelected({
      ...selected,
      actionItems: [...selected.actionItems, item],
    });
  };

  return (
    <>
      <h1 className="page-title">Transcript History</h1>
      <p className="page-subtitle">
        View your last 5 processed transcripts and their action items.
      </p>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="empty-state">
          <span className="spinner" style={{ margin: "0 auto" }} />
        </div>
      ) : transcripts.length === 0 ? (
        <div className="empty-state">
          No transcripts yet. Go to the home page to process your first one.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Transcript List */}
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {transcripts.map((t) => (
              <button
                key={t.id}
                className="history-card"
                onClick={() => loadTranscript(t.id)}
                style={{
                  textAlign: "left",
                  borderColor:
                    selected?.id === t.id ? "var(--accent)" : undefined,
                }}
              >
                <div className="history-card-date">
                  {new Date(t.createdAt).toLocaleString()}
                </div>
                <div className="history-card-snippet">{t.snippet}</div>
                <div className="history-card-count">
                  {t.itemCount} action item{t.itemCount !== 1 ? "s" : ""}
                </div>
              </button>
            ))}
          </div>

          {/* Selected Transcript Details */}
          {loadingDetail ? (
            <div className="empty-state">
              <span className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : selected ? (
            <div className="fade-in">
              <ActionItemList
                items={selected.actionItems}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onAdd={handleAdd}
                transcriptId={selected.id}
              />
            </div>
          ) : (
            <div className="empty-state">
              Click a transcript above to view its action items.
            </div>
          )}
        </div>
      )}
    </>
  );
}
