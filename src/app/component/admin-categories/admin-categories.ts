import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CategoryService } from '../../services/category-service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-categories.html',
  styleUrls: ['./admin-categories.scss']
})
export class AdminCategories {
  private service = inject(CategoryService);
  private fb = inject(FormBuilder);

  categories: Category[] = [];
  editing: Category | null = null;
  error = '';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.load();
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const payload = this.form.getRawValue();
    const request = this.editing
      ? this.service.update(this.editing.id, payload)
      : this.service.create(payload);

    request.subscribe({
      next: category => {
        this.error = '';
        this.replaceCategory(category);
        this.reset();
      },
      error: () => {
        this.error = 'Operation impossible';
      },
    });
  }

  edit(category: Category): void {
    this.editing = category;
    this.form.setValue({ name: category.name });
  }

  remove(category: Category): void {
    this.service.remove(category.id).subscribe({
      next: () => {
        this.categories = this.categories.filter(item => item.id !== category.id);
      },
      error: () => {
        this.error = 'Suppression impossible';
      },
    });
  }

  reset(): void {
    this.editing = null;
    this.form.reset({ name: '' });
  }

  private load(): void {
    this.service.list().subscribe({
      next: list => {
        this.categories = list;
      },
    });
  }

  private replaceCategory(category: Category): void {
    const index = this.categories.findIndex(item => item.id === category.id);
    if (index === -1) {
      this.categories = [category, ...this.categories];
    } else {
      const clone = [...this.categories];
      clone[index] = category;
      this.categories = clone;
    }
  }
}
