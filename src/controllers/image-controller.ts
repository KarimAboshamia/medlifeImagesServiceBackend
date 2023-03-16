import { Request as ExpRequest, Response as ExpResponse, NextFunction as ExpNextFunc } from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

import AWSCloudSingleton from '../models/aws-cloud-singleton';

const postImage = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    try {
        //! [1] Generate random name for image
        const imageName = crypto.randomBytes(32).toString('hex');

        //! [2] Upload image to s3
        const AWSSingleton = AWSCloudSingleton.getInstance();

        const params = {
            Bucket: AWSSingleton.bucketName,
            Key: imageName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(params);

        await AWSSingleton.s3.send(command);

        //! [3] Return image name
        return res.status(200).json({ name: imageName });
    } catch (err) {
        return next(err);
    }
};

const imageController = {
    postImage,
};

export default imageController;
