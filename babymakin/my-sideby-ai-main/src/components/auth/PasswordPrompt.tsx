
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { verifyStagePassword } from '@/utils/permissions/domainAccess';

interface PasswordPromptProps {
  onAuthenticated: () => void;
}

export const PasswordPrompt = ({ onAuthenticated }: PasswordPromptProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const isCorrect = verifyStagePassword(password);
      if (isCorrect) {
        onAuthenticated();
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-primary">Staging Environment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-gray-700 mb-4">
                This is a protected staging environment. Please enter the password to continue.
              </p>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                autoFocus
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !password}
            >
              {isSubmitting ? 'Verifying...' : 'Access Staging'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          If you need access, please contact the administrator.
        </CardFooter>
      </Card>
    </div>
  );
};
