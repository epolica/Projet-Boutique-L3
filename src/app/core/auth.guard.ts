import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user-service';

export const authGuard: CanActivateFn = () => {
  const user = inject(UserService);
  const router = inject(Router);
  if (user.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};
