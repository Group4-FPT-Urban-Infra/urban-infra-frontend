import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'

interface InternalNote {
  author: string
  content: string
  time: string
}

interface TimelineEvent {
  status: string
  description: string
  time: string
}

@Component({
  selector: 'app-staff-incident-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[var(--color-background)] p-4 md:p-8">
      <!-- Header -->
      <header class="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div class="mb-2 flex items-center gap-2 text-[12px] font-medium text-[var(--color-on-surface-variant)]">
            <a routerLink="/staff/incidents" class="hover:text-[var(--color-primary)]">Incidents</a>
            <span class="material-symbols-outlined text-[16px]">chevron_right</span>
            <span class="font-semibold text-[var(--color-on-surface)]">{{ incidentId() }}</span>
          </div>
          <h2 class="flex items-center gap-3 text-[28px] font-bold text-[var(--color-on-surface)]">
            Massive Pothole on Arterial Route
            <span class="inline-flex items-center gap-1 rounded-full bg-[var(--color-error-container)] px-3 py-1 text-[11px] font-medium text-[var(--color-on-error-container)]">
              <span class="material-symbols-outlined text-[14px]">priority_high</span>
              High Priority
            </span>
          </h2>
        </div>
        <div class="flex w-full items-center gap-3 md:w-auto">
          <div class="relative w-full md:w-48">
            <select class="w-full appearance-none rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-4 py-2 text-[14px] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]">
              <option value="assigned">Assigned</option>
              <option value="in_progress" selected>In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]">expand_more</span>
          </div>
          <button class="whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-6 py-2 text-[12px] font-medium text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-primary)]/90">
            Save Changes
          </button>
        </div>
      </header>

      <!-- Bento Grid Layout -->
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <!-- Main Content Column -->
        <div class="flex flex-col gap-6 xl:col-span-2">
          <!-- Details Card -->
          <section class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/80 p-6 shadow-sm backdrop-blur-md">
            <h3 class="mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)]/30 pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-[var(--color-primary)]">info</span>
              Incident Details
            </h3>
            <div class="grid grid-cols-1 gap-4 text-[14px] md:grid-cols-2">
              <div>
                <span class="mb-1 block text-[var(--color-on-surface-variant)]">Category</span>
                <span class="font-semibold text-[var(--color-on-surface)]">Road Maintenance</span>
              </div>
              <div>
                <span class="mb-1 block text-[var(--color-on-surface-variant)]">Date Reported</span>
                <span class="font-semibold text-[var(--color-on-surface)]">Oct 24, 2024 at 08:14 AM</span>
              </div>
              <div class="md:col-span-2">
                <span class="mb-1 block text-[var(--color-on-surface-variant)]">Location</span>
                <span class="flex items-center gap-2 font-semibold text-[var(--color-on-surface)]">
                  <span class="material-symbols-outlined text-[16px] text-[var(--color-outline)]">location_on</span>
                  4500 Block, Westheimer Rd, Near Post Oak Blvd
                </span>
              </div>
              <div class="md:col-span-2">
                <span class="mb-1 block text-[var(--color-on-surface-variant)]">Description provided by Citizen</span>
                <p class="mt-2 rounded-lg bg-[var(--color-surface-container-low)] p-4 text-[var(--color-on-surface)]">
                  "There is a crater-sized pothole in the right lane heading eastbound. Multiple cars hitting it hard. Rebar is visible at the bottom."
                </p>
              </div>
            </div>
          </section>

          <!-- Map Context -->
          <section class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/80 p-6 shadow-sm backdrop-blur-md">
            <h3 class="mb-4 flex items-center gap-2 text-[18px] font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-[var(--color-primary)]">map</span>
              Geospatial Context & Nearby Similar Incidents
            </h3>
            <div class="relative h-64 w-full overflow-hidden rounded-lg border border-[var(--color-outline-variant)]">
              <div class="absolute inset-0 bg-cover bg-center"
                style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfgxOJwaPo39kC7yEsqgVvMqVCAEhc6_cYNU5uHVbMTDwqu2wmBVeGZFiEQuV5ENOVcQlL8XRdamGaUKr0MV5o8_mdXmrO21HkrhFh16HfD3LH9weWDFvbLJXaTtM1j1aYFLs5E3Sd8oV2o1Z_cgJMPaXa76RI8w7mBT4I_AposjB6IztteLw4k5ZGJ19MiFY6cmbv30yFMpJpp_6u7yooy4hfUQioM7MaC0YKQtqEBWzCK56dPB4');"
              ></div>
              <div class="absolute bottom-2 right-2 flex flex-col gap-1">
                <button class="rounded bg-[var(--color-surface)] p-1 text-[var(--color-on-surface)] shadow-sm transition-colors hover:bg-[var(--color-surface-variant)]">
                  <span class="material-symbols-outlined text-[18px]">add</span>
                </button>
                <button class="rounded bg-[var(--color-surface)] p-1 text-[var(--color-on-surface)] shadow-sm transition-colors hover:bg-[var(--color-surface-variant)]">
                  <span class="material-symbols-outlined text-[18px]">remove</span>
                </button>
              </div>
            </div>
            <p class="mt-3 flex items-center gap-2 text-[12px] text-[var(--color-on-surface-variant)]">
              <span class="material-symbols-outlined text-[14px] text-[var(--color-error)]">warning</span>
              2 other active 'Road Maintenance' incidents within 1/2 mile.
            </p>
          </section>

          <!-- Internal Notes (Staff Only) -->
          <section class="relative overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/80 p-6 shadow-sm backdrop-blur-md">
            <div class="absolute top-0 right-0 flex items-center gap-1 rounded-bl-lg bg-[var(--color-tertiary-container)] px-3 py-1 text-[11px] font-medium text-[var(--color-on-tertiary-container)] shadow-sm">
              <span class="material-symbols-outlined text-[14px]">visibility_off</span>
              Staff Only
            </div>
            <h3 class="mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)]/30 pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-[var(--color-tertiary)]">forum</span>
              Internal Notes History
            </h3>
            <div class="mb-6 flex max-h-64 flex-col gap-4 overflow-y-auto pr-2">
              @for (note of notes(); track note.author) {
                <div class="rounded-lg border-l-4 border-[var(--color-tertiary)] bg-[var(--color-surface-container-low)] p-4">
                  <div class="mb-1 flex items-start justify-between">
                    <span class="text-[12px] font-semibold text-[var(--color-on-surface)]">{{ note.author }}</span>
                    <span class="text-[11px] text-[var(--color-on-surface-variant)]">{{ note.time }}</span>
                  </div>
                  <p class="text-[14px] text-[var(--color-on-surface)]">{{ note.content }}</p>
                </div>
              }
            </div>
            <div class="flex gap-3">
              <input
                type="text"
                placeholder="Type an internal note..."
                class="flex-1 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-4 py-2 text-[14px] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              />
              <button class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-variant)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-container-high)]">
                <span class="material-symbols-outlined text-[18px]">send</span>
                Post
              </button>
            </div>
          </section>
        </div>

        <!-- Side Column -->
        <div class="flex flex-col gap-6 xl:col-span-1">
          <!-- Reporter Info Panel -->
          <section class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/80 p-6 shadow-sm backdrop-blur-md">
            <h3 class="mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)]/30 pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-[var(--color-primary)]">person</span>
              Reporter Information
            </h3>
            <div class="flex flex-col gap-4 text-[14px]">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-fixed)] text-[18px] font-bold text-[var(--color-on-primary-fixed)]">JD</div>
                <div>
                  <div class="font-semibold text-[var(--color-on-surface)]">Jane Doe</div>
                  <div class="text-[11px] text-[var(--color-on-surface-variant)]">Verified Resident</div>
                </div>
              </div>
              <div class="flex items-center gap-3 text-[var(--color-on-surface)]">
                <span class="material-symbols-outlined text-[20px] text-[var(--color-outline)]">phone</span>
                (555) 019-2834
              </div>
              <div class="flex items-center gap-3 text-[var(--color-on-surface)]">
                <span class="material-symbols-outlined text-[20px] text-[var(--color-outline)]">mail</span>
                jane.doe.resident&#64;email.com
              </div>
              <button class="w-full rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-surface)] py-2 text-[12px] font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-container)]/20">
                Message Citizen
              </button>
            </div>
          </section>

          <!-- Evidence Upload & Gallery -->
          <section class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/80 p-6 shadow-sm backdrop-blur-md">
            <h3 class="mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)]/30 pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-[var(--color-primary)]">photo_camera</span>
              Evidence & Media
            </h3>
            <div class="mb-4 cursor-pointer rounded-lg border-2 border-dashed border-[var(--color-outline-variant)] p-4 text-center transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)]">
              <span class="text-[32px] text-[var(--color-outline)] transition-colors group-hover:text-[var(--color-primary)] material-symbols-outlined">cloud_upload</span>
              <p class="mt-2 text-[12px] text-[var(--color-on-surface-variant)]">Drag & drop repair photos here</p>
              <p class="text-[11px] text-[var(--color-outline)]">or click to browse</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="group relative aspect-square overflow-hidden rounded-md border border-[var(--color-outline-variant)]">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW91o5mNscd9vDXjk0Wtz3l_TaATa95BEEoxYkyXED54Py3jgWSsLn8_GqgPjRVQRvKDqWCDjkKb0gnIkDw7NPPX5tx_Ck9ATh7XOZYxc421RGgNH4US-KhjhvRxOfTphdPAAocx1qOi0dwxaimdATpAHTM3QxMfyULhtvM_yT2dVu1UzkLEqDBy5l394UvA27Twqz6esIv2SSZ3E-o8OajD_98bB8zFsvfgQMLaMSf1NVR1Gnhvw" alt="Before repair" class="h-full w-full object-cover" />
                <div class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <span class="material-symbols-outlined cursor-pointer text-[var(--color-on-inverse-surface)]">zoom_in</span>
                </div>
              </div>
              <div class="group relative aspect-square overflow-hidden rounded-md border border-[var(--color-outline-variant)]">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDHM8vL0OOrBLByI1Hg1v1iZnybv8HD3tIqTTWIPh_FOe44Q8jnty6QsDdoxkOhaAttx39YEMc7CKKL2aheauCfsJIg3LuOflrO_Paf8_i0AqA-4AtizrGCyiGw_fP5vg1H3iwNPHNCz-QyewKqJ60bEOAD441KQWN1lyOQt-K9Avuixhs1EtA39pFVmYQwQ8pcYaV6eGjyEUnv8wPzRM-SWY8yPFCJX6s0JmPmSh4Alc_8iWzSis" alt="After repair" class="h-full w-full object-cover" />
                <div class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <span class="material-symbols-outlined cursor-pointer text-[var(--color-on-inverse-surface)]">zoom_in</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Status Timeline -->
          <section class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/80 p-6 shadow-sm backdrop-blur-md">
            <h3 class="mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)]/30 pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-[var(--color-primary)]">history</span>
              Action Log
            </h3>
            <div class="relative ml-4 flex flex-col gap-4 border-l-2 border-[var(--color-outline-variant)] py-4">
              @for (event of timeline(); track event.status) {
                <div class="relative pl-6">
                  <div class="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-[var(--color-primary)] ring-4 ring-[var(--color-surface)]"></div>
                  <p class="text-[12px] text-[var(--color-on-surface)]">
                    Status changed to <span class="font-semibold text-[var(--color-primary)]">{{ event.status }}</span>
                  </p>
                  <p class="text-[11px] text-[var(--color-on-surface-variant)]">{{ event.time }}</p>
                </div>
              }
            </div>
          </section>
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
export class StaffIncidentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)

  incidentId = signal('')

  notes = signal<InternalNote[]>([
    {
      author: 'Dispatcher Mike T.',
      content: 'Assigned to Crew B. Traffic control might be needed based on location.',
      time: 'Oct 24, 08:30 AM',
    },
    {
      author: 'Crew Lead Sarah K.',
      content: 'Arrived on site. It\'s worse than described. Need additional hot mix. Requested partial lane closure.',
      time: 'Oct 24, 10:15 AM',
    },
  ])

  timeline = signal<TimelineEvent[]>([
    { status: 'In Progress', description: 'by Crew Lead Sarah K.', time: 'Oct 24, 10:00 AM' },
    { status: 'Assigned', description: 'by Dispatcher Mike T.', time: 'Oct 24, 08:30 AM' },
    { status: 'Created', description: 'Incident created via Public Portal', time: 'Oct 24, 08:14 AM' },
  ])

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.incidentId.set(`INC-${id}`)
    }
  }
}
