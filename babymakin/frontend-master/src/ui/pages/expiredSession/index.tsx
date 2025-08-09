import React from "react";
import { FaUserTimes } from "react-icons/fa";

export const ExpiredSessionPage: React.FC = () => {
  return (
    <div className="flex flex-col px-5 lg:px-0 h-full w-full items-center justify-center bg-[#E7EDE6]">
      <div className="space-y-5 flex flex-col items-center justify-center">
        <FaUserTimes size="40px" color="#43A980" />
        <p className="text-md text-center font-inter text-[#008080] text-base">
          <span className="block font-interBold text-2xl md:text-xl">
            Sorry !
          </span>
          We were unable to setup your dashboard.{" "}
          <a
            href="/login"
            className="inline-block underline underline-offset-4 text-[#a9a9a9] hover:text-[#182747] mr-2"
          >
            Redirect to Login
          </a>{" "}
          to get a new login token or
          <a
            href="mailto:kippy@smallwinsdashboard.com"
            className="underline underline-offset-4 text-[#a9a9a9] hover:text-[#182747] mx-2"
          >
            contact us
          </a>
          if problem persists.
        </p>
      </div>
    </div>
  );
};
