import { Component, EventEmitter, OnDestroy, OnInit, Output, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IncidentStore } from './incident.store'

@Component({
  selector: 'app-step-detail',
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <div class="mb-2">
        <h2 class="text-[20px] leading-7 font-semibold text-[var(--color-on-surface)]">
          Incident Details
        </h2>
        <p class="mt-1 text-sm text-[var(--color-on-surface-variant)]">
          Provide specific information about the issue to help teams route it correctly.
        </p>
      </div>

      <!-- Form Layout -->
      <div class="flex flex-col gap-6">
        <!-- Issue Type Multi-Select (Dropdown + Checkbox) -->
        <div class="flex flex-col gap-2">
          <label
            class="text-[12px] leading-4 font-medium tracking-wide text-[var(--color-on-surface)]"
          >
            Incident Types <span class="text-[var(--color-error)]">*</span>
          </label>
          <div class="dropdown-container relative">
            <!-- Dropdown Trigger -->
            <button
              type="button"
              (click)="toggleDropdown()"
              class="flex w-full items-center justify-between rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-[10px] text-sm transition-colors hover:bg-[var(--color-surface-container)]"
              [class.border-[var(--color-primary)]]="isDropdownOpen()"
              [class.ring-2]="isDropdownOpen()"
              [class.ring-[var(--color-primary-fixed)]]="isDropdownOpen()"
            >
              <span class="flex items-center gap-2">
                @if (selectedIssueTypeIds.length === 0) {
                  <span class="text-[var(--color-outline)]">Select incident types...</span>
                } @else {
                  <span class="text-[var(--color-on-surface)]">
                    {{ selectedIssueTypeIds.length }} type{{
                      selectedIssueTypeIds.length > 1 ? 's' : ''
                    }}
                    selected
                  </span>
                  @if (selectedIssueTypeIds.length <= 3) {
                    <span class="text-xs text-[var(--color-on-surface-variant)]">
                      ({{ getSelectedTypeNames() }})
                    </span>
                  }
                }
              </span>
              <span
                class="material-symbols-outlined text-lg text-[var(--color-on-surface-variant)] transition-transform"
                [class.rotate-180]="isDropdownOpen()"
              >
                expand_more
              </span>
            </button>

            <!-- Dropdown Panel -->
            @if (isDropdownOpen()) {
              <div
                class="absolute z-50 mt-1 w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-lg"
              >
                <div class="max-h-64 overflow-y-auto p-1">
                  @for (type of store.issueTypes(); track type.issueTypeId) {
                    <label
                      class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface-container)]"
                      [class.bg-[var(--color-primary-container)]]="
                        isIssueTypeSelected(type.issueTypeId)
                      "
                    >
                      <input
                        type="checkbox"
                        [checked]="isIssueTypeSelected(type.issueTypeId)"
                        (change)="onIssueTypeToggle(type.issueTypeId)"
                        [disabled]="
                          !isIssueTypeSelected(type.issueTypeId) && selectedIssueTypeIds.length >= 5
                        "
                        class="h-4 w-4 rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary-fixed)]"
                      />
                      <span class="flex flex-col">
                        <span
                          [class.text-[var(--color-on-primary-container)]]]="
                            isIssueTypeSelected(type.issueTypeId)
                          "
                          [class.text-[var(--color-on-surface)]]]="
                            !isIssueTypeSelected(type.issueTypeId)
                          "
                        >
                          {{ type.typeName }}
                        </span>
                        @if (type.description) {
                          <span class="line-clamp-1 text-xs text-[var(--color-on-surface-variant)]">
                            {{ type.description }}
                          </span>
                        }
                      </span>
                    </label>
                  }
                </div>
                @if (selectedIssueTypeIds.length === 0) {
                  <div class="border-t border-[var(--color-outline-variant)] px-3 py-2">
                    <p class="text-xs text-[var(--color-on-surface-variant)]">
                      Select at least one incident type. You can select up to 5 types.
                    </p>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Title Input -->
        <div class="flex flex-col gap-1">
          <label
            class="text-[12px] leading-4 font-medium tracking-wide text-[var(--color-on-surface)]"
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
            class="w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-[10px] text-sm text-[var(--color-on-surface)] transition-colors placeholder:text-[var(--color-outline)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-fixed)] focus:outline-none"
          />
          <span class="mt-1 self-end text-[11px] text-[var(--color-on-surface-variant)]">
            {{ title.length }} / 200 characters
          </span>
        </div>

        <!-- Priority Selection (Chips) -->
        <div class="flex flex-col gap-2">
          <label
            class="text-[12px] leading-4 font-medium tracking-wide text-[var(--color-on-surface)]"
          >
            Priority
          </label>
          <div class="flex flex-wrap gap-2">
            @for (priority of store.priorities(); track priority.priorityId) {
              <button
                type="button"
                (click)="onPriorityChange(priority.priorityId)"
                class="rounded-full border px-4 py-2 text-[12px] font-medium transition-all"
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
            class="text-[12px] leading-4 font-medium tracking-wide text-[var(--color-on-surface)]"
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
            class="w-full resize-none rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm text-[var(--color-on-surface)] transition-colors placeholder:text-[var(--color-outline)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-fixed)] focus:outline-none"
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
      <div
        class="mt-4 flex items-center justify-between border-t border-[var(--color-outline-variant)] pt-4"
      >
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
          class="flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-4 py-[10px] text-[12px] font-semibold text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-on-primary-fixed-variant)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Check for Duplicates
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </div>
  `,
})
export class StepDetailComponent implements OnInit, OnDestroy {
  @Output() stepComplete = new EventEmitter<void>()
  @Output() goBackToLocation = new EventEmitter<void>()

  protected readonly store = inject(IncidentStore)

  protected selectedIssueTypeIds: number[] = []
  protected selectedPriorityId: number | null = null
  protected title = ''
  protected description = ''
  protected prioritiesLoaded = signal(false)
  protected isDropdownOpen = signal(false)
  private clickOutsideListener: ((event: MouseEvent) => void) | null = null

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
        const defaultPriority = this.store.priorities().find((p) => p.severityRank === 1)
        if (defaultPriority) {
          this.selectedPriorityId = defaultPriority.priorityId
          this.store.setPriorityId(defaultPriority.priorityId)
        }
      }
    }

    // Close dropdown on outside click
    this.clickOutsideListener = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.dropdown-container')) {
        this.isDropdownOpen.set(false)
      }
    }
    document.addEventListener('click', this.clickOutsideListener)
  }

  ngOnDestroy(): void {
    if (this.clickOutsideListener) {
      document.removeEventListener('click', this.clickOutsideListener)
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
      this.selectedIssueTypeIds = this.selectedIssueTypeIds.filter((id) => id !== issueTypeId)
    } else {
      // Max 5 issue types allowed
      if (this.selectedIssueTypeIds.length < 5) {
        this.selectedIssueTypeIds = [...this.selectedIssueTypeIds, issueTypeId]
      }
    }
    this.store.setIssueTypeIds(this.selectedIssueTypeIds)
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update((open) => !open)
  }

  getSelectedTypeNames(): string {
    return this.selectedIssueTypeIds
      .map((id) => this.store.issueTypes().find((t) => t.issueTypeId === id)?.typeName)
      .filter((name) => !!name)
      .join(', ')
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
    const priority = this.store.priorities().find((p) => p.priorityId === priorityId)
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
