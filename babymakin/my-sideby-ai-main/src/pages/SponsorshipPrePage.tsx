
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Gift, ArrowRight, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const SponsorshipPrePage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-32">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <Card className="max-w-4xl mx-auto animate-fade-up">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Gift className="h-8 w-8 text-primary" />
              AI Tool Sponsorships
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="prose dark:prose-invert">
              <h2 className="text-2xl font-semibold mb-4">Supporting Educators in AI Adoption</h2>
              <p className="text-lg leading-relaxed">
                Through our network of contributors from outside K-12 education, we're able to offer 
                sponsored access to cutting-edge AI tools. These sponsorships, valued at approximately 
                $30 per month, help educators explore and implement new AI capabilities in their practice.
              </p>
              
              <div className="mt-6 p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg">
                <h3 className="text-xl font-medium text-blue-800 dark:text-blue-100">Request Almost Any AI Tool</h3>
                <p className="text-blue-700 dark:text-blue-200 mt-2">
                  Don't see the AI tool you're interested in? No problem! You can request access to almost any AI tool 
                  you're curious about. Our Gear Guides will work with you to determine the best tools for your teaching needs.
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800 mt-6">
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
                  Currently Available Sponsorships
                </h3>
                <p className="text-green-800 dark:text-green-200 mb-4">
                  We have <span className="font-bold">3 sponsorships</span> available for distribution this month.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <p className="text-green-800 dark:text-green-200">
                      Meet with a Gear Guide to get started
                    </p>
                  </div>
                  <Button asChild size="lg" className="w-full">
                    <a href="https://calendly.com/mike-sideby/gear-guide" target="_blank" rel="noopener noreferrer">
                      Schedule a Gear Guide Meeting
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SponsorshipPrePage;
