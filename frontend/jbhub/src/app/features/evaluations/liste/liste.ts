import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { EvaluationsService } from '../../../core/services/evaluations.service';
import { PublicationsService } from '../../../core/services/publications.service';
import { Evaluation, CreateEvaluationDto } from '../../../core/models/evaluation.model';
import { PublicationResume } from '../../../core/models/publication.model';

@Component({
  selector: 'app-liste',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './liste.html',
  styleUrl: './liste.scss'
})
export class Liste implements OnInit {
  private service     = inject(EvaluationsService);
  private pubService  = inject(PublicationsService);
  private fb          = inject(FormBuilder);

  evaluations  = signal<Evaluation[]>([]);
  publications = signal<PublicationResume[]>([]);
  loading      = signal(true);
  erreur       = signal('');
  showForm     = signal(false);
  saving       = signal(false);
  recherche    = '';

  form = this.fb.group({
    publication_id:   [null, Validators.required],
    retenu_reseaux:   [false],
    commentaire:      [''],
    reseau_utilise:   [''],
    date_utilisation: [''],
  });

  ngOnInit() {
    this.charger();
    this.chargerPublications();
  }

  charger() {
    this.loading.set(true);
    this.service.lister().subscribe({
      next:  r => { this.evaluations.set(r.data); this.loading.set(false); },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  chargerPublications() {
    this.pubService.lister().subscribe({
      next: r => this.publications.set(r.data),
      error: () => {}
    });
  }

  get evaluationsFiltrees(): Evaluation[] {
    const q = this.recherche.toLowerCase();
    return this.evaluations().filter(e =>
      !q ||
      (e.publication_titre ?? '').toLowerCase().includes(q) ||
      (e.evaluateur_prenom + ' ' + e.evaluateur_nom).toLowerCase().includes(q)
    );
  }

  evaluer() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const val = this.form.value;
    const dto: CreateEvaluationDto = {
      publication_id:   +val.publication_id!,
      retenu_reseaux:   !!val.retenu_reseaux,
      commentaire:      val.commentaire || null,
      reseau_utilise:   val.reseau_utilise || null,
      date_utilisation: val.date_utilisation || null,
    };

    this.service.evaluer(dto).subscribe({
      next: r => {
        this.evaluations.update(list => [r.data, ...list]);
        this.form.reset({ retenu_reseaux: false });
        this.showForm.set(false);
        this.saving.set(false);
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.saving.set(false); }
    });
  }
}
