from fastapi import HTTPException, status

class FinPayException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)

class InvalidCredentialsException(FinPayException):
    def __init__(self, detail: str = "Invalid email or password"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail
        )

class InactiveUserException(FinPayException):
    def __init__(self, detail: str = "Account is inactive"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )

class UnauthorizedAccessException(FinPayException):
    def __init__(self, detail: str = "Not authorized to access this resource"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )

class ResourceNotFoundException(FinPayException):
    def __init__(self, resource_name: str = "Resource"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource_name} not found"
        )

class InsufficientBalanceException(FinPayException):
    def __init__(self, detail: str = "Not enough balance"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )

class InvalidPaymentAmountException(FinPayException):
    def __init__(self, detail: str = "Payment amount must be greater than zero"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )

class ConflictException(FinPayException):
    def __init__(self, detail: str = "Resource conflict or duplicate entry"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )
