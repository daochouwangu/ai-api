import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // console fun name
    const url = context.switchToHttp().getRequest().url;
    return next.handle().pipe(tap((res) => console.log(`${url} => ${res}`)));
  }
}
