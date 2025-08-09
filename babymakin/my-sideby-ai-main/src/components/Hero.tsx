
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="relative bg-gradient-to-br from-brand-primary to-brand-secondary text-white overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/lovable-uploads/e4cab24d-9e67-43cc-aa48-f6b21b0c884e.png")'
        }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32 bg-primary/80">
          {/* Hero Brand Section */}
          <div className="flex justify-center pt-8 mb-8">
            <img 
              src="/lovable-uploads/0da40708-6587-46e8-883e-15310c301556.png" 
              alt="sideby logo" 
              className="h-16 w-auto min-w-[100px] drop-shadow-lg"
            />
          </div>
          
          <main className="mt-4 mx-auto max-w-7xl px-4 sm:mt-8 sm:px-6 md:mt-12 lg:mt-16 lg:px-8 xl:mt-20">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-black text-white sm:text-5xl md:text-6xl font-headline">
                <span className="block xl:inline animate-fade-down">Why Educators</span>{" "}
                <span className="block xl:inline animate-fade-up">
                  Get sideby
                </span>
              </h1>
              <p className="mt-3 text-base text-white sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 animate-fade-up font-body">
                Unlike LinkedIn or Facebook groups, sideby is intentionally designed for educators to connect, learn, and grow through meaningful, focused conversations tailored to their teaching practice.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start animate-fade-up">
                <div className="rounded-md shadow">
                  <Button
                    asChild
                    variant="sideby"
                    size="lg"
                    className="w-full px-8 py-3 text-base font-medium"
                  >
                    <Link to="/register">
                      <span className="font-semibold">Enter Here</span>
                    </Link>
                  </Button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full px-8 py-3 text-base font-medium border-2 border-white bg-transparent text-white hover:bg-white hover:text-brand-primary shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    <Link to="/faqs">
                      <span className="font-semibold">Learn More</span>
                    </Link>
                  </Button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full px-8 py-3 text-base font-medium border-2 border-white bg-transparent text-white hover:bg-white hover:text-brand-primary shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    <Link to="/sponsor-teacher">
                      <span className="font-semibold">Sponsor a Teacher</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
