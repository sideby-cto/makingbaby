"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationInput = void 0;
class PaginationInput {
    constructor(currentPage, pageSize, filter) {
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.filter = filter;
        this.pageSize = this.pageSize ? this.pageSize : 25;
    }
}
exports.PaginationInput = PaginationInput;
//# sourceMappingURL=pagination-input.js.map