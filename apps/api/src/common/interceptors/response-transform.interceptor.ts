import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@growflow/types';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data) => {
        // If data already has the format (e.g. from swagger or nested calls), return it
        if (
          data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          'data' in data
        ) {
          return data as ApiResponse<T>;
        }

        return {
          statusCode,
          message: 'OK',
          data,
        };
      }),
    );
  }
}
