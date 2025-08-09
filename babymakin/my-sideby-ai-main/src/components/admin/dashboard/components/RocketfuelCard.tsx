
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

export const RocketfuelCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow border border-semantic-border bg-white shadow-sm rounded-xl">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-accent/10 rounded-lg">
              <Rocket size={24} weight="regular" className="text-brand-accent" />
            </div>
            <h3 className="text-heading-md text-semantic-text-primary font-sans">Rocketfuel</h3>
          </div>
          <p className="text-body-md text-semantic-text-secondary">
            Create meaningful connections between members and facilitate learning conversations
          </p>
        </div>
        <Button onClick={() => navigate('/admin/matchmaker')} className="w-full">
          Drive sideby
        </Button>
      </div>
    </Card>
  );
};
