import { keyManager } from './keyManager.mjs';
import { createHash } from './hash.mjs';

export const verifySignature = ({ publicKey, data, signature }) => {
  const key = keyManager.keyFromPublic(publicKey, 'hex');
  return key.verify(createHash(data), signature);
};