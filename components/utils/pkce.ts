import * as Crypto from 'expo-crypto';

export function generateCodeVerifier(): string {
  const randomBytes = Crypto.getRandomBytes(32);
  return base64URLEncode(randomBytes);
}

export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier
  );
  return base64URLEncode(digest);
};

function base64URLEncode(buffer: Uint8Array | string): string {
  const str = typeof buffer === 'string' ? buffer : Buffer.from(buffer).toString('base64');
  return str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}