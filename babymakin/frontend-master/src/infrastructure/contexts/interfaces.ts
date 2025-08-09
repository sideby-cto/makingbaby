export type ContextProviderWithStateValuesType<T> = [
  T | null,
  React.Dispatch<React.SetStateAction<T | null>>
];
