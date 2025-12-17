import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { Category, CategoryService } from '../../services/category-service';
import { Product, ProductService } from '../../services/product-service';
import { UserService } from '../../services/user-service';
import { NavbarComponent } from '../../navbar/navbar';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss']
})
export class Homepage {
  private cart = inject(CartService);
  private productsApi = inject(ProductService);
  private categoriesApi = inject(CategoryService);
  private users = inject(UserService);

  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';
  selected = 0;

  readonly connected$ = this.users.isLoggedIn$; // Utilise l'etat d'authentification expose par UserService.

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  filter(id: number): void {
    this.selected = id;
    this.loading = true;
    const source = id ? this.productsApi.getByCategory(id) : this.productsApi.list();
    source.subscribe({
      next: list => {
        this.products = list;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur produits';
        this.loading = false;
      },
    });
  }

  addToCart(product: Product): void {
    this.cart.add(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.image ?? undefined,
      },
      1,
    );
  }

  private loadProducts(): void {
    this.loading = true;
    this.productsApi.list().subscribe({
      next: list => {
        this.products = list;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur produits';
        this.loading = false;
      },
    });
  }

  private loadCategories(): void {
    this.categoriesApi.list().subscribe({
      next: list => {
        this.categories = list;
      },
      error: () => {
        this.error = 'Erreur categories';
      },
    });
  }
}
