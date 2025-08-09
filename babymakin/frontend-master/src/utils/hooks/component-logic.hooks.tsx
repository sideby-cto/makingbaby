import { useState } from "react";
import { isSyntheticEvent } from "../functions";

export function useSelector<T>(initialValue?: T) {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const selectorFunction = (data: T) => {
    setValue(data);
  };
  return {
    value,
    selectorFunction,
  };
}

export function useSyntheticEventSelector<T>(initialValue?: T) {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const setFunction = (e: any) => {
    if (isSyntheticEvent(e)) {
      setValue((e.target as any).value as T);
    } else if (typeof e === "string") {
      setValue((e as any) ?? ("" as any));
    }
  };
  return {
    value,
    setFunction,
  };
}
