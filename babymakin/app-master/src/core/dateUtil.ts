export const getDays = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

export const getMonthFromString = (mon: string) => {
  return new Date(Date.parse(mon + ' 1, 2012')).getMonth() + 1;
};
