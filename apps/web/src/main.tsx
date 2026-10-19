import '@getpara/react-sdk/styles.css'
import './styles.css'
import { ParaProvider } from '@getpara/react-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { para } from './para'
import { App } from './ui/App'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
})
const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={para}
        config={{ appName: 'Walrus Memory example' }}
      >
        <App />
      </ParaProvider>
    </QueryClientProvider>
  </StrictMode>
)
