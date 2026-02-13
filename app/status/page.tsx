import StatusDashboard from "@/components/status-dashboard";

export default function StatusPage() {
  return (
    <>
      <h1 className="page-title">System Status</h1>
      <p className="page-subtitle">
        Real-time health checks for all services. Auto-refreshes every 30 seconds.
      </p>
      <StatusDashboard />
    </>
  );
}
