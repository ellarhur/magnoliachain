import EC from 'elliptic';
import { createHash } from './hash.mjs';

export const verify = new EC.ec('secp256k1');

export const verifySignature = ({ publicKey, data, signature }) => {
  const key = verify.keyFromPublic(publicKey, 'hex');
  return key.verify(createHash(data), signature);
};