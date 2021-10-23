import "tailwindcss/tailwind.css";
import { QueryClient, QueryClientProvider } from "react-query";
const client = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={client}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default MyApp;
