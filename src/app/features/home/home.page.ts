import { Component, inject, signal } from '@angular/core'
import { Router } from '@angular/router'

interface Incident {
  id: number
  title: string
  description: string
  status: 'Open' | 'Investigating' | 'Resolved'
  upvotes: number
  timeAgo: string
  icon?: string
  image?: string
}

@Component({
  selector: 'app-home-page',
  imports: [],
  styles: [
    `
      /* Thin custom scrollbar for the feed panel */
      .feed-scroll::-webkit-scrollbar { width: 4px; }
      .feed-scroll::-webkit-scrollbar-track { background: transparent; }
      .feed-scroll::-webkit-scrollbar-thumb {
        background-color: var(--color-outline-variant);
        border-radius: 4px;
      }

      /* Filled icon utility */
      .icon-filled { font-variation-settings: 'FILL' 1; }
    `,
  ],
  template: `
    <main class="flex flex-grow flex-col">

      <!-- ── Hero Section ───────────────────────────────────────────────── -->
      <section
        class="relative flex flex-col items-center justify-center overflow-hidden px-4 py-16 text-center md:py-20"
      >
        <!-- Background city image (low-opacity overlay) -->
        <div
          class="pointer-events-none absolute inset-0 z-0 opacity-20"
          style="
            background-image: url('/civic_hero_city.jpg');
            background-size: cover;
            background-position: center;
          "
          aria-hidden="true"
        ></div>

        <div class="relative z-10 flex max-w-3xl flex-col items-center gap-6">
          <h1
            class="text-[36px] font-bold leading-tight tracking-tight text-[var(--color-on-surface)]"
            style="letter-spacing: -0.02em"
          >
            Build a Better City Together
          </h1>
          <p class="max-w-xl text-base leading-6 text-[var(--color-on-surface-variant)]">
            Report issues, track progress, and collaborate with your local government to maintain a
            safe and beautiful urban environment.
          </p>
          <div class="mt-2 flex flex-col gap-4 sm:flex-row">
            <button
              id="reportIncidentBtn"
              (click)="navigateToCreateIncident()"
              class="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-4 text-sm font-semibold text-[var(--color-on-primary)] shadow-sm transition-shadow hover:shadow-md"
            >
              <span class="material-symbols-outlined icon-filled text-[20px]" aria-hidden="true"
                >add_circle</span
              >
              Report Incident
            </button>
            <button
              id="viewMapBtn"
              class="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-6 py-4 text-sm font-semibold text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]"
            >
              <span class="material-symbols-outlined text-[20px]" aria-hidden="true">map</span>
              View Incident Map
            </button>
          </div>
        </div>
      </section>

      <!-- ── Stats Section ──────────────────────────────────────────────── -->
      <section class="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">

          <!-- Stat: Active Incidents -->
          <div
            class="flex items-start gap-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-error-container)] text-[var(--color-on-error-container)]"
            >
              <span class="material-symbols-outlined" aria-hidden="true">report_problem</span>
            </div>
            <div>
              <h3 class="text-2xl font-semibold leading-8 text-[var(--color-on-surface)]">
                2,415
              </h3>
              <p class="text-sm text-[var(--color-on-surface-variant)]">Active Incidents</p>
            </div>
          </div>

          <!-- Stat: Resolved This Week -->
          <div
            class="flex items-start gap-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            >
              <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
            </div>
            <div>
              <h3 class="text-2xl font-semibold leading-8 text-[var(--color-on-surface)]">843</h3>
              <p class="text-sm text-[var(--color-on-surface-variant)]">Resolved This Week</p>
            </div>
          </div>

          <!-- Stat: Citizen Participants -->
          <div
            class="flex items-start gap-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-fixed)] text-[var(--color-on-primary-fixed)]"
            >
              <span class="material-symbols-outlined" aria-hidden="true">group</span>
            </div>
            <div>
              <h3 class="text-2xl font-semibold leading-8 text-[var(--color-on-surface)]">
                12.5k
              </h3>
              <p class="text-sm text-[var(--color-on-surface-variant)]">Citizen Participants</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Overview Bento Grid ────────────────────────────────────────── -->
      <section class="mx-auto w-full max-w-7xl px-4 pb-10 pt-2 md:px-8">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-[28px] font-semibold leading-9 text-[var(--color-on-surface)]"
            style="letter-spacing: -0.01em"
          >
            Overview
          </h2>
        </div>

        <div class="grid h-auto grid-cols-1 gap-6 lg:h-[600px] lg:grid-cols-12">

          <!-- Map Preview (8 cols) -->
          <div
            class="flex flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] lg:col-span-8"
          >
            <!-- Card header -->
            <div
              class="flex items-center justify-between border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3"
            >
              <h3 class="flex items-center gap-2 text-[18px] font-semibold text-[var(--color-on-surface)]">
                <span
                  class="material-symbols-outlined text-[var(--color-primary)]"
                  aria-hidden="true"
                  >public</span
                >
                Live City Map
              </h3>
              <button
                class="text-sm font-medium text-[var(--color-primary)] hover:underline"
                type="button"
              >
                Full Screen
              </button>
            </div>

            <!-- Map image -->
            <div class="relative flex-grow bg-[var(--color-surface-dim)]">
              <img
                src="/civic_map_preview.jpg"
                alt="Live city incident map showing active reports"
                class="absolute inset-0 h-full w-full object-cover"
              />

              <!-- Legend overlay -->
              <div
                class="absolute left-4 top-4 flex flex-col gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 p-3 shadow-sm backdrop-blur-md"
              >
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full bg-[var(--color-error)]"></div>
                  <span class="text-[11px] font-medium">High Priority (12)</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full bg-[var(--color-tertiary-container)]"></div>
                  <span class="text-[11px] font-medium">In Progress (45)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Latest Incidents Feed (4 cols) -->
          <div
            class="flex flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] lg:col-span-4"
          >
            <!-- Panel header -->
            <div
              class="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3"
            >
              <h3 class="text-[18px] font-semibold text-[var(--color-on-surface)]">
                Latest Incidents
              </h3>
            </div>

            <!-- Scrollable feed -->
            <div class="feed-scroll flex flex-grow flex-col gap-2 overflow-y-auto p-2">
              @for (incident of incidents; track incident.id) {
                <div
                  class="flex cursor-pointer gap-4 rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface)] p-4 transition-colors hover:bg-[var(--color-surface-container)]"
                >
                  <!-- Thumbnail -->
                  <div
                    class="h-16 w-16 shrink-0 overflow-hidden rounded bg-[var(--color-surface-dim)]"
                  >
                    @if (incident.image) {
                      <img
                        [src]="incident.image"
                        [alt]="incident.title"
                        class="h-full w-full object-cover"
                      />
                    } @else {
                      <div
                        class="flex h-full w-full items-center justify-center text-[var(--color-outline)]"
                      >
                        <span class="material-symbols-outlined" aria-hidden="true">{{
                          incident.icon
                        }}</span>
                      </div>
                    }
                  </div>

                  <!-- Info -->
                  <div class="flex w-full flex-col justify-between">
                    <div class="flex items-start justify-between gap-1">
                      <h4
                        class="line-clamp-1 text-sm font-semibold text-[var(--color-on-surface)]"
                      >
                        {{ incident.title }}
                      </h4>
                      <!-- Status badge -->
                      <span
                        class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        [class]="getStatusClass(incident.status)"
                      >
                        {{ incident.status }}
                      </span>
                    </div>
                    <p class="line-clamp-1 text-xs text-[var(--color-on-surface-variant)]">
                      {{ incident.description }}
                    </p>
                    <div
                      class="mt-1 flex items-center gap-3 text-[var(--color-outline)]"
                    >
                      <span class="material-symbols-outlined text-[16px]" aria-hidden="true"
                        >thumb_up</span
                      >
                      <span class="text-[11px]">{{ incident.upvotes }}</span>
                      <span
                        class="material-symbols-outlined ml-2 text-[16px]"
                        aria-hidden="true"
                        >schedule</span
                      >
                      <span class="text-[11px]">{{ incident.timeAgo }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- View all footer -->
            <div
              class="border-t border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-2"
            >
              <button
                id="viewAllIncidentsBtn"
                class="w-full rounded py-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-container)]/10"
                type="button"
              >
                View All Incidents
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class HomePage {
  private readonly router = inject(Router)
  protected readonly incidents: Incident[] = [
    {
      id: 1,
      title: 'Pothole on 5th Ave',
      description: 'Large pothole blocking right lane.',
      status: 'Open',
      upvotes: 24,
      timeAgo: '2h ago',
      image: '/civic_pothole.jpg',
    },
    {
      id: 2,
      title: 'Broken Streetlight',
      description: 'Corner of Main and Elm is dark.',
      status: 'Investigating',
      upvotes: 12,
      timeAgo: '5h ago',
      icon: 'lightbulb',
    },
    {
      id: 3,
      title: 'Water Main Leak',
      description: 'Water pooling near park entrance.',
      status: 'Resolved',
      upvotes: 89,
      timeAgo: '1d ago',
      icon: 'water_drop',
    },
    {
      id: 4,
      title: 'Graffiti on Bridge',
      description: 'Large graffiti on the underside of bridge.',
      status: 'Open',
      upvotes: 7,
      timeAgo: '3h ago',
      icon: 'format_paint',
    },
    {
      id: 5,
      title: 'Fallen Tree on Road',
      description: 'Tree blocking southbound lane on Oak Street.',
      status: 'Investigating',
      upvotes: 31,
      timeAgo: '45m ago',
      icon: 'park',
    },
  ]

  protected getStatusClass(status: Incident['status']): string {
    switch (status) {
      case 'Open':
        return 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
      case 'Investigating':
        return 'bg-[var(--color-tertiary-fixed)] text-[var(--color-on-tertiary-fixed)]'
      case 'Resolved':
        return 'bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]'
    }
  }

  navigateToCreateIncident(): void {
    void this.router.navigate(['/incident-reporting'])
  }
}
