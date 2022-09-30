const bcrypt = require("bcrypt")
const uuid = require("uuid")
const { execute } = require("../db")
const UserDto = require("../dtos/user.tdo")
const mailServise = require("./mail.service")
const tokenService = require("./token.service")
const ApiError = require("../exceptions/api-error")
const jwt = require("jsonwebtoken")

class UserService {

  async registration(email, password) {

    const resultFind = await execute(`SELECT * FROM users WHERE email = '${email}'`).then(resolve => resolve.rows)

    if (resultFind.length > 0) {
      return { error: `Пользователь c почтой - ${email} уже существует` }
    }
    const hashPassword = bcrypt.hashSync(password, 3)
    const activationLink = uuid.v4()

    const { rows } = await execute("INSERT INTO `users`(`email`, `password`, activation_link) VALUES (?, ?, ?)", [email, hashPassword, activationLink])

    await mailServise.sendActivationMail('okmic.g@gmail.com', `${process.env.API_URL}/api/activate/${activationLink}`)

    const userDto = new UserDto({ email, id: rows.insertId, isActivated: false })

    const tokens = tokenService.generateTokens({ ...userDto })

    await execute("INSERT INTO `tokens`(`user_id`, `refresh_token`) VALUES (?,?)", [rows.insertId, tokens.refreshToken])

    return { ...tokens, user: userDto }
  }

  async activate(activateLink) {

    return execute("SELECT `id` FROM `users` WHERE `activation_link` = '" + activateLink + "'").then((resolve) => {
      if (resolve.rows.length < 1) {
        throw ApiError.BadRequest("Неккоректная ссылка активации")
      }
      execute("UPDATE `users` SET `is_activated`= ? WHERE `id` = ?", [1, resolve.rows[0]["id"]])
      return true
    })
  }

  async login(email, password) {
    const resultFind = await execute(`SELECT * FROM users WHERE email = '${email}'`).then(resolve => resolve.rows)
    
    if (resultFind.length < 1) {
      throw ApiError.BadRequest("Пользователь с таким email не найден")
    }
    
    const isPassEquals = bcrypt.compareSync(password, resultFind[0]["password"]) 

    if (!isPassEquals) {
      throw ApiError.BadRequest("Неверный пароль")
    }

    const userDto = new UserDto(resultFind[0])
    const tokens = tokenService.generateTokens({...userDto})

    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return { ...tokens, user: userDto }
  }

  async logout(refreshToken) {
    return await tokenService.removeToken(refreshToken)
  }
  
  async refresh(refreshToken) {

    if(!refreshToken) {
      throw ApiError.UnauthorizedError()
    }

    // need add jwt.verify()
    const validToken = tokenService.validateToken(refreshToken, process.env.JWT_REFRESH_SECRET_KEY)
    const tokenFromDb = await tokenService.findToken(refreshToken)

    if(!tokenFromDb || !validToken) {
      throw ApiError.UnauthorizedError()
    } 

    const user = (await execute("SELECT * FROM `users` WHERE `id` = ?", [tokenFromDb[0]["user_id"]])).rows

    const userDto = new UserDto(user[0])
    const tokens =  tokenService.generateTokens({...userDto})

    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return { ...tokens, user: userDto }
  }

  async getAllUsers() {
    return (await execute("SELECT * FROM `users`")).rows
  }
}

module.exports = new UserService()