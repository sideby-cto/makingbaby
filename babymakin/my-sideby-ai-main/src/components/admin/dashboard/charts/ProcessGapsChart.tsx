
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AddProcessGapDialog } from "../dialogs/AddProcessGapDialog";
import { CloseProcessGapDialog } from "../dialogs/CloseProcessGapDialog";

interface ProcessGap {
  id: string;
  description: string;
  created_at: string;
  status: 'open' | 'closed';
}

interface ProcessGapsChartProps {
  processGaps: ProcessGap[];
  onAddGap: (description: string) => void;
  onCloseGap: (gapId: string) => void;
}

export const ProcessGapsChart = ({ processGaps, onAddGap, onCloseGap }: ProcessGapsChartProps) => {
  const [showAddGapDialog, setShowAddGapDialog] = useState(false);
  const [selectedGapId, setSelectedGapId] = useState<string | null>(null);
  
  const chartData = React.useMemo(() => {
    const monthlyData = processGaps.reduce((acc: { [key: string]: { identified: number; filled: number } }, gap) => {
      const month = new Date(gap.created_at).toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { identified: 0, filled: 0 };
      }
      acc[month].identified++;
      if (gap.status === 'closed') {
        acc[month].filled++;
      }
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));
  }, [processGaps]);

  const openGaps = processGaps.filter(gap => gap.status === 'open');

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Process Gaps</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAddGapDialog(true)}
          >
            Add Gap
          </Button>
          {openGaps.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedGapId(openGaps[0]?.id || '')}
            >
              Close Gap
            </Button>
          )}
        </div>
      </div>
      <ChartContainer
        className="h-[200px]"
        config={{
          identified: {
            theme: {
              light: "#f59e0b",
              dark: "#fbbf24",
            },
          },
          filled: {
            theme: {
              light: "#10b981",
              dark: "#34d399",
            },
          },
        }}
      >
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="identified"
            stackId="1"
            stroke="var(--color-identified)"
            fill="var(--color-identified)"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="filled"
            stackId="1"
            stroke="var(--color-filled)"
            fill="var(--color-filled)"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ChartContainer>
      
      {/* Dialogs */}
      <Dialog open={showAddGapDialog} onOpenChange={setShowAddGapDialog}>
        <AddProcessGapDialog 
          isOpen={showAddGapDialog}
          onClose={() => setShowAddGapDialog(false)}
          onAddGap={onAddGap} 
        />
      </Dialog>
      
      <Dialog open={selectedGapId !== null} onOpenChange={(open) => !open && setSelectedGapId(null)}>
        <CloseProcessGapDialog 
          isOpen={selectedGapId !== null}
          onClose={() => setSelectedGapId(null)} 
          gapId={selectedGapId || ''} 
          onCloseGap={onCloseGap} 
        />
      </Dialog>
    </Card>
  );
};
