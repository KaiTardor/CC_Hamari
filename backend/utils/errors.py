class ApiError(Exception):
    status_code = 500

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class BadRequestError(ApiError):
    status_code = 400


class ForbiddenError(ApiError):
    status_code = 403


class NotFoundError(ApiError):
    status_code = 404


class ConflictError(ApiError):
    status_code = 409
