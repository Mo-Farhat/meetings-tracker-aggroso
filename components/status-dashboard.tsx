"use client";

import { useEffect, useState, useCallback } from "react";

interface HealthCheck {
  name: string;
  endpoint: string;
  status: "loading" | "ok" | "error";
  detail?: string;
  latencyMs?: number;
}

export default function StatusDashboard() {
  const [checks, setChecks] = useState<HealthCheck[]>([
    { name: "Backend", endpoint: "/api/health", status: "loading" },
    { name: "Database", endpoint: "/api/health/db", status: "loading" },
    { name: "LLM Provider", endpoint: "/api/health/llm", status: "loading" },
  ]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runChecks = useCallback(async () => {
    setChecks((prev) =>
      prev.map((c) => ({ ...c, status: "loading" as const }))
    );

    const results = await Promise.all(
      checks.map(async (check) => {
        try {
          const res = await fetch(check.endpoint);
          const data = await res.json();

          return {
            ...check,
            status: (res.ok ? "ok" : "error") as "ok" | "error",
            detail: data.provider
              ? `Provider: ${data.provider}`
              : data.latencyMs
                ? `Latency: ${data.latencyMs}ms`
                : data.uptime
                  ? `Uptime: ${Math.floor(data.uptime)}s`
                  : undefined,
            latencyMs: data.latencyMs,
          };
        } catch {
          return {
            ...check,
            status: "error" as const,
            detail: "Connection failed",
          };
        }
      })
    );

    setChecks(results);
    setLastChecked(new Date());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    runChecks();
    const interval = setInterval(runChecks, 30000);
    return () => clearInterval(interval);
  }, [runChecks]);

  const allOk = checks.every((c) => c.status === "ok");
  const anyError = checks.some((c) => c.status === "error");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <span
          className={`status-dot ${allOk ? "status-ok" : anyError ? "status-error" : "status-loading"}`}
          style={{ width: "0.75rem", height: "0.75rem" }}
        />
        <span style={{ fontWeight: 600 }}>
          {allOk ? "All Systems Operational" : anyError ? "Service Disruption" : "Checking..."}
        </span>
      </div>

      <div className="status-grid">
        {checks.map((check) => (
          <div key={check.name} className="status-card fade-in">
            <span
              className={`status-dot ${
                check.status === "ok"
                  ? "status-ok"
                  : check.status === "error"
                    ? "status-error"
                    : "status-loading"
              }`}
            />
            <div className="status-card-info">
              <div className="status-card-title">{check.name}</div>
              {check.detail && (
                <div className="status-card-detail">{check.detail}</div>
              )}
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color:
                  check.status === "ok"
                    ? "var(--success)"
                    : check.status === "error"
                      ? "var(--danger)"
                      : "var(--warning)",
              }}
            >
              {check.status === "ok"
                ? "Operational"
                : check.status === "error"
                  ? "Down"
                  : "Checking"}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>
          {lastChecked
            ? `Last checked: ${lastChecked.toLocaleTimeString()}`
            : "Checking..."}
        </span>
        <button className="btn btn-secondary btn-sm" onClick={runChecks}>
          Refresh
        </button>
      </div>
    </div>
  );
}
