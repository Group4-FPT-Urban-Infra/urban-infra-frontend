import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { DepartmentManagerService } from '../../core/services/department-manager.service'
import { StaffMemberResponse } from '../../core/services/department-manager.service'

@Component({
  selector: 'app-staff-manager-staffs',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
          <span class="rounded-md bg-[var(--color-surface-container)] px-3 py-2 text-[12px] font-bold text-[var(--color-on-surface)]">
            {{ staffList().length }} Staff
          </span>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="mb-6 flex flex-col items-center gap-3 rounded-xl border border-[var(--color-outline-variant)]/30 bg-white p-4 shadow-sm lg:flex-row">
        <!-- Search -->
        <div class="group relative w-full lg:w-72">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">search</span>
          <input
            type="text"
            [(ngModel)]="searchKeyword"
            (ngModelChange)="onSearchChange()"
            placeholder="Search staff..."
            class="w-full rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-10 pr-4 text-[14px] shadow-sm transition-all focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          />
        </div>

        <div class="hidden h-8 w-px bg-[var(--color-outline-variant)]/30 lg:block"></div>

        <!-- Filters -->
        <div class="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <div class="relative">
            <select [(ngModel)]="statusFilter" (ngModelChange)="filterStaff()" class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-w-[140px]">
              <option value="">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/30 bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead class="sticky top-0 z-10 border-b border-[var(--color-outline-variant)]/40 bg-white/90 text-[11px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] shadow-sm backdrop-blur-md">
              <tr>
                <th class="p-4 font-semibold">Staff</th>
                <th class="p-4 font-semibold">Email</th>
                <th class="p-4 font-semibold">Status</th>
                <th class="p-4 font-semibold">Assigned</th>
                <th class="p-4 font-semibold">Resolved</th>
                <th class="p-4 font-semibold">Resolution Rate</th>
                <th class="p-4 font-semibold">Current Workload</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-outline-variant)]/20 bg-white text-[14px]">
              @for (staff of filteredStaff(); track staff.userId) {
                <tr class="group cursor-default transition-colors hover:bg-[#F1F5F9]">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-container)]">
                        @if (staff.avatarUrl) {
                          <img [src]="staff.avatarUrl" [alt]="staff.fullName" class="h-full w-full object-cover" />
                        } @else {
                          <span class="text-[14px] font-bold text-[var(--color-on-primary-container)]">{{ getInitials(staff.fullName) }}</span>
                        }
                      </div>
                      <span class="font-semibold text-[var(--color-on-surface)]">{{ staff.fullName }}</span>
                    </div>
                  </td>
                  <td class="p-4 text-[var(--color-on-surface-variant)]">{{ staff.email }}</td>
                  <td class="p-4">
                    <span [class]="getStatusBadgeClass(staff.isActive)" class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium">
                      <span class="h-1.5 w-1.5 rounded-full"></span>
                      {{ staff.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="p-4">
                    <span class="text-[var(--color-on-surface)]">{{ staff.assignedCount }}</span>
                  </td>
                  <td class="p-4">
                    <span class="text-[var(--color-primary)]">{{ staff.resolvedCount }}</span>
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <div class="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-surface-container)]">
                        <div [class]="getPerformanceBarClass(staff.resolutionRate)" [style.width.%]="staff.resolutionRate"></div>
                      </div>
                      <span class="text-[12px] font-medium" [class]="getPerformanceTextClass(staff.resolutionRate)">
                        {{ staff.resolutionRate }}%
                      </span>
                    </div>
                  </td>
                  <td class="p-4">
                    <span class="rounded-full px-2 py-1 text-[12px] font-medium" [class]="getWorkloadClass(staff.currentWorkload)">
                      {{ staff.currentWorkload }} issues
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="p-8 text-center text-[var(--color-on-surface-variant)]">
                    No staff members found
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `],
})
export class StaffManagerStaffsComponent implements OnInit {
  private readonly dmService = inject(DepartmentManagerService)

  staffList = signal<StaffMemberResponse[]>([])
  filteredStaff = signal<StaffMemberResponse[]>([])

  searchKeyword = ''
  statusFilter = ''

  ngOnInit(): void {
    this.loadStaff()
  }

  loadStaff(): void {
    this.dmService.getStaffs().subscribe({
      next: (data) => {
        this.staffList.set(data)
        this.filteredStaff.set(data)
      },
      error: (err) => console.error('Failed to load staff:', err),
    })
  }

  onSearchChange(): void {
    this.filterStaff()
  }

  filterStaff(): void {
    let result = this.staffList()

    if (this.searchKeyword) {
      const keyword = this.searchKeyword.toLowerCase()
      result = result.filter(s =>
        s.fullName.toLowerCase().includes(keyword) ||
        s.email.toLowerCase().includes(keyword)
      )
    }

    if (this.statusFilter === 'active') {
      result = result.filter(s => s.isActive)
    } else if (this.statusFilter === 'inactive') {
      result = result.filter(s => !s.isActive)
    }

    this.filteredStaff.set(result)
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F1F5F9] text-[#64748B]'
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

  getWorkloadClass(workload: number): string {
    if (workload === 0) return 'bg-[#F1F5F9] text-[#64748B]'
    if (workload <= 3) return 'bg-[#DCFCE7] text-[#166534]'
    return 'bg-[#FEF3C7] text-[#92400E]'
  }
}
