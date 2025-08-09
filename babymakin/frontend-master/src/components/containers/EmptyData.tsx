import React from "react";
import { MdOutlineFilterNone } from "react-icons/md";

interface Props {
  title?: string;
}

export const EmptyData: React.FC<Props> = ({ title }) => (
  <div className="flex flex-col space-y-5 w-full h-fit py-2 items-center justify-center">
    <MdOutlineFilterNone color="#000" size="32px" />
    <h2 className="text-md font-inter"> No {title ? `${title}` : "data"}</h2>
  </div>
);
