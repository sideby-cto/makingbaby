
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings } from "lucide-react";
import { useLocation } from "react-router-dom";
import { QuickLink } from "./quick-access/QuickLink";
import { CrewQuickLink } from "./quick-access/CrewQuickLink";

interface QuickAccessProps {
  userId?: string | null;
}

// Define an interface for the link items
interface QuickLinkItem {
  title: string;
  description: string;
  icon: typeof Users | typeof Settings;
  href: string;
  tooltip: string;
  primary: boolean;
}

const QuickAccess = ({ userId }: QuickAccessProps) => {
  const location = useLocation();

  // Define quick links without the toolbox button
  const quickLinks: QuickLinkItem[] = [
    {
      title: "Communities",
      description: "Engage with your community",
      icon: Users,
      href: "/dashboard",
      tooltip: "Connect with other educators",
      primary: false,
    },
    {
      title: "Settings",
      description: "Manage preferences",
      icon: Settings,
      href: "/settings",
      tooltip: "Update your community and pacing settings",
      primary: false,
    }
  ];

  return (
    <Card className="border-[#FF5733]/20 shadow-md">
      <CardHeader className="bg-gradient-to-r from-[#FFF0ED] to-white">
        <CardTitle className="text-lg font-semibold text-[#FF5733]">Quick Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {quickLinks.map((link) => (
          <QuickLink
            key={link.title}
            title={link.title}
            description={link.description}
            icon={link.icon}
            href={link.href}
            tooltip={link.tooltip}
            primary={link.primary}
          />
        ))}
        <CrewQuickLink />
      </CardContent>
    </Card>
  );
};

export default QuickAccess;
