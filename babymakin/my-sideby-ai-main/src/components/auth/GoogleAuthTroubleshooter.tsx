import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { validateGoogleAuthConfiguration, getRequiredGoogleCloudSettings } from '@/utils/googleAuthConfig';
import { useToast } from '@/hooks/use-toast';

interface GoogleAuthTroubleshooterProps {
  trigger?: React.ReactNode;
}

export const GoogleAuthTroubleshooter: React.FC<GoogleAuthTroubleshooterProps> = ({ trigger }) => {
  const { toast } = useToast();
  const [validation, setValidation] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const config = validateGoogleAuthConfiguration();
      const settingsData = getRequiredGoogleCloudSettings();
      setValidation(config);
      setSettings(settingsData);
    }
  }, [open]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="text-xs">
      <AlertTriangle className="h-3 w-3 mr-1" />
      Troubleshoot Google Auth
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Google OAuth Configuration Troubleshooter
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Status */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Current Configuration Status</h3>
            {validation && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {validation.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={validation.isValid ? 'text-green-700' : 'text-red-700'}>
                    {validation.isValid ? 'Configuration appears correct' : 'Configuration issues detected'}
                  </span>
                </div>
                
                {!validation.isValid && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-medium">Issues found:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {validation.issues.map((issue: string, index: number) => (
                            <li key={index} className="text-sm">{issue}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {/* Environment Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Current Environment</h3>
            <div className="bg-gray-50 p-3 rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Domain:</span>
                <Badge variant="outline">{window.location.hostname}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Origin:</span>
                <Badge variant="outline">{window.location.origin}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Protocol:</span>
                <Badge variant={window.location.protocol === 'https:' ? 'default' : 'destructive'}>
                  {window.location.protocol}
                </Badge>
              </div>
            </div>
          </div>

          {/* Step 1: Google Cloud Console */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Step 1: Google Cloud Console Setup</h3>
            <Alert>
              <AlertDescription>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium mb-2">1. Open Google Cloud Console:</div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                        https://console.cloud.google.com/apis/credentials
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2">2. Create OAuth 2.0 Client ID (Web application)</div>
                    <p className="text-sm text-gray-600">
                      Click "Create Credentials" → "OAuth Client ID" → Select "Web application"
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          {/* Step 2: Authorized JavaScript Origins */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Step 2: Authorized JavaScript Origins</h3>
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Add ALL of these origins to your OAuth client:</div>
                  {settings?.authorizedJavaScriptOrigins.map((origin: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">{origin}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(origin, 'Origin')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          </div>

          {/* Step 3: Authorized Redirect URIs */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Step 3: Authorized Redirect URIs</h3>
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Add ALL of these redirect URIs to your OAuth client:</div>
                  {settings?.authorizedRedirectUris.map((uri: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">{uri}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(uri, 'Redirect URI')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          </div>

          {/* Step 4: Supabase Configuration */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Step 4: Supabase Dashboard</h3>
            <Alert>
              <AlertDescription>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium mb-2">1. Configure Google Provider:</div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                        https://supabase.com/dashboard/project/upffcxqiozqhdgfesmji/auth/providers
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open('https://supabase.com/dashboard/project/upffcxqiozqhdgfesmji/auth/providers', '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2">2. Site URL:</div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                        {window.location.origin}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(window.location.origin, 'Site URL')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-2">3. Redirect URLs:</div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                        {window.location.origin}/**
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`${window.location.origin}/**`, 'Redirect URL pattern')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          {/* Common Issues */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Common Issues & Solutions</h3>
            <div className="space-y-2">
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">❌ "accounts.google.com refused to connect"</div>
                    <p className="text-sm">Your current domain is not authorized in Google Cloud Console. Add the exact origins listed above to your OAuth client configuration.</p>
                  </div>
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">❌ "unauthorized_client"</div>
                    <p className="text-sm">Check that your Google Client ID is correctly configured in Supabase and that the domain matches exactly in Google Cloud Console.</p>
                  </div>
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">❌ "invalid_request"</div>
                    <p className="text-sm">Verify that your redirect URIs in Google Cloud Console match exactly with the Supabase callback URL.</p>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                const config = validateGoogleAuthConfiguration();
                const settingsData = getRequiredGoogleCloudSettings();
                setValidation(config);
                setSettings(settingsData);
              }}
            >
              Refresh Status
            </Button>
            <Button onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};