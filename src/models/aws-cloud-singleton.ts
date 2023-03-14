import { S3Client } from '@aws-sdk/client-s3';

const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
const S3_SECRET_ACCESS = process.env.S3_SECRET_ACCESS;

class AWSCloudSingleton {
    static instance = null;
    private _s3 = null;

    static getInstance() {
        if (AWSCloudSingleton.instance === null) {
            AWSCloudSingleton.instance = new AWSCloudSingleton();
        }

        return AWSCloudSingleton.instance;
    }

    private constructor() {
        this._s3 = new S3Client({
            credentials: {
                accessKeyId: S3_ACCESS_KEY,
                secretAccessKey: S3_SECRET_ACCESS,
            },
            region: BUCKET_REGION,
        });
    }

    get s3() {
        return this._s3;
    }

    get bucketName() {
        return BUCKET_NAME;
    }
}

export default AWSCloudSingleton;
