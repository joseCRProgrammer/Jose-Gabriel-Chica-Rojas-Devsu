import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EditIntentService } from 'src/app/shared/services/edit-intent.service';

export const editAccessGuard: CanActivateFn = (route, _state) => {
  const svc = inject(EditIntentService);
  const router = inject(Router);

  const id = route.paramMap.get('id') ?? '';
  const token = route.queryParamMap.get('token');

  const ok = svc.validateAndConsume(id, token);
  if (ok) return true;

  router.navigate(['/dashboard/products/list']);
  return false;
};
