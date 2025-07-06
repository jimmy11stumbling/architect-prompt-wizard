import React from "react";
import AnalyticsPage from "@/components/analytics/AnalyticsPage";

const AnalyticsDashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <AnalyticsPage />
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;