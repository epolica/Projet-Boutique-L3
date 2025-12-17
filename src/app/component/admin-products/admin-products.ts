import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CategoryService } from '../../services/category-service';
import { Product, ProductService } from '../../services/product-service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-products.html',
  styleUrls: ['./admin-products.scss']
})
export class AdminProducts {
  private productsApi = inject(ProductService);
  private categoriesApi = inject(CategoryService);
  private fb = inject(FormBuilder);

  products: Product[] = [];
  categories: Category[] = [];
  editing: Product | null = null;
  error = '';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categories: this.fb.control<number[]>([]),
    description: [''],
    image: [''],
  });

  ngOnInit(): void {
    this.loadDatasets();
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const payload = {
      ...this.form.getRawValue(),
      categories: this.normalizeCategories(this.form.value.categories),
    };
    const request = this.editing
      ? this.productsApi.update(this.editing.id, payload)
      : this.productsApi.create(payload);

    request.subscribe({
      next: product => {
        this.error = '';
        this.reset();
        this.replaceProduct(product);
      },
      error: () => {
        this.error = 'Enregistrement impossible';
      },
    });
  }

  edit(product: Product): void {
    this.editing = product;
    this.form.setValue({
      name: product.name,
      price: product.price,
      stock: product.stock,
      categories: product.categories?.map(cat => cat.id) ?? [],
      description: product.description ?? '',
      image: product.image ?? '',
    });
  }

  remove(product: Product): void {
    this.productsApi.remove(product.id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== product.id);
      },
      error: () => {
        this.error = 'Suppression impossible';
      },
    });
  }

  reset(): void {
    this.editing = null;
    this.form.reset({
      name: '',
      price: 0,
      stock: 0,
      categories: [],
      description: '',
      image: '',
    });
  }

  formatCategories(product: Product): string {
    return (product.categories?.map(cat => cat.name) ?? ['Aucune']).join(', ');
  }

  private loadDatasets(): void {
    this.productsApi.list().subscribe({
      next: list => {
        this.products = list;
      },
    });

    this.categoriesApi.list().subscribe({
      next: list => {
        this.categories = list;
      },
    });
  }

  private replaceProduct(product: Product): void {
    const index = this.products.findIndex(item => item.id === product.id);
    if (index === -1) {
      this.products = [product, ...this.products];
    } else {
      const clone = [...this.products];
      clone[index] = product;
      this.products = clone;
    }
  }

  private normalizeCategories(value: unknown): number[] {
    if (!value) return [];
    const entries = Array.isArray(value) ? value : [value];
    return entries.map(Number).filter(id => !Number.isNaN(id)); // Convertit les valeurs selectionnees en entiers.
  }
}
