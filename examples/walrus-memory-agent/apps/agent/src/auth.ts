import { createRemoteJWKSet, type JWTVerifyGetKey, jwtVerify } from 'jose'

export type VerifyParaUser = (paraJwt: string) => Promise<string>

export function paraJwks(url: string): JWTVerifyGetKey {
  return createRemoteJWKSet(new URL(url))
}

// Guide, App-Managed Memory, Step 3: resolve the Para user from a verified session token
export function createVerifyParaUser(
  jwks: JWTVerifyGetKey,
  audience: string
): VerifyParaUser {
  return async (paraJwt) => {
    const { payload } = await jwtVerify(paraJwt, jwks, { audience })
    if (!payload.sub) throw new Error('Para token has no sub claim')
    return payload.sub
  }
}

export function bearerToken(header: string | undefined): string | null {
  const match = header?.match(/^Bearer (.+)$/)
  return match?.[1] ?? null
}
