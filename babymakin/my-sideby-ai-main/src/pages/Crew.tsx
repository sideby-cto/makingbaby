import React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Crew = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crew</h1>
          <p className="text-muted-foreground">
            Manage your crew and team activities
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Join a Crew
              </CardTitle>
              <CardDescription>
                Enter your crew code to join your learning community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/crew-code">
                  <Plus className="h-4 w-4 mr-2" />
                  Enter Crew Code
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Crew Status</CardTitle>
              <CardDescription>
                View your current crew membership and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No crew membership found. Use a crew code to join your learning community.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Crew;