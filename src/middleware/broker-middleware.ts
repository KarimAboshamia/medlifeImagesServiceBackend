import { createChannel, createQueue, generateUrl, deleteImage } from "../utilities/message-broker-utility";

//get env variable
const generateUrlQueue = process.env.GENERATE_URLS_QUEUE;
const deleteImageQueue = process.env.DELETE_IMAGE_QUEUE;

//create function without requests
export const callReceiver = async () => {
    try {
        const {channel} = await createChannel();

        await createQueue(generateUrlQueue, channel);
        generateUrl(generateUrlQueue, channel);

        await createQueue(deleteImageQueue, channel);
        deleteImage(deleteImageQueue, channel);

    } catch (e) {
        throw e;
    }
};
