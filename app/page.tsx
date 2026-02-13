"use client";

import { useState } from "react";
import TranscriptInput from "@/components/transcript-input";
import ActionItemList from "@/components/action-item-list";
import type { ActionItemData, TranscriptResponse } from "@/components/transcript-input";

export default function HomePage() {
  const [transcriptId, setTranscriptId] = useState<string | undefined>();
  const [items, setItems] = useState<ActionItemData[]>([]);

  const handleExtracted = (data: TranscriptResponse) => {
    setTranscriptId(data.id);
    setItems(data.actionItems);
  };

  const handleUpdate = (updated: ActionItemData) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdd = (item: ActionItemData) => {
    setItems((prev) => [...prev, item]);
  };

  return (
    <>
      <h1 className="page-title">Meeting Action Items</h1>
      <p className="page-subtitle">
        Paste a meeting transcript to extract action items automatically.
      </p>

      <TranscriptInput onExtracted={handleExtracted} />
      <ActionItemList
        items={items}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onAdd={handleAdd}
        transcriptId={transcriptId}
      />
    </>
  );
}
