import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RessourcesService } from '../../../core/services/ressources.service';

@Component({
  selector: 'app-ressources-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form.html',
  styleUrl: './form.scss'
})
export class Form {
  fb = inject(FormBuilder);
  ressourcesSvc = inject(RessourcesService);
  router = inject(Router);

  form: FormGroup;
  isSubmitting = false;

  constructor() {
    this.form = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      type: ['lien', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.ressourcesSvc.creer(this.form.value).subscribe({
      next: () => {
        window.alert('Ressource ajoutée avec succès');
        this.router.navigate(['/ressources']);
      },
      error: (e) => {
        console.error(e);
        window.alert('Erreur lors de l\'ajout de la ressource');
        this.isSubmitting = false;
      }
    });
  }
}
