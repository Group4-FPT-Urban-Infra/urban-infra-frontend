import { Component, EventEmitter, Output, inject, signal } from '@angular/core'
import { IncidentStore } from './incident.store'
import { CATEGORY_LABELS, PRIORITY_LABELS } from './incident.types'

@Component({
  selector: 'app-step-review',
  imports: [],
  template: `
    <div class="flex flex-col gap-6">
      <div class="mb-2 text-center">
        <div
          class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-secondary-container)]"
        >
          <span class="material-symbols-outlined icon-filled text-[32px] text-[var(--color-on-secondary-container)]">
            fact_check
          </span>
        </div>
        <h2 class="text-[20px] font-semibold leading-7 text-[var(--color-on-surface)]">
          Review Your Report
        </h2>
        <p class="mt-1 text-sm text-[var(--color-on-surface-variant)]">
          Please verify all information is correct before submitting.
        </p>
      </div>

      <!-- Review Cards -->
      <div class="flex flex-col gap-4">
        <!-- Location Card -->
        <div
          class="overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]"
        >
          <div
            class="flex items-center justify-between border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3"
          >
            <h3 class="flex items-center gap-2 text-sm font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-lg text-[var(--color-primary)]">
                location_on
              </span>
              Location
            </h3>
            <button
              type="button"
              (click)="editSection('location')"
              class="text-[12px] font-medium text-[var(--color-primary)] hover:underline"
            >
              Edit
            </button>
          </div>
          <div class="p-4">
            <p class="text-sm text-[var(--color-on-surface)]">
              {{ store.location()?.address || 'No address provided' }}
            </p>
            @if (store.location()?.latitude && store.location()?.longitude) {
              <p class="mt-1 text-xs text-[var(--color-on-surface-variant)]">
                {{ store.location()!.latitude.toFixed(6) }}, {{ store.location()!.longitude.toFixed(6) }}
              </p>
            }
          </div>
        </div>

        <!-- Details Card -->
        <div
          class="overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]"
        >
          <div
            class="flex items-center justify-between border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3"
          >
            <h3 class="flex items-center gap-2 text-sm font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-lg text-[var(--color-primary)]">
                description
              </span>
              Details
            </h3>
            <button
              type="button"
              (click)="editSection('details')"
              class="text-[12px] font-medium text-[var(--color-primary)] hover:underline"
            >
              Edit
            </button>
          </div>
          <div class="p-4">
            <div class="flex flex-wrap gap-2">
              @if (store.details().category) {
                <span
                  class="inline-flex items-center rounded-full bg-[var(--color-primary-container)] px-3 py-1 text-[12px] font-medium text-[var(--color-on-primary-container)]"
                >
                  {{ getCategoryLabel(store.details().category!) }}
                </span>
              }
              <span
                class="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium"
                [class]="getPriorityBadgeClass(store.details().priority)"
              >
                {{ getPriorityLabel(store.details().priority) }}
              </span>
            </div>
            @if (store.details().description) {
              <p class="mt-3 text-sm text-[var(--color-on-surface)]">
                {{ store.details().description }}
              </p>
            }
          </div>
        </div>

        <!-- Photos Card -->
        <div
          class="overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]"
        >
          <div
            class="flex items-center justify-between border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3"
          >
            <h3 class="flex items-center gap-2 text-sm font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-lg text-[var(--color-primary)]">
                photo_library
              </span>
              Photos
              <span class="text-[var(--color-on-surface-variant)]">({{ store.photos().length }})</span>
            </h3>
            <button
              type="button"
              (click)="editSection('photos')"
              class="text-[12px] font-medium text-[var(--color-primary)] hover:underline"
            >
              Edit
            </button>
          </div>
          <div class="p-4">
            @if (store.photos().length > 0) {
              <div class="flex gap-2 overflow-x-auto pb-2">
                @for (photo of store.photos(); track photo.preview) {
                  <img
                    [src]="photo.preview"
                    alt="Incident photo"
                    class="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                  />
                }
              </div>
            } @else {
              <p class="text-sm text-[var(--color-on-surface-variant)]">
                No photos attached
              </p>
            }
          </div>
        </div>
      </div>

      <!-- Terms notice -->
      <div class="rounded-lg bg-[var(--color-surface-container)] p-4">
        <p class="text-xs text-[var(--color-on-surface-variant)]">
          By submitting this report, you confirm that the information provided is accurate to the
          best of your knowledge. False reports may result in account restrictions.
        </p>
      </div>

      <!-- Footer Actions -->
      <div class="mt-4 flex items-center justify-between border-t border-[var(--color-outline-variant)] pt-4">
        <button
          type="button"
          (click)="goBack()"
          [disabled]="store.isSubmitting()"
          class="flex items-center gap-1 rounded-lg border border-[var(--color-outline-variant)] bg-transparent px-4 py-[10px] text-[12px] font-medium text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50 disabled:opacity-60"
        >
          <span class="material-symbols-outlined text-lg">arrow_back</span>
          Back
        </button>
        <button
          type="button"
          (click)="submit()"
          [disabled]="store.isSubmitting()"
          class="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-[10px] text-[12px] font-semibold text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-on-primary-fixed-variant)] disabled:opacity-60"
        >
          @if (store.isSubmitting()) {
            <span class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            Submitting...
          } @else {
            <span class="material-symbols-outlined text-lg">send</span>
            Submit Report
          }
        </button>
      </div>
    </div>
  `,
})
export class StepReviewComponent {
  @Output() goBackToPhotos = new EventEmitter<void>()
  @Output() editLocation = new EventEmitter<void>()
  @Output() editDetails = new EventEmitter<void>()
  @Output() editPhotos = new EventEmitter<void>()
  @Output() submitSuccess = new EventEmitter<string>()

  protected readonly store = inject(IncidentStore)

  getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category
  }

  getPriorityLabel(priority: string): string {
    return PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS] || priority
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'low':
        return 'bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]'
      case 'medium':
        return 'bg-[var(--color-tertiary-fixed)] text-[var(--color-on-tertiary-fixed)]'
      case 'high':
        return 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
      default:
        return 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]'
    }
  }

  editSection(section: 'location' | 'details' | 'photos'): void {
    switch (section) {
      case 'location':
        this.editLocation.emit()
        break
      case 'details':
        this.editDetails.emit()
        break
      case 'photos':
        this.editPhotos.emit()
        break
    }
  }

  goBack(): void {
    this.goBackToPhotos.emit()
  }

  async submit(): Promise<void> {
    const result = await this.store.submitIncident()
    if (result.success && result.incidentId) {
      this.submitSuccess.emit(result.incidentId)
    }
  }
}
