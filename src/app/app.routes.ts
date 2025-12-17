import { Routes } from '@angular/router';
import { AdminComponent } from './component/admin/admin';
import { CartComponent } from './component/cart/cart';
import { CheckoutComponent } from './component/checkout/checkout';
import { Homepage } from './component/homepage/homepage';
import { LoginComponent } from './component/login/login';
import { ResetPasswordComponent } from './component/reset-password/reset-password';
import { SignupComponent } from './component/signup/signup';
import { ProfileComponent } from './component/profile/profile';
import { adminGuard } from './core/admin.guard';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: Homepage },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' },
];
