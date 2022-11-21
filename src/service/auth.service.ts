import bcrypt from "bcrypt"
import { execute } from "../db"
import UserDto from "../dtos/auth.tdo"
import tokenService from "./token.service"
import ApiError from "../exceptions/api-error"
import { checkLoginAndPassword, roleIdToRole } from "../auxiliary/otherFuncs"

class AuthService {

  async registration(email: string, ip: string, password: string, roleId: number) {
    try {
      const resultFind = await execute(`SELECT * FROM users WHERE email = '${email}'`).then((resolve: any) => resolve.rows)

      if (resultFind.length > 0) {
        return { error: `User with mail - ${email} already exists` }
      }
  
      const hashPassword = bcrypt.hashSync(password, 3)
  
      const { rows } = await execute("INSERT INTO `users`(`email`, `password`, roleId) VALUES (?, ?, ?)", [email, hashPassword, roleId])
  
      const role = await roleIdToRole(roleId).then(res => res)
  
      const userDto = new UserDto({ email, id: rows.insertId, role})
  
      const tokens = tokenService.generateTokens({ ...userDto })
  
      await execute("INSERT INTO tokens(userId, userIp, refreshToken) VALUES (?,?,?) ON DUPLICATE KEY UPDATE userId=?, userIp = ?, refreshToken=?", [rows.insertId, ip, tokens.refreshToken, rows.insertId, ip, tokens.refreshToken])
  
      return { ...tokens, user: userDto }
    } catch (e) {
      throw e
    }
  }

  async login(email: string, password: string, ip: string, remember: boolean) {

    const resultFind = await checkLoginAndPassword(email, password)

    const userDto = new UserDto(resultFind[0])
    const tokens = tokenService.generateTokens({...userDto})

    await tokenService.saveToken(userDto.id, ip, tokens.refreshToken)

    if(remember) {
      return await this.remember(resultFind, ip)
    } else {
      return await this.dontRemeber(resultFind)
    }
  }

  private async remember(resultFind: any, ip: string) {
    const userDto = new UserDto(resultFind[0])
    const tokens = tokenService.generateTokens({...userDto})
    await tokenService.saveToken(userDto.id, ip, tokens.refreshToken)

    return { ...tokens, user: userDto }
  }

  private async dontRemeber(resultFind: any) {
    const userDto = new UserDto(resultFind[0])
    const tokens = tokenService.generateTokens({...userDto})

    return { accessToken: tokens.accessToken, user: userDto }
  }

  async logout(refreshToken: string) {
    return await tokenService.removeToken(refreshToken)
  }
  
  async refresh(refreshToken: string, ip: string) {

    if(!refreshToken) {
      throw ApiError.UnauthorizedError()
    }

    const validToken = tokenService.validateToken(refreshToken, "refresh")
    const tokenFromDb = await tokenService.findToken(refreshToken)
    console.log(tokenFromDb)
    if(!tokenFromDb || !validToken) {
      throw ApiError.UnauthorizedError()
    } 

    const user = (await execute("SELECT u.id, u.email, r.role FROM users u, roles r WHERE u.id = ? AND u.roleId = r.id", [tokenFromDb[0]["userId"]])).rows

    const userDto = new UserDto(user[0])
    const tokens =  tokenService.generateTokens({...userDto})

    await tokenService.saveToken(userDto.id, ip, tokens.refreshToken)

    return { ...tokens, user: userDto }
  }



  async change(accessToken: string, ip: string, oldPassword: string, newPassword: string){
    try{

      const tokenPayload: any = tokenService.validateToken(accessToken, 'access')

      if(!tokenPayload.email) throw ApiError.UnauthorizedError()
      const resultFind: any = await checkLoginAndPassword(tokenPayload.email, oldPassword)

      if (resultFind.length < 1) {
        throw ApiError.BadRequest("Error of entered data")
      }
 
      const isPassEquals = await bcrypt.compare(oldPassword, resultFind[0]["password"])

      if (!isPassEquals) {
        throw ApiError.BadRequest("Invalid password")
      }

      const hashPassword = await bcrypt.hash(newPassword, 3)
      
      await execute(`
      UPDATE users SET password= ? WHERE id = ?
      `, [hashPassword, tokenPayload.id])

      const userDto = new UserDto(resultFind[0])
      const tokens = tokenService.generateTokens({...userDto})
      await tokenService.saveToken(userDto.id, ip, tokens.refreshToken)
      return {...tokens, user: userDto }
    } catch (e) {
      throw e
    }

  }


  async getAllUsers() {
    return (await execute("SELECT * FROM `users`")).rows
  }
}

export default new AuthService()