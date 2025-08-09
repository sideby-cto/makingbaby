const colors = [
  "#B9BDC8",
  "#DDCABB",
  "#DCB13C",
  "#57BDA2",
  "#2493A2",
  "#304A78",
  "#2C3259",
];

export const generateRandomColor = () => {
  const index = Math.ceil(Math.random() * 7);
  return colors[index];
};
