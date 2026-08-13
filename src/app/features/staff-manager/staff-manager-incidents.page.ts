import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'

interface IncidentRow {
  id: string
  type: string
  typeIcon: string
  location: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  slaRemaining: string
  slaPercent: number
  assignedTo: string
  assignedAvatar?: string
  reportedAt: string
}

@Component({
  selector: 'app-staff-manager-incidents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[var(--color-background)] p-4 md:p-8">
      <!-- Page Header -->
      <div class="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div class="mb-2 flex items-center gap-2 text-[12px] text-[var(--color-on-surface-variant)]">
            <span>Reports</span>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <span class="font-bold text-[var(--color-primary)]">Incident Management</span>
          </div>
          <h2 class="text-[36px] font-bold text-[var(--color-on-surface)]" style="letter-spacing: -0.02em; line-height: 44px;">
            Active Incidents
          </h2>
          <p class="mt-1 max-w-2xl text-[14px] text-[var(--color-on-surface-variant)]">
            Review, filter, and reassign current departmental reports. Prioritize tasks nearing SLA breaches.
          </p>
        </div>
        <div class="flex gap-3">
          <button class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)]/50 bg-white px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] shadow-sm transition-all hover:bg-[var(--color-surface-container)]">
            <span class="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          <button class="flex items-center gap-2 rounded-lg bg-[var(--color-primary-container)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary-container)] shadow-sm transition-all hover:opacity-90">
            <span class="material-symbols-outlined text-[18px]">add_task</span>
            Assign Batch
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="mb-6 flex flex-col items-center gap-3 rounded-xl border border-[var(--color-outline-variant)]/30 bg-white p-4 shadow-sm lg:flex-row">
        <!-- Search -->
        <div class="group relative w-full lg:w-72">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)] transition-colors group-focus-within:text-[var(--color-primary)]">search</span>
          <input
            type="text"
            placeholder="Search ID, Location, Keyword..."
            class="w-full rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-10 pr-4 text-[14px] shadow-sm transition-all focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          />
        </div>

        <div class="hidden h-8 w-px bg-[var(--color-outline-variant)]/30 lg:block"></div>

        <!-- Filters -->
        <div class="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <div class="relative">
            <select class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-w-[130px]">
              <option value="">Status: All</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>

          <div class="relative">
            <select class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-w-[130px]">
              <option value="">Priority: All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>

          <div class="relative">
            <select class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-w-[150px]">
              <option value="">Assigned: Any</option>
              <option value="unassigned">Unassigned</option>
              <option value="team_a">Team Alpha</option>
              <option value="team_b">Team Beta</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>

          <div class="relative">
            <select class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-w-[120px]">
              <option value="">Ward: All</option>
              <option value="w1">Ward 1</option>
              <option value="w2">Ward 2</option>
              <option value="w3">Ward 3</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>
        </div>

        <div class="flex items-center gap-2 lg:ml-auto">
          <button class="rounded-lg p-2 text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)] hover:text-[var(--color-primary)]" title="Clear Filters">
            <span class="material-symbols-outlined text-[20px]">filter_alt_off</span>
          </button>
          <div class="mx-1 h-6 w-px bg-[var(--color-outline-variant)]/50"></div>
          <span class="rounded-md bg-[var(--color-surface-container)] px-2 py-1 text-[11px] font-bold text-[var(--color-on-surface)]">24 Active</span>
        </div>
      </div>

      <!-- Data Table -->
      <div class="overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/30 bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead class="sticky top-0 z-10 border-b border-[var(--color-outline-variant)]/40 bg-white/90 text-[11px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] shadow-sm backdrop-blur-md">
              <tr>
                <th class="w-12 border-r border-[var(--color-outline-variant)]/20 p-4 text-center">
                  <input type="checkbox" class="h-4 w-4 cursor-pointer rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                </th>
                <th class="cursor-pointer p-4 transition-colors hover:bg-[var(--color-surface-container-low)]">
                  <div class="flex items-center gap-1">
                    ID / Location
                    <span class="material-symbols-outlined text-[14px] text-[var(--color-outline)]">arrow_drop_down</span>
                  </div>
                </th>
                <th class="hidden cursor-pointer p-4 transition-colors hover:bg-[var(--color-surface-container-low)] sm:table-cell">
                  Type
                </th>
                <th class="cursor-pointer p-4 transition-colors hover:bg-[var(--color-surface-container-low)]">
                  <div class="flex items-center gap-1">
                    Priority
                  </div>
                </th>
                <th class="hidden p-4 md:table-cell">
                  SLA Status
                </th>
                <th class="hidden p-4 lg:table-cell">
                  Assigned To
                </th>
                <th class="hidden cursor-pointer p-4 transition-colors hover:bg-[var(--color-surface-container-low)] xl:table-cell">
                  <div class="flex items-center gap-1">
                    Reported Date
                    <span class="material-symbols-outlined text-[14px] text-[var(--color-outline)]">arrow_upward</span>
                  </div>
                </th>
                <th class="p-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-outline-variant)]/20 bg-white">
              @for (incident of incidents(); track incident.id) {
                <tr class="cursor-default transition-colors hover:bg-[#F1F5F9]" (click)="viewDetail(incident.id)">
                  <td class="border-r border-[var(--color-outline-variant)]/10 p-4 text-center" (click)="$event.stopPropagation()">
                    <input type="checkbox" class="h-4 w-4 cursor-pointer rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border" [class]="getTypeBgClass(incident.typeIcon)">
                        <span class="material-symbols-outlined text-[20px]" [class]="getTypeIconClass(incident.typeIcon)">{{ incident.typeIcon }}</span>
                      </div>
                      <div>
                        <div class="cursor-pointer text-[18px] font-semibold text-[var(--color-on-surface)] transition-colors hover:text-[var(--color-primary)]">
                          {{ incident.id }}
                        </div>
                        <div class="max-w-[150px] truncate text-[11px] text-[var(--color-on-surface-variant)] sm:max-w-[200px]">
                          {{ incident.location }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="hidden p-4 sm:table-cell">
                    <span class="text-[14px] text-[var(--color-on-surface)]">{{ incident.type }}</span>
                  </td>
                  <td class="p-4">
                    <span [class]="getPriorityClass(incident.priority)" class="text-[11px] inline-flex items-center gap-1 rounded-full border px-2 py-1 font-bold">
                      <span class="h-1.5 w-1.5 rounded-full"></span>
                      {{ incident.priority }}
                    </span>
                  </td>
                  <td class="hidden p-4 md:table-cell">
                    <div class="flex items-center gap-2">
                      <div class="h-1.5 w-16 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-container)]">
                        <div [class]="getSlaBarClass(incident.priority)" [style.width.%]="incident.slaPercent"></div>
                      </div>
                      <span class="text-[11px] font-bold" [class]="getSlaTextClass(incident.priority)">{{ incident.slaRemaining }}</span>
                    </div>
                  </td>
                  <td class="hidden p-4 lg:table-cell">
                    @if (incident.assignedTo) {
                      <div class="flex items-center gap-2">
                        <div class="h-6 w-6 overflow-hidden rounded-full bg-[var(--color-surface-variant)]">
                          @if (incident.assignedAvatar) {
                            <img [src]="incident.assignedAvatar" [alt]="incident.assignedTo" class="h-full w-full object-cover" />
                          } @else {
                            <div class="flex h-full w-full items-center justify-center text-[10px] font-bold text-[var(--color-on-surface-variant)]">
                              {{ incident.assignedTo.split(' ').map(n => n[0]).join('') }}
                            </div>
                          }
                        </div>
                        <span class="text-[14px] text-[var(--color-on-surface)]">{{ incident.assignedTo }}</span>
                      </div>
                    } @else {
                      <button class="flex items-center gap-1 rounded-md border border-dashed border-[var(--color-outline)] px-2 py-1 text-[12px] font-medium text-[var(--color-on-surface-variant)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                        <span class="material-symbols-outlined text-[16px]">add</span>
                        Assign
                      </button>
                    }
                  </td>
                  <td class="hidden p-4 text-[14px] text-[var(--color-on-surface-variant)] xl:table-cell">
                    {{ incident.reportedAt }}
                  </td>
                  <td class="p-4 text-right" (click)="$event.stopPropagation()">
                    <div class="flex justify-end gap-1">
                      <button class="rounded-md p-1 text-[var(--color-outline)] transition-colors hover:bg-[var(--color-primary-container)]/20 hover:text-[var(--color-primary)]" title="Re-assign">
                        <span class="material-symbols-outlined text-[20px]">person_add</span>
                      </button>
                      <button class="rounded-md p-1 text-[var(--color-outline)] transition-colors hover:bg-[var(--color-primary-container)]/20 hover:text-[var(--color-primary)]" title="View Details">
                        <span class="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between border-t border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-bright)] p-4">
          <span class="text-[12px] text-[var(--color-on-surface-variant)]">Showing 1 to 3 of 24 entries</span>
          <div class="flex items-center gap-1">
            <button class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-outline-variant)] text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)] disabled:opacity-50" disabled>
              <span class="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button class="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary)] font-bold text-[var(--color-on-primary)]">1</button>
            <button class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-outline-variant)] text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]">2</button>
            <button class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-outline-variant)] text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]">3</button>
            <span class="px-1 text-[var(--color-outline)]">...</span>
            <button class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-outline-variant)] text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)]">
              <span class="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
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
export class StaffManagerIncidentsComponent implements OnInit {

