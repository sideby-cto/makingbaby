
import React from "react";
import { cn } from "@/lib/utils";
import { X, Plus, BarChart3, Users, Settings, Database, MessageSquare, Mail, TestTube, Clock, UserCheck, Wrench, Cat, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddIdea: () => void;
}

export const AdminSidebar = ({ open, onOpenChange, onAddIdea }: AdminSidebarProps) => {
  const location = useLocation();

  const navigationItems = [
    {
      label: "Overview",
      items: [
        {
          name: "Dashboard",
          href: "/admin",
          icon: BarChart3,
          description: "Platform overview and metrics"
        }
      ]
    },
    {
      label: "User Management",
      items: [
        {
          name: "Users",
          href: "/admin/users",
          icon: Users,
          description: "Manage platform users"
        },
        {
          name: "User Journeys",
          href: "/admin/user-journeys",
          icon: UserCheck,
          description: "Track user progress"
        },
        {
          name: "Crews",
          href: "/admin/crews",
          icon: Users,
          description: "Manage user crews"
        }
      ]
    },
    {
      label: "Matchmaking",
      items: [
        {
          name: "Matchmaker",
          href: "/admin/matchmaker",
          icon: UserCheck,
          description: "Create and manage matches"
        }
      ]
    },
    {
      label: "Communication",
      items: [
        {
          name: "Notifications",
          href: "/admin/notifications",
          icon: MessageSquare,
          description: "Manage notifications"
        },
        {
          name: "Email Management",
          href: "/admin/email-management",
          icon: Mail,
          description: "Email templates and logs"
        }
      ]
    },
    {
      label: "Tools & Features",
      items: [
        {
          name: "Badge Opt-ins",
          href: "/admin/badge-opt-ins",
          icon: Award,
          description: "Manage badge opt-in preferences"
        },
        {
          name: "Sponsorships",
          href: "/admin/sponsorships",
          icon: Wrench,
          description: "Manage tool sponsorships"
        },
        {
          name: "Sponsorship Requests",
          href: "/admin/sponsorship-requests",
          icon: Database,
          description: "Review sponsorship requests"
        }
      ]
    },
    {
      label: "Testing",
      items: [
        {
          name: "Cat in the Fort",
          href: "/admin/chaos-testing",
          icon: Cat,
          description: "Chaos testing dashboard"
        },
        {
          name: "Protect the Core",
          href: "/admin/core-flow",
          icon: Shield,
          description: "Core flow monitoring & testing"
        }
      ]
    },
    {
      label: "Development",
      items: [
        {
          name: "Experiments",
          href: "/admin/experiments",
          icon: TestTube,
          description: "User experiments and testing"
        },
        {
          name: "Sessions",
          href: "/admin/sessions",
          icon: Clock,
          description: "Session monitoring"
        }
      ]
    }
  ];

  const isActiveRoute = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto overflow-y-auto",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Team Panel</h2>
            <p className="text-sm text-gray-500">Platform Management</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden lg:block p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Team Panel</h2>
          <p className="text-sm text-gray-500">Platform Management</p>
        </div>
        
        {/* Quick Actions */}
        <div className="p-4 border-b bg-gray-50">
          <Button 
            onClick={onAddIdea} 
            className="w-full mb-3 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Idea
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="text-xs"
            >
              <Link to="/admin/matchmaker">
                <UserCheck className="h-3 w-3 mr-1" />
                Match
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="text-xs"
            >
              <Link to="/admin/crews">
                <Users className="h-3 w-3 mr-1" />
                Crews
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-6">
          {navigationItems.map((section) => (
            <div key={section.label}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {section.label}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = isActiveRoute(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-start px-3 py-2 rounded-md text-sm transition-colors group",
                        isActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <item.icon className={cn(
                        "h-4 w-4 mt-0.5 mr-3 flex-shrink-0",
                        isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                      )} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700">
                          Active
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            <div>sideby Team Panel</div>
            <div className="mt-1">Team Dashboard v2.0</div>
          </div>
        </div>
      </div>
    </>
  );
};
