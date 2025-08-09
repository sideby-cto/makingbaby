
import React from "react";

export const ValuesHeader = () => {
  return (
    <div className="space-y-2 pb-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
          <img 
            src="/lovable-uploads/0da40708-6587-46e8-883e-15310c301556.png" 
            alt="sideby logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h2 className="text-4xl tracking-tight font-black text-classroom-orange">
            Our Mission & Values
          </h2>
          <p className="text-base text-classroom-text-secondary sm:text-lg">Join us in shaping the future of education</p>
        </div>
      </div>
    </div>
  );
};
