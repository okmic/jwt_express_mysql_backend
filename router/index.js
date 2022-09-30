const Router = require('express').Router
const { body } = require("express-validator")
const userController = require('../controllers/user.controller')
const authMiddleware = require("../midlewares/auth.middleware")

const router = new Router()

router.post('/registration',
    body("email").isEmail(),
    body("password").isLength({min: 5, max: 15}),
    userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/activate', userController.activate)
router.get('/refresh', userController.refresh)
router.get('/users', authMiddleware, userController.getUsers)

module.exports = router