import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { ToastService } from '@osf/shared/services';

import { ERROR_MESSAGES } from '../constants';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage: string;

      if (error.error instanceof ErrorEvent) {
        errorMessage = error.error.message;
      } else {
        if (error.error?.errors?.[0]?.detail) {
          errorMessage = error.error.errors[0].detail;
        } else {
          errorMessage = ERROR_MESSAGES[error.status as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.default;
        }
      }

      if (error.status === 403) {
        router.navigate(['/forbidden']);
      }

      toastService.showError(errorMessage);

      return throwError(() => error);
    })
  );
};
