import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiResponseOptions } from '@nestjs/swagger';

export const LoginResponses = {
  success: {
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        statusCode: 200,
        message: 'Login successful',
        data: {
          email: 'john@example.com',
          name: 'John Doe',
          avatar: 'https://example.com/avatar.jpg',
        },
      },
    },
  } as ApiResponseOptions,

  unauthorized: {
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  } as ApiResponseOptions,

  serverError: {
    status: 500,
    description: 'Internal Server Error',
    schema: {
      example: {
        message: 'Ocurrió un error inesperado',
        error: 'Internal Server Error',
        statusCode: 500,
      },
    },
  } as ApiResponseOptions,
};

export function ApiLoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'login with attack tracer' }),
    ApiResponse(LoginResponses.success),
    ApiResponse(LoginResponses.unauthorized),
    ApiResponse(LoginResponses.serverError),
  );
}
