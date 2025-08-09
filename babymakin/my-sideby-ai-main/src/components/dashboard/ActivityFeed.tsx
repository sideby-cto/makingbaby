
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ActivityFeedProps {
  userId?: string;
}

export const ActivityFeed = ({ userId }: ActivityFeedProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Activity feed has been removed from the application.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
