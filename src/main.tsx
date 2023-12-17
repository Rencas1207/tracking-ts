import { QueryClient, QueryClientProvider } from 'react-query';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ReactQueryDevtools } from 'react-query/devtools';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools />
  </QueryClientProvider>
);
