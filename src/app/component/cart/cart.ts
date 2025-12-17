import { Component, inject } from '@angular/core';
import { NgFor, CurrencyPipe,AsyncPipe,CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart-service';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from "../../navbar/navbar";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgFor, CurrencyPipe, RouterLink, AsyncPipe, NavbarComponent, CommonModule, FormsModule],
  templateUrl: './cart.html'
})
export class CartComponent {
  cart = inject(CartService);
  couponCode = '';
  couponMessage = '';

  subtotal$ = this.cart.subtotal$; // Sous-total avant remise.
  total$ = this.cart.total$; // Total apres remise.
  coupon$ = this.cart.coupon$; // Coupon (code + taux).

  trackById = (_: number, it: any) => it.id;

  applyCoupon() {
    const ok = this.cart.applyCoupon(this.couponCode); // Applique le coupon et met a jour le total persiste.
    this.couponMessage = ok ? 'Coupon applique (-99%)' : 'Coupon invalide';
  }
}
