import { Router } from 'express'
import { body } from "express-validator"
import authController from '../controllers/auth.controller'
import authMiddleware from "../midlewares/auth.middleware"
import rolesMiddleware from '../midlewares/roles.middleware'

const router = Router()

router.post('/registration',
    body("email").isEmail().exists(),
    body("password").isLength({ min: 5, max: 15 }),
    body("roleId").exists(),
    authController.registration)

router.post('/login',
    body("email").isEmail().exists(),
    body("password").isLength({ min: 5, max: 15 }),
    body("remember").isBoolean(),
    authController.login)

router.post('/logout',
    body("email").isEmail(),
    authController.logout)

router.post('/change-password',
    rolesMiddleware(["admin"]),
    body("oldPassword").isLength({min: 5, max: 15}),
    body("newPassword").isLength({min: 5, max: 15}),
    authController.changePasswords)

router.get('/refresh', authController.refresh)

router.get('/users', authMiddleware, authController.getUsers)

export default router