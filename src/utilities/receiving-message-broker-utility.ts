import amqp from 'amqplib';

import ReceivingChannelSingleton from '../models/receiving-channel-singleton';
import imageBroker from '../brokers/image-broker';

const BROKER_URL = process.env.BROKER_URL;
const GENERATE_URLS_QUEUE = process.env.GENERATE_URLS_QUEUE;
const DELETE_IMAGE_QUEUE = process.env.DELETE_IMAGE_QUEUE;

export const pullMessageFromQueue = async (
    queueName: string,
    channel: amqp.Channel,
    controller: (data: any) => Promise<any>
) => {
    try {
        channel.consume(
            queueName,
            async (msg) => {
                channel.ack(msg!);

                let data = JSON.parse(String(msg!.content));

                let res: any;

                try {
                    res = await controller(data);
                } catch (error) {
                    res = {
                        ...error,
                        message: error.message,
                        statusCode: error.statusCode || error.status || 500,
                    };
                }

                await channel.sendToQueue(msg?.properties.replyTo!, Buffer.from(JSON.stringify(res)), {
                    correlationId: msg?.properties.correlationId,
                });
            },
            { noAck: false }
        );
    } catch (error) {
        throw error;
    }
};

export async function createChannel(): Promise<{ channel: amqp.Channel }> {
    try {
        const connection = await amqp.connect(BROKER_URL);
        let channel = await connection.createChannel();

        const receivingChannel = ReceivingChannelSingleton.getInstance();

        receivingChannel.channel = channel;

        //when connection is closed reopen channel
        channel.on('error', async () => {
            // Re-open the channel
            await connection.createChannel().then((newChannel) => {
                channel = newChannel;
                receivingChannel.channel = channel;
            });
        });

        return { channel };
    } catch (error) {
        throw error;
    }
}

export async function createQueue(queueName: string, channel: amqp.Channel) {
    try {
        await channel.assertQueue(queueName, { durable: false });
        channel.prefetch(1);
    } catch (error) {
        throw error;
    }
}

export const callReceiver = async () => {
    try {
        const receivingChannel = ReceivingChannelSingleton.getInstance();

        await createChannel();

        await createQueue(GENERATE_URLS_QUEUE, receivingChannel.channel);
        await pullMessageFromQueue(GENERATE_URLS_QUEUE, receivingChannel.channel, imageBroker.generateUrls);

        await createQueue(DELETE_IMAGE_QUEUE, receivingChannel.channel);
        await pullMessageFromQueue(DELETE_IMAGE_QUEUE, receivingChannel.channel, imageBroker.deleteImages);
    } catch (error) {
        throw error;
    }
};
