import {Request, NextFunction} from "express"
import { validationResult } from "express-validator"
import bcrypt from "bcrypt"
import ApiError from "../exceptions/api-error"
import { execute } from "../db"

export const roleIdToRole = async (roleId: number): Promise<string> => {
    let role = ""
    await execute(`SELECT * FROM roles`).then(res => {
      for (let i = 0; i < res.rows.length; i++) {
         if(res.rows[i]["id"] === roleId) role = res.rows[i]["role"]       
      }
    })

    return role
} 

export default function validBody(req: Request, next: NextFunction) {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        throw ApiError.BadRequest("Invalid value", errors.array())
    }
}

export async function checkLoginAndPassword(email: string, password: string) {
    try {
      const resultFind = await execute(`
      SELECT u.*, r.role
      FROM users u, roles r 
      WHERE u.email = ? AND u.roleId = r.id`, [email]).then((resolve: any) => resolve.rows)
  
      if (resultFind.length < 1) {
        throw ApiError.BadRequest("Check the email, there is no such user")
      }
  
      const isPassEquals = bcrypt.compareSync(password, resultFind[0]["password"])
  
      if (!isPassEquals) {
        throw ApiError.BadRequest("Invalid password")
      }
  
      return resultFind
    } catch (e) {
      throw e
    }
  }