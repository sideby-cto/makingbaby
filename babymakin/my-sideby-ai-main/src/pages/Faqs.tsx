
import { Navbar } from "@/components/Navbar";
import { FAQs } from "@/components/FAQs";

const Faqs = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-20 pb-24">
        <FAQs />
      </div>
    </div>
  );
};

export default Faqs;
