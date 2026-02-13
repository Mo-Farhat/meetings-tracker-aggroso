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
          {item.owner && <span><svg style={{display:"inline",verticalAlign:"middle",marginRight:"0.25rem"}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{item.owner}</span>}
          {item.dueDate && (
            <span><svg style={{display:"inline",verticalAlign:"middle",marginRight:"0.25rem"}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{new Date(item.dueDate).toLocaleDateString()}</span>
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button
          className="btn btn-danger btn-sm btn-icon"
          onClick={handleDelete}
          disabled={loading}
          title="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </button>
      </div>
    </div>
  );
}
