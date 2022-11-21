import { AuthDTOType } from "./types"

export default class UserDto {
    id
    email
    role

    constructor(model: AuthDTOType) {
        this.id = model.id
        this.email = model.email
        this.role = model.role
    }
}