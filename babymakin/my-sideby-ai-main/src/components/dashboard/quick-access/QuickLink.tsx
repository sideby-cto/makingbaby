
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface QuickLinkProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  tooltip: string;
  primary?: boolean;
  highlight?: boolean;
}

export const QuickLink = ({
  title,
  description,
  icon: Icon,
  href,
  tooltip,
  primary = false,
  highlight = false,
}: QuickLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <div className="relative">
          <Button
            variant={primary ? "default" : "outline"}
            className={`w-full justify-start group transition-transform duration-200 ${
              isActive ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
            } ${primary ? 'bg-[#FF5733] hover:bg-[#FF5733]/90' : 'border-[#FF5733]/20 hover:border-[#FF5733]/40'} ${
              highlight ? 'ring-2 ring-[#FF5733]/30' : ''
            }`}
            asChild={!isActive}
            disabled={isActive}
          >
            {isActive ? (
              <div className="flex items-center">
                <Icon className={`h-5 w-5 mr-2 ${
                  primary ? 'text-primary-foreground' : 'text-[#FF5733]'
                }`} />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{title}</span>
                  <span className={`text-sm ${
                    primary ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {description}
                  </span>
                </div>
              </div>
            ) : (
              <Link to={href} className="w-full flex items-center">
                <Icon className={`h-5 w-5 mr-2 ${
                  primary ? 'text-primary-foreground' : 'text-[#FF5733]'
                }`} />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{title}</span>
                  <span className={`text-sm ${
                    primary ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {description}
                  </span>
                </div>
              </Link>
            )}
          </Button>
        </div>
      </HoverCardTrigger>
      <HoverCardContent 
        className="p-3 shadow-lg border-2 border-[#FF5733]/20 bg-white"
        sideOffset={5}
      >
        <div>
          <h4 className="font-bold text-[#FF5733] mb-1">{title}</h4>
          <p className="text-sm">{tooltip}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
