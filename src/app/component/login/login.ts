import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user-service';
import { NavbarComponent } from '../../navbar/navbar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private user = inject(UserService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly resetForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  error = '';
  resetLoading = false;
  resetMessage = '';
  resetError = '';

  get f() {
    return this.form.controls;
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get resetEmail() {
    return this.resetForm.controls.email;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.user.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => {
        console.log('LOGIN ERROR', err.status, err.error);
        this.error = err.error?.message ?? 'Connexion refusee';
      },
    });
  }

  sendResetLink(): void {
    if (this.resetForm.invalid || this.resetLoading) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.resetLoading = true;
    this.resetMessage = '';
    this.resetError = '';

    const email = this.resetForm.controls.email.value;

    this.user.requestPasswordReset(email).subscribe({
      next: res => {
        this.resetMessage = res?.message ?? 'Si ce compte existe, un email a ete envoye.';
      },
      error: err => {
        this.resetError = err?.error?.message ?? 'Impossible denvoyer le lien.';
      },
      complete: () => {
        this.resetLoading = false;
      },
    });
  }
}
