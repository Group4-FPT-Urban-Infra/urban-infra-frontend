import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IncidentStore } from './incident.store'

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
        <!-- Issue Type Multi-Select (Chips) -->
        <div class="flex flex-col gap-2">
          <label class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]">
            Incident Types <span class="text-[var(--color-error)]">*</span>
          </label>
          <div class="flex flex-wrap gap-2">
            @for (type of store.issueTypes(); track type.issueTypeId) {
              <button
                type="button"
                (click)="onIssueTypeToggle(type.issueTypeId)"
                class="px-3 py-2 rounded-full border text-[12px] font-medium transition-all"
                [class]="getIssueTypeClasses(type.issueTypeId)"
                [title]="type.description || type.typeName"
              >
                {{ type.typeName }}
              </button>
            }
          </div>
          @if (selectedIssueTypeIds.length === 0) {
            <p class="text-xs text-[var(--color-on-surface-variant)]">
              Select at least one incident type. You can select up to 5 types.
            </p>
          } @else {
            <p class="text-xs text-[var(--color-on-surface-variant)]">
              {{ selectedIssueTypeIds.length }}/5 incident types selected
            </p>
          }
        </div>

        <!-- Title Input -->
        <div class="flex flex-col gap-1">
          <label
            class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]"
            for="title"
          >
            Title <span class="text-[var(--color-error)]">*</span>
          </label>
          <input
            id="title"
            type="text"
            [(ngModel)]="title"
            (ngModelChange)="onTitleChange($event)"
            placeholder="Brief title describing the incident..."
            maxlength="200"
            class="w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-[10px] text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-fixed)]"
          />
          <span class="mt-1 self-end text-[11px] text-[var(--color-on-surface-variant)]">
            {{ title.length }} / 200 characters
          </span>
        </div>

        <!-- Priority Selection (Chips) -->
        <div class="flex flex-col gap-2">
          <label class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]">
            Priority
          </label>
          <div class="flex flex-wrap gap-2">
            @for (priority of store.priorities(); track priority.priorityId) {
              <button
                type="button"
                (click)="onPriorityChange(priority.priorityId)"
                class="px-4 py-2 rounded-full border text-[12px] font-medium transition-all"
                [class]="getPriorityClasses(priority.priorityId)"
              >
                {{ priority.priorityName }}
              </button>
            }
          </div>
          @if (store.details().priorityId === null && prioritiesLoaded()) {
            <p class="text-xs text-[var(--color-on-surface-variant)]">
              Priority will be set to default if not selected.
            </p>
          }
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
          <div class="mt-1 flex items-center justify-between">
            @if (description.length > 0 && description.length < 10) {
              <span class="text-xs text-[var(--color-error)]">
                Minimum 10 characters required ({{ 10 - description.length }} more needed)
              </span>
            } @else {
              <span></span>
            }
            <span class="text-[11px] text-[var(--color-on-surface-variant)]">
              {{ description.length }} / 2000 characters
            </span>
          </div>
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
export class StepDetailComponent implements OnInit {
  @Output() stepComplete = new EventEmitter<void>()
  @Output() goBackToLocation = new EventEmitter<void>()

  protected readonly store = inject(IncidentStore)

  protected selectedIssueTypeIds: number[] = []
  protected selectedPriorityId: number | null = null
  protected title = ''
  protected description = ''
  protected prioritiesLoaded = signal(false)

  ngOnInit(): void {
    // Sync with store
    const details = this.store.details()
    this.selectedIssueTypeIds = [...details.issueTypeIds]
    this.selectedPriorityId = details.priorityId
    this.title = details.title
    this.description = details.description

    // Mark priorities as loaded if available
    if (this.store.priorities().length > 0) {
      this.prioritiesLoaded.set(true)
      // Set default priority if not set
      if (!this.selectedPriorityId) {
        const defaultPriority = this.store.priorities().find(p => p.severityRank === 1)
        if (defaultPriority) {
          this.selectedPriorityId = defaultPriority.priorityId
          this.store.setPriorityId(defaultPriority.priorityId)
        }
      }
    }
  }

  canProceed(): boolean {
    return (
      this.selectedIssueTypeIds.length > 0 &&
      this.title.trim().length >= 5 &&
      this.description.trim().length >= 10
    )
  }

  isIssueTypeSelected(issueTypeId: number): boolean {
    return this.selectedIssueTypeIds.includes(issueTypeId)
  }

  onIssueTypeToggle(issueTypeId: number): void {
    if (this.isIssueTypeSelected(issueTypeId)) {
      this.selectedIssueTypeIds = this.selectedIssueTypeIds.filter(id => id !== issueTypeId)
    } else {
      // Max 5 issue types allowed
      if (this.selectedIssueTypeIds.length < 5) {
        this.selectedIssueTypeIds = [...this.selectedIssueTypeIds, issueTypeId]
      }
    }
    this.store.setIssueTypeIds(this.selectedIssueTypeIds)
  }

  onPriorityChange(priorityId: number): void {
    this.selectedPriorityId = priorityId
    this.store.setPriorityId(priorityId)
  }

  onTitleChange(title: string): void {
    this.title = title
    this.store.setTitle(title)
  }

  onDescriptionChange(description: string): void {
    this.description = description
    this.store.setDescription(description)
  }

  getPriorityClasses(priorityId: number): string {
    const isSelected = this.selectedPriorityId === priorityId
    const base =
      'border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'

    if (!isSelected) {
      return base
    }

    // Get priority info from store
    const priority = this.store.priorities().find(p => p.priorityId === priorityId)
    if (!priority) return base

    // Style based on severity rank
    switch (priority.severityRank) {
      case 1: // Low
        return `${base} border-[var(--color-secondary)] bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]`
      case 2: // Medium
        return `${base} border-[var(--color-tertiary)] bg-[var(--color-tertiary-fixed)] text-[var(--color-on-tertiary-fixed)]`
      case 3: // High
        return `${base} border-[var(--color-error)] bg-[var(--color-error-container)] text-[var(--color-on-error-container)]`
      default:
        return base
    }
  }

  getIssueTypeClasses(issueTypeId: number): string {
    const isSelected = this.isIssueTypeSelected(issueTypeId)
    const base =
      'border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'

    if (!isSelected) {
      return base
    }

    return `${base} border-[var(--color-primary)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]`
  }

  goBack(): void {
    this.goBackToLocation.emit()
  }

  proceed(): void {
    if (this.canProceed()) {
      this.stepComplete.emit()
    }
  }
}
