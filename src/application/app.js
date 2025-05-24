// --------------------------------------------------------------------------------
// dependencies
// --------------------------------------------------------------------------------
import cors from 'cors';
import express from "express";
import cookieParser from 'cookie-parser';
import 'dotenv/config';

// --------------------------------------------------------------------------------
// dependencies - routes
// --------------------------------------------------------------------------------
import web from "../routes/web.route.js";
import api from "../routes/api.route.js";

// --------------------------------------------------------------------------------
// dependencies - custom middleware
// --------------------------------------------------------------------------------
import NotFoundMiddleware from '../middleware/NotFoundMiddleware.js';
import ErrorMiddleware from '../middleware/ErrorMiddleware.js';

// --------------------------------------------------------------------------------
// initialize express
// --------------------------------------------------------------------------------
const app = express();

// --------------------------------------------------------------------------------
// middlewares - app
// --------------------------------------------------------------------------------
const allowedOrigins = process.env.EXPRESS_CORS_ORIGIN?.split(',') || [];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) { return callback(null, true); }
        else { return callback(new Error('Not allowed by CORS')); }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------------------------------------
// routes
// --------------------------------------------------------------------------------
app.use('/', web);
app.use('/api', api);

// --------------------------------------------------------------------------------
// custom middleware
// --------------------------------------------------------------------------------
app.use(NotFoundMiddleware);
app.use(ErrorMiddleware);

// --------------------------------------------------------------------------------
// export default
// --------------------------------------------------------------------------------
export default app;
