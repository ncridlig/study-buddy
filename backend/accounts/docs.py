from drf_yasg import openapi

def auth_error():
    return {"401": openapi.Response(description="Authentication credentials were not provided")}

def not_found_error():
    return {"404": openapi.Response(description="Resource not found")}


app_tag = 'Accounts'
schemas = {
    'RegisterAPIViewSchema': {
        'POST': dict(
            operation_summary="Register a new user",
            operation_description="""
            Register a new user.

            Required fields:
            - **email**
            - **firstname**
            - **lastname**
            - **password**
            - **confirm_password**
            """,
            tags=[app_tag],
            responses={
                "201": openapi.Response(
                    description="User registered successfully",
                    examples={
                        "application/json": {
                            "email": "user@example.com",
                            "firstname": "String",
                            "lastname": "String"
                        }
                    }
                ),
                "400": openapi.Response(
                    description="Validation error!"
                ),
            }
        ),
        'GET': dict(
            operation_summary="Get current user",
            operation_description="Return the authenticated user's information.",
            tags=[app_tag],
            responses={
                "200": openapi.Response(
                    description="User data retrieved",
                    examples={
                        "application/json": {
                            "email": "user@example.com",
                            "firstname": "John",
                            "lastname": "Doe"
                        }
                    }
                ),
                **auth_error(),
            }
        )
    },
    'JWTAuth': {
        'LOGIN': dict(
            operation_summary="Obtain JWT token pair",
            operation_description="""
                Authenticate a user and receive access and refresh tokens.

                Required:
                - **email**
                - **password**
                """,
            tags=[app_tag],
            responses={
                200: openapi.Response(
                    description="Token pair returned",
                    examples={
                        'application/json': {
                            'refresh': 'refresh toke',
                            'access': 'access token'
                        }
                    }
                ),
                401: openapi.Response(description="Invalid credentials")
            }
        ),
        'REFRESH': dict(
            operation_summary="Refresh JWT access token",
            operation_description="""
                Provide a valid refresh token to obtain a new access token.
                """,
            tags=[app_tag],
            responses={
                200: openapi.Response(
                    description="New access token returned",
                    examples={
                        'application/json': {
                            'access': 'access token'
                        }
                    }
                ),
                401: openapi.Response(description="Invalid or expired refresh token")
            }
        )
    }
}