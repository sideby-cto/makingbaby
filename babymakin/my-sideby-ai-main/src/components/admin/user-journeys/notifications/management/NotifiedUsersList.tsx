import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

import { UsersTable } from './notified-users/UsersTable';
import { EmptyState } from './notified-users/EmptyState';
import { StatusFilters } from './notified-users/StatusFilters';
import { StatsCards } from './notified-users/StatsCards';

export interface NotifiedUserData {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  stage: string;
  reminderType: string;
  status: string;
  sentAt?: string;
  scheduled?: boolean;
  engagement_level?: string;
  pacingLevel?: string; // For backward compatibility
}

interface NotifiedUsersListProps {
  users: NotifiedUserData[];
  isLoading: boolean;
}

export const NotifiedUsersList = ({ users, isLoading }: NotifiedUsersListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Filter users based on search query and status
  const filteredUsers = users.filter(user => {
    const searchString = `${user.firstName} ${user.lastName} ${user.email} ${user.stage} ${user.reminderType}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'scheduled' && user.scheduled) ||
                          (statusFilter === 'sent' && user.status === 'sent') ||
                          (statusFilter === 'pending' && user.status === 'pending') ||
                          (statusFilter === 'failed' && user.status === 'failed');
    
    return matchesSearch && matchesStatus;
  });

  // Sort users by scheduled status and send time
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // Sort by scheduled status first
    if (a.scheduled && !b.scheduled) return -1;
    if (!a.scheduled && b.scheduled) return 1;
    
    // Then sort by sent time (most recent first)
    if (a.sentAt && b.sentAt) {
      return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
    } else if (a.sentAt) {
      return 1;
    } else if (b.sentAt) {
      return -1;
    }
    return 0;
  });

  // Calculate counts for filters and stat cards
  const scheduledCount = users.filter(user => user.scheduled).length;
  const sentCount = users.filter(user => user.status === 'sent').length;
  const pendingCount = users.filter(user => user.status === 'pending' && !user.scheduled).length;
  const failedCount = users.filter(user => user.status === 'failed').length;
  
  const counts = {
    scheduled: scheduledCount,
    sent: sentCount,
    pending: pendingCount,
    failed: failedCount
  };
  
  // Ensure hasFilters is always a boolean value
  const hasFilters = Boolean(searchQuery) || statusFilter !== 'all';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Notified Users</CardTitle>
        <CardDescription>
          Users who have received or are scheduled to receive journey notifications
        </CardDescription>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email or journey stage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          <StatusFilters 
            value={statusFilter} 
            onChange={setStatusFilter} 
            counts={counts}
          />
        </div>
        
        <StatsCards counts={counts} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin opacity-70" />
          </div>
        ) : sortedUsers.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <UsersTable users={sortedUsers} />
        )}
      </CardContent>
    </Card>
  );
};
