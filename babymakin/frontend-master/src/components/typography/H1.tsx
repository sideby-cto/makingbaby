import { FC } from "react";

interface H1Props {
  heading: string;
}

export const H1: FC<H1Props> = ({ heading }) => (
  <h1 className="text-lg font-interBold text-black">{heading}</h1>
);
