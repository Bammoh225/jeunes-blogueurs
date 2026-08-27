import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const mdp = control.get('nouveau_mot_de_passe')?.value;
  const confirmation = control.get('confirmation')?.value;
  return mdp === confirmation ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword implements OnInit {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  form = this.fb.group({
    nouveau_mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
    confirmation:         ['', [Validators.required]]
  }, { validators: passwordsMatchValidator });

  loading    = signal(false);
  erreur     = signal('');
  succes     = signal(false);
  showPass   = signal(false);
  token      = '';
  tokenAbsent = signal(false);

  get nouveauMdp()  { return this.form.get('nouveau_mot_de_passe')!; }
  get confirmation() { return this.form.get('confirmation')!; }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.tokenAbsent.set(true);
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.erreur.set('');

    this.auth.reinitialiserMotDePasse(this.token, this.nouveauMdp.value!).subscribe({
      next: () => {
        this.loading.set(false);
        this.succes.set(true);
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.erreur.set(err.error?.message ?? 'Lien invalide ou expiré');
        this.loading.set(false);
      }
    });
  }
}