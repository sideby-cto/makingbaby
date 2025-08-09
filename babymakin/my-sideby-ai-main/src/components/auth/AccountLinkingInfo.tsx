import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, User, Link } from 'lucide-react';

interface AccountLinkingInfoProps {
  className?: string;
}

export const AccountLinkingInfo: React.FC<AccountLinkingInfoProps> = ({ className = "" }) => {
  return (
    <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="space-y-2">
          <p className="font-medium flex items-center gap-2">
            <Link className="h-4 w-4" />
            Account Linking Available
          </p>
          <p className="text-sm">
            You can now sign in with either your email/password or Google account. If you have both types of accounts with the same email, they will be automatically linked together.
          </p>
          <div className="text-xs mt-2 space-y-1">
            <p className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <strong>Email/Password:</strong> Use your registered email and password
            </p>
            <p className="flex items-center gap-1">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <strong>Google:</strong> Click "Continue with Google" for one-click access
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};