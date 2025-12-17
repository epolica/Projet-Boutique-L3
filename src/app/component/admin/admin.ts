import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminCategories } from '../admin-categories/admin-categories';
import { AdminProducts } from '../admin-products/admin-products';
import { AdminUsers } from '../admin-users/admin-users';
import { AdminOrders } from '../admin-orders/admin-orders';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminProducts, AdminCategories, AdminUsers, AdminOrders],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent {
  tab: 'products' | 'categories' | 'orders' | 'users' = 'products';
}
