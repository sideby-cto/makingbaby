import React from "react";
interface AuthContainerProps {
  children: React.ReactNode;
}
export const AuthContainer: React.FC<AuthContainerProps> = ({
  children
}) => {
  return <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-classroom-cream-light to-classroom-cream">
      <div className="w-full max-w-xl text-center mb-8">
        <p className="text-palette-book-brown text-xl md:text-2xl italic font-medium font-body">Learning together, side by side</p>
      </div>
      {children}
    </div>;
};