import { Component, EventEmitter, Output, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IncidentStore } from './incident.store'
import {
  CATEGORY_LABELS,
  IncidentCategory,
  IncidentPriority,
  PRIORITY_LABELS,
} from './incident.types'

@Component({
  selector: 'app-step-detail',
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <div class="mb-2">
        <h2 class="text-[20px] font-semibold leading-7 text-[var(--color-on-surface)]">
          Incident Details
        </h2>
        <p class="mt-1 text-sm text-[var(--color-on-surface-variant)]">
          Provide specific information about the issue to help teams route it correctly.
        </p>
      </div>

      <!-- Form Layout -->
      <div class="flex flex-col gap-6">
        <!-- Category Dropdown -->
        <div class="flex flex-col gap-1">
          <label
            class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]"
            for="category"
          >
            Primary Category <span class="text-[var(--color-error)]">*</span>
          </label>
          <div class="relative">
            <select
              id="category"
              [(ngModel)]="selectedCategory"
              (ngModelChange)="onCategoryChange($event)"
              name="category"
              class="w-full appearance-none rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] py-[10px] pl-4 pr-10 text-sm text-[var(--color-on-surface)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-fixed)] cursor-pointer"
            >
              <option [ngValue]="null" disabled>Select category...</option>
              @for (category of categories; track category.value) {
                <option [value]="category.value">{{ category.label }}</option>
              }
            </select>
            <span
              class="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]"
            >
              expand_more
            </span>
          </div>
        </div>

        <!-- Priority Selection (Chips) -->
        <div class="flex flex-col gap-2">
          <label class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]">
            Assessed Priority
          </label>
          <div class="flex flex-wrap gap-2">
            @for (priority of priorities; track priority.value) {
              <button
                type="button"
                (click)="onPriorityChange(priority.value)"
                class="px-4 py-2 rounded-full border text-[12px] font-medium transition-all"
                [class]="getPriorityClasses(priority.value)"
              >
                {{ priority.label }}
              </button>
            }
          </div>
        </div>

        <!-- Description Textarea -->
        <div class="flex flex-col gap-1">
          <label
            class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]"
            for="description"
          >
            Detailed Description <span class="text-[var(--color-error)]">*</span>
          </label>
          <textarea
            id="description"
            [(ngModel)]="description"
            (ngModelChange)="onDescriptionChange($event)"
            name="description"
            placeholder="Describe the incident, exact location specifics, and any immediate hazards..."
            rows="5"
            class="w-full resize-none rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-fixed)]"
          ></textarea>
          <span class="mt-1 self-end text-[11px] text-[var(--color-on-surface-variant)]">
            {{ description.length }} / 500 characters
          </span>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="mt-4 flex items-center justify-between border-t border-[var(--color-outline-variant)] pt-4">
        <button
          type="button"
          (click)="goBack()"
          class="flex items-center gap-1 rounded-lg border border-[var(--color-outline-variant)] bg-transparent px-4 py-[10px] text-[12px] font-medium text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50"
        >
          <span class="material-symbols-outlined text-lg">arrow_back</span>
          Back to Location
        </button>
        <button
          type="button"
          (click)="proceed()"
          [disabled]="!canProceed()"
          class="flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-4 py-[10px] text-[12px] font-semibold text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-on-primary-fixed-variant)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Check for Duplicates
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </div>
  `,
})
export class StepDetailComponent {
  @Output() stepComplete = new EventEmitter<void>()
  @Output() goBackToLocation = new EventEmitter<void>()

  protected readonly store = inject(IncidentStore)

  protected readonly categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as IncidentCategory,
    label,
  }))

  protected readonly priorities = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
    value: value as IncidentPriority,
    label,
  }))

  protected selectedCategory: IncidentCategory | null = null
  protected selectedPriority: IncidentPriority = 'medium'
  protected description = ''

  constructor() {
    // Sync with store on component init
    const details = this.store.details()
    this.selectedCategory = details.category
    this.selectedPriority = details.priority
    this.description = details.description
  }

  canProceed(): boolean {
    return this.selectedCategory !== null && this.description.trim().length >= 10
  }

  onCategoryChange(category: IncidentCategory): void {
    this.selectedCategory = category
    this.store.setCategory(category)
  }

  onPriorityChange(priority: IncidentPriority): void {
    this.selectedPriority = priority
    this.store.setPriority(priority)
  }

  onDescriptionChange(description: string): void {
    this.description = description
    this.store.setDescription(description)
  }

  getPriorityClasses(priority: IncidentPriority): string {
    const isSelected = this.selectedPriority === priority
    const base =
      'border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'

    if (!isSelected) {
      return base
    }

    switch (priority) {
      case 'low':
        return `${base} border-[var(--color-secondary)] bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]`
      case 'medium':
        return `${base} border-[var(--color-tertiary)] bg-[var(--color-tertiary-fixed)] text-[var(--color-on-tertiary-fixed)]`
      case 'high':
        return `${base} border-[var(--color-error)] bg-[var(--color-error-container)] text-[var(--color-on-error-container)]`
      default:
        return base
    }
  }

  goBack(): void {
    this.goBackToLocation.emit()
  }

  proceed(): void {
    this.stepComplete.emit()
  }
}
