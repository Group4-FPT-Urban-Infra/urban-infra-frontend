import { Component, EventEmitter, Output, inject, signal } from '@angular/core'
import { IncidentStore } from './incident.store'
import type { PhotoData } from './incident.types'

@Component({
  selector: 'app-step-photo',
  imports: [],
  template: `
    <div class="flex flex-col gap-6">
      <div class="mb-2">
        <h2 class="text-[20px] font-semibold leading-7 text-[var(--color-on-surface)]">
          Add Photos
        </h2>
        <p class="mt-1 text-sm text-[var(--color-on-surface-variant)]">
          Upload photos of the incident to help authorities assess the situation. You can add up to 5
          photos.
        </p>
      </div>

      <!-- Photo Upload Area -->
      <div
        class="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-8 transition-colors hover:border-[var(--color-primary)]"
        [class.border-primary]="isDragging()"
        [class.bg-[var(--color-primary-fixed)]]="isDragging()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
      >
        <input
          #fileInput
          type="file"
          accept="image/*"
          multiple
          (change)="onFileSelect($event)"
          class="hidden"
        />

        <div
          class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined text-4xl text-[var(--color-on-surface-variant)]">
            add_a_photo
          </span>
        </div>

        <p class="mb-1 text-sm font-medium text-[var(--color-on-surface)]">
          Drag photos here or click to browse
        </p>
        <p class="text-xs text-[var(--color-on-surface-variant)]">
          JPG, PNG up to 10MB each (max 5 photos)
        </p>

        <button
          type="button"
          (click)="fileInput.click()"
          class="mt-4 rounded-lg bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-on-primary-fixed-variant)]"
        >
          Select Photos
        </button>
      </div>

      <!-- Photo Grid -->
      @if (store.photos().length > 0) {
        <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
          @for (photo of store.photos(); track photo.preview; let i = $index) {
            <div class="relative group">
              <div
                class="aspect-square overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)]"
              >
                <img
                  [src]="photo.preview"
                  alt="Incident photo"
                  class="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <!-- Remove button -->
              <button
                type="button"
                (click)="removePhoto(i)"
                class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-error-container)] text-[var(--color-on-error-container)] shadow-md opacity-0 transition-opacity hover:bg-[var(--color-error)] hover:text-[var(--color-on-error)] group-hover:opacity-100"
              >
                <span class="material-symbols-outlined text-lg">close</span>
              </button>
              <!-- Photo number badge -->
              <span
                class="absolute bottom-2 left-2 rounded-full bg-[var(--color-surface-container-lowest)]/90 px-2 py-0.5 text-[11px] font-medium text-[var(--color-on-surface)] backdrop-blur-sm"
              >
                {{ i + 1 }}
              </span>
            </div>
          }

          <!-- Add more button -->
          @if (store.photos().length < 5) {
            <button
              type="button"
              (click)="addMorePhotos()"
              class="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-fixed)]"
            >
              <span class="material-symbols-outlined text-3xl text-[var(--color-on-surface-variant)]">
                add
              </span>
              <span class="mt-1 text-[11px] text-[var(--color-on-surface-variant)]">
                Add more
              </span>
            </button>
          }
        </div>
      }

      <!-- Skip option -->
      <p class="text-center text-sm text-[var(--color-on-surface-variant)]">
        Photos are optional.
        <button
          type="button"
          (click)="skipPhotos()"
          class="ml-1 font-medium text-[var(--color-primary)] hover:underline"
        >
          Skip for now
        </button>
      </p>

      <!-- Footer Actions -->
      <div class="mt-4 flex items-center justify-between border-t border-[var(--color-outline-variant)] pt-4">
        <button
          type="button"
          (click)="goBack()"
          class="flex items-center gap-1 rounded-lg border border-[var(--color-outline-variant)] bg-transparent px-4 py-[10px] text-[12px] font-medium text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50"
        >
          <span class="material-symbols-outlined text-lg">arrow_back</span>
          Back
        </button>
        <button
          type="button"
          (click)="proceed()"
          class="flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-4 py-[10px] text-[12px] font-semibold text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-on-primary-fixed-variant)]"
        >
          Review Report
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </div>
  `,
})
export class StepPhotoComponent {
  @Output() stepComplete = new EventEmitter<void>()
  @Output() goBackToDuplication = new EventEmitter<void>()

  protected readonly store = inject(IncidentStore)
  protected isDragging = signal(false)

  onDragOver(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging.set(true)
  }

  onDragLeave(): void {
    this.isDragging.set(false)
  }

  onDrop(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging.set(false)

    const files = event.dataTransfer?.files
    if (files) {
      this.processFiles(Array.from(files))
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files) {
      this.processFiles(Array.from(input.files))
      input.value = ''
    }
  }

  private processFiles(files: File[]): void {
    const remaining = 5 - this.store.photos().length
    const toProcess = files.slice(0, remaining)

    for (const file of toProcess) {
      if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const photo: PhotoData = {
            file,
            preview: e.target?.result as string,
          }
          this.store.addPhoto(photo)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  removePhoto(index: number): void {
    this.store.removePhoto(index)
  }

  addMorePhotos(): void {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e) => this.onFileSelect(e)
    input.click()
  }

  skipPhotos(): void {
    this.stepComplete.emit()
  }

  goBack(): void {
    this.goBackToDuplication.emit()
  }

  proceed(): void {
    this.stepComplete.emit()
  }
}
