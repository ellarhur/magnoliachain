import crypto from 'crypto';

export default class Wallet {
  constructor() {
    this.keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    this.publicKey = this.keyPair.publicKey;
    this.privateKey = this.keyPair.privateKey;
  }

  getAddress() {
    return crypto.createHash('sha256').update(this.publicKey).digest('hex');
  }

  sign(data) {
    return crypto.sign('sha256', Buffer.from(data), this.privateKey);
  }

  verify(data, signature) {
    return crypto.verify('sha256', Buffer.from(data), this.publicKey, signature);
  }
} 