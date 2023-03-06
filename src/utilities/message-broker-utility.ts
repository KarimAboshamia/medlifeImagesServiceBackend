import amqp from 'amqplib';
import imageController from '../controllers/image-controller';

export const generateUrl = async (queueName: string, channel: amqp.Channel) => {
    channel.consume(
        queueName,
        async (msg) => {
            channel.ack(msg!);

            const res = await imageController.brokerURL(JSON.parse(String(msg!.content)));
            channel.sendToQueue(
                msg?.properties.replyTo!,
                Buffer.from(JSON.stringify({ res })),
                {
                    correlationId: msg?.properties.correlationId,
                }
            );
        },
        { noAck: false }
    );
};



export const deleteImage = async (queueName: string, channel: amqp.Channel) => {
    channel.consume(
        queueName,
        async (msg) => {
            channel.ack(msg!);

            const res = await imageController.brokerDelete(JSON.parse(String(msg!.content)));
            channel.sendToQueue(
                msg?.properties.replyTo!,
                Buffer.from(JSON.stringify({ res })),
                {
                    correlationId: msg?.properties.correlationId,
                }
            );
        },
        { noAck: false }
    );
};


export async function createChannel(): Promise<{ channel: amqp.Channel }> {
    try {
        const connection = await amqp.connect(
            'amqps://hxhbuwqc:pNhM1LZazWWxYJ9N_HPpHD0TRTNR-2-H@rat.rmq2.cloudamqp.com/hxhbuwqc'
        );
        const channel = await connection.createChannel();

        console.log("Channel created");
        return {channel};
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export async function createQueue(queueName: string, channel: amqp.Channel) {
    try {
        await channel.assertQueue(queueName, { durable: false });
        channel.prefetch(1);
        console.log("Queue created");
    } catch (error) {
        console.log(error);
        throw error;
    }
}