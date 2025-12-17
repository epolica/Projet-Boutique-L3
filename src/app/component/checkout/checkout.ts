import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { OrderService } from '../../services/order-service';
import { NavbarComponent } from '../../navbar/navbar';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
})
export class CheckoutComponent {
  private cart = inject(CartService);
  private order = inject(OrderService);
  private router = inject(Router);

  items = this.cart.snapshot;
  total = 0;
  loading = false;
  error = '';
  ok = false;

  ngOnInit(): void {
    this.cart.items$.subscribe(list => {
      this.items = list;
    });
    this.cart.total$.subscribe(sum => {
      this.total = sum;
    });
  }

  submit(): void {
    if (!this.items.length) {
      return;
    }

    this.loading = true;
    this.error = '';

    const payload = this.cart.toOrderPayload();
    this.order.create(payload).subscribe({
      next: () => {
        this.ok = true;
        this.cart.clear();
        this.router.navigate(['/']);
      },
      error: err => {
        this.error = err?.error?.message ?? 'Erreur commande';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  trackById = (_: number, item: any) => item.id; // Optimise le rendu de la liste.
}
