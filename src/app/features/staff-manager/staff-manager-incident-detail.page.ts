import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-staff-manager-incident-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[var(--color-surface)] px-4 py-6 md:px-8">
      <!-- Header -->
      <header
        class="sticky top-0 z-50 mb-6 flex w-full items-center justify-between bg-[var(--color-surface)]/70 px-4 py-2 shadow-sm backdrop-blur-md md:px-6"
      >
        <div class="flex items-center gap-3">
          <button
            class="flex items-center justify-center rounded-full p-2 text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50"
            (click)="goBack()"
          >
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <div class="text-[20px] font-semibold text-[var(--color-primary)]" style="line-height: 28px;">
            CivicShield
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button class="flex items-center justify-center rounded-full p-2 text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50">
            <span class="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </header>

      <!-- Breadcrumbs -->
      <nav class="mb-6 flex items-center text-[12px] font-medium text-[var(--color-on-surface-variant)]">
        <a class="hover:text-[var(--color-primary)] transition-colors" routerLink="/staff-manager/incidents">Incidents</a>
        <span class="material-symbols-outlined mx-2 text-[16px]">chevron_right</span>
        <span class="font-medium text-[var(--color-primary)]">{{ incidentId() }}</span>
      </nav>

      <!-- Incident Header -->
      <div class="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm md:flex-row md:items-start">
        <div class="flex-1">
          <div class="mb-3 flex flex-wrap gap-2">
            <span class="rounded-full bg-[#FEE2E2] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#991B1B]">High Priority</span>
            <span class="rounded-full bg-[var(--color-surface-variant)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">In Progress</span>
          </div>
          <h1 class="mb-3 text-[36px] font-bold text-[var(--color-on-surface)]" style="letter-spacing: -0.02em; line-height: 44px;">
            Water Main Rupture - 5th Ave
          </h1>
          <p class="text-[14px] text-[var(--color-on-surface-variant)]">
            Reported by John Doe on Oct 24, 2024 at 14:32
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button class="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-primary)]/90">
            <span class="material-symbols-outlined text-[18px]">check_circle</span>
            Resolve
          </button>
          <button class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-variant)]/50">
            <span class="material-symbols-outlined text-[18px]">swap_horiz</span>
            Re-route
          </button>
        </div>
      </div>

      <!-- Bento Grid Layout -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <!-- Left Column: Details & Media -->
        <div class="flex flex-col gap-6 lg:col-span-8">
          <!-- Description -->
          <div class="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
            <h2 class="mb-4 flex items-center gap-2 text-[18px] font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-[var(--color-primary)]">description</span>
              Description
            </h2>
            <p class="leading-relaxed text-[14px] text-[var(--color-on-surface-variant)]">
              Significant water flow observed coming from beneath the pavement near the intersection of 5th Ave and Main St. The water is pooling rapidly and beginning to impact pedestrian walkways and the right-hand traffic lane. Pavement shows signs of buckling. Immediate assessment required to prevent sinkhole formation.
            </p>
          </div>

          <!-- Media Gallery -->
          <div class="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
            <h2 class="mb-4 flex items-center gap-2 text-[18px] font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-[var(--color-primary)]">photo_library</span>
              Citizen Uploads
            </h2>
            <div class="grid grid-cols-2 gap-4">
              <div class="group relative aspect-video overflow-hidden rounded-lg">
                <img
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8FzgkrZZ7FQxgdDxixtELd89EES_ga7ivVpYZFAk8PpcNUyExE0DfFE1fXmlb8SwDVbVTdRhEnlg4NiMTAFFCMXv0Vq8Mv24C3ahhKKvD9yykmbHy0cnDZW_Y-Gaoad6ttQOtf5JLLV8qm3EcdLyVGuND_bnz2JaIzpoSYNvt85MZ-QnEtZJPbDbvMD3_53IufvnlnDTC44xSwHd5cDomOCLScnbiWK2EjCNDNKhXDi9Uabw0uIU"
                  alt="Water main break"
                />
                <div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <span class="material-symbols-outlined text-3xl text-white">zoom_in</span>
                </div>
              </div>
              <div class="group relative aspect-video overflow-hidden rounded-lg">
                <img
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB85v8Agnu_Rs_kqDcRgFNv3XeuaZIsrBhloe29-6CW8cPegV4ASIq0-XwL7xlGlpdxCZ2CdRPAzIM3zK1AP4Hp9L-NgBBglzcJpuchnm8-cX-SKfTZO60tBdxgaa2IOZspMbqMwWpZ65-zKjMjGIS_A36Pe5Z7uaXMceTDiCGkrZhQfi7E5eN0KupFYENQuxrS9hjNnPq6OaSclNYGY_bUjegICbfdesS-r1PlkZvh0S_ZWXiKTeI"
                  alt="Road damage"
                />
                <div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <span class="material-symbols-outlined text-3xl text-white">zoom_in</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Location Map -->
          <div class="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
            <h2 class="mb-4 flex items-center gap-2 text-[18px] font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-[var(--color-primary)]">location_on</span>
              Location
            </h2>
            <div class="relative aspect-[21/9] overflow-hidden rounded-lg bg-[var(--color-surface-container-high)]">
              <img
                class="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPyILX6PjSJNlVpq7Dv73HGQjwlDKe0poOwqROvrZDFbiCoj22qk-wLZOfC8HArfY9Xnl_8HP0Z1NkQ0YJgLsnBK_OiCe7vmbrjMdZnoj8_AmcvQGcbm9wpxs_lpeLrxQnIakenzqFkdYaFa_PsJ8IbvCZs-hqUhQZ_fSTnLNFxT6tlxwCZRqwmPTcZIIv0maAU0-tG2GhiigDoe4QRvSA8wDWRXB5le5HPm0QAH-p2XWFvgijpJ8"
                alt="Map location"
              />
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div class="relative flex items-center justify-center">
                  <div class="absolute h-8 w-8 animate-ping rounded-full bg-[var(--color-error)]/20"></div>
                  <span class="material-symbols-outlined relative z-10 text-3xl text-[var(--color-error)]">location_on</span>
                </div>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-between text-[14px] text-[var(--color-on-surface-variant)]">
              <span>40.7128° N, 74.0060° W</span>
              <button class="font-medium text-[var(--color-primary)] hover:underline">Open in GIS</button>
            </div>
          </div>
        </div>

        <!-- Right Column: Meta & Actions -->
        <div class="flex flex-col gap-6 lg:col-span-4">
          <!-- Assignment -->
          <div class="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
            <h2 class="mb-4 flex items-center gap-2 text-[18px] font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-[var(--color-primary)]">assignment_ind</span>
              Assignment
            </h2>
            <div class="mb-6 flex items-center gap-4 rounded-lg bg-[var(--color-surface)] p-4">
              <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-container)]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuX1-b9B70z9uHYMzWvUxr7zOxnzXsA1fPjzBV3ppLkp7b-frNxsanS3u9jDLyjfvYOBKAfhBz_jDe_Nau5SVLW1l1BvzNJTWf6f06aI2C2tOPwLpSexLaj2TR0Z6UDad5uMXm2YChPjJMrScL5FdG0fpAMdI8K_Lp2XoYU76cpH7_Y4pCkYC6v3rB87Odyx-kZSuLVV6cYx98byOsGXIdyaSs4-AQfu8aZBeSs3ZczHOIbxWP8c0"
                  alt="Sarah Jenkins"
                  class="h-full w-full object-cover"
                />
              </div>
              <div>
                <div class="text-[12px] font-bold text-[var(--color-on-surface)]">Sarah Jenkins</div>
                <div class="text-[14px] text-[var(--color-on-surface-variant)]">Public Works Field Team Alpha</div>
              </div>
            </div>
            <button class="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-outline-variant)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-variant)]/50">
              <span class="material-symbols-outlined text-[18px]">person_add</span>
              Re-assign Team
            </button>
          </div>

          <!-- Activity Log -->
          <div class="flex flex-1 flex-col rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
            <h2 class="mb-6 text-[18px] font-semibold text-[var(--color-on-surface)]">Activity Log</h2>
            <div class="relative mt-6 ml-3 space-y-6 border-l-2 border-[var(--color-surface-container-high)]">
              <!-- Log Item 1 -->
              <div class="relative pl-6">
                <div class="absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-secondary)] ring-4 ring-[var(--color-surface-container-lowest)]"></div>
                <div class="mb-1 text-[12px] font-semibold text-[var(--color-on-surface)]">Status changed to In Progress</div>
                <div class="mb-1 text-[14px] text-[var(--color-on-surface-variant)]">Team dispatched to location. ETA 15 mins.</div>
                <div class="text-[11px] text-[var(--color-outline)]">Today, 14:45 - System</div>
              </div>
              <!-- Log Item 2 -->
              <div class="relative pl-6">
                <div class="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-[var(--color-surface-variant)] ring-4 ring-[var(--color-surface-container-lowest)]"></div>
                <div class="mb-1 text-[12px] font-semibold text-[var(--color-on-surface)]">Assigned to Sarah Jenkins</div>
                <div class="text-[11px] text-[var(--color-outline)]">Today, 14:35 - Dispatcher Mike</div>
              </div>
              <!-- Log Item 3 -->
              <div class="relative pl-6">
                <div class="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-[var(--color-surface-variant)] ring-4 ring-[var(--color-surface-container-lowest)]"></div>
                <div class="mb-1 text-[12px] font-semibold text-[var(--color-on-surface)]">Incident Created</div>
                <div class="mb-1 text-[14px] text-[var(--color-on-surface-variant)]">Source: Citizen App (iOS)</div>
                <div class="text-[11px] text-[var(--color-outline)]">Today, 14:32 - System</div>
              </div>
            </div>

            <!-- Add Comment -->
            <div class="mt-8 border-t border-[var(--color-outline-variant)] pt-6">
              <div class="relative">
                <textarea
                  class="w-full resize-none rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-3 pt-6 text-[14px] text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                  placeholder="Add an internal note..."
                  rows="2"
                  [(ngModel)]="newComment"
                ></textarea>
                <label class="absolute left-3 top-2 text-[12px] font-medium text-[var(--color-primary)]">Comment</label>
                <div class="absolute bottom-2 right-2">
                  <button class="flex items-center gap-1 rounded-md bg-[var(--color-surface-variant)] px-3 py-1.5 text-[11px] font-medium text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-container-high)]">
                    <span class="material-symbols-outlined text-[16px]">send</span>
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
    `,
  ],
})
export class StaffManagerIncidentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)

  incidentId = signal('')
  newComment = ''

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.incidentId.set(`INC-${id}`)
    }
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      void this.router.navigate(['/staff-manager/incidents'])
    }
  }
}
