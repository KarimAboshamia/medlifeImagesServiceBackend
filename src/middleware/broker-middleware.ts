import { createChannel, createQueue, generateUrl, deleteImage } from "../utilities/message-broker-utility";

//get env variable
const generateUrlQueue = process.env.GENERATE_URLS_QUEUE;

//create function without requests
export const callReceiver = async () => {
    try {
        console.log("Here")
        const {channel} = await createChannel();
        await createQueue(generateUrlQueue, channel);
        generateUrl(generateUrlQueue, channel);
        deleteImage(generateUrlQueue, channel);

    } catch (e) {
        console.log(e);
    }
};
