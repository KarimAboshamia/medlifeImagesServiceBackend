import { Request as ExpRequest, Response as ExpResponse, NextFunction as ExpNextFunc } from 'express';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { type } from 'os';

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const s3AccessKey = process.env.S3_ACCESS_KEY;
const s3SecretKey = process.env.S3_SECRET_ACCESS;

const s3 = new S3Client({
    credentials: {
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretKey,
    },
    region: bucketRegion,
});

const postImage = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Generate random name for image
    const imageName = crypto.randomBytes(32).toString('hex');

    //! [2] Upload image to s3
    const params = {
        Bucket: bucketName,
        Key: imageName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    };

    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
    } catch (err) {
        return next(err);
    }

    //! [3] Return image name
    return res.status(200).json({ name: imageName });
};

const brokerDelete = async (imageName: any) => {
    //! [2] Delete image/s from s3
    try {
        for (const image of imageName) {
            const params = {
                Bucket: bucketName,
                Key: image,
            };

            const command = new DeleteObjectCommand(params);
            await s3.send(command);
        }
    } catch (err) {
        throw err;
    }
    //! [3] Return success message
    return { message: 'success' };
};

const brokerURL = async (images: any) => {
    let responseURLs = [];
    for (let image of images) {
        let imageUrls = [];
        for (let im of image) {
            const params = {
                Bucket: bucketName,
                Key: im,
            };

            try {
                const command = new GetObjectCommand(params);
                const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
                imageUrls.push(url);
            } catch (err) {
                throw err;
            }
        }
        responseURLs.push(imageUrls);
    }

    //! [3] Return url/s
    return responseURLs;
};

const imageController = {
    postImage,
    brokerDelete,
    brokerURL,
};

export default imageController;
