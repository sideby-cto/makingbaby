
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ValuesContent = () => {
  return (
    <ScrollArea className="h-[60vh] w-full rounded-lg border border-gray-100 bg-white p-6">
      <div className="prose max-w-none space-y-8">
        <section>
          <h3 className="text-2xl tracking-tight font-bold text-[#FF5733]">
            Accelerating Innovation in Teaching and Learning, Together.
          </h3>
        </section>

        <section className="text-left">
          <h4 className="text-xl font-semibold text-gray-900">
            by amplifying and connecting educators with a stance
          </h4>
          <p className="mt-3 text-base text-gray-600 sm:text-lg">
            We're for and with educators with a stance - those specifically leaning into AI. 
            We're about supporting and connecting "early adopters" - specifically with AI, but 
            also in student-centered, competency-based, and deeper learning for equity. We're 
            a network and a community. We're a way to adopt and adapt innovations, curriculum, 
            and tools.
          </p>
        </section>

        <section className="text-left">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Our Shared Values</h4>
          <ul className="list-none space-y-2">
            {[
              "We are a learning community. We are a learning organization. Learning is progress. Prioritizing learning does not compromise excellence.",
              "Transparency and trust help us learn and grow together. We don't hide or manipulate results, choices, data, or decisions.",
              "We are striving for sustainability and adaptability in our work and across our team.",
              "We flex our growth mindset.",
              "Results and actions matter. When we know better, we do better.",
              "We expect conflict. We encourage open and honest professional conversations.",
              "We give feedback that's kind, specific, and helpful.",
              "We embrace the latest technology to support how we do our work."
            ].map((value, index) => (
              <li key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5733] flex items-center justify-center text-white text-sm">
                  {index + 1}
                </span>
                <span className="text-base text-gray-600 sm:text-lg">{value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="text-left">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Our Shared Norms</h4>
          <ul className="list-none space-y-2">
            {[
              "VALUE CURIOSITY - ask questions and share the air",
              "LISTEN - with the intention of learning",
              "SPEAK - to share, wonder, clarify, connect, teach, and learn",
              "SEEK PRESENCE - be here and engage",
              "COLLABORATE - support one another",
              "ENJOY one another - look for connection",
              "HAVE COURAGE - take risks, be ok with not knowing",
              "CELEBRATE LEARNING - focus on growth",
              "ASSUME THE BEST - consider strengths-based approaches"
            ].map((norm, index) => (
              <li key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF5733] flex items-center justify-center text-white text-sm">
                  {index + 1}
                </span>
                <span className="text-base text-gray-600 sm:text-lg">{norm}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ScrollArea>
  );
};
