
import React from "react";
import { Lightbulb, Sparkles, Heart, MessageSquare, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const GalleryEmptyState = () => {
  return (
    <div className="max-w-4xl mx-auto text-center py-12 space-y-8">
      {/* Main Icon */}
      <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
        <Lightbulb className="h-12 w-12 text-gray-600" />
      </div>

      {/* Title and Description */}
      <div className="space-y-4">
        <h3 className="text-3xl font-bold text-gray-900">Your Ideas Gallery</h3>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          As you participate in sideby sessions, meaningful ideas will emerge and be captured here. 
          These are reflections of your learning journey.
        </p>
      </div>

      {/* Preview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Card className="p-4 bg-white border-gray-200 hover:shadow-md transition-shadow">
          <Sparkles className="h-6 w-6 text-sideby-burgundy-500 mb-3" />
          <h4 className="font-semibold text-gray-900 mb-2">Transformative</h4>
          <p className="text-sm text-gray-600">Ideas that spark profound change and breakthrough thinking</p>
        </Card>
        
        <Card className="p-4 bg-white border-gray-200 hover:shadow-md transition-shadow">
          <Heart className="h-6 w-6 text-sideby-orange-500 mb-3" />
          <h4 className="font-semibold text-gray-900 mb-2">Energizing</h4>
          <p className="text-sm text-gray-600">Ideas that ignite passion and motivation for action</p>
        </Card>
        
        <Card className="p-4 bg-white border-gray-200 hover:shadow-md transition-shadow">
          <Target className="h-6 w-6 text-sideby-blue-600 mb-3" />
          <h4 className="font-semibold text-gray-900 mb-2">Strategic</h4>
          <p className="text-sm text-gray-600">Thoughts perfectly aligned with your goals and values</p>
        </Card>
        
        <Card className="p-4 bg-white border-gray-200 hover:shadow-md transition-shadow">
          <MessageSquare className="h-6 w-6 text-sideby-teal-600 mb-3" />
          <h4 className="font-semibold text-gray-900 mb-2">Community Wisdom</h4>
          <p className="text-sm text-gray-600">Rich discussions and reflections from your learning peers</p>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="space-y-6 pt-4">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to start your learning journey?</h4>
          <p className="text-gray-600 mb-4">
            Join sideby sessions to begin collecting meaningful ideas that will shape your growth and learning path.
          </p>
          <Button className="bg-sideby-orange-500 hover:bg-sideby-orange-600 text-white font-semibold px-6 py-3">
            <Lightbulb className="h-4 w-4 mr-2" />
            Explore sideby Sessions
          </Button>
        </div>
      </div>
    </div>
  );
};
