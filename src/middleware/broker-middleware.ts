import { createChannel, createQueue, generateUrl, deleteImage } from "../utilities/message-broker-utility";
import ChannelMySingleton from "../utilities/singleton-utility";

//get env variable
const generateUrlQueue = process.env.GENERATE_URLS_QUEUE;
const deleteImageQueue = process.env.DELETE_IMAGE_QUEUE;

//create function without requests
export const callReceiver = async () => {
    try {
        const mySingletonInstance = ChannelMySingleton.getInstance();

        await createChannel();

        await createQueue(generateUrlQueue, mySingletonInstance.channel);
        generateUrl(generateUrlQueue, mySingletonInstance.channel);

        await createQueue(deleteImageQueue, mySingletonInstance.channel);
        deleteImage(deleteImageQueue, mySingletonInstance.channel);

    } catch (e) {
        throw e;
    }
};
