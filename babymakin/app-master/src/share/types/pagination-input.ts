export class PaginationInput {
  constructor(
    public currentPage: number,
    public pageSize: number,
    public filter?: string,
  ) {
    this.pageSize = this.pageSize ? this.pageSize : 25;
  }
}
