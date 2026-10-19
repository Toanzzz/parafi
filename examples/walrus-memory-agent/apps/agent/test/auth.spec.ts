import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose'
import { describe, expect, it } from 'vitest'
import { bearerToken, createVerifyParaUser } from '../src/auth'

async function issuer() {
  const { publicKey, privateKey } = await generateKeyPair('ES256')
  const jwk = { ...(await exportJWK(publicKey)), kid: 'test', alg: 'ES256' }
  const sign = (claims: { sub?: string; aud: string }) => {
    const jwt = new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: 'test' })
      .setAudience(claims.aud)
    if (claims.sub) jwt.setSubject(claims.sub)
    return jwt.setExpirationTime('5m').sign(privateKey)
  }
  return { jwks: createLocalJWKSet({ keys: [jwk] }), sign }
}

describe('createVerifyParaUser', () => {
  it('returns the sub of a token issued for this app', async () => {
    const { jwks, sign } = await issuer()
    const verify = createVerifyParaUser(jwks, 'app-key-id')
    await expect(
      verify(await sign({ sub: 'user-1', aud: 'app-key-id' }))
    ).resolves.toBe('user-1')
  })

  it('rejects a token issued for another Para app', async () => {
    const { jwks, sign } = await issuer()
    const verify = createVerifyParaUser(jwks, 'app-key-id')
    await expect(
      verify(await sign({ sub: 'user-1', aud: 'other-app' }))
    ).rejects.toThrow()
  })

  it('rejects a token without a subject', async () => {
    const { jwks, sign } = await issuer()
    const verify = createVerifyParaUser(jwks, 'app-key-id')
    await expect(verify(await sign({ aud: 'app-key-id' }))).rejects.toThrow(
      'no sub'
    )
  })
})

describe('bearerToken', () => {
  it('extracts the token from a Bearer header', () => {
    expect(bearerToken('Bearer abc.def')).toBe('abc.def')
    expect(bearerToken('Basic abc')).toBeNull()
    expect(bearerToken(undefined)).toBeNull()
  })
})
