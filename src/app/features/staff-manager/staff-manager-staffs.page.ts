import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'

interface StaffRow {
  id: string
  name: string
  initials: string
  avatar?: string
  role: string
  status: 'Active' | 'Offline' | 'On Leave'
  assignedIncidents: number
  performance: number
  email: string
}

@Component({
  selector: 'app-staff-manager-staffs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[var(--color-surface)] p-4 md:p-8">
      <!-- Page Header -->
      <div class="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="text-[36px] font-bold text-[var(--color-on-surface)]" style="letter-spacing: -0.02em; line-height: 44px;">
            Staff Management
          </h2>
          <p class="mt-1 text-[14px] text-[var(--color-on-surface-variant)]">
            Manage department staff, roles, and workload distribution.
          </p>
        </div>
        <div class="flex gap-3">
          <button class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] shadow-sm transition-all hover:bg-[var(--color-surface-container-low)]">
            <span class="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          <button class="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-primary)]/90">
            <span class="material-symbols-outlined text-[18px]">person_add</span>
            Add Staff
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
            placeholder="Search staff..."
            class="w-full rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-10 pr-4 text-[14px] shadow-sm transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          />
        </div>

        <div class="hidden h-8 w-px bg-[var(--color-outline-variant)]/30 lg:block"></div>

        <!-- Filters -->
        <div class="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <div class="relative">
            <select class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-w-[140px]">
              <option value="">Role: All</option>
              <option value="staff">Department Staff</option>
              <option value="manager">Department Manager</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>

          <div class="relative">
            <select class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-w-[120px]">
              <option value="">Status: All</option>
              <option value="active">Active</option>
              <option value="offline">Offline</option>
              <option value="leave">On Leave</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>

          <div class="relative">
            <select class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-w-[140px]">
              <option value="">Department: All</option>
              <option value="public_works">Public Works</option>
              <option value="traffic">Traffic Management</option>
              <option value="utilities">Utilities</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>
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
          <table class="w-full border-collapse text-left">
            <thead class="sticky top-0 z-10 border-b border-[var(--color-outline-variant)]/40 bg-white/90 text-[11px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] shadow-sm backdrop-blur-md">
              <tr>
                <th class="w-12 border-r border-[var(--color-outline-variant)]/20 p-4 text-center">
                  <input type="checkbox" class="h-4 w-4 cursor-pointer rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                </th>
                <th class="cursor-pointer p-4 transition-colors hover:bg-[var(--color-surface-container-low)]">
                  <div class="flex items-center gap-1">
                    Staff
                    <span class="material-symbols-outlined text-[14px] text-[var(--color-outline)]">arrow_drop_down</span>
                  </div>
                </th>
                <th class="p-4 font-semibold">Role</th>
                <th class="p-4 font-semibold">Status</th>
                <th class="p-4 font-semibold">Assigned Incidents</th>
                <th class="p-4 font-semibold">Performance</th>
                <th class="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-outline-variant)]/20 bg-white text-[14px]">
              @for (staff of staffList(); track staff.id) {
                <tr class="group cursor-default transition-colors hover:bg-[#F1F5F9]">
                  <td class="border-r border-[var(--color-outline-variant)]/10 p-4 text-center">
                    <input type="checkbox" class="h-4 w-4 cursor-pointer rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-container)]">
                        @if (staff.avatar) {
                          <img [src]="staff.avatar" [alt]="staff.name" class="h-full w-full object-cover" />
                        } @else {
                          <span class="text-[14px] font-bold text-[var(--color-on-primary-container)]">{{ staff.initials }}</span>
                        }
                      </div>
                      <div>
                        <div class="font-semibold text-[var(--color-on-surface)]">{{ staff.name }}</div>
                        <div class="text-[11px] text-[var(--color-outline)]">{{ staff.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="p-4">
                    <span class="rounded-full bg-[var(--color-surface-container)] px-3 py-1 text-[11px] font-medium text-[var(--color-on-surface)]">
                      {{ staff.role }}
                    </span>
                  </td>
                  <td class="p-4">
                    <span [class]="getStatusBadgeClass(staff.status)" class="inline-flex items-center gap-1 text-[11px] font-medium">
                      <span class="h-1.5 w-1.5 rounded-full"></span>
                      {{ staff.status }}
                    </span>
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <div class="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-surface-container)]">
                        <div [class]="getPerformanceBarClass(staff.performance)" [style.width.%]="staff.performance"></div>
                      </div>
                      <span class="text-[12px] font-medium text-[var(--color-on-surface)]">{{ staff.assignedIncidents }}</span>
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <span class="text-[14px] font-bold" [class]="getPerformanceTextClass(staff.performance)">{{ staff.performance }}%</span>
                      <div class="flex items-center gap-1 text-[11px]" [class]="getPerformanceTextClass(staff.performance)">
                        <span class="material-symbols-outlined text-sm">trending_up</span>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 text-right">
                    <div class="flex justify-end gap-1">
                      <button class="rounded-md p-1 text-[var(--color-outline)] transition-colors hover:bg-[var(--color-primary-container)]/20 hover:text-[var(--color-primary)]" title="Edit">
                        <span class="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button class="rounded-md p-1 text-[var(--color-outline)] transition-colors hover:bg-[var(--color-primary-container)]/20 hover:text-[var(--color-primary)]" title="View Profile">
                        <span class="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button class="rounded-md p-1 text-[var(--color-outline)] transition-colors hover:bg-[var(--color-error-container)]/20 hover:text-[var(--color-error)]" title="Remove">
                        <span class="material-symbols-outlined text-[20px]">person_remove</span>
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
          <p class="text-[12px] text-[var(--color-on-surface-variant)]">Showing 1 to 5 of 12 staff members</p>
          <div class="flex items-center gap-1">
            <button class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)] disabled:opacity-50" disabled>
              <span class="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] font-bold text-[var(--color-on-primary)]">1</button>
            <button class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]">2</button>
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
export class StaffManagerStaffsComponent implements OnInit {

