import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { OrderService } from '../../services/order-service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.html',
  styleUrls: ['./admin-orders.scss']
})
export class AdminOrders {
  private orderService = inject(OrderService);
  orders: any[] = [];

  ngOnInit(): void {
    this.orderService.listAll().subscribe({
      next: list => this.orders = list,
    });
  }
}
