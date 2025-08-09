
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Policy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-3xl font-bold mb-8 text-[#FF5733]">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Effective Date: January 2, 2025</p>
        
        <div className="prose max-w-none">
          <p className="text-lg">
            At sideby, we prioritize your privacy and security. This Privacy Policy explains what data we collect, 
            how we use it, and how we protect your information while fostering a trusted professional learning environment for educators.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
          <p>
            When you use sideby, we collect the following types of information:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Account Information – Name, email, and professional details when you create an account.</li>
            <li>Usage Data – Your participation in learning pathways, educator connections, and interactions with AI-generated insights.</li>
            <li>Device & Technical Data – Browser type, IP address, and operating system for platform functionality and security.</li>
            <li>Communication Data – Messages, conversation summaries, and shared insights within the network.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
          <p>
            We use collected information to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Facilitate AI-powered educator matching and peer learning experiences.</li>
            <li>Personalize learning pathways based on engagement and interests.</li>
            <li>Improve platform functionality and AI-driven recommendations.</li>
            <li>Ensure a safe and collaborative learning environment.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. Data Sharing & Protection</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>We do not sell your data to third parties.</li>
            <li>Data is securely stored using encryption and privacy best practices.</li>
            <li>Student information should not be shared on the platform, and we actively work to prevent its collection.</li>
            <li>We may share anonymized, aggregated insights to improve AI learning models and educational strategies.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Retention & Deletion</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>We retain your data only as long as necessary for platform functionality and improvement.</li>
            <li>You may delete or modify your profile at any time.</li>
            <li>If you request account deletion, your personal data will be removed from our systems within a reasonable timeframe.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">5. Third-Party Services</h2>
          <p>
            sideby may integrate with third-party tools (e.g., AI models) to enhance educator learning experiences. 
            We ensure these partners follow strict data security and privacy standards.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">6. Compliance & User Rights</h2>
          <p>
            We comply with global data protection laws, including GDPR, ensuring transparency and user control. You have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access, update, or delete your data.</li>
            <li>Adjust privacy settings within your account.</li>
            <li>Request information about how your data is used.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">7. Updates & Contact</h2>
          <p>
            We may update this Privacy Policy periodically. Any changes will be communicated through the platform.
          </p>
          <p>
            For questions or concerns, contact us at <a href="mailto:info@sideby.ai" className="text-[#FF5733]">info@sideby.ai</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Policy;
