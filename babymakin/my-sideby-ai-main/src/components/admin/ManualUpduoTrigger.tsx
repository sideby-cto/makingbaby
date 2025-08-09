import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ManualUpduoTrigger() {
  const [email, setEmail] = useState('mikeme@upduo.com');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleTrigger = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log('Calling manual-upduo-integration for:', email);
      
      const { data, error } = await supabase.functions.invoke('manual-upduo-integration', {
        body: { email }
      });

      console.log('Manual integration result:', { data, error });

      if (error) {
        throw error;
      }

      setResult(data);
      toast({
        title: 'Success',
        description: 'Manual Upduo integration triggered successfully',
      });
    } catch (error) {
      console.error('Error triggering manual integration:', error);
      setResult({ error: error.message });
      toast({
        title: 'Error',
        description: `Failed to trigger integration: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Manual Upduo Integration Trigger</CardTitle>
        <CardDescription>
          Manually trigger Upduo integration for a specific user email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">User Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user email"
          />
        </div>

        <Button 
          onClick={handleTrigger} 
          disabled={isLoading || !email}
          className="w-full"
        >
          {isLoading ? 'Triggering...' : 'Trigger Manual Integration'}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Result:</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}