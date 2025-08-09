
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Crew {
  id: string;
  name: string;
  code: string;
}

interface CrewFilterProps {
  onCrewSelect: (crewId: string | null) => void;
  selectedCrew: string | null;
}

export const CrewFilter: React.FC<CrewFilterProps> = ({
  onCrewSelect,
  selectedCrew
}) => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrewName, setSelectedCrewName] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrews = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('crews')
          .select('id, name, code')
          .order('name');
          
        if (error) throw error;
        setCrews(data || []);
        
        // If we have a selected crew ID, find its name
        if (selectedCrew) {
          const crew = data?.find(c => c.id === selectedCrew);
          if (crew) {
            setSelectedCrewName(crew.name);
          }
        }
      } catch (error) {
        console.error('Error fetching crews:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCrews();
  }, [selectedCrew]);

  const handleCrewChange = (crewId: string) => {
    const crew = crews.find(c => c.id === crewId);
    if (crew) {
      setSelectedCrewName(crew.name);
    }
    onCrewSelect(crewId);
  };
  
  const handleClearCrew = () => {
    setSelectedCrewName(null);
    onCrewSelect(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="crew-filter" className="text-sm">Filter by Crew</Label>
        {selectedCrew && (
          <button 
            onClick={handleClearCrew}
            className="text-xs text-blue-500 hover:text-blue-700"
          >
            Clear filter
          </button>
        )}
      </div>
      
      {selectedCrewName ? (
        <div className="flex items-center space-x-2">
          <Badge className="flex items-center gap-1 px-3 py-1">
            {selectedCrewName}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={handleClearCrew}
            />
          </Badge>
        </div>
      ) : (
        <Select
          value={selectedCrew || ""}
          onValueChange={handleCrewChange}
          disabled={loading}
        >
          <SelectTrigger id="crew-filter" className="w-full">
            <SelectValue placeholder="All crews" />
          </SelectTrigger>
          <SelectContent>
            {crews.map((crew) => (
              <SelectItem key={crew.id} value={crew.id}>
                {crew.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
