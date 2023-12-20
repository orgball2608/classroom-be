import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import _ from 'lodash';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeFieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) =>
        response.data
          ? {
              message: response.message,
              data: this.omitFields(response.data),
            }
          : response,
      ),
    );
  }

  omitFields(data: any) {
    if (Array.isArray(data)) {
      return data.map((item) => this.omitFields(item));
    } else if (data && typeof data === 'object') {
      return _.omit(data, 'deleted', 'deletedAt');
    } else {
      return data;
    }
  }
}
