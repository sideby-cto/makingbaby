
import React from "react";
import { DashboardLayout } from "./layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import QuickAccess from "./QuickAccess";
import { WelcomeMessage } from "./WelcomeMessage";
import { MatchSection } from "./MatchSection";
import { CrewCreationCard } from "./CrewCreationCard";
import { LearningColumn } from "./learning/LearningColumn";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout data-testid="dashboard-layout">
      <div className="space-y-6" data-testid="dashboard-container">
        {/* Welcome Section */}
        <div data-testid="welcome-section">
          <WelcomeMessage />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" data-testid="main-content-grid">
          {/* Left Column - Match Section */}
          <div className="lg:col-span-2" data-testid="match-section-container">
            <MatchSection userId={user?.id} />
          </div>

          {/* Middle Column - Learning */}
          <div className="space-y-6" data-testid="learning-column-container">
            <div data-testid="learning-section">
              <LearningColumn userId={user?.id} />
            </div>
          </div>

          {/* Right Column - Quick Access & Crew Creation */}
          <div className="space-y-6" data-testid="sidebar-container">
            <div data-testid="quick-access-section">
              <QuickAccess userId={user?.id} />
            </div>
            <div data-testid="crew-creation-section">
              <CrewCreationCard />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
