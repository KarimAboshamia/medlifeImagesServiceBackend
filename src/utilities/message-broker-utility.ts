import amqp from 'amqplib';
import imageController from '../controllers/image-controller';
import ChannelMySingleton from './singleton-utility';

const brokerURL = process.env.BROKER_URL;

export const generateUrl = async (queueName: string, channel: amqp.Channel) => {
    channel.consume(
        queueName,
        async (msg) => {
            channel.ack(msg!);

            const res = await imageController.brokerURL(JSON.parse(String(msg!.content)));
            channel.sendToQueue(msg?.properties.replyTo!, Buffer.from(JSON.stringify({ res })), {
                correlationId: msg?.properties.correlationId,
            });
        },
        { noAck: false }
    );
};

export const deleteImage = async (queueName: string, channel: amqp.Channel) => {
    channel.consume(
        queueName,
        async (msg) => {
            channel.ack(msg!);

            let res;

            try {
                res = await imageController.brokerDelete(JSON.parse(String(msg!.content)));
            } catch (error) {
                res = error;
            }

            channel.sendToQueue(msg?.properties.replyTo!, Buffer.from(JSON.stringify({ res })), {
                correlationId: msg?.properties.correlationId,
            });
        },
        { noAck: false }
    );
};

export async function createChannel(): Promise<{ channel: amqp.Channel }> {
    try {
        const connection = await amqp.connect(brokerURL);
        let channel = await connection.createChannel();

        const mySingletonInstance = ChannelMySingleton.getInstance();

        mySingletonInstance.channel = channel;

        //when connection is closed reopen channel
        channel.on('error', async () => {
            // Re-open the channel
            await connection.createChannel().then((newChannel) => {
                channel = newChannel;
                mySingletonInstance.channel = channel;
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
