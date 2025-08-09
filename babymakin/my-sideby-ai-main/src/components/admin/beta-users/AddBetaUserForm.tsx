
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface AddBetaUserFormProps {
  onAddUser: (email: string) => Promise<void>;
  addingUser: boolean;
}

export const AddBetaUserForm: React.FC<AddBetaUserFormProps> = ({
  onAddUser,
  addingUser
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      setError(null);
      await onAddUser(email);
      setEmail('');
    } catch (err: any) {
      setError(err?.message || 'Failed to add user');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input 
          type="email"
          placeholder="User email (user must be registered first)" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="flex-1"
          disabled={addingUser}
        />
        <Button 
          type="submit"
          disabled={addingUser || !email}
        >
          {addingUser ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Adding...
            </>
          ) : 'Add Beta User'}
        </Button>
      </div>
      
      {error && (
        <div className="px-4 py-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
    </form>
  );
};
