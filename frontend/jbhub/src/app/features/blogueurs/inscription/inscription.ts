import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { BlogueursService } from '../../../core/services/blogueurs.service';
import {
  VillesService,
  Ville
} from '../../../core/services/villes.service';
import {
  ThematiquesService,
  Thematique
} from '../../../core/services/thematiques.service';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss'
})
export class Inscription implements OnInit {

  /* =========================
     SERVICES
  ========================== */

  private fb = inject(FormBuilder);

  private service = inject(BlogueursService);

  private villesSvc = inject(VillesService);

  private thematiquesSvc = inject(ThematiquesService);

  private router = inject(Router);


  /* =========================
     ÉTAT
  ========================== */

  villes = signal<Ville[]>([]);

  thematiques = signal<Thematique[]>([]);

  loading = signal(false);

  erreur = signal('');

  succes = signal(false);

  etape = signal(1);


  /* =========================
     THÉMATIQUES SÉLECTIONNÉES
  ========================== */

  thematiqueIds: number[] = [];


  /* =========================
     FORMULAIRE
  ========================== */

  form = this.fb.group({

    // Étape 1
    prenom: [
      '',
      Validators.required
    ],

    nom: [
      '',
      Validators.required
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    mot_de_passe: [
      '',
      [
        Validators.required,
        Validators.minLength(6)
      ]
    ],


    // Étape 2
    date_naissance: [
      '',
      Validators.required
    ],

    sexe: [
      '',
      Validators.required
    ],

    telephone: [
      '', Validators.required
    ],

    /*
     * IMPORTANT
     * Ce champ doit avoir exactement
     * le même nom que dans inscription.html
     */
   numero_urgence: ['', Validators.required],

    ville_id: [
      null
    ],


    bio: [
      ''
    ],


    motivation: [
      ''
    ]

  });


  /* =========================
     INITIALISATION
  ========================== */

  ngOnInit(): void {

    /* Charger les villes */

    this.villesSvc.lister().subscribe({

      next: r => {
        this.villes.set(r.data);
      },

      error: () => {
        this.erreur.set(
          'Impossible de charger les villes.'
        );
      }

    });


    /* Charger les thématiques */

    this.thematiquesSvc.lister().subscribe({

      next: r => {

        /*
         * Dédupliquer par nom
         * car les thématiques sont
         * déclinées par catégorie.
         */

        const seen = new Set<string>();

        const uniques = r.data.filter(t => {

          if (seen.has(t.nom)) {
            return false;
          }

          seen.add(t.nom);

          return true;

        });

        this.thematiques.set(uniques);

      },

      error: () => {

        this.erreur.set(
          'Impossible de charger les thématiques.'
        );

      }

    });

  }


  /* =========================
     THÉMATIQUES
  ========================== */

  toggleThematique(id: number): void {

    if (this.thematiqueIds.includes(id)) {

      this.thematiqueIds =
        this.thematiqueIds.filter(
          t => t !== id
        );

    } else if (this.thematiqueIds.length < 3) {

      this.thematiqueIds = [
        ...this.thematiqueIds,
        id
      ];

    }

  }


  isSelected(id: number): boolean {

    return this.thematiqueIds.includes(id);

  }




  etapeSuivante(): void {

    const {
      prenom,
      nom,
      email,
      mot_de_passe
    } = this.form.controls;


    if (
      prenom.invalid ||
      nom.invalid ||
      email.invalid ||
      mot_de_passe.invalid
    ) {

      [
        prenom,
        nom,
        email,
        mot_de_passe
      ].forEach(control => {

        control.markAsTouched();

      });

      return;

    }


    this.erreur.set('');

    this.etape.set(2);

  }


  /* =========================
     SOUMISSION
  ========================== */

  soumettre(): void {

    /*
     * Vérifier le formulaire
     */

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }


    /*
     * Vérifier les thématiques
     */

    if (this.thematiqueIds.length === 0) {

      this.erreur.set(
        'Choisissez au moins une thématique'
      );

      return;

    }


    /*
     * Début de l'envoi
     */

    this.loading.set(true);

    this.erreur.set('');


    /*
     * Préparation du DTO
     */

    const dto = {

      ...this.form.value,

      /*
       * ville_id peut être une chaîne
       * provenant du select.
       *
       * On la convertit en nombre.
       */

      ville_id:
        this.form.value.ville_id
          ? +this.form.value.ville_id
          : null,

      /*
       * Numéro d'urgence
       * déjà inclus automatiquement
       * grâce à ...this.form.value
       */

      thematique_ids:
        this.thematiqueIds

    };


    console.log(
      'DTO inscription :',
      dto
    );


    /*
     * Appel API
     */

    this.service.inscrire(dto as any).subscribe({

      next: () => {

        this.succes.set(true);

        this.loading.set(false);

      },

      error: e => {

        console.error(
          'Erreur inscription :',
          e
        );

        this.erreur.set(
          e.error?.message ??
          'Une erreur est survenue lors de l’inscription.'
        );

        this.loading.set(false);

      }

    });

  }

}