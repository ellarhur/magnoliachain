import PubNub from 'pubnub';

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'MAGNOLIACHAIN',
};

export default class Network {
  constructor({ blockchain }) {
    this.blockchain = blockchain;
    this.publisher = new PubNub({
      publishKey: process.env.PUBNUB_PUBLISH_KEY,
      subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
      uuid: 'server',
    });
    this.subscriber = new PubNub({
      publishKey: 'DIN_PUBLISH_KEY',
      subscribeKey: 'DIN_SUBSCRIBE_KEY',
      uuid: 'server-subscriber',
    });

    this.loadChannels();

    this.subscriber.addListener({
      message: (messageEvent) => {
        const { channel, message } = messageEvent;
        this.handleMessage(channel, JSON.stringify(message));
      },
    });

    this.subscriber.subscribe({
      channels: Object.values(CHANNELS),
    });
  }

  broadcast() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: this.blockchain.chain,
    });
  }

  handleMessage(channel, message) {
    console.log(`Got message ${message} on channel ${channel}`);
    const msg = JSON.parse(message);

    if (channel === CHANNELS.BLOCKCHAIN) {
      this.blockchain.replaceChain(msg);
    }
  }

  publish({ channel, message }) {
    this.publisher.publish(
      {
        channel,
        message,
      },
      (status, response) => {
        if (status.error) {
          console.error('PubNub publish error:', status);
        }
      }
    );
  }

  loadChannels() {
  }
}
