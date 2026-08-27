import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading  = signal(false);
  erreur   = signal('');
  envoye   = signal(false);

  get email() { return this.form.get('email')!; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.erreur.set('');

    this.auth.motDePasseOublie(this.form.value.email!).subscribe({
      next: () => {
        this.loading.set(false);
        this.envoye.set(true);
      },
      error: (err) => {
        this.erreur.set(err.error?.message ?? 'Une erreur est survenue');
        this.loading.set(false);
      }
    });
  }
}