import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import AWSCloudSingleton from '../models/aws-cloud-singleton';

const deleteImages = async (imagesName: string[]) => {
    console.log('imagesName', imagesName);

    try {
        const AWSSingleton = AWSCloudSingleton.getInstance();

        for (const image of imagesName) {
            const params = {
                Bucket: AWSSingleton.bucketName,
                Key: image,
            };

            const command = new DeleteObjectCommand(params);
            await AWSSingleton.s3.send(command);
        }
    } catch (err) {
        throw err;
    }

    return { message: 'image deleted successfully!', status: 200 };
};

const generateUrls = async (imagesName: string[][]) => {
    console.log('imagesName', imagesName);

    let responseURLs = [];

    try {
        const AWSSingleton = AWSCloudSingleton.getInstance();

        for (let image of imagesName) {
            let imageUrls = [];

            for (let im of image) {
                const params = {
                    Bucket: AWSSingleton.bucketName,
                    Key: im,
                };

                const command = new GetObjectCommand(params);
                const url = await getSignedUrl(AWSSingleton.s3, command, { expiresIn: 3600 });

                imageUrls.push(url);
            }

            responseURLs.push(imageUrls);
        }
    } catch (err) {
        throw err;
    }

    return { message: 'urls generated successfully!', status: 200, responseURLs };
};

const imageBroker = {
    deleteImages,
    generateUrls,
};

export default imageBroker;