  staffList = signal<StaffRow[]>([
    {
      id: '1',
      name: 'Sarah Connor',
      initials: 'SC',
      role: 'Department Staff',
      status: 'Active',
      assignedIncidents: 12,
      performance: 95,
      email: 'sarah.connor@urban.gov',
    },
    {
      id: '2',
      name: 'John Davis',
      initials: 'JD',
      role: 'Department Staff',
      status: 'Active',
      assignedIncidents: 8,
      performance: 88,
      email: 'john.davis@urban.gov',
    },
    {
      id: '3',
      name: 'Mike Thompson',
      initials: 'MT',
      role: 'Department Staff',
      status: 'Offline',
      assignedIncidents: 0,
      performance: 72,
      email: 'mike.thompson@urban.gov',
    },
    {
      id: '4',
      name: 'Emily Chen',
      initials: 'EC',
      role: 'Department Staff',
      status: 'On Leave',
      assignedIncidents: 0,
      performance: 90,
      email: 'emily.chen@urban.gov',
    },
    {
      id: '5',
      name: 'Robert Kim',
      initials: 'RK',
      role: 'Department Manager',
      status: 'Active',
      assignedIncidents: 3,
      performance: 98,
      email: 'robert.kim@urban.gov',
    },
  ])

  ngOnInit(): void {
    // TODO: Load staff from API
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-[#DCFCE7] text-[#166534]'
      case 'Offline':
        return 'bg-[#F1F5F9] text-[#64748B]'
      case 'On Leave':
        return 'bg-[#FEF3C7] text-[#92400E]'
      default:
        return 'bg-[#F1F5F9] text-[#64748B]'
    }
  }

  getPerformanceBarClass(performance: number): string {
    if (performance >= 90) return 'h-full bg-[var(--color-secondary)]'
    if (performance >= 70) return 'h-full bg-[var(--color-primary)]'
    return 'h-full bg-[var(--color-tertiary)]'
  }

  getPerformanceTextClass(performance: number): string {
    if (performance >= 90) return 'text-[var(--color-secondary)]'
    if (performance >= 70) return 'text-[var(--color-primary)]'
    return 'text-[var(--color-tertiary-container)]'
  }
}
