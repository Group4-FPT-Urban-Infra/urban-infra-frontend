import { Component, EventEmitter, Output, inject, signal } from '@angular/core'
import { IncidentStore } from './incident.store'
import type { DuplicateIncident } from './incident.types'

@Component({
  selector: 'app-step-duplication',
  imports: [],
  template: `
    <div class="flex flex-col">
      <!-- Contextual Header -->
      <div class="mb-6 text-center">
        <div
          class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-fixed)] text-[var(--color-primary)]"
        >
          <span class="material-symbols-outlined icon-filled text-[32px]">location_on</span>
        </div>
        <h1
          class="mb-2 text-[24px] font-semibold leading-8 text-[var(--color-on-surface)] md:text-[28px] md:leading-9"
          style="letter-spacing: -0.01em"
        >
          Is this what you're reporting?
        </h1>
        <p class="mx-auto max-w-xl text-base text-[var(--color-on-surface-variant)]">
          We found similar incidents already reported near your selected location. Upvoting an
          existing report helps us resolve it faster.
        </p>
      </div>

      @if (store.isCheckingDuplicates()) {
        <!-- Loading State -->
        <div class="flex flex-col items-center justify-center py-12">
          <span
            class="material-symbols-outlined animate-spin text-5xl text-[var(--color-primary)]"
          >
            progress_activity
          </span>
          <p class="mt-4 text-sm text-[var(--color-on-surface-variant)]">
            Checking for similar incidents...
          </p>
        </div>
      } @else if (store.duplicateIncidents().length === 0) {
        <!-- No Duplicates -->
        <div class="flex flex-col items-center justify-center py-12">
          <div
            class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-secondary-container)]"
          >
            <span class="material-symbols-outlined icon-filled text-[32px] text-[var(--color-on-secondary-container)]">
              check_circle
            </span>
          </div>
          <h2 class="mb-2 text-lg font-semibold text-[var(--color-on-surface)]">
            No similar incidents found
          </h2>
          <p class="mb-6 text-center text-sm text-[var(--color-on-surface-variant)]">
            Great! Your report appears to be a new incident. Continue to add photos.
          </p>
          <button
            type="button"
            (click)="continueWithReport()"
            class="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-on-primary-fixed-variant)]"
          >
            Continue with Report
            <span class="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      } @else {
        <!-- Suggestion List -->
        <div class="mb-6 flex flex-col gap-4">
          @for (incident of store.duplicateIncidents(); track incident.id) {
            <div
              class="group relative flex flex-col items-start overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-4 shadow-sm transition-all hover:border-[var(--color-primary-fixed-dim)] hover:shadow-md md:flex-row md:items-center md:p-6 md:gap-4"
            >
              <!-- Left accent bar -->
              <div
                class="bg-[var(--color-tertiary-container)] absolute inset-y-0 left-0 w-1 rounded-l-xl opacity-0 transition-opacity group-hover:opacity-100"
              ></div>

              <!-- Icon -->
              <div
                class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]"
              >
                <span class="material-symbols-outlined icon-filled">{{ incident.icon }}</span>
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-1">
                <div class="mb-1 flex items-center gap-2">
                  <h3 class="truncate text-base font-semibold text-[var(--color-on-surface)]">
                    {{ incident.title }}
                  </h3>
                  <span
                    class="ml-2 inline-flex items-center rounded-full bg-[var(--color-surface-container-high)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-on-surface)]"
                  >
                    {{ incident.status }}
                  </span>
                </div>
                <div class="flex items-center gap-3 text-sm text-[var(--color-on-surface-variant)]">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-base">straighten</span>
                    {{ incident.distance }}m away
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-base">schedule</span>
                    {{ incident.timeAgo }}
                  </span>
                </div>
              </div>

              <!-- Action -->
              <div class="mt-4 w-full flex-shrink-0 md:mt-0 md:w-auto">
                <button
                  type="button"
                  (click)="upvoteIncident(incident)"
                  [disabled]="upvotingId() === incident.id"
                  class="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary-fixed)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary-fixed)] transition-colors hover:bg-[var(--color-primary-fixed-dim)] disabled:opacity-60 md:w-auto"
                >
                  @if (upvotingId() === incident.id) {
                    <span class="material-symbols-outlined animate-spin text-lg">
                      progress_activity
                    </span>
                  } @else {
                    <span class="material-symbols-outlined text-lg">thumb_up</span>
                  }
                  Yes, upvote existing
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Sticky Bottom Action -->
        <div class="mt-4 flex justify-center border-t border-[var(--color-outline-variant)]/50 pt-6 pb-2">
          <button
            type="button"
            (click)="continueWithReport()"
            class="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[var(--color-outline-variant)] bg-transparent px-6 py-3 text-[12px] font-medium text-[var(--color-on-surface)] transition-all hover:border-[var(--color-outline)] hover:bg-[var(--color-surface-container)] md:w-auto"
          >
            <span class="material-symbols-outlined text-xl">add_circle</span>
            No, continue with new report
          </button>
        </div>
      }
    </div>
  `,
})
export class StepDuplicationComponent {
  @Output() skipDuplicates = new EventEmitter<void>()
  @Output() continueToPhotos = new EventEmitter<void>()

  protected readonly store = inject(IncidentStore)
  protected upvotingId = signal<string | null>(null)

  async upvoteIncident(incident: DuplicateIncident): Promise<void> {
    this.upvotingId.set(incident.id)
    try {
      await this.store.upvoteDuplicate(incident.id)
      this.store.removeDuplicate(incident.id)
    } finally {
      this.upvotingId.set(null)
    }
  }

  continueWithReport(): void {
    this.store.skipDuplicateCheck()
    this.continueToPhotos.emit()
  }
}
