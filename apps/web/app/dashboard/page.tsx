import type { Metadata } from "next";

import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your Ledgera account and recent activity.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
