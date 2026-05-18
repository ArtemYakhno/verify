import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';
import { STATUS_CODES } from 'node:http';
import { IMAGE_MESSAGES } from '../constants/messages.constants';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let message = IMAGE_MESSAGES.OTHERE_FILE_ERRORS;

    switch (exception.code) {
      case 'LIMIT_FILE_SIZE':
        message = IMAGE_MESSAGES.LIMIT_FILE_SIZE;
        break;
      case 'LIMIT_FILE_COUNT':
        message = IMAGE_MESSAGES.LIMIT_FILE_COUNT;
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = IMAGE_MESSAGES.LIMIT_UNEXPECTED_FILE;
        break;
    }

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: STATUS_CODES[HttpStatus.BAD_REQUEST],
    });
  }
}
