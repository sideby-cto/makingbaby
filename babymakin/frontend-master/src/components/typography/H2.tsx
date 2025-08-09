import { FC } from "react";

interface H2Props {
  heading: string;
}

export const H2: FC<H2Props> = ({ heading }) => (
  <h2 className="text-xl font-semibold">{heading}</h2>
);
