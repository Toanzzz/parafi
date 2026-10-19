import { ParaWeb } from '@getpara/react-sdk'
import { SuiGrpcClient } from '@mysten/sui/grpc'

const apiKey = import.meta.env.VITE_PARA_API_KEY
if (!apiKey) throw new Error('Set VITE_PARA_API_KEY in apps/web/.env.local')

// Guide, User-Owned Memory, Step 2: initialize Para (complete authentication before signing)
export const para = new ParaWeb(apiKey)

export const suiClient = new SuiGrpcClient({
  network: 'mainnet',
  baseUrl: 'https://fullnode.mainnet.sui.io:443',
})
