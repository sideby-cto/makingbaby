
import React from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRow } from './UserRow';
import { NotifiedUserData } from '../NotifiedUsersList';

interface UsersTableProps {
  users: NotifiedUserData[];
}

export const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  return (
    <div className="overflow-x-auto w-full">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">User</TableHead>
            <TableHead>Journey Stage</TableHead>
            <TableHead>Notification Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
