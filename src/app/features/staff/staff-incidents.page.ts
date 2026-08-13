import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'

interface IncidentRow {
  id: string
  type: string
  typeIcon: string
  location: string
  district: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Resolved'
  assignedTo: string
  assignedInitials: string
  reportedAt: string
}

@Component({
  selector: 'app-staff-incidents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[var(--color-surface-bright)] p-4 md:p-6">
      <!-- Page Header -->
      <div class="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="text-[36px] font-bold text-[var(--color-on-surface)]" style="letter-spacing: -0.02em; line-height: 44px;">
            Incident Management
          </h2>
          <p class="mt-1 text-[14px] text-[var(--color-on-surface-variant)]">
            Review and manage assigned incidents.
          </p>
        </div>
        <div class="flex gap-3">
          <button class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-white px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] shadow-sm transition-all hover:bg-[var(--color-surface-container)]">
            <span class="material-symbols-outlined text-[18px]">download</span>
            Export CSV
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
            placeholder="Search incidents..."
            class="w-full rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-10 pr-4 text-[14px] shadow-sm transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          />
        </div>

        <div class="hidden h-8 w-px bg-[var(--color-outline-variant)]/30 lg:block"></div>

        <!-- Filters -->
        <div class="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <div class="relative">
            <select class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-w-[140px]">
              <option value="">District (All)</option>
              <option value="downtown">Downtown</option>
              <option value="north">North Hills</option>
              <option value="west">Westside</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>

          <div class="relative">
            <select class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-w-[120px]">
              <option value="">Priority (All)</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>

          <div class="relative">
            <select class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-w-[120px]">
              <option value="">Status (All)</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>

          <button class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)]/50 bg-white px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] shadow-sm transition-colors hover:bg-[var(--color-surface-container)]">
            <span class="material-symbols-outlined text-[18px]">person_search</span>
            Assigned To
          </button>
        </div>

        <div class="flex items-center gap-2 lg:ml-auto">
          <button class="rounded-lg p-2 text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)] hover:text-[var(--color-primary)]" title="Clear Filters">
            <span class="material-symbols-outlined text-[20px]">filter_alt_off</span>
          </button>
        </div>
      </div>

      <!-- Data Table -->
      <div class="overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/30 bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr class="bg-surface border-b border-[var(--color-outline-variant)]/40 text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                <th class="w-12 p-4 text-center">
                  <input type="checkbox" class="h-4 w-4 cursor-pointer rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                </th>
                <th class="p-4 font-semibold">ID</th>
                <th class="p-4 font-semibold">Incident Type</th>
                <th class="p-4 font-semibold">Location / District</th>
                <th class="p-4 font-semibold">Priority</th>
                <th class="p-4 font-semibold">Status</th>
                <th class="p-4 font-semibold">Assigned To</th>
                <th class="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-surface-container)] text-[14px]">
              @for (incident of incidents(); track incident.id) {
                <tr class="group cursor-pointer transition-colors hover:bg-[#F1F5F9]" (click)="viewDetail(incident.id)">
                  <td class="p-4 text-center" (click)="$event.stopPropagation()">
                    <input type="checkbox" class="h-4 w-4 cursor-pointer rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  </td>
                  <td class="p-4 font-medium text-[var(--color-primary)]">{{ incident.id }}</td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                        <span class="material-symbols-outlined text-[18px]">{{ incident.typeIcon }}</span>
                      </div>
                      <div>
                        <p class="font-medium text-[var(--color-on-surface)]">{{ incident.type }}</p>
                        <p class="text-[11px] text-[var(--color-outline)]">Reported {{ incident.reportedAt }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-4">
                    <p class="text-[var(--color-on-surface)]">{{ incident.location }}</p>
                    <p class="text-[11px] text-[var(--color-outline)]">{{ incident.district }}</p>
                  </td>
                  <td class="p-4">
                    <span [class]="getPriorityClass(incident.priority)" class="text-[11px] inline-flex items-center rounded-full bg-[#FEE2E2] px-2 py-1 font-bold">
                      {{ incident.priority }}
                    </span>
                  </td>
                  <td class="p-4">
                    <div class="relative inline-block w-full">
                      <select [class]="getStatusClass(incident.status)" class="text-[11px] w-full cursor-pointer appearance-none rounded-full border-none py-1 pl-3 pr-8 font-bold outline-none focus:ring-2">
                        <option value="open" [selected]="incident.status === 'Open'">Open</option>
                        <option value="in_progress" [selected]="incident.status === 'In Progress'">In Progress</option>
                        <option value="resolved" [selected]="incident.status === 'Resolved'">Resolved</option>
                      </select>
                      <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px]">arrow_drop_down</span>
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-container)] text-[10px] font-bold text-[var(--color-on-primary-container)]">
                        {{ incident.assignedInitials }}
                      </div>
                      <span class="text-[var(--color-on-surface)]">{{ incident.assignedTo }}</span>
                    </div>
                  </td>
                  <td class="p-4 text-right" (click)="$event.stopPropagation()">
                    <div class="flex justify-end gap-1">
                      <button class="p-1 text-[var(--color-outline)] transition-colors hover:text-[var(--color-primary)]">
                        <span class="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button class="p-1 text-[var(--color-outline)] transition-colors hover:text-[var(--color-primary)]">
                        <span class="material-symbols-outlined text-[20px]">more_vert</span>
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
          <p class="text-[12px] text-[var(--color-on-surface-variant)]">
            Showing 1 to 3 of 42 entries
          </p>
          <div class="flex items-center gap-1">
            <button class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)] disabled:opacity-50" disabled>
              <span class="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] font-bold text-[var(--color-on-primary)]">1</button>
            <button class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]">2</button>
            <button class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]">3</button>
            <span class="px-1 text-[var(--color-outline)]">...</span>
            <button class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)]">
              <span class="material-symbols-outlined text-[18px]">chevron_right</span>
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
export class StaffIncidentsComponent implements OnInit {

