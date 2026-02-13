"use client";

import { useState } from "react";
import type { ActionItemData } from "./transcript-input";
import ActionItemCard from "./action-item-card";
import ActionItemForm from "./action-item-form";

interface ActionItemListProps {
  items: ActionItemData[];
  onUpdate: (updated: ActionItemData) => void;
  onDelete: (id: string) => void;
  onAdd: (item: ActionItemData) => void;
  transcriptId?: string;
}

type Filter = "all" | "open" | "done";

export default function ActionItemList({
  items,
  onUpdate,
  onDelete,
  onAdd,
  transcriptId,
}: ActionItemListProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [showAddForm, setShowAddForm] = useState(false);

  const filtered = items.filter((item) => {
    if (filter === "open") return !item.done;
    if (filter === "done") return item.done;
    return true;
  });

  const openCount = items.filter((i) => !i.done).length;
  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>
          Action Items
          <span style={{ fontWeight: 400, color: "var(--muted)", marginLeft: "0.5rem" }}>
            ({items.length})
          </span>
        </h2>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showAddForm && (
        <div className="fade-in" style={{ marginBottom: "1rem" }}>
          <ActionItemForm
            transcriptId={transcriptId}
            onSaved={(item) => {
              onAdd(item);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({items.length})
        </button>
        <button
          className={`filter-tab ${filter === "open" ? "active" : ""}`}
          onClick={() => setFilter("open")}
        >
          Open ({openCount})
        </button>
        <button
          className={`filter-tab ${filter === "done" ? "active" : ""}`}
          onClick={() => setFilter("done")}
        >
          Done ({doneCount})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {items.length === 0
            ? "No action items yet. Paste a transcript to extract tasks."
            : `No ${filter} items.`}
        </div>
      ) : (
        <div>
          {filtered.map((item) => (
            <ActionItemCard
              key={item.id}
              item={item}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