  incidents = signal<IncidentRow[]>([
    {
      id: 'INC-2049',
      type: 'Water Main Break',
      typeIcon: 'water_damage',
      location: '4th Ave & Main St, Ward 2',
      priority: 'Critical',
      slaRemaining: '2h left',
      slaPercent: 90,
      assignedTo: 'S. Connor',
      reportedAt: 'Oct 24, 08:32 AM',
    },
    {
      id: 'INC-2048',
      type: 'Traffic Light Outage',
      typeIcon: 'traffic',
      location: 'I-95 Northbound Exit 4',
      priority: 'High',
      slaRemaining: '12h left',
      slaPercent: 60,
      assignedTo: '',
      reportedAt: 'Oct 24, 07:15 AM',
    },
    {
      id: 'INC-2047',
      type: 'Severe Pothole',
      typeIcon: 'maps_ar',
      location: 'Elm St & Oak Ave, Ward 1',
      priority: 'Medium',
      slaRemaining: '48h left',
      slaPercent: 20,
      assignedTo: 'R. Jenkins',
      reportedAt: 'Oct 23, 14:20 PM',
    },
  ])

  ngOnInit(): void {
    // TODO: Load incidents from API
  }

  viewDetail(id: string): void {
    const numericId = id.replace('INC-', '')
    // TODO: Navigate to detail page when ready
    console.log('View detail:', numericId)
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Critical':
        return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]'
      case 'High':
        return 'bg-[#FFF7ED] text-[#C2410C] border-[#FDBA74]'
      case 'Medium':
        return 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]'
      default:
        return 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]'
    }
  }

  getSlaBarClass(priority: string): string {
    switch (priority) {
      case 'Critical':
        return 'h-full bg-[var(--color-error)]'
      case 'High':
        return 'h-full bg-[var(--color-tertiary)]'
      default:
        return 'h-full bg-[var(--color-secondary)]'
    }
  }

  getSlaTextClass(priority: string): string {
    switch (priority) {
      case 'Critical':
        return 'text-[var(--color-error)]'
      case 'High':
        return 'text-[var(--color-tertiary-container)]'
      default:
        return 'text-[var(--color-on-surface-variant)]'
    }
  }

  getTypeBgClass(icon: string): string {
    switch (icon) {
      case 'water_damage':
        return 'bg-[var(--color-error-container)]/20 border-[var(--color-error-container)]/50'
      case 'traffic':
        return 'bg-[var(--color-tertiary-container)]/10 border-[var(--color-tertiary-container)]/30'
      default:
        return 'bg-[var(--color-surface-container)] border-[var(--color-outline-variant)]/30'
    }
  }

  getTypeIconClass(icon: string): string {
    switch (icon) {
      case 'water_damage':
        return 'text-[var(--color-error)]'
      case 'traffic':
        return 'text-[var(--color-tertiary)]'
      default:
        return 'text-[var(--color-on-surface-variant)]'
    }
  }
}
