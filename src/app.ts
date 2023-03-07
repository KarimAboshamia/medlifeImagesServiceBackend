import express, { Request as ExpRequest, Response as ExpResponse, NextFunction as ExpNextFun } from 'express';
import bodyParser from 'body-parser';

// --------------------------------------------------------
import ResponseError from './models/response-error';

import imageRouter from './routes/image-route';
import { callReceiver } from './middleware/broker-middleware';

// --------------------------------------------------------

const app = express();
callReceiver();

//? parsing coming request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//? setting access-control-allow headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', String(process.env.ACCESS_CONTROL_ALLOW_ORIGIN));
    res.setHeader('Access-Control-Allow-Methods', String(process.env.ACCESS_CONTROL_ALLOW_METHODS));
    res.setHeader('Access-Control-Allow-Headers', String(process.env.ACCESS_CONTROL_ALLOW_HEADERS));

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

app.use('/image', imageRouter);

app.use((req: ExpRequest, _res, _next: ExpNextFun) => {
    throw new ResponseError(`sorry, it seems that the URL '${req.url}' is not provided!`, 404);
});

app.use((error: any, _req: ExpRequest, res: ExpResponse, _next: ExpNextFun) => {
    const message = error.message || 'an unknown error have been occurred!';
    const statusCode = error.statusCode || 500;
    const extraData = error.extraData;

    res.status(statusCode).json({
        message,
        extraData,
    });
});

app.listen(process.env.PORT || 8085);
