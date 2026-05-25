import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorResponseName = 'Internal Server Error';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        const resObj = response as Record<string, unknown>;
        message = (resObj.message as string | string[]) || exception.message;
        errorResponseName = (resObj.error as string) || exception.name;
      } else {
        message = response || exception.message;
        errorResponseName = exception.name;
      }
    } else if (exception instanceof Error) {
      // Handle generic errors or specific DB errors (like Prisma client error) dynamically
      // to avoid crash/import dependencies before they exist
      const err = exception as unknown as Record<string, unknown>;
      
      if (err.code === 'P2002') {
        httpStatus = HttpStatus.CONFLICT;
        message = 'Unique constraint failed on the database';
        errorResponseName = 'Conflict';
      } else if (err.code === 'P2025') {
        httpStatus = HttpStatus.NOT_FOUND;
        message = 'Record not found in the database';
        errorResponseName = 'Not Found';
      } else {
        message = exception.message;
      }
    }

    const path = httpAdapter.getRequestUrl(ctx.getRequest());
    const responseBody = {
      statusCode: httpStatus,
      message,
      error: errorResponseName,
      timestamp: new Date().toISOString(),
      path,
    };

    // Log the error
    if (httpStatus >= 500) {
      this.logger.error(
        `[${path}] Exception status: ${httpStatus} - Error: ${
          exception instanceof Error ? exception.stack : JSON.stringify(exception)
        }`,
      );
    } else {
      this.logger.warn(
        `[${path}] Exception status: ${httpStatus} - Message: ${JSON.stringify(message)}`,
      );
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
