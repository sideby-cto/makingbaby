import {
  QueryClient,
  QueryClientProvider as RQClientPRovider,
} from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});
export const QueryClientProvider = ({ children }: any) => {
  return <RQClientPRovider client={queryClient}>{children}</RQClientPRovider>;
};
