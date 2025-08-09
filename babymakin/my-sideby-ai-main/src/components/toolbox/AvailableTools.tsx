
import { Card, CardContent } from "@/components/ui/card";

const AVAILABLE_SPONSORSHIPS = [
  {
    name: "ChatGPT",
    description: "Access GPT-4 and advanced AI features",
    iconColor: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    name: "Claude (Anthropic)",
    description: "Advanced AI assistant for education",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-100",
  }
];

interface AvailableToolsProps {
  onSponsorshipClick: () => void;
}

export const AvailableTools = ({ onSponsorshipClick }: AvailableToolsProps) => {
  return (
    <>
      {AVAILABLE_SPONSORSHIPS.map((tool) => (
        <Card 
          key={tool.name} 
          className="overflow-hidden hover:shadow-md transition-shadow group border-[#FF5733]/20 transform hover:scale-105 transition-transform duration-300"
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className={`h-12 w-12 ${tool.bgColor} rounded-lg flex items-center justify-center ${tool.iconColor} group-hover:animate-bounce`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <path d="M12 17h.01"/>
                </svg>
              </div>
              <h4 className="font-bold text-xl">{tool.name}</h4>
              <p className="text-gray-500">{tool.description}</p>
              <div className="text-xs text-gray-500 italic mb-2">
                Made available by generous sponsors
              </div>
              <a 
                onClick={onSponsorshipClick}
                className="inline-flex cursor-pointer items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Request Access
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
