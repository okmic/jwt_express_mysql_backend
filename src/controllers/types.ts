import UserDto from "../dtos/auth.tdo"

export type LoginReturn = {
    accessToken: string
    refreshToken?: string
    user: UserDto
}