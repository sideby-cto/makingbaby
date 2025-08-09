
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Gift, ArrowRight, ArrowLeft, Briefcase, Sparkles, Users, CheckCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { useState } from "react";
import { useClaimSponsorship } from "@/hooks/useClaimSponsorship";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Sponsorship = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { claimSponsorship, isLoading } = useClaimSponsorship();
  
  const [formData, setFormData] = useState({
    store: "",
    district: "",
    region: "",
    tool_name: "",
    scheduler_link: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tool_name) {
      toast({
        title: "Missing information",
        description: "Please specify which AI tool you're interested in.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.scheduler_link) {
      toast({
        title: "Missing scheduler link",
        description: "Please provide your scheduler link as it's required for sponsorship.",
        variant: "destructive",
      });
      return;
    }
    
    await claimSponsorship(formData);
    
    // Clear form after submission
    setFormData({
      store: "",
      district: "",
      region: "",
      tool_name: "",
      scheduler_link: ""
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/toolbox')} 
            className="mb-8 flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Toolbox
          </Button>
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-lg">
              <Gift className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent mb-4">
              AI Tool Sponsorship
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Unlock the power of cutting-edge AI tools with sponsored access through our educator network
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column - Information Cards */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Benefits Card */}
              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-orange-800">
                    <Sparkles className="h-6 w-6 text-orange-600" />
                    Why Sponsorship?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-orange-800 text-sm leading-relaxed">
                      Access premium AI tools without the financial burden
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-orange-800 text-sm leading-relaxed">
                      Expert guidance on tool implementation in education
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-orange-800 text-sm leading-relaxed">
                      Join a community of innovative educators
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Process Card */}
              <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-teal-800">
                    <Users className="h-6 w-6 text-teal-600" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center">1</div>
                    <p className="text-teal-800 text-sm leading-relaxed">
                      Submit your tool request with scheduler link
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center">2</div>
                    <p className="text-teal-800 text-sm leading-relaxed">
                      Quick 20-minute consultation call
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center">3</div>
                    <p className="text-teal-800 text-sm leading-relaxed">
                      Get sponsored access and start exploring
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Request Form */}
            <div className="lg:col-span-2">
              <Card className="border-gray-200 bg-white shadow-xl">
                <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-teal-50">
                  <CardTitle className="text-2xl text-gray-800">
                    Request Tool Sponsorship
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    Tell us about the AI tool you'd like to explore and we'll help make it happen.
                  </p>
                </CardHeader>
                <CardContent className="pt-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Tool Request Section */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tool_name" className="text-gray-700 font-medium mb-2 block">
                          Which AI tool interests you? *
                        </Label>
                        <Input
                          id="tool_name"
                          name="tool_name"
                          placeholder="e.g., ChatGPT Plus, Claude Pro, Midjourney, Perplexity Pro..."
                          value={formData.tool_name}
                          onChange={handleInputChange}
                          className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-400 text-gray-800 placeholder-gray-500 h-12"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="scheduler_link" className="text-gray-700 font-medium mb-2 block">
                          Your Scheduler Link *
                        </Label>
                        <Input
                          id="scheduler_link"
                          name="scheduler_link"
                          placeholder="https://calendly.com/yourname or your booking link"
                          value={formData.scheduler_link}
                          onChange={handleInputChange}
                          className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-400 text-gray-800 placeholder-gray-500 h-12"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                          📅 Required so we can coordinate a brief meeting to discuss your needs
                        </p>
                      </div>
                    </div>

                    {/* Optional Information Section */}
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Optional Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="district" className="text-gray-700 font-medium mb-2 block">
                            School or District
                          </Label>
                          <Input
                            id="district"
                            name="district"
                            placeholder="Your school or district"
                            value={formData.district}
                            onChange={handleInputChange}
                            className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-400 text-gray-800 placeholder-gray-500 h-11"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="region" className="text-gray-700 font-medium mb-2 block">
                            Region/State
                          </Label>
                          <Input
                            id="region"
                            name="region"
                            placeholder="Your region or state"
                            value={formData.region}
                            onChange={handleInputChange}
                            className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-400 text-gray-800 placeholder-gray-500 h-11"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-100">
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold h-12 px-8 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting Request...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Submit Sponsorship Request
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Meeting Info Card */}
              <Card className="mt-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-1">
                        Quick Coordination Meeting
                      </h3>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        We'll spend less than 20 minutes together to discuss your AI tool needs and coordinate sponsorship details. No worries if your calendar sends 30-minute or 1-hour blocks!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Sponsorship;
