
import React from "react";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const ValuesTab: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-full px-1 sm:px-2">
          <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
            <AccordionItem value="values" className="border border-secondary/20 rounded-xl shadow-sm px-3 sm:px-6 py-1 bg-white hover:border-secondary/40 transition-all">
              <AccordionTrigger className="text-base sm:text-lg font-semibold text-gray-900 hover:no-underline py-4 sm:py-6">
                Our Shared Values
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-sm sm:text-base pb-6 sm:pb-8 leading-relaxed">
                <ul className="list-disc pl-4 sm:pl-6 space-y-2 sm:space-y-3">
                  <li>We are a learning community and a learning organization. Learning is progress. Prioritizing learning does not compromise excellence.</li>
                  <li>Transparency and trust help us learn and grow together. We don't hide or manipulate results, choices, data, or decisions.</li>
                  <li>We are striving for sustainability and adaptability in our work and across our team.</li>
                  <li>We flex our growth mindset.</li>
                  <li>Results and actions matter. When we know better, we do better.</li>
                  <li>We expect conflict. We encourage open and honest professional conversations.</li>
                  <li>We give feedback that's kind, specific, and helpful.</li>
                  <li>We embrace the latest technology to support how we do our work.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="norms" className="border border-secondary/20 rounded-xl shadow-sm px-3 sm:px-6 py-1 bg-white hover:border-secondary/40 transition-all">
              <AccordionTrigger className="text-base sm:text-lg font-semibold text-gray-900 hover:no-underline py-4 sm:py-6">
                Our Shared Norms
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-sm sm:text-base pb-6 sm:pb-8 leading-relaxed">
                <ul className="list-disc pl-4 sm:pl-6 space-y-2 sm:space-y-3">
                  <li><strong>VALUE CURIOSITY</strong> - ask questions and share the air</li>
                  <li><strong>LISTEN</strong> - with the intention of learning</li>
                  <li><strong>SPEAK</strong> - to share, wonder, clarify, connect, teach, and learn</li>
                  <li><strong>SEEK PRESENCE</strong> - be here and engage</li>
                  <li><strong>COLLABORATE</strong> - support one another</li>
                  <li><strong>ENJOY ONE ANOTHER</strong> - look for connection</li>
                  <li><strong>HAVE COURAGE</strong> - take risks, be ok with not knowing</li>
                  <li><strong>CELEBRATE LEARNING</strong> - focus on growth</li>
                  <li><strong>ASSUME THE BEST</strong> - consider strengths-based approaches</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      
      <div className="flex-shrink-0 mt-3 sm:mt-4 px-1 sm:px-2">
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-3">
          <Button 
            asChild 
            variant="outline" 
            className="flex-1 text-sm sm:text-base"
          >
            <Link to="/faqs">View Full FAQs</Link>
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="ghost" className="flex-1 text-sm sm:text-base">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </div>
    </div>
  );
};
