import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const details =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as { message?: string | string[] }).message
        : undefined;

    const message = Array.isArray(details)
      ? 'Validation failed'
      : typeof details === 'string'
        ? details
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    response.status(status).json({
      message,
      code: status,
      ...(Array.isArray(details) && {
        details,
      }),
    });
  }
}
