"use client";

import { useState } from "react";
import type { ActionItemData } from "./transcript-input";

interface ActionItemFormProps {
  transcriptId?: string;
  onSaved: (item: ActionItemData) => void;
  onCancel: () => void;
}

export default function ActionItemForm({ transcriptId, onSaved, onCancel }: ActionItemFormProps) {
  const [task, setTask] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) {
      setError("Task description is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/action-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: task.trim(),
          owner: owner.trim() || null,
          dueDate: dueDate || null,
          transcriptId: transcriptId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create action item");
      }

      onSaved(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <input
        className="input"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Task description *"
        autoFocus
      />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          className="input"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          placeholder="Owner (optional)"
          style={{ flex: 1 }}
        />
        <input
          className="input"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? "Adding..." : "Add Item"}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
