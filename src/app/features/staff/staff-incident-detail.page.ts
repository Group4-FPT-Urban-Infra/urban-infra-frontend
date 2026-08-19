import { Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import * as L from 'leaflet'
import { StaffService, StaffIncidentDetailResponse } from './staff.service'

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

@Component({
  selector: 'app-staff-incident-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    @if (isLoading()) {
      <div class="flex min-h-screen items-center justify-center">
        <span class="material-symbols-outlined animate-spin text-4xl text-[var(--color-primary)]">
          progress_activity
        </span>
      </div>
    } @else if (incident()) {
      <div class="min-h-screen bg-[var(--color-background)] p-4 md:p-8">
        <!-- Header -->
        <header class="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div
              class="mb-2 flex items-center gap-2 text-[12px] font-medium text-[var(--color-on-surface-variant)]"
            >
              <a routerLink="/staff/incidents" class="hover:text-[var(--color-primary)]"
                >Incidents</a
              >
              <span class="material-symbols-outlined text-[16px]">chevron_right</span>
              <span class="font-semibold text-[var(--color-on-surface)]">{{
                incident()!.publicCode
              }}</span>
            </div>
            <h2
              class="flex flex-wrap items-center gap-3 text-[28px] font-bold text-[var(--color-on-surface)]"
            >
              {{ incident()!.title }}
              @if (incident()!.isSlaBreached) {
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-[var(--color-error-container)] px-3 py-1 text-[11px] font-medium text-[var(--color-on-error-container)]"
                >
                  <span class="material-symbols-outlined text-[14px]">priority_high</span>
                  SLA Breached
                </span>
              }
              <!-- Assignment Action Buttons -->
              @if (incident()!.currentMember) {
                @if (incident()!.currentMember!.status === 'PENDING') {
                  <button
                    type="button"
                    [disabled]="actionLoading()"
                    (click)="acceptAssignment()"
                    class="inline-flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-[12px] font-medium text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50"
                  >
                    @if (actionLoading()) {
                      <span class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                    } @else {
                      <span class="material-symbols-outlined text-[16px]">check</span>
                    }
                    Accept
                  </button>
                  <button
                    type="button"
                    [disabled]="actionLoading()"
                    (click)="rejectAssignment()"
                    class="inline-flex items-center gap-1 rounded-lg bg-red-600 px-4 py-2 text-[12px] font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    @if (actionLoading()) {
                      <span class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                    } @else {
                      <span class="material-symbols-outlined text-[16px]">close</span>
                    }
                    Reject
                  </button>
                }
                @if (incident()!.currentMember!.status === 'ACCEPTED') {
                  <button
                    type="button"
                    [disabled]="actionLoading() || incident()!.staffImages.length === 0"
                    (click)="completeAssignment()"
                    class="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[12px] font-medium text-white shadow-sm transition-colors hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
                    [title]="incident()!.staffImages.length === 0 ? 'Upload evidence photos first' : 'Mark as complete'"
                  >
                    @if (actionLoading()) {
                      <span class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                    } @else {
                      <span class="material-symbols-outlined text-[16px]">task_alt</span>
                    }
                    Completed
                  </button>
                }
                @if (incident()!.currentMember!.status === 'COMPLETED') {
                  <span class="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[11px] font-medium text-green-700">
                    <span class="material-symbols-outlined text-[14px]">check_circle</span>
                    Completed
                  </span>
                }
              }
            </h2>
          </div>
        </header>

        <!-- Bento Grid Layout -->
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <!-- Main Content Column -->
          <div class="flex flex-col gap-6 xl:col-span-2">
            <!-- Details Card -->
            <section
              class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/80 p-6 shadow-sm backdrop-blur-md"
            >
              <h3
                class="mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)]/30 pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]"
              >
                <span class="material-symbols-outlined text-[var(--color-primary)]">info</span>
                Incident Details
              </h3>
              <div class="grid grid-cols-1 gap-4 text-[14px] md:grid-cols-2">
                <div>
                  <span class="mb-1 block text-[var(--color-on-surface-variant)]">Category</span>
                  <span class="font-semibold text-[var(--color-on-surface)]">{{
                    incident()!.issueType.name
                  }}</span>
                </div>
                <div>
                  <span class="mb-1 block text-[var(--color-on-surface-variant)]">Priority</span>
                  <span class="font-semibold text-[var(--color-on-surface)]">{{
                    incident()!.priority.name
                  }}</span>
                </div>
                <div>
                  <span class="mb-1 block text-[var(--color-on-surface-variant)]">Area</span>
                  <span class="font-semibold text-[var(--color-on-surface)]">{{
                    incident()!.area.name
                  }}</span>
                </div>
                <div>
                  <span class="mb-1 block text-[var(--color-on-surface-variant)]"
                    >Date Reported</span
                  >
                  <span class="font-semibold text-[var(--color-on-surface)]">{{
                    formatDateTime(incident()!.reportedAt)
                  }}</span>
                </div>
                <div class="md:col-span-2">
                  <span class="mb-1 block text-[var(--color-on-surface-variant)]">Location</span>
                  <span
                    class="flex items-center gap-2 font-semibold text-[var(--color-on-surface)]"
                  >
                    <span class="material-symbols-outlined text-[16px] text-[var(--color-outline)]"
                      >location_on</span
                    >
                    {{ incident()!.address || 'N/A' }}
                  </span>
                </div>
                <div class="md:col-span-2">
                  <span class="mb-1 block text-[var(--color-on-surface-variant)]"
                    >Description provided by Citizen</span
                  >
                  <p
                    class="mt-2 rounded-lg bg-[var(--color-surface-container-low)] p-4 text-[var(--color-on-surface)]"
                  >
                    {{ incident()!.description }}
                  </p>
                </div>
              </div>
            </section>

            <!-- Map & Navigation -->
            <section
              class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/80 p-6 shadow-sm backdrop-blur-md"
            >
              <h3
                class="mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)]/30 pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]"
              >
                <span class="material-symbols-outlined text-[var(--color-primary)]">map</span>
                Location
              </h3>
              <!-- Map Container -->
              <div
                #mapContainer
                class="mb-4 h-[400px] w-full overflow-hidden rounded-lg border border-[var(--color-outline-variant)]"
              ></div>
              <!-- Open in Google Maps Button -->
              <a
                [href]="getGoogleMapsUrl()"
                target="_blank"
                rel="noopener noreferrer"
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-[14px] font-medium text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-primary)]/90"
              >
                <span class="material-symbols-outlined text-[20px]">open_in_new</span>
                Open in Google Maps
              </a>
            </section>

            <!-- Status History -->
            <section
              class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/80 p-6 shadow-sm backdrop-blur-md"
            >
              <h3
                class="mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)]/30 pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]"
              >
                <span class="material-symbols-outlined text-[var(--color-primary)]">history</span>
                Status History
              </h3>
              @if (incident()!.timeline.length > 0) {
                <div class="relative space-y-5 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-[var(--color-outline-variant)]/50 before:content-['']">
                  @for (event of incident()!.timeline; track event.id) {
                    <div class="relative">
                      <div class="absolute -left-[30px] z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-primary-fixed)]">
                        <span class="material-symbols-outlined text-[12px]">history</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[12px] font-bold text-[var(--color-on-surface)]">{{ event.toStatus?.name || event.updateType }}</span>
                        <span class="mb-1 text-[11px] text-[var(--color-outline)]">{{ formatDateTime(event.createdAt) }}</span>
                        @if (event.note) { <span class="text-[14px] text-[var(--color-on-surface-variant)]">{{ event.note }}</span> }
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-center text-[12px] text-[var(--color-on-surface-variant)]">No status history yet.</p>
              }
            </section>
          </div>

          <!-- Side Column -->
          <div class="flex flex-col gap-6 xl:col-span-1">
            <!-- Reporter Info Panel -->
            <section
              class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/80 p-6 shadow-sm backdrop-blur-md"
            >
              <h3
                class="mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)]/30 pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]"
              >
                <span class="material-symbols-outlined text-[var(--color-primary)]">person</span>
                Reporter Information
              </h3>
              <div class="flex flex-col gap-4 text-[14px]">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-fixed)] text-[18px] font-bold text-[var(--color-on-primary-fixed)]"
                  >
                    {{ getInitials(incident()!.reporter.displayName) }}
                  </div>
                  <div>
                    <div class="font-semibold text-[var(--color-on-surface)]">
                      {{ incident()!.reporter.displayName }}
                    </div>
                    <div class="text-[11px] text-[var(--color-on-surface-variant)]">Reporter</div>
                  </div>
                </div>
                @if (incident()!.reporter.phoneNumber) {
                  <div class="flex items-center gap-3 text-[var(--color-on-surface)]">
                    <span class="material-symbols-outlined text-[20px] text-[var(--color-outline)]"
                      >phone</span
                    >
                    {{ incident()!.reporter.phoneNumber }}
                  </div>
                }
                @if (incident()!.reporter.email) {
                  <div class="flex items-center gap-3 text-[var(--color-on-surface)]">
                    <span class="material-symbols-outlined text-[20px] text-[var(--color-outline)]"
                      >mail</span
                    >
                    {{ incident()!.reporter.email }}
                  </div>
                }
              </div>
            </section>

            <!-- Reporter Images -->
            @if (incident()!.reporterImages.length > 0) {
              <section
                class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/80 p-6 shadow-sm backdrop-blur-md"
              >
                <h3
                  class="mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)]/30 pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]"
                >
                  <span class="material-symbols-outlined text-[var(--color-primary)]"
                    >photo_library</span
                  >
                  Reporter Photos
                </h3>
                <div class="grid grid-cols-2 gap-3">
                  @for (img of incident()!.reporterImages; track img.id) {
                    <div
                      class="group relative aspect-square overflow-hidden rounded-md border border-[var(--color-outline-variant)]"
                    >
                      <img
                        [src]="getImageUrl(img.fileUrl)"
                        alt="Reporter photo"
                        class="h-full w-full object-cover"
                      />
                      <div
                        class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <span
                          class="material-symbols-outlined cursor-pointer text-[var(--color-on-inverse-surface)]"
                          >zoom_in</span
                        >
                      </div>
                    </div>
                  }
                </div>
              </section>
            }

            <!-- Staff Evidence Upload -->
            <section
              class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/80 p-6 shadow-sm backdrop-blur-md"
            >
              <h3
                class="mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)]/30 pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]"
              >
                <span class="material-symbols-outlined text-[var(--color-primary)]"
                  >photo_camera</span
                >
                Evidence (Staff Upload)
              </h3>

              <!-- File Upload -->
              <div
                class="mb-4 cursor-pointer rounded-lg border-2 border-dashed border-[var(--color-outline-variant)] p-4 text-center transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)]"
                (click)="fileInput.click()"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
                [class.border-[var(--color-primary)]]="isDragging"
                [class.bg-[var(--color-surface-container-low)]]]="isDragging"
              >
                <input
                  #fileInput
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  (change)="onFileSelected($event)"
                />
                <span
                  class="material-symbols-outlined text-[32px] text-[var(--color-outline)] transition-colors"
                  >cloud_upload</span
                >
                <p class="mt-2 text-[12px] text-[var(--color-on-surface-variant)]">
                  Drag & drop repair photos here
                </p>
                <p class="text-[11px] text-[var(--color-outline)]">or click to browse</p>
              </div>

              <!-- Selected Files Preview -->
              @if (selectedFiles.length > 0) {
                <div class="mb-4 grid grid-cols-3 gap-2">
                  @for (file of selectedFiles; track $index) {
                    <div class="group relative aspect-square overflow-hidden rounded-md border border-[var(--color-outline-variant)]">
                      <img
                        [src]="file.preview"
                        alt="Preview"
                        class="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        (click)="removeFile($index); $event.stopPropagation()"
                      >
                        <span class="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  }
                </div>
              }

              <!-- Submit Button -->
              <button
                type="button"
                [disabled]="isSubmitting() || selectedFiles.length === 0"
                (click)="submitEvidence()"
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-[14px] font-medium text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                @if (isSubmitting()) {
                  <span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Submitting...
                } @else {
                  <span class="material-symbols-outlined text-[18px]">check</span>
                  Submit Evidence
                }
              </button>

              <!-- Success / Error Messages -->
              @if (submitMessage()) {
                <div
                  class="mt-3 rounded-lg p-3 text-[12px]"
                  [class]="submitSuccess() ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
                >
                  {{ submitMessage() }}
                </div>
              }

              <!-- Staff Images -->
              @if (incident()!.staffImages.length > 0) {
                <div class="mt-6 border-t border-[var(--color-outline-variant)]/30 pt-4">
                  <h4 class="mb-3 text-[14px] font-semibold text-[var(--color-on-surface)]">
                    Uploaded Evidence
                  </h4>
                  <div class="grid grid-cols-2 gap-3">
                    @for (img of incident()!.staffImages; track img.id) {
                      <div
                        class="group relative aspect-square overflow-hidden rounded-md border border-[var(--color-outline-variant)]"
                      >
                        <img
                          [src]="getImageUrl(img.fileUrl)"
                          alt="Evidence photo"
                          class="h-full w-full object-cover"
                        />
                        <div
                          class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <span
                            class="material-symbols-outlined cursor-pointer text-[var(--color-on-inverse-surface)]"
                            >zoom_in</span
                          >
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </section>
          </div>
        </div>
      </div>
    } @else {
      <div class="flex min-h-screen items-center justify-center">
        <p class="text-[var(--color-on-surface-variant)]">Incident not found.</p>
      </div>
    }
  `,
  styles: [
    `
      .material-symbols-outlined {
        font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 24;
      }

      :host ::ng-deep .leaflet-container {
        height: 400px !important;
        width: 100%;
        background: var(--color-surface-dim, #e5e5e5);
      }
    `,
  ],
})
export class StaffIncidentDetailComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>

  private map!: L.Map
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly staffService = inject(StaffService)

  isLoading = signal(true)
  incident = signal<StaffIncidentDetailResponse | null>(null)
  isSubmitting = signal(false)
  submitMessage = signal('')
  submitSuccess = signal(false)
  actionLoading = signal(false)
  selectedFiles: { file: File; preview: string }[] = []
  isDragging = false

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      const issueId = parseInt(id, 10)
      this.loadIncident(issueId)
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove()
    }
  }

  private loadIncident(issueId: number): void {
    this.isLoading.set(true)
    this.staffService.getIncidentDetail(issueId).subscribe({
      next: (data) => {
        this.incident.set(data)
        this.isLoading.set(false)
        setTimeout(() => this.initMap(), 100)
      },
      error: () => {
        this.isLoading.set(false)
      },
    })
  }

  getImageUrl(relativePath: string | undefined | null): string {
    if (!relativePath) return ''
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) return relativePath
    return `http://localhost:5080${relativePath}`
  }

  private initMap(): void {
    const inc = this.incident()
    if (!inc || !this.mapContainer?.nativeElement) return

    const container = this.mapContainer.nativeElement
    if (container.clientWidth === 0) {
      setTimeout(() => this.initMap(), 100)
      return
    }

    if (this.map) {
      this.map.remove()
    }

    this.map = L.map(container, {
      center: [inc.latitude, inc.longitude],
      zoom: 16,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map)

    const markerIcon = L.divIcon({
      html: `<div style="background-color: #6750A4; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); transform: rotate(-45deg);"></div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })

    L.marker([inc.latitude, inc.longitude], { icon: markerIcon })
      .addTo(this.map)
      .bindPopup(`<strong>${inc.title}</strong><br/>${inc.address || 'Location'}`)
  }

  centerOnLocation(): void {
    const inc = this.incident()
    if (this.map && inc) {
      this.map.setView([inc.latitude, inc.longitude], 16)
    }
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes} ${day}/${month}/${year}`
  }

  getInitials(name: string): string {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  getGoogleMapsUrl(): string {
    const inc = this.incident()
    if (!inc) return '#'
    return `https://www.google.com/maps?q=${inc.latitude},${inc.longitude}`
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = true
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = false
  }

  onDrop(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = false
    const files = event.dataTransfer?.files
    if (files) {
      this.processFiles(Array.from(files))
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files) {
      this.processFiles(Array.from(input.files))
      input.value = ''
    }
  }

  private processFiles(files: File[]): void {
    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    for (const file of imageFiles) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.selectedFiles.push({ file, preview: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1)
  }

  submitEvidence(): void {
    const inc = this.incident()
    if (!inc) return
    if (this.selectedFiles.length === 0) return

    this.isSubmitting.set(true)
    this.submitMessage.set('')

    const formData = new FormData()
    for (const { file } of this.selectedFiles) {
      formData.append('images', file)
    }

    this.staffService.uploadEvidence(inc.issueId, formData).subscribe({
      next: (updated) => {
        if (updated) {
          this.incident.set(updated)
          this.selectedFiles = []
          this.submitSuccess.set(true)
          this.submitMessage.set('Evidence submitted successfully!')
        }
        this.isSubmitting.set(false)
        setTimeout(() => this.submitMessage.set(''), 3000)
      },
      error: (err) => {
        this.isSubmitting.set(false)
        this.submitSuccess.set(false)
        this.submitMessage.set(err?.error?.message || 'Failed to submit evidence. Please try again.')
        setTimeout(() => this.submitMessage.set(''), 5000)
      },
    })
  }

  acceptAssignment(): void {
    const inc = this.incident()
    if (!inc) return
    this.actionLoading.set(true)
    this.staffService.acceptAssignment(inc.issueId).subscribe({
      next: (updated) => {
        if (updated) this.incident.set(updated)
        this.actionLoading.set(false)
      },
      error: () => this.actionLoading.set(false),
    })
  }

  rejectAssignment(): void {
    const inc = this.incident()
    if (!inc) return
    this.actionLoading.set(true)
    this.staffService.rejectAssignment(inc.issueId).subscribe({
      next: (updated) => {
        if (updated) this.incident.set(updated)
        this.actionLoading.set(false)
      },
      error: () => this.actionLoading.set(false),
    })
  }

  completeAssignment(): void {
    const inc = this.incident()
    if (!inc) return
    this.actionLoading.set(true)
    this.staffService.completeAssignment(inc.issueId).subscribe({
      next: (updated) => {
        if (updated) this.incident.set(updated)
        this.actionLoading.set(false)
      },
      error: () => this.actionLoading.set(false),
    })
  }
}
