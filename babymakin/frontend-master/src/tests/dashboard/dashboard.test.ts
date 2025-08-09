import { transformDashboardFilters } from "../../application";

test("Transforms filters correctly", function () {
  const dummyFilters = {
    school: "1234567890",
    district: "1234567890",
    goal: "1234567890",
    fromDate: new Date("2024-01-22"),
    toDate: new Date("2024-01-24"),
    successSign: "anshtasdf",
  };
  const parsedResults = transformDashboardFilters(dummyFilters);
  const expectedAnswer = `from=Sun Jan 21 2024 19:00:00 GMT-0500 (Eastern Standard Time)&to=Tue Jan 23 2024 19:00:00 GMT-0500 (Eastern Standard Time)&district=1234567890&school=1234567890&goal=1234567890&successSign=anshtasdf`;
  expect(parsedResults).toBe(expectedAnswer);
});

test("Transforms filters with 'All' values", function () {
  const dummyFilters = {
    school: "All",
    district: "All",
    goal: "All",
    fromDate: new Date("2023-08-30"),
    toDate: new Date("2024-01-24"),
    successSign: "All",
  };
  const parsedResults = transformDashboardFilters(dummyFilters);
  const expectedAnswer = `from=Tue Aug 29 2023 20:00:00 GMT-0400 (Eastern Daylight Time)&to=Tue Jan 23 2024 19:00:00 GMT-0500 (Eastern Standard Time)`;
  expect(parsedResults).toBe(expectedAnswer);
});

