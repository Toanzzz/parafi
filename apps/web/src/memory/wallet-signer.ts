import type { Signer } from '@mysten/sui/cryptography'
import type { SuiGrpcClient } from '@mysten/sui/grpc'
import type { Transaction } from '@mysten/sui/transactions'

// ParaSuiSigner isn't assignable to Signer under @mysten/sui 2.37 (its sign() return type is wider),
// so accept the methods the adapter uses.
type SuiSigner = Pick<
  Signer,
  'toSuiAddress' | 'signAndExecuteTransaction' | 'signPersonalMessage'
>

// Guide, User-Owned Memory, Step 3: adapt the Para signer for Walrus Memory
export function createWalletSigner(
  signer: SuiSigner,
  suiClient: SuiGrpcClient
) {
  return {
    address: signer.toSuiAddress(),
    signAndExecuteTransaction: ({
      transaction,
    }: {
      transaction: Transaction
    }) => signer.signAndExecuteTransaction({ transaction, client: suiClient }),
    signPersonalMessage: ({ message }: { message: Uint8Array }) =>
      signer.signPersonalMessage(message),
  }
}
