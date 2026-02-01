import express from 'express';
import { getDashPage, postDash } from '../controllers/dashboard.controller.js';

export const dashRouter = express.Router();

dashRouter
.get('/', getDashPage)
.post('/', postDash);
