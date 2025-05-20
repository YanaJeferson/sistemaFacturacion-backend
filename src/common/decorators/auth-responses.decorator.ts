import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ResponseAlreadyExistsDto } from '../../web/dto/reponse-already-exists.dto';

export function ApiAuthResponses() {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
      type: ResponseAlreadyExistsDto,
    })
  );
}

export function ApiCommonResponses() {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
      type: ResponseAlreadyExistsDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden',
      type: ResponseAlreadyExistsDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request',
      type: ResponseAlreadyExistsDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      type: ResponseAlreadyExistsDto,
    })
  );
}