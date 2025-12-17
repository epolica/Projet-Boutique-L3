import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss'],
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private user = inject(UserService);

  loading = false;
  message = '';
  error = '';

  form = this.fb.nonNullable.group({
    token: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const token = params.get('token') ?? '';
    const email = params.get('email') ?? '';
    if (token || email) {
      this.form.patchValue({ token, email }); // Pré-remplit les champs quand on arrive depuis l'email.
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.message = '';
    this.error = '';

    this.user.resetPassword(this.form.getRawValue()).subscribe({
      next: res => {
        this.message = res?.message ?? 'Mot de passe reinitialise.';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: err => {
        this.error = err?.error?.message ?? 'Reinitialisation impossible';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
