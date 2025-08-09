export const convertArrayToHashMap = (
  list: any[],
  keyExtractionFn: (data: any) => string,
  valueExtractionFn?: (data: any) => any
) => {
  const hash: Map<string, any> = list.reduce((itm: Map<string, any>, sch) => {
    const key = keyExtractionFn(sch);
    const value = valueExtractionFn ? valueExtractionFn(sch) : sch;
    return itm.set(key, value);
  }, new Map());
  return Object.fromEntries(hash.entries());
};
