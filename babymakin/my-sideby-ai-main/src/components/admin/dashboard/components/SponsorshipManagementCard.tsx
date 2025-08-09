
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

interface SponsorshipManagementCardProps {
  userTools: any[] | undefined;
}

export const SponsorshipManagementCard = ({ userTools }: SponsorshipManagementCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow border border-semantic-border bg-white shadow-sm rounded-xl">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-accent/10 rounded-lg">
              <Gift size={24} weight="regular" className="text-brand-accent" />
            </div>
            <h3 className="text-heading-md text-semantic-text-primary font-sans">Sponsorship Management</h3>
          </div>
          
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center text-body-md text-semantic-text-secondary">
              <span>Active Sponsorships</span>
              <span>{userTools?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center text-body-md text-semantic-text-secondary mb-2">
              <span>Total Members with Tools</span>
              <span>{new Set(userTools?.map(tool => tool.user_id)).size || 0}</span>
            </div>
          </div>
        </div>

        <Button onClick={() => navigate('/admin/sponsorships')} className="w-full">
          Give Tools
        </Button>
      </div>
    </Card>
  );
};
