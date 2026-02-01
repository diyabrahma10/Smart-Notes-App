import express from 'express';
import { getRegisterPage, postRegister } from '../../controllers/register.controllers.js';

export const registerRouter = express.Router();

registerRouter
.get('/register', getRegisterPage)
.post('/register', postRegister );

