"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthFromString = exports.getDays = void 0;
const getDays = (year, month) => {
    return new Date(year, month, 0).getDate();
};
exports.getDays = getDays;
const getMonthFromString = (mon) => {
    return new Date(Date.parse(mon + ' 1, 2012')).getMonth() + 1;
};
exports.getMonthFromString = getMonthFromString;
//# sourceMappingURL=dateUtil.js.map