import express from 'express';
import { getLoginPage, getLogout, postLogin } from '../../controllers/login.controller.js';

export const loginRouter = express.Router();

loginRouter
.get('/login', getLoginPage)
.get('/logout', getLogout)
.post('/login', postLogin);

