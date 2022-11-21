export default class ApiError extends Error {
    status
    errors

    constructor(status: number, message: string, errors = []) {
        super(message)
        this.status = status
        this.errors = errors
    }

    static UnauthorizedError() {
        return new ApiError(401, "The user is not logged in")
    }

    static BadRequest(message: string, errors: any = []) {
        return new ApiError(400, message, errors)
    }

    static ErrorDb() {
        return new ApiError(401, "Data error")
    }

    static NoRights() {
        return new ApiError(403, "No rights")
    }
}