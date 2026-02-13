"use client";

import { useState } from "react";
import type { ActionItemData } from "./transcript-input";

interface ActionItemCardProps {
  item: ActionItemData;
  onUpdate: (updated: ActionItemData) => void;
  onDelete: (id: string) => void;
}

export default function ActionItemCard({ item, onUpdate, onDelete }: ActionItemCardProps) {
  const [editing, setEditing] = useState(false);
  const [editTask, setEditTask] = useState(item.task);
  const [editOwner, setEditOwner] = useState(item.owner || "");
  const [editDueDate, setEditDueDate] = useState(
    item.dueDate ? item.dueDate.split("T")[0] : ""
  );
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/action-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !item.done }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editTask.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/action-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: editTask.trim(),
          owner: editOwner.trim() || null,
          dueDate: editDueDate || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        setEditing(false);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/action-items/${item.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDelete(item.id);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (editing) {
    return (
      <div className="action-item fade-in">
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <input
            className="input"
            value={editTask}
            onChange={(e) => setEditTask(e.target.value)}
            placeholder="Task description"
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              className="input"
              value={editOwner}
              onChange={(e) => setEditOwner(e.target.value)}
              placeholder="Owner (optional)"
              style={{ flex: 1 }}
            />
            <input
              className="input"
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>
              Save
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="action-item fade-in">
      <input
        type="checkbox"
        className="action-item-checkbox"
        checked={item.done}
        onChange={handleToggle}
        disabled={loading}
      />
      <div className="action-item-content">
        <div className={`action-item-task ${item.done ? "done" : ""}`}>
          {item.task}
        </div>
        <div className="action-item-meta">
          {item.owner && <span>👤 {item.owner}</span>}
          {item.dueDate && (
            <span>
              📅 {new Date(item.dueDate).toLocaleDateString()}
            </span>
          )}
          {item.tags &&
            item.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
        </div>
      </div>
      <div className="action-item-actions">
        <button
          className="btn btn-secondary btn-sm btn-icon"
          onClick={() => setEditing(true)}
          title="Edit"
        >
          ✏️
        </button>
        <button
          className="btn btn-danger btn-sm btn-icon"
          onClick={handleDelete}
          disabled={loading}
          title="Delete"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
