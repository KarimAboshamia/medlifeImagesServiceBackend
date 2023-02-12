import { Router } from 'express';
import imageController from '../controllers/image-controller';
import multer from 'multer';

const imageRouter = Router();

const storage = multer.memoryStorage();
const uploadImages = multer({
    storage: storage,
});

imageRouter.post('/images/create', uploadImages.single('file'), imageController.postImage);
imageRouter.delete('/images/delete', imageController.deleteImage);
imageRouter.post('/images/generate', imageController.generateUrl);

export default imageRouter;
