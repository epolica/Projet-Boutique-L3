import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user-service';

export const adminGuard: CanActivateFn = () => {
  const user = inject(UserService);
  const router = inject(Router);

  const current = user.currentUser();
  if (current && current.role === 'admin') {
    return true;
  }

  router.navigate(['/']);
  return false;
};
