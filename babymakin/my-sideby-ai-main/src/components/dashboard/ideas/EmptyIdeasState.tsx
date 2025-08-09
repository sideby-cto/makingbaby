
import { Lightbulb } from "lucide-react";
export const EmptyIdeasState = () => {
  return <div className="text-center py-8 space-y-2">
      <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto" />
      <h3 className="text-lg font-semibold">No ideas yet</h3>
      <p className="text-muted-foreground">After your first sideby session, you'll start to see ideas appear here. Our team makes matches each Wednesday 🥁.</p>
    </div>;
};
