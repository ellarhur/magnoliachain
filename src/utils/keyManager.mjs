import elliptic from 'elliptic';

const { ec } = elliptic;

export const keyManager = new ec('secp256k1'); 