  incidents = signal<IncidentRow[]>([
    {
      id: '#INC-4092',
      type: 'Water Main Break',
      typeIcon: 'water_drop',
      location: '1420 Main St',
      district: 'Downtown',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'J. Davis',
      assignedInitials: 'JD',
      reportedAt: '2h ago',
    },
    {
      id: '#INC-4091',
      type: 'Signal Malfunction',
      typeIcon: 'traffic',
      location: '5th Ave & Oak St',
      district: 'Westside',
      priority: 'Medium',
      status: 'Open',
      assignedTo: 'Unassigned',
      assignedInitials: '',
      reportedAt: '4h ago',
    },
    {
      id: '#INC-4088',
      type: 'Fallen Tree',
      typeIcon: 'park',
      location: 'Centennial Park',
      district: 'North Hills',
      priority: 'Low',
      status: 'Resolved',
      assignedTo: 'M. King',
      assignedInitials: 'MK',
      reportedAt: '1d ago',
    },
  ])

  ngOnInit(): void {
    // TODO: Load incidents from API
  }

  viewDetail(id: string): void {
    const numericId = id.replace('#INC-', '')
    // TODO: Navigate to detail page when ready
    console.log('View detail:', numericId)
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Critical':
        return 'bg-[#FEE2E2] text-[#991B1B]'
      case 'High':
        return 'bg-[#FEF3C7] text-[#92400E]'
      case 'Medium':
        return 'bg-[#DBEAFE] text-[#1E40AF]'
      case 'Low':
        return 'bg-[#F1F5F9] text-[#475569]'
      default:
        return 'bg-[#F1F5F9] text-[#475569]'
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'bg-[#FEF3C7] text-[#92400E]'
      case 'In Progress':
        return 'bg-[#DBEAFE] text-[#1E40AF]'
      case 'Resolved':
        return 'bg-[#DCFCE7] text-[#166534]'
      default:
        return 'bg-[#F1F5F9] text-[#475569]'
    }
  }
}
