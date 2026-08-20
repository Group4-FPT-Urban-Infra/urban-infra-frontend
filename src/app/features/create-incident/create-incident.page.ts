import { Component, OnInit, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { IncidentStore } from './incident.store'
import { StepLocationComponent } from './step-location.component'
import { StepDetailComponent } from './step-detail.component'
import { StepDuplicationComponent } from './step-duplication.component'
import { StepPhotoComponent } from './step-photo.component'
import { StepReviewComponent } from './step-review.component'

@Component({
  selector: 'app-create-incident-page',
  imports: [
    StepLocationComponent,
    StepDetailComponent,
    StepDuplicationComponent,
    StepPhotoComponent,
    StepReviewComponent,
  ],
  styles: [
    `
      .step-active .step-icon {
        background-color: var(--color-primary);
        color: var(--color-on-primary);
        border-color: var(--color-primary);
      }
      .step-completed .step-icon {
        background-color: var(--color-primary);
        color: var(--color-on-primary);
        border-color: var(--color-primary);
      }
      .step-inactive .step-icon {
        background-color: var(--color-surface-container-high);
        color: var(--color-on-surface-variant);
        border-color: var(--color-outline-variant);
      }
    `,
  ],
  template: `
    <!-- Focused Journey Header -->
    <header
      class="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]/70 px-4 py-4 backdrop-blur-xl md:px-8"
    >
      <button
        type="button"
        (click)="cancel()"
        class="flex cursor-pointer items-center gap-1 text-[12px] font-medium text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
      >
        <span class="material-symbols-outlined text-xl">close</span>
        Cancel
      </button>
      <h1 class="text-base font-semibold text-[var(--color-on-surface)]">Report New Incident</h1>
      <span class="w-14"></span>
    </header>

    <!-- Main Content -->
    <main
      class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 py-8 md:px-8"
    >
      <!-- Stepper Component -->
      <div class="mb-8 w-full">
        <div class="relative flex items-center justify-between">
          <!-- Progress Line Background -->
          <div
            class="absolute left-0 top-1/2 z-0 h-[2px] w-full -translate-y-1/2 bg-[var(--color-surface-container-highest)]"
          ></div>
          <!-- Progress Line Active -->
          <div
            class="absolute left-0 top-1/2 z-0 h-[2px] -translate-y-1/2 bg-[var(--color-primary)] transition-all duration-300"
            [style.width]="getProgressWidth()"
          ></div>

          <!-- Step 1: Location -->
          <div
            class="step-completed group relative z-10 flex cursor-pointer flex-col items-center gap-1 bg-[var(--color-surface)] px-1"
            [class.step-completed]="store.currentStep() > 0"
            [class.step-active]="store.currentStep() === 0"
            [class.step-inactive]="store.currentStep() < 0"
            (click)="goToStep(0)"
          >
            <div
              class="step-icon flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors"
            >
              @if (store.currentStep() > 0) {
                <span class="material-symbols-outlined text-[16px]">check</span>
              } @else {
                <span class="text-[12px] font-medium">1</span>
              }
            </div>
            <span
              class="text-[12px] font-medium"
              [class.text-primary]="store.currentStep() >= 0"
              [class.text-[var(--color-on-surface)]]="store.currentStep() < 0"
            >
              Location
            </span>
          </div>

          <!-- Step 2: Details -->
          <div
            class="step-completed group relative z-10 flex cursor-pointer flex-col items-center gap-1 bg-[var(--color-surface)] px-1"
            [class.step-completed]="store.currentStep() > 1"
            [class.step-active]="store.currentStep() === 1"
            [class.step-inactive]="store.currentStep() < 1"
            (click)="goToStep(1)"
          >
            <div
              class="step-icon flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors"
              [class.shadow-sm]="store.currentStep() === 1"
            >
              @if (store.currentStep() > 1) {
                <span class="material-symbols-outlined text-[16px]">check</span>
              } @else {
                <span class="text-[12px] font-medium">2</span>
              }
            </div>
            <span
              class="text-[12px] font-medium"
              [class.text-primary]="store.currentStep() >= 1"
              [class.font-bold]="store.currentStep() === 1"
              [class.text-[var(--color-on-surface-variant)]]="store.currentStep() < 1"
            >
              Details
            </span>
          </div>

          <!-- Step 3: Photos -->
          <div
            class="step-inactive group relative z-10 flex cursor-pointer flex-col items-center gap-1 bg-[var(--color-surface)] px-1"
            [class.step-completed]="store.currentStep() > 2"
            [class.step-active]="store.currentStep() === 2"
            [class.step-inactive]="store.currentStep() < 2"
            (click)="goToStep(2)"
          >
            <div
              class="step-icon flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors"
              [class.shadow-sm]="store.currentStep() === 2"
            >
              @if (store.currentStep() > 2) {
                <span class="material-symbols-outlined text-[16px]">check</span>
              } @else {
                <span class="text-[12px] font-medium">3</span>
              }
            </div>
            <span
              class="text-[12px] font-medium"
              [class.text-primary]="store.currentStep() >= 2"
              [class.font-bold]="store.currentStep() === 2"
              [class.text-[var(--color-on-surface-variant)]]="store.currentStep() < 2"
            >
              Photos
            </span>
          </div>

          <!-- Step 4: Review -->
          <div
            class="step-inactive group relative z-10 flex cursor-pointer flex-col items-center gap-1 bg-[var(--color-surface)] px-1"
            [class.step-active]="store.currentStep() === 3"
            [class.step-inactive]="store.currentStep() < 3"
            (click)="goToStep(3)"
          >
            <div
              class="step-icon flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors"
              [class.shadow-sm]="store.currentStep() === 3"
            >
              <span class="text-[12px] font-medium">4</span>
            </div>
            <span
              class="text-[12px] font-medium"
              [class.text-primary]="store.currentStep() >= 3"
              [class.font-bold]="store.currentStep() === 3"
              [class.text-[var(--color-on-surface-variant)]]="store.currentStep() < 3"
            >
              Review
            </span>
          </div>
        </div>
      </div>

      <!-- Form Container -->
      <div
        class="w-full overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-[0px_10px_30px_rgba(0,0,0,0.05)]"
      >
        <!-- Step Content -->
        <div class="p-6 md:p-8">
          @switch (store.currentStep()) {
            @case (0) {
              <app-step-location (stepComplete)="onLocationComplete()" />
            }
            @case (1) {
              <app-step-detail
                (stepComplete)="onDetailsComplete()"
                (goBackToLocation)="goToStep(0)"
              />
            }
            @case (2) {
              @if (showDuplication()) {
                <app-step-duplication
                  (continueToPhotos)="onDuplicationComplete()"
                />
              } @else {
                <app-step-photo
                  (stepComplete)="onPhotosComplete()"
                  (goBackToDuplication)="goBackToDuplication()"
                />
              }
            }
            @case (3) {
              <app-step-review
                (goBackToPhotos)="goToStep(2)"
                (editLocation)="goToStep(0)"
                (editDetails)="goToStep(1)"
                (editPhotos)="goToStep(2)"
                (submitSuccess)="onSubmitSuccess($event)"
              />
            }
          }
        </div>
      </div>

      <!-- Success Modal -->
      @if (showSuccessModal()) {
        <div
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          (click)="closeSuccessModal()"
        >
          <div
            class="w-full max-w-sm overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-xl"
            (click)="$event.stopPropagation()"
          >
            <div class="flex flex-col items-center p-8 text-center">
              <div
                class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-secondary-container)]"
              >
                <span class="material-symbols-outlined icon-filled text-5xl text-[var(--color-on-secondary-container)]">
                  check_circle
                </span>
              </div>
              <h2 class="mb-2 text-xl font-semibold text-[var(--color-on-surface)]">
                Report Submitted!
              </h2>
              <p class="mb-2 text-sm text-[var(--color-on-surface-variant)]">
                Your incident report has been successfully submitted.
              </p>
              @if (submittedIncidentCode()) {
                <p class="mb-6 rounded-lg bg-[var(--color-surface-container)] px-3 py-2 text-sm font-mono text-[var(--color-on-surface)]">
                  {{ submittedIncidentCode() }}
                </p>
              }
              <button
                type="button"
                (click)="goToHome()"
                class="w-full rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-on-primary-fixed-variant)]"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      }
    </main>
  `,
})
export class CreateIncidentPage implements OnInit {
  protected readonly store = inject(IncidentStore)
  private readonly router = inject(Router)

  protected showDuplication = signal(false)
  protected showSuccessModal = signal(false)
  protected submittedIncidentId = signal<string | null>(null)
  protected submittedIncidentCode = signal<string | null>(null)

  async ngOnInit(): Promise<void> {
    // Load lookup data from API
    await Promise.all([
      this.store.loadAreas(),
      this.store.loadIssueTypes(),
      this.store.loadPriorities(),
    ])
  }

  getProgressWidth(): string {
    const step = this.store.currentStep()
    switch (step) {
      case 0:
        return '0%'
      case 1:
        return '33%'
      case 2:
        return '66%'
      case 3:
        return '100%'
      default:
        return '0%'
    }
  }

  goToStep(step: number): void {
    // Only allow going back to completed steps
    if (step < this.store.currentStep()) {
      // If going back to step 2 and was showing duplication, skip duplication
      if (step === 2) {
        this.showDuplication.set(false)
      }
      this.store.goToStep(step)
    }
  }

  onLocationComplete(): void {
    this.store.nextStep()
  }

  async onDetailsComplete(): Promise<void> {
    // Check for duplicates before showing duplication step
    await this.store.checkDuplicates()
    this.showDuplication.set(true)
    this.store.nextStep()
  }

  onDuplicationComplete(): void {
    // After duplication check, proceed to photo step
    this.showDuplication.set(false)
    // Already at step 2, stay here to show photo component
  }

  goBackToDuplication(): void {
    // Go back to duplication check
    this.showDuplication.set(true)
  }

  onPhotosComplete(): void {
    // After photos, go to review (step 3)
    this.store.nextStep()
  }

  onSubmitSuccess(incidentId: string): void {
    // Get the public code from store result
    const code = this.store.state().currentStep > 0 ? incidentId : null
    this.submittedIncidentId.set(incidentId)
    // Try to get publicCode if available
    const details = this.store.details()
    if (details.title) {
      this.submittedIncidentCode.set(incidentId)
    }
    this.showSuccessModal.set(true)
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false)
  }

  goToHome(): void {
    this.store.reset()
    void this.router.navigate(['/'])
  }

  cancel(): void {
    if (
      this.store.location() ||
      this.store.details().issueTypeIds.length > 0 ||
      this.store.details().title ||
      this.store.details().description
    ) {
      if (confirm('Are you sure you want to cancel? Your progress will be lost.')) {
        this.store.reset()
        void this.router.navigate(['/'])
      }
    } else {
      void this.router.navigate(['/'])
    }
  }

}
