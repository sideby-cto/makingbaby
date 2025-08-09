import { BookOpen, Users, MessageCircle, Shield, Brain, Target } from "lucide-react";
const features = [{
  name: "Purpose-Built for Educators",
  description: "sideby is intentionally designed for educators to connect, learn, and grow through meaningful, focused conversations tailored to their teaching practice.",
  icon: Target
}, {
  name: "Facilitated, Not Just Hosted",
  description: "We actively facilitate learning pathways and conversations, using AI to surface relevant topics, insights, and connections that matter most to educators.",
  icon: Brain
}, {
  name: "A Learning Network",
  description: "Focus on professional growth and collaboration in education—not job hunting or casual interactions. It's about actionable learning and shared problem-solving.",
  icon: Users
}, {
  name: "Learner-Centered Values",
  description: "We emphasize student-centered learning, mirroring the values of our community. Create conditions where educators can thrive and innovate together.",
  icon: BookOpen
}, {
  name: "Focus on Conversations",
  description: "While other platforms emphasize content overload, sideby focuses on connection through conversation—meaningful exchanges, not just scrolling through feeds.",
  icon: MessageCircle
}, {
  name: "Verified Educators Only",
  description: "Every member is a verified educator, creating a trusted space for genuine, professional collaboration with robust verification processes.",
  icon: Shield
}];
export const Features = () => {
  return <div className="py-12 bg-classroom-cream ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-[#FF5733] font-black tracking-wide uppercase">
            Features
          </h2>
          <p className="mt-2 text-3xl leading-8 font-black tracking-tight text-gray-900 sm:text-4xl">
            Built for Educator Growth
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Connect with educators, share insights, and grow together in a space designed specifically for teaching professionals.
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map(feature => <div key={feature.name} className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-bold text-gray-900">
                  {feature.name}
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  {feature.description}
                </p>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};