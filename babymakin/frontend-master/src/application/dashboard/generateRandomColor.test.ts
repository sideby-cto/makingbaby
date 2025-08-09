import { generateRandomColor } from "./generateRandomColor";

test("Return a random color", function () {
  
  const returnedColor = generateRandomColor();

  const expectedColors = [
    "#B9BDC8",
    "#DDCABB",
    "#DCB13C",
    "#57BDA2",
    "#2493A2",
    "#304A78",
    "#2C3259",
  ];

  expect(expectedColors).toContain(returnedColor);
});

