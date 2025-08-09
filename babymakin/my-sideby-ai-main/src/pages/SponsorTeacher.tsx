
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SponsorTeacher = () => {
  const navigate = useNavigate();
  const stripeLink = "https://buy.stripe.com/14kaH7821an04ne001";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-[#FF5733]">
            Sponsor a Teacher's AI Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help educators explore cutting-edge AI tools without financial barriers. 
            Your $20/month sponsorship opens doors to innovation in education.
          </p>
        </div>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-[#FF5733] flex items-center">
              <Heart className="h-6 w-6 mr-3" />
              How Your Sponsorship Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">What You Provide</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#FF5733] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>$20/month</strong> recurring sponsorship</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#FF5733] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Direct support for educator innovation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#FF5733] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Investment in the future of education</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">What Teachers Receive</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#FF5733] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>3 months</strong> of premium AI tool access</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#FF5733] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Freedom to explore any AI tool they're curious about</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#FF5733] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Time to evaluate before personal/institutional commitment</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why This Matters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Why This Matters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed mb-4">
              Many educators are curious about AI tools but face budget constraints that prevent exploration. 
              Your sponsorship removes this barrier, giving teachers 3 months to:
            </p>
            <ul className="space-y-2 text-gray-600 ml-4">
              <li>• Experiment with AI tools in their actual teaching context</li>
              <li>• Build confidence and expertise before making purchasing decisions</li>
              <li>• Gather evidence to present to administrators for institutional adoption</li>
              <li>• Discover which tools truly enhance their teaching practice</li>
            </ul>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-[#FF5733] to-[#FF7961] text-white">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join our community of supporters helping educators embrace AI innovation
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-[#FF5733] hover:bg-gray-100 font-semibold px-8 py-3"
            >
              <a href={stripeLink} target="_blank" rel="noopener noreferrer">
                Sponsor a Teacher - $20/month
              </a>
            </Button>
            <p className="text-sm mt-4 opacity-75">
              Cancel anytime. Your impact starts immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SponsorTeacher;
