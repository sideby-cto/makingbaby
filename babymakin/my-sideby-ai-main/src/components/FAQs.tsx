import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQs = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-primary mb-6">
          Our Values and Norms
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-3xl">
          These shared principles guide our community and help foster meaningful connections among educators.
        </p>
      </div>
      
      <div className="space-y-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="values" className="border border-secondary/20 rounded-xl shadow-sm px-6 py-1 mb-4 bg-white hover:border-secondary/40 transition-all">
            <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline py-6">
              Our Shared Values
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 text-base pb-8 leading-relaxed">
              <ul className="list-disc pl-6 space-y-3">
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

          <AccordionItem value="norms" className="border border-secondary/20 rounded-xl shadow-sm px-6 py-1 mb-4 bg-white hover:border-secondary/40 transition-all">
            <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline py-6">
              Our Shared Norms
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 text-base pb-8 leading-relaxed">
              <ul className="list-disc pl-6 space-y-3">
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

          <AccordionItem value="mission" className="border border-secondary/20 rounded-xl shadow-sm px-6 py-1 mb-4 bg-white hover:border-secondary/40 transition-all">
            <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline py-6">
              Our Mission
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 text-base pb-8 leading-relaxed">
              <p className="mb-4">Accelerating Innovation in Teaching and Learning, Together.</p>
              <p className="mb-4">We amplify and connect educators with a stance - those specifically leaning into AI and innovative teaching approaches. We support "early adopters" in student-centered, competency-based, and deeper learning for equity.</p>
              <p>We're building a network and community where educators can adopt and adapt innovations, curriculum, and tools while growing professionally through meaningful connections.</p>
              <p className="mt-4 text-sm border-t border-gray-100 pt-4">
                <strong>Community Standards:</strong> By joining our community, members acknowledge that inability to adhere to our values and norms or engaging in negative or harassing behaviors may result in removal from the community.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pacing" className="border border-secondary/20 rounded-xl shadow-sm px-6 py-1 mb-4 bg-white hover:border-secondary/40 transition-all">
            <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline py-6">
              What is pacing and how does it work?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 text-base pb-8 leading-relaxed">
              <p className="mb-3">Pacing determines how frequently you'll be matched with a new learning partner. If your pace is set to "Light" (monthly), you'll be matched once a month. If it's "Moderate" (every two weeks), you'll get a new partner every two weeks. For "Consistent" or "Deep Dive" paces, you'll be matched weekly.</p>
              <p>Each learning cycle follows a simple pattern: at the beginning of your cycle, you'll find out who your new partner is. Then, you'll coordinate to find a time that works for both of you. Next, you'll have a guided conversation using the Upduo app. Finally, you'll receive an artifact summarizing your conversation, and the cycle begins again with a new partner.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="upduo" className="border border-secondary/20 rounded-xl shadow-sm px-6 py-1 mb-4 bg-white hover:border-secondary/40 transition-all">
            <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline py-6">
              What is Upduo and how does it relate to our platform?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 text-base pb-8 leading-relaxed">
              <p className="mb-3">Upduo is a mobile app that we use to facilitate guided conversations between matched educators. Once you and your learning partner have scheduled a time to connect, you'll use the Upduo app to have a structured, meaningful conversation about educational topics.</p>
              <p>We encourage you to have these conversations once per cycle with your matched partner. Upduo provides thoughtful prompts and questions that help make your professional learning conversations more productive and insightful. After your conversation, you'll receive a summary artifact that captures key insights from your discussion.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
