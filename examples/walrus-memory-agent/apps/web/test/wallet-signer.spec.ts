import type { SuiGrpcClient } from '@mysten/sui/grpc'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { Transaction } from '@mysten/sui/transactions'
import { describe, expect, it, vi } from 'vitest'
import { createWalletSigner } from '../src/memory/wallet-signer'

describe('createWalletSigner (guide Step 3)', () => {
  const signer = new Ed25519Keypair()
  const suiClient = {} as SuiGrpcClient

  it('exposes the signer address', () => {
    expect(createWalletSigner(signer, suiClient).address).toBe(
      signer.toSuiAddress()
    )
  })

  it('executes transactions with the Sui client Walrus Memory leaves out', async () => {
    const spy = vi
      .spyOn(signer, 'signAndExecuteTransaction')
      .mockResolvedValue({} as never)
    const transaction = new Transaction()
    await createWalletSigner(signer, suiClient).signAndExecuteTransaction({
      transaction,
    })
    expect(spy).toHaveBeenCalledWith({ transaction, client: suiClient })
  })

  it('signs personal messages from the wallet-adapter input shape', async () => {
    const message = new TextEncoder().encode('gm')
    const { signature } = await createWalletSigner(
      signer,
      suiClient
    ).signPersonalMessage({ message })
    expect(signature).toBe(
      (await signer.signPersonalMessage(message)).signature
    )
  })
})
