
import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getJourneyStageLabel } from "@/hooks/user-journey/journeyUtils";
import { Card } from "@/components/ui/card";

// Define the UserJourney type based on the existing usage
export interface UserJourney {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  stage: string;
  daysSinceRegistration: number;
  matchCount: number;
  lastActive?: string;
  pacingLevel?: string;
  hasCompletedReflection?: boolean;
}

// Define props for this component
interface UserJourneyListProps {
  journeys: UserJourney[];
  loading: boolean;
  onUserSelect: (userId: string) => void;
  selectedStage?: string;
  searchQuery?: string;
  dateRange?: { from?: Date; to?: Date };
}

const ITEMS_PER_PAGE = 20;

export function UserJourneyList({ 
  journeys, 
  loading, 
  onUserSelect,
  selectedStage = "all",
  searchQuery = "",
  dateRange = {}
}: UserJourneyListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return journeys.slice(startIndex, endIndex);
  }, [journeys, currentPage]);

  const totalPages = Math.ceil(journeys.length / ITEMS_PER_PAGE);

  // Reset to first page when journeys change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [journeys.length, selectedStage, searchQuery]);

  if (loading) {
    return (
      <Card className="p-4 shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (journeys.length === 0) {
    return (
      <Card className="p-8 text-center shadow-sm">
        <p className="text-muted-foreground">
          No user journeys match the current filters
        </p>
      </Card>
    );
  }

  const getPacingBadge = (pacing?: string) => {
    if (!pacing) return null;

    const badgeStyles: Record<string, string> = {
      light: "bg-blue-50 text-blue-700 border-blue-100",
      moderate: "bg-orange-50 text-orange-700 border-orange-100",
      consistent: "bg-green-50 text-green-700 border-green-100",
      deep_dive: "bg-purple-50 text-purple-700 border-purple-100",
    };

    const style = badgeStyles[pacing] || "bg-gray-50 text-gray-700 border-gray-100";
    const displayName = pacing.replace("_", " ");

    return (
      <Badge variant="outline" className={`${style} capitalize`}>
        {displayName}
      </Badge>
    );
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis and current page area
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <span className="px-3 py-2">...</span>
          </PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          items.push(
            <PaginationItem key={i}>
              <PaginationLink
                isActive={currentPage === i}
                onClick={() => setCurrentPage(i)}
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
      }

      // Show ellipsis before last page
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <span className="px-3 py-2">...</span>
          </PaginationItem>
        );
      }

      // Show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              isActive={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <div className="rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Matches</TableHead>
                <TableHead>Pacing</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((journey) => (
                <TableRow key={journey.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {journey.firstName} {journey.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{journey.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {getJourneyStageLabel(journey.stage)}
                    </Badge>
                  </TableCell>
                  <TableCell>{journey.matchCount}</TableCell>
                  <TableCell>{getPacingBadge(journey.pacingLevel)}</TableCell>
                  <TableCell>{journey.daysSinceRegistration} days ago</TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onUserSelect(journey.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, journeys.length)} of{" "}
            {journeys.length} results
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {renderPaginationItems()}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
