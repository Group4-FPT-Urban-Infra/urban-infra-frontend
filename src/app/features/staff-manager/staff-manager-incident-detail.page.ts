import { Component, inject, OnInit, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import * as L from 'leaflet'
import { DepartmentManagerService } from '../../core/services/department-manager.service'
import { DashboardService } from '../../core/services/dashboard.service'
import {
  DepartmentManagerIssueDetail,
  DepartmentManagerUpdateIssueStatusRequest,
  StaffMemberResponse,
} from '../../core/services/department-manager.service'
import { IssueStatusLookup } from '../../core/services/dashboard.service'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

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
        <span class="font-medium text-[var(--color-primary)]">{{ issue()?.publicCode || 'Loading...' }}</span>
      </nav>

      @if (isLoading()) {
        <div class="flex h-64 items-center justify-center">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
        </div>
      } @else if (issue()) {
        <!-- Incident Header -->
        <div class="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm md:flex-row md:items-start">
          <div class="flex-1">
            <div class="mb-3 flex flex-wrap gap-2">
              <span class="rounded-full bg-[#FEE2E2] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#991B1B]">
                {{ issue()!.priorityName }}
              </span>
              <span class="rounded-full bg-[var(--color-surface-variant)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                {{ issue()!.statusName }}
              </span>
              @if (issue()!.upvoteCount > 0) {
                <span class="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-variant)] px-3 py-1 text-[11px] font-medium text-[var(--color-on-surface-variant)]">
                  <span class="material-symbols-outlined text-[12px]">thumb_up</span>
                  {{ issue()!.upvoteCount }}
                </span>
              }
            </div>
            <h1 class="mb-3 text-[36px] font-bold text-[var(--color-on-surface)]" style="letter-spacing: -0.02em; line-height: 44px;">
              {{ issue()!.title }}
            </h1>
            <p class="text-[14px] text-[var(--color-on-surface-variant)]">
              {{ formatReportedAt(issue()!.reportedAt) }}
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button
              (click)="openResolveModal()"
              [disabled]="isResolving()"
              class="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
            >
              @if (isResolving()) {
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)] border-t-transparent"></div>
              } @else {
                <span class="material-symbols-outlined text-[18px]">edit</span>
              }
              Change Status
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
                {{ issue()!.description }}
              </p>
            </div>

            <!-- Media Gallery - Citizen Uploads -->
            @if (issue()!.imageUrls && issue()!.imageUrls.length > 0) {
              <div class="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
                <h2 class="mb-4 flex items-center gap-2 text-[18px] font-semibold text-[var(--color-on-surface)]">
                  <span class="material-symbols-outlined text-[var(--color-primary)]">photo_library</span>
                  Citizen Uploads
                </h2>
                <div class="grid grid-cols-2 gap-4">
                  @for (imageUrl of issue()!.imageUrls; track $index) {
                    <div class="group relative aspect-video overflow-hidden rounded-lg">
                      <img
                        class="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
                        [src]="getImageUrl(imageUrl)"
                        alt="Citizen upload"
                        (click)="openImageModal(imageUrl)"
                      />
                      <div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <span class="material-symbols-outlined text-3xl text-white">zoom_in</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Evidence - Staff Uploads -->
            @if (issue()!.assignedMembers && issue()!.assignedMembers.length > 0) {
              <div class="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
                <h2 class="mb-4 flex items-center gap-2 text-[18px] font-semibold text-[var(--color-on-surface)]">
                  <span class="material-symbols-outlined text-[var(--color-primary)]">verified</span>
                  Evidence
                </h2>
                <div class="rounded-lg bg-[var(--color-surface-container)] p-4 text-center text-[14px] text-[var(--color-on-surface-variant)]">
                  <span class="material-symbols-outlined text-4xl text-[var(--color-outline)]">folder_open</span>
                  <p class="mt-2">Evidence uploads from assigned staff will appear here</p>
                </div>
              </div>
            }

            <!-- Location Map -->
            <div class="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
              <h2 class="mb-4 flex items-center gap-2 text-[18px] font-semibold text-[var(--color-on-surface)]">
                <span class="material-symbols-outlined text-[var(--color-primary)]">location_on</span>
                Location
              </h2>
              <div #mapContainer class="relative aspect-[21/9] overflow-hidden rounded-lg bg-[var(--color-surface-container-high)]"></div>
              <div class="mt-4 flex items-center justify-between text-[14px] text-[var(--color-on-surface-variant)]">
                <span>{{ issue()!.latitude.toFixed(6) }}, {{ issue()!.longitude.toFixed(6) }}</span>
                <a
                  [href]="getGoogleMapsUrl()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-medium text-[var(--color-primary)] hover:underline"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>

          <!-- Right Column: Meta & Actions -->
          <div class="flex flex-col gap-6 lg:col-span-4">
            <!-- Assignment -->
            <div class="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="flex items-center gap-2 text-[18px] font-semibold text-[var(--color-on-surface)]">
                  <span class="material-symbols-outlined text-[var(--color-primary)]">assignment_ind</span>
                  Assignment
                </h2>
                <button
                  (click)="openReassignModal()"
                  class="flex items-center gap-1 rounded-lg border border-[var(--color-outline-variant)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-variant)]/50"
                >
                  <span class="material-symbols-outlined text-[16px]">swap_horiz</span>
                  Re-route
                </button>
              </div>
              @if (issue()!.currentAssignment) {
                <div class="mb-4 rounded-lg bg-[var(--color-surface)] p-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-container)]">
                      <span class="material-symbols-outlined text-[var(--color-on-primary-container)]">apartment</span>
                    </div>
                    <div>
                      <div class="text-[14px] font-semibold text-[var(--color-on-surface)]">
                        {{ issue()!.currentAssignment!.departmentName }}
                      </div>
                      <div class="text-[12px] text-[var(--color-on-surface-variant)]">
                        Assigned {{ formatDate(issue()!.currentAssignment!.assignedAt) }}
                      </div>
                    </div>
                  </div>
                </div>
              }

              @if (issue()!.assignedMembers && issue()!.assignedMembers.length > 0) {
                <div class="mb-4 space-y-3">
                  <h3 class="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                    Assigned Staff
                  </h3>
                  @for (member of issue()!.assignedMembers; track member.memberId) {
                    <div class="flex items-center gap-3">
                      <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)]">
                        @if (member.avatarUrl) {
                          <img [src]="member.avatarUrl" [alt]="member.fullName" class="h-full w-full object-cover" />
                        } @else {
                          <span class="text-[14px] font-medium text-[var(--color-on-primary)]">
                            {{ member.fullName.charAt(0).toUpperCase() }}
                          </span>
                        }
                      </div>
                      <div class="flex-1">
                        <div class="text-[14px] font-medium text-[var(--color-on-surface)]">{{ member.fullName }}</div>
                        <div class="text-[12px] text-[var(--color-on-surface-variant)]">
                          {{ member.acceptedAt ? 'Accepted' : 'Pending' }}
                        </div>
                      </div>
                      <span class="rounded-full px-2 py-0.5 text-[10px] font-medium" [class]="getMemberStatusClass(member.status)">
                        {{ formatMemberStatus(member.status) }}
                      </span>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-[14px] text-[var(--color-on-surface-variant)]">No staff assigned yet.</p>
              }

            <button
              (click)="openAssignModal()"
              class="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-outline-variant)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-variant)]/50"
            >
              <span class="material-symbols-outlined text-[18px]">person_add</span>
              Assign Staff
            </button>
            </div>

            <!-- Activity Log -->
            <div class="flex flex-1 flex-col rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
              <h2 class="mb-6 text-[18px] font-semibold text-[var(--color-on-surface)]">Activity Log</h2>
              <div class="relative mt-6 ml-3 space-y-6 border-l-2 border-[var(--color-surface-container-high)] overflow-y-auto" style="max-height: 400px;">
                @if (issue()!.updates && issue()!.updates.length > 0) {
                  @for (update of issue()!.updates; track update.id) {
                    <div class="relative pl-6">
                      <div class="absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full"
                           [class]="update.isSystemGenerated ? 'bg-[var(--color-secondary)]' : 'bg-[var(--color-surface-variant)]'"
                           [style.border]="'2px solid var(--color-surface-container-lowest)'">
                      </div>
                      <div class="mb-1 text-[12px] font-semibold text-[var(--color-on-surface)]">
                        @if (update.fromStatusName && update.toStatusName) {
                          Status changed to {{ update.toStatusName }}
                        } @else if (update.toStatusName) {
                          {{ update.toStatusName }}
                        } @else {
                          Update
                        }
                      </div>
                      @if (update.note) {
                        <div class="mb-1 text-[14px] text-[var(--color-on-surface-variant)]">{{ update.note }}</div>
                      }
                      @if (update.progressPercent !== null && update.progressPercent !== undefined) {
                        <div class="mb-1 text-[12px] text-[var(--color-on-surface-variant)]">
                          Progress: {{ update.progressPercent }}%
                        </div>
                      }
                      <div class="text-[11px] text-[var(--color-outline)]">
                        {{ formatDateTime(update.createdAt) }} - {{ update.createdByName }}
                      </div>
                    </div>
                  }
                } @else {
                  <div class="text-center text-[14px] text-[var(--color-on-surface-variant)]">
                    No activity yet.
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="flex h-64 items-center justify-center">
          <p class="text-[16px] text-[var(--color-on-surface-variant)]">Issue not found.</p>
        </div>
      }
    </div>

    <!-- Re-assign Modal (re-route to different department) -->
    @if (showReassignModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closeReassignModal()">
        <div class="w-full max-w-md rounded-2xl bg-[var(--color-surface)] p-6 shadow-2xl" (click)="$event.stopPropagation()">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-[var(--color-on-surface)]">Re-route Issue</h2>
            <button (click)="closeReassignModal()" class="rounded-full p-1 hover:bg-[var(--color-surface-variant)]">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <p class="mb-4 text-[14px] text-[var(--color-on-surface-variant)]">
            Select a department to transfer this issue to:
          </p>

          @if (departments().length === 0) {
            <div class="flex h-32 items-center justify-center">
              <div class="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"></div>
            </div>
          } @else {
            <div class="mb-4 max-h-64 space-y-2 overflow-y-auto">
              @for (dept of departments(); track dept.departmentId) {
                <button
                  (click)="selectDepartment(dept.departmentId)"
                  class="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
                  [class]="selectedDepartmentId() === dept.departmentId ? 'bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]' : 'bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)]'"
                >
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-container)]">
                    <span class="material-symbols-outlined text-[var(--color-on-primary-container)]">apartment</span>
                  </div>
                  <div>
                    <div class="text-[14px] font-medium text-[var(--color-on-surface)]">{{ dept.departmentName }}</div>
                    <div class="text-[12px] text-[var(--color-on-surface-variant)]">{{ dept.departmentCode }}</div>
                  </div>
                  @if (selectedDepartmentId() === dept.departmentId) {
                    <span class="material-symbols-outlined ml-auto text-[var(--color-primary)]">check_circle</span>
                  }
                </button>
              }
            </div>
          }

          <div class="mb-4">
            <label class="mb-2 block text-[12px] font-medium text-[var(--color-on-surface-variant)]">Note (optional)</label>
            <textarea
              [(ngModel)]="reassignNote"
              rows="2"
              class="w-full resize-none rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-3 text-[14px] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none"
              placeholder="Add a note about this transfer..."
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              (click)="closeReassignModal()"
              class="flex-1 rounded-lg border border-[var(--color-outline-variant)] py-2 text-[14px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-variant)]/50"
            >
              Cancel
            </button>
            <button
              (click)="confirmReassign()"
              [disabled]="!selectedDepartmentId() || isReassigning()"
              class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] py-2 text-[14px] font-medium text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
            >
              @if (isReassigning()) {
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)] border-t-transparent"></div>
              }
              Confirm Transfer
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Assign Staff Modal -->
    @if (showAssignModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closeAssignModal()">
        <div class="w-full max-w-md rounded-2xl bg-[var(--color-surface)] p-6 shadow-2xl" (click)="$event.stopPropagation()">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-[var(--color-on-surface)]">Assign Staff Member</h2>
            <button (click)="closeAssignModal()" class="rounded-full p-1 hover:bg-[var(--color-surface-variant)]">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <p class="mb-4 text-[14px] text-[var(--color-on-surface-variant)]">
            Select a staff member to assign to this issue:
          </p>

          <div class="mb-4 max-h-64 space-y-2 overflow-y-auto">
            @if (staffMembers().length === 0) {
              <div class="flex h-32 items-center justify-center">
                <div class="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"></div>
              </div>
            } @else {
              @for (staff of staffMembers(); track staff.userId) {
                <button
                  (click)="selectStaff(staff.userId)"
                  class="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
                  [class]="selectedUserId() === staff.userId ? 'bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]' : 'bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)]'"
                >
                  <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)]">
                    @if (staff.avatarUrl) {
                      <img [src]="staff.avatarUrl" [alt]="staff.fullName" class="h-full w-full object-cover" />
                    } @else {
                      <span class="text-[14px] font-medium text-[var(--color-on-primary)]">
                        {{ staff.fullName.charAt(0).toUpperCase() }}
                      </span>
                    }
                  </div>
                  <div class="flex-1">
                    <div class="text-[14px] font-medium text-[var(--color-on-surface)]">{{ staff.fullName }}</div>
                    <div class="text-[12px] text-[var(--color-on-surface-variant)]">
                      {{ staff.resolvedCount }} resolved / {{ staff.currentWorkload }} pending
                    </div>
                  </div>
                  @if (selectedUserId() === staff.userId) {
                    <span class="material-symbols-outlined text-[var(--color-primary)]">check_circle</span>
                  }
                </button>
              }
            }
          </div>

          <div class="mb-4">
            <label class="mb-2 block text-[12px] font-medium text-[var(--color-on-surface-variant)]">Note (optional)</label>
            <textarea
              [(ngModel)]="assignNote"
              rows="2"
              class="w-full resize-none rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-3 text-[14px] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none"
              placeholder="Add a note about this assignment..."
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              (click)="closeAssignModal()"
              class="flex-1 rounded-lg border border-[var(--color-outline-variant)] py-2 text-[14px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-variant)]/50"
            >
              Cancel
            </button>
            <button
              (click)="confirmAssign()"
              [disabled]="!selectedUserId() || isAssigning()"
              class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] py-2 text-[14px] font-medium text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
            >
              @if (isAssigning()) {
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)] border-t-transparent"></div>
              }
              Assign Staff
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Resolve Modal -->
    @if (showResolveModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closeResolveModal()">
        <div class="w-full max-w-md rounded-2xl bg-[var(--color-surface)] p-6 shadow-2xl" (click)="$event.stopPropagation()">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-[var(--color-on-surface)]">Resolve Issue</h2>
            <button (click)="closeResolveModal()" class="rounded-full p-1 hover:bg-[var(--color-surface-variant)]">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <p class="mb-4 text-[14px] text-[var(--color-on-surface-variant)]">
            Select a status to mark this issue as resolved:
          </p>

          <div class="mb-4 space-y-2">
            @for (status of issueStatuses(); track status.statusId) {
              <button
                (click)="selectResolveStatus(status.statusId)"
                class="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
                [class]="selectedResolveStatusId() === status.statusId ? 'bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]' : 'bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)]'"
              >
                <span class="material-symbols-outlined text-[var(--color-on-surface-variant)]">check_circle</span>
                <span class="text-[14px] text-[var(--color-on-surface)]">{{ status.statusName }}</span>
                @if (selectedResolveStatusId() === status.statusId) {
                  <span class="material-symbols-outlined ml-auto text-[var(--color-primary)]">check</span>
                }
              </button>
            }
          </div>

          <div class="mb-4">
            <label class="mb-2 block text-[12px] font-medium text-[var(--color-on-surface-variant)]">Note (optional)</label>
            <textarea
              [(ngModel)]="resolveNote"
              rows="2"
              class="w-full resize-none rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-3 text-[14px] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none"
              placeholder="Add resolution notes..."
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              (click)="closeResolveModal()"
              class="flex-1 rounded-lg border border-[var(--color-outline-variant)] py-2 text-[14px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-variant)]/50"
            >
              Cancel
            </button>
            <button
              (click)="confirmResolve()"
              [disabled]="!selectedResolveStatusId() || isResolving()"
              class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] py-2 text-[14px] font-medium text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
            >
              @if (isResolving()) {
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)] border-t-transparent"></div>
              }
              Confirm
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Image Modal -->
    @if (showImageModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" (click)="closeImageModal()">
        <button class="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" (click)="closeImageModal()">
          <span class="material-symbols-outlined">close</span>
        </button>
        <img
          [src]="getImageUrl(selectedImageUrl()!)"
          alt="Full size"
          class="max-h-[90vh] max-w-[90vw] object-contain"
          (click)="$event.stopPropagation()"
        />
      </div>
    }
  `,
  styles: [
    `
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
    `,
  ],
})
export class StaffManagerIncidentDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef

  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly dmService = inject(DepartmentManagerService)
  private readonly dashboardService = inject(DashboardService)

  issue = signal<DepartmentManagerIssueDetail | null>(null)
  isLoading = signal(true)
  issueStatuses = signal<IssueStatusLookup[]>([])

  // Staff list for assign
  staffMembers = signal<StaffMemberResponse[]>([])

  // Resolve modal
  showResolveModal = signal(false)
  selectedResolveStatusId = signal<number | null>(null)
  resolveNote = ''
  isResolving = signal(false)

  // Reassign modal (for re-routing to different department)
  showReassignModal = signal(false)
  departments = signal<{ departmentId: number; departmentCode: string; departmentName: string }[]>([])
  selectedDepartmentId = signal<number | null>(null)
  reassignNote = ''
  isReassigning = signal(false)

  // Assign modal (for assigning staff)
  showAssignModal = signal(false)
  selectedUserId = signal<string | null>(null)
  assignNote = ''
  isAssigning = signal(false)

  // Image modal
  showImageModal = signal(false)
  selectedImageUrl = signal<string | null>(null)

  private map!: L.Map
  private marker!: L.Marker

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.loadIssueDetail(parseInt(id, 10))
    }
    this.loadIssueStatuses()
  }

  ngAfterViewInit(): void {
    // Map will be initialized after issue data is loaded
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove()
    }
  }

  private loadIssueDetail(issueId: number): void {
    this.isLoading.set(true)
    this.dmService.getIssueDetail(issueId).subscribe({
      next: (detail) => {
        this.issue.set(detail)
        this.isLoading.set(false)
        // Initialize map after data is loaded
        setTimeout(() => this.initMap(), 100)
      },
      error: (err) => {
        console.error('Failed to load issue detail:', err)
        this.isLoading.set(false)
      }
    })
  }

  private loadIssueStatuses(): void {
    this.dashboardService.getIssueStatuses().subscribe({
      next: (statuses) => {
        this.issueStatuses.set(statuses)
      }
    })
  }

  private initMap(): void {
    const issue = this.issue()
    if (!issue || !this.mapContainer) return

    if (this.map) {
      this.map.remove()
    }

    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map)

    const lat = issue.latitude
    const lng = issue.longitude
    this.map.setView([lat, lng], 15)

    const icon = L.divIcon({
      html: `<div style="background-color: #F44336; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 18px;" class="material-symbols-outlined">location_on</span>
      </div>`,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })

    this.marker = L.marker([lat, lng], { icon }).addTo(this.map)
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      void this.router.navigate(['/staff-manager/incidents'])
    }
  }

  formatReportedAt(dateStr: string): string {
    const date = new Date(dateStr)
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return `Reported on ${date.toLocaleDateString('en-US', options)}`
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  getImageUrl(path: string): string {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `http://localhost:5080/${path.replace(/^\//, '')}`
  }

  getGoogleMapsUrl(): string {
    const issue = this.issue()
    if (!issue) return '#'
    return `https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`
  }

  openImageModal(imageUrl: string): void {
    this.selectedImageUrl.set(imageUrl)
    this.showImageModal.set(true)
  }

  closeImageModal(): void {
    this.showImageModal.set(false)
    this.selectedImageUrl.set(null)
  }

  getMemberStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  formatMemberStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  // Resolve functionality
  openResolveModal(): void {
    // Find RESOLVED status by default
    const resolvedStatus = this.issueStatuses().find(s =>
      s.statusCode.toUpperCase() === 'RESOLVED'
    )
    this.selectedResolveStatusId.set(resolvedStatus?.statusId ?? null)
    this.resolveNote = ''
    this.showResolveModal.set(true)
  }

  closeResolveModal(): void {
    this.showResolveModal.set(false)
    this.selectedResolveStatusId.set(null)
    this.resolveNote = ''
  }

  selectResolveStatus(statusId: number): void {
    this.selectedResolveStatusId.set(statusId)
  }

  confirmResolve(): void {
    const issue = this.issue()
    const statusId = this.selectedResolveStatusId()
    if (!issue || !statusId) return

    this.isResolving.set(true)
    const request: DepartmentManagerUpdateIssueStatusRequest = {
      statusId,
      note: this.resolveNote || undefined
    }

    this.dmService.updateIssueStatus(issue.issueId, request).subscribe({
      next: (updated) => {
        this.issue.set(updated)
        this.isResolving.set(false)
        this.closeResolveModal()
      },
      error: (err) => {
        console.error('Failed to resolve issue:', err)
        this.isResolving.set(false)
      }
    })
  }

  // Reassign functionality (re-route to different department)
  openReassignModal(): void {
    this.selectedDepartmentId.set(null)
    this.reassignNote = ''
    this.showReassignModal.set(true)
    this.loadDepartments()
  }

  closeReassignModal(): void {
    this.showReassignModal.set(false)
    this.selectedDepartmentId.set(null)
    this.reassignNote = ''
  }

  private loadDepartments(): void {
    this.dashboardService.get<any[]>('/departments').subscribe({
      next: (depts) => {
        this.departments.set(depts.map((d: any) => ({
          departmentId: d.departmentId ?? d.DepartmentId,
          departmentCode: d.departmentCode ?? d.DepartmentCode ?? '',
          departmentName: d.departmentName ?? d.DepartmentName ?? ''
        })))
      }
    })
  }

  selectDepartment(departmentId: number): void {
    this.selectedDepartmentId.set(departmentId)
  }

  confirmReassign(): void {
    const issue = this.issue()
    const departmentId = this.selectedDepartmentId()
    if (!issue || !departmentId) return

    this.isReassigning.set(true)

    this.dashboardService.post<any>(`/issues/${issue.issueId}/re-route`, {
      departmentId,
      note: this.reassignNote || undefined
    }).subscribe({
      next: () => {
        // Reload the issue detail to get updated data
        this.loadIssueDetail(issue.issueId)
        this.isReassigning.set(false)
        this.closeReassignModal()
      },
      error: (err) => {
        console.error('Failed to reassign issue:', err)
        this.isReassigning.set(false)
      }
    })
  }

  // Assign Staff functionality
  openAssignModal(): void {
    this.selectedUserId.set(null)
    this.assignNote = ''
    this.showAssignModal.set(true)
    this.loadStaffMembers()
  }

  closeAssignModal(): void {
    this.showAssignModal.set(false)
    this.selectedUserId.set(null)
    this.assignNote = ''
  }

  private loadStaffMembers(): void {
    this.dmService.getStaffs().subscribe({
      next: (staffs) => {
        // Filter out already assigned staff
        const issue = this.issue()
        const assignedUserIds = issue?.assignedMembers?.map(m => m.userId) ?? []
        this.staffMembers.set(staffs.filter(s => !assignedUserIds.includes(s.userId)))
      }
    })
  }

  selectStaff(userId: string): void {
    this.selectedUserId.set(userId)
  }

  confirmAssign(): void {
    const issue = this.issue()
    const userId = this.selectedUserId()
    if (!issue || !userId) return

    this.isAssigning.set(true)

    this.dmService.assignIssue(issue.issueId, { userId, note: this.assignNote || undefined }).subscribe({
      next: (updated) => {
        this.issue.set(updated)
        this.isAssigning.set(false)
        this.closeAssignModal()
      },
      error: (err) => {
        console.error('Failed to assign staff:', err)
        this.isAssigning.set(false)
      }
    })
  }
}
