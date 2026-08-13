import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { UserManagementService, AdminUserListRequest, AdminUserResponse, CreateUserByAdminRequest, UpdateUserByAdminRequest, DepartmentResponse } from './services/user-management.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';

interface UserRow {
  id: string;
  name: string;
  email: string;
  avatar: string;
  initials?: string;
  role: string;
  roleValue: string;
  department: string;
  departmentId?: number;
  status: string;
  statusColor: string;
  statusBg: string;
  lastLogin: string;
  isActive: boolean;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent],
  providers: [DatePipe],
  styles: [
    `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `
  ],
  template: `
    <!-- Outer wrapper: sidebar + main column -->
    <div class="flex min-h-screen overflow-hidden" style="background-color: var(--color-background)">

      <!-- Shared Admin Sidebar -->
      <app-admin-sidebar #sidebar></app-admin-sidebar>

      <!-- ── Main Column ── -->
      <div
        class="flex flex-1 flex-col transition-all duration-300 min-w-0"
        [style.margin-left]="sidebar.open() ? '280px' : '0px'"
      >

        <!-- Scrollable content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-8 pb-16 relative">
          <div class="flex-1 bg-surface-bright flex flex-col gap-6">
            <!-- Page Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-outline-variant/30" style="border-color: rgba(195,198,215,0.3)">
              <div>
                <h1 class="text-3xl font-bold tracking-tight" style="color: var(--color-on-surface)">User Management</h1>
                <p class="text-sm mt-1" style="color: var(--color-on-surface-variant)">Manage system access, roles, and security for all organization members.</p>
              </div>
              <button (click)="openCreateModal()" class="transition-colors px-6 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 shadow-sm hover:shadow-md" style="background-color: var(--color-primary-container); color: var(--color-on-primary-container)">
                <span class="material-symbols-outlined text-[18px]">add</span>
                Add New User
              </button>
            </div>

            <!-- Stats Overview (Bento Grid Style) -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="p-4 rounded-xl border shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow" style="background-color: var(--color-surface-container-lowest); border-color: rgba(195,198,215,0.5)">
                <div class="absolute -right-4 -top-4 w-16 h-16 rounded-full group-hover:scale-150 transition-transform duration-500" style="background-color: rgba(37,99,235,0.05)"></div>
                <span class="material-symbols-outlined text-[24px]" style="color: var(--color-on-surface-variant)">group</span>
                <div>
                  <p class="text-[11px] uppercase tracking-widest font-medium" style="color: var(--color-on-surface-variant)">Total Users</p>
                  <p class="text-2xl font-bold mt-1" style="color: var(--color-on-surface)">{{ totalUsers() }}</p>
                </div>
              </div>
              
              <div class="p-4 rounded-xl border shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow" style="background-color: var(--color-surface-container-lowest); border-color: rgba(195,198,215,0.5)">
                <div class="absolute -right-4 -top-4 w-16 h-16 rounded-full group-hover:scale-150 transition-transform duration-500" style="background-color: rgba(108,248,187,0.2)"></div>
                <span class="material-symbols-outlined text-[24px]" style="color: var(--color-secondary)">verified_user</span>
                <div>
                  <p class="text-[11px] uppercase tracking-widest font-medium" style="color: var(--color-on-surface-variant)">Active Now</p>
                  <p class="text-2xl font-bold mt-1" style="color: var(--color-on-surface)">-</p>
                </div>
              </div>
              
              <div class="p-4 rounded-xl border shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow" style="background-color: var(--color-surface-container-lowest); border-color: rgba(195,198,215,0.5)">
                <div class="absolute -right-4 -top-4 w-16 h-16 rounded-full group-hover:scale-150 transition-transform duration-500" style="background-color: rgba(153,97,0,0.1)"></div>
                <span class="material-symbols-outlined text-[24px]" style="color: var(--color-tertiary)">pending_actions</span>
                <div>
                  <p class="text-[11px] uppercase tracking-widest font-medium" style="color: var(--color-on-surface-variant)">Pending Invites</p>
                  <p class="text-2xl font-bold mt-1" style="color: var(--color-on-surface)">-</p>
                </div>
              </div>
              
              <div class="p-4 rounded-xl border shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow" style="background-color: rgba(255,218,214,0.3); border-color: rgba(186,26,26,0.2)">
                <div class="absolute -right-4 -top-4 w-16 h-16 rounded-full group-hover:scale-150 transition-transform duration-500" style="background-color: rgba(186,26,26,0.1)"></div>
                <span class="material-symbols-outlined text-[24px]" style="color: var(--color-error)">lock</span>
                <div>
                  <p class="text-[11px] uppercase tracking-widest font-medium" style="color: var(--color-error)">Locked Accounts</p>
                  <p class="text-2xl font-bold mt-1" style="color: var(--color-on-error-container)">-</p>
                </div>
              </div>
            </div>

            <!-- Main Data Card -->
            <div class="rounded-xl border shadow-sm flex flex-col flex-1 overflow-hidden" style="background-color: var(--color-surface-container-lowest); border-color: rgba(195,198,215,0.5)">
              
              <!-- Toolbar/Filters -->
              <div class="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between" style="border-color: rgba(195,198,215,0.5); background-color: rgba(247,249,251,0.3)">
                <div class="relative w-full md:w-72">
                  <span class="material-symbols-outlined absolute left-2 top-1/2 transform -translate-y-1/2 text-[18px]" style="color: var(--color-on-surface-variant)">search</span>
                  <input class="w-full border rounded-lg py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-1 transition-all placeholder:opacity-60" 
                         style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.5); color: var(--color-on-surface); focus:border-color: var(--color-primary-container); --tw-ring-color: var(--color-primary-container)" 
                         placeholder="Search users, emails..." type="text"
                         [value]="keyword()" (input)="onSearch($event)"/>
                </div>
                
                <div class="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                  <select class="border rounded-lg py-1.5 px-3 text-sm min-w-[120px] outline-none cursor-pointer appearance-none" 
                          style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.5); color: var(--color-on-surface)"
                          [value]="role()" (change)="onRoleChange($event)">
                    <option value="">All Roles</option>
                    <option value="Admin">Administrator</option>
                    <option value="DepartmentStaff">Dept Staff</option>
                    <option value="Citizen">Citizen</option>
                  </select>
                  
                  <select class="border rounded-lg py-1.5 px-3 text-sm min-w-[140px] outline-none cursor-pointer appearance-none" 
                          style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.5); color: var(--color-on-surface)"
                          [value]="departmentId()" (change)="onDeptChange($event)">
                    <option value="">All Departments</option>
                    @for (dept of departments(); track dept.departmentId) {
                      <option [value]="dept.departmentId">{{ dept.departmentName }}</option>
                    }
                  </select>
                  
                  <select class="border rounded-lg py-1.5 px-3 text-sm min-w-[120px] outline-none cursor-pointer appearance-none" 
                          style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.5); color: var(--color-on-surface)"
                          [value]="isActive()" (change)="onStatusChange($event)">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="locked">Locked</option>
                  </select>
                  
                  <button class="border p-1.5 rounded-lg transition-colors flex items-center justify-center hover:bg-black/5" style="background-color: var(--color-surface); color: var(--color-on-surface-variant); border-color: rgba(195,198,215,0.5)">
                    <span class="material-symbols-outlined text-[20px]">filter_list</span>
                  </button>
                </div>
              </div>

              <!-- Table -->
              <div class="overflow-x-auto relative">
                @if (!users() || users().length === 0) {
                  <div class="p-8 text-center text-sm" style="color: var(--color-on-surface-variant)">
                    No users found.
                  </div>
                }
                @if (users() && users().length > 0) {
                  <table class="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr class="border-b text-[11px] uppercase tracking-wider font-medium" style="border-color: rgba(195,198,215,0.5); background-color: rgba(247,249,251,0.2); color: var(--color-on-surface-variant)">
                        <th class="p-4">User</th>
                        <th class="p-4">Role</th>
                        <th class="p-4">Department</th>
                        <th class="p-4">Status</th>
                        <th class="p-4">Created At</th>
                        <th class="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y" style="border-color: rgba(195,198,215,0.3)">
                      @for (user of users(); track user.id) {
                        <tr class="hover:bg-black/5 transition-colors group">
                          <td class="p-4">
                            <div class="flex items-center gap-3">
                              <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-medium" 
                                   [style.background-color]="user.avatar ? 'rgba(37,99,235,0.2)' : 'var(--color-surface-variant)'"
                                   [style.color]="!user.avatar ? 'var(--color-on-surface-variant)' : ''">
                                @if (user.avatar) {
                                  <img [src]="user.avatar" alt="User avatar" class="w-full h-full object-cover" />
                                } @else {
                                  {{ user.initials }}
                                }
                              </div>
                              <div>
                                <p class="font-medium" style="color: var(--color-on-surface)">{{ user.name }}</p>
                                <p class="text-xs" style="color: var(--color-on-surface-variant)">{{ user.email }}</p>
                              </div>
                            </div>
                          </td>
                          <td class="p-4" style="color: var(--color-on-surface-variant)">{{ user.role }}</td>
                          <td class="p-4" style="color: var(--color-on-surface-variant)">{{ user.department }}</td>
                          <td class="p-4">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" [style.background-color]="user.statusBg" [style.color]="user.statusColor">
                              {{ user.status }}
                            </span>
                          </td>
                          <td class="p-4 text-xs" style="color: var(--color-on-surface-variant)">{{ user.lastLogin }}</td>
                          <td class="p-4 text-right">
                            <div class="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                              <!-- Edit Button -->
                              <button (click)="openEditModal(user)" class="p-1 rounded transition-colors hover:bg-black/10" style="color: var(--color-on-surface-variant)" title="Edit User">
                                <span class="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <!-- Toggle Status Button -->
                              <button (click)="toggleLock(user)" class="p-1 rounded transition-colors hover:bg-black/10" [style.color]="user.isActive ? 'var(--color-on-surface-variant)' : 'var(--color-error)'" [title]="user.isActive ? 'Lock User' : 'Unlock User'">
                                <span class="material-symbols-outlined text-[18px]">{{ user.isActive ? 'lock_open' : 'lock' }}</span>
                              </button>
                              <!-- Delete Button -->
                              <button (click)="deleteUser(user)" class="p-1 rounded transition-colors hover:bg-red-500/10 hover:text-red-600" style="color: var(--color-on-surface-variant)" title="Delete User">
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              </div>

              <!-- Pagination -->
              <div class="p-4 border-t flex items-center justify-between mt-auto" style="border-color: rgba(195,198,215,0.5); background-color: rgba(247,249,251,0.3)">
                <p class="text-[11px] font-medium" style="color: var(--color-on-surface-variant)">
                  Showing {{ ((page() - 1) * pageSize()) + (users().length > 0 ? 1 : 0) }} 
                  to {{ ((page() - 1) * pageSize()) + users().length }} 
                  of {{ totalUsers() }} results
                </p>
                
                <div class="flex items-center gap-1">
                  <button class="p-1 rounded transition-colors hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed" 
                          style="color: var(--color-outline)" [disabled]="!hasPrev()" (click)="prevPage()">
                    <span class="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  
                  @for (p of visiblePages(); track p) {
                    @if (p === -1) {
                      <span class="text-sm px-1" style="color: var(--color-on-surface-variant)">...</span>
                    } @else {
                      <button class="w-8 h-8 flex items-center justify-center rounded text-sm transition-colors hover:bg-black/5" 
                              [style.background-color]="p === page() ? 'var(--color-primary-container)' : 'transparent'"
                              [style.color]="p === page() ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)'"
                              [style.font-weight]="p === page() ? '500' : '400'"
                              (click)="goToPage(p)">
                        {{ p }}
                      </button>
                    }
                  }

                  <button class="p-1 rounded transition-colors hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed" 
                          style="color: var(--color-outline)" [disabled]="!hasNext()" (click)="nextPage()">
                    <span class="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      <!-- Create/Edit User Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
          <div class="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden" style="background-color: var(--color-surface)">
            
            <!-- Modal Header -->
            <div class="p-6 border-b border-outline-variant/30 flex items-center justify-between" style="border-color: rgba(195,198,215,0.3)">
              <h2 class="text-xl font-bold" style="color: var(--color-on-surface)">
                {{ editingUserId() ? 'Edit User' : 'Create New User' }}
              </h2>
              <button (click)="closeModal()" class="p-1 rounded-full transition-colors hover:bg-black/5" style="color: var(--color-on-surface-variant)">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6">
              <form [formGroup]="userForm" (ngSubmit)="submitUser()" class="flex flex-col gap-4">
                
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-medium" style="color: var(--color-on-surface-variant)">Full Name <span class="text-red-500">*</span></label>
                  <input formControlName="fullName" type="text" placeholder="e.g. John Doe" class="border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 transition-all" style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.5); color: var(--color-on-surface); focus:border-color: var(--color-primary-container); --tw-ring-color: var(--color-primary-container)" />
                  @if (userForm.get('fullName')?.touched && userForm.get('fullName')?.invalid) {
                    <span class="text-xs text-red-500 mt-1">Full name is required.</span>
                  }
                </div>

                @if (!editingUserId()) {
                  <div class="flex flex-col gap-1">
                    <label class="text-xs font-medium" style="color: var(--color-on-surface-variant)">Email <span class="text-red-500">*</span></label>
                    <input formControlName="email" type="email" placeholder="john.doe@example.com" class="border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 transition-all" style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.5); color: var(--color-on-surface); focus:border-color: var(--color-primary-container); --tw-ring-color: var(--color-primary-container)" />
                    @if (userForm.get('email')?.touched && userForm.get('email')?.invalid) {
                      <span class="text-xs text-red-500 mt-1">A valid email is required.</span>
                    }
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-xs font-medium" style="color: var(--color-on-surface-variant)">Password <span class="text-red-500">*</span></label>
                    <input formControlName="password" type="password" placeholder="At least 6 characters" class="border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 transition-all" style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.5); color: var(--color-on-surface); focus:border-color: var(--color-primary-container); --tw-ring-color: var(--color-primary-container)" />
                    @if (userForm.get('password')?.touched && userForm.get('password')?.invalid) {
                      <span class="text-xs text-red-500 mt-1">Password must be at least 6 characters.</span>
                    }
                  </div>
                }

                <div class="flex flex-col gap-1">
                  <label class="text-xs font-medium" style="color: var(--color-on-surface-variant)">Phone Number</label>
                  <input formControlName="phoneNumber" type="tel" placeholder="+123456789" class="border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 transition-all" style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.5); color: var(--color-on-surface); focus:border-color: var(--color-primary-container); --tw-ring-color: var(--color-primary-container)" />
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-xs font-medium" style="color: var(--color-on-surface-variant)">Role <span class="text-red-500">*</span></label>
                  <select formControlName="role" class="border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 transition-all outline-none cursor-pointer" style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.5); color: var(--color-on-surface); focus:border-color: var(--color-primary-container); --tw-ring-color: var(--color-primary-container)">
                    <option value="Citizen">Citizen</option>
                    <option value="DepartmentStaff">Department Staff</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                @if (userForm.get('role')?.value === 'DepartmentStaff') {
                  <div class="flex flex-col gap-1">
                    <label class="text-xs font-medium" style="color: var(--color-on-surface-variant)">Department <span class="text-red-500">*</span></label>
                    <select formControlName="departmentId" class="border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 transition-all outline-none cursor-pointer" style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.5); color: var(--color-on-surface); focus:border-color: var(--color-primary-container); --tw-ring-color: var(--color-primary-container)">
                      <option [ngValue]="null" disabled>Select Department</option>
                      @for (dept of departments(); track dept.departmentId) {
                        <option [ngValue]="dept.departmentId">{{ dept.departmentName }}</option>
                      }
                    </select>
                    @if (userForm.get('departmentId')?.touched && userForm.get('departmentId')?.invalid) {
                      <span class="text-xs text-red-500 mt-1">Department is required for staff.</span>
                    }
                  </div>
                }
                
                @if (submitError()) {
                  <div class="p-3 mt-2 text-sm rounded bg-red-50 text-red-600 border border-red-200">
                    {{ submitError() }}
                  </div>
                }

                <div class="mt-4 flex justify-end gap-2">
                  <button type="button" (click)="closeModal()" class="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-black/5" style="color: var(--color-on-surface)">
                    Cancel
                  </button>
                  <button type="submit" [disabled]="userForm.invalid || isSubmitting()" class="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2" style="background-color: var(--color-primary); color: var(--color-on-primary)">
                    @if (isSubmitting()) {
                      <span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    }
                    {{ editingUserId() ? 'Update User' : 'Create User' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class UserManagementPage implements OnInit {
  private readonly userService = inject(UserManagementService);
  private readonly datePipe = inject(DatePipe);
  private readonly fb = inject(FormBuilder);

  // Filters state
  readonly page = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly keyword = signal<string>('');
  readonly role = signal<string>('');
  readonly departmentId = signal<string>('');
  readonly isActive = signal<string>('');
  
  // Data State
  readonly refreshTrigger = signal<number>(0);
  readonly departments = signal<DepartmentResponse[]>([]);

  private readonly filter$ = computed<AdminUserListRequest & { _tick: number }>(() => {
    return {
      page: this.page(),
      pageSize: this.pageSize(),
      keyword: this.keyword() || undefined,
      role: this.role() || undefined,
      departmentId: this.departmentId() ? parseInt(this.departmentId(), 10) : undefined,
      isActive: this.isActive() === 'active' ? true : (this.isActive() === 'locked' ? false : undefined),
      _tick: this.refreshTrigger()
    };
  });

  // Reactive data fetch using rxJS toSignal
  readonly dataResult = toSignal(
    toObservable(this.filter$).pipe(
      switchMap(filter => this.userService.getUsers(filter))
    )
  );

  readonly totalUsers = computed(() => this.dataResult()?.totalCount ?? 0);
  readonly totalPages = computed(() => this.dataResult()?.totalPages ?? 1);
  readonly hasNext = computed(() => this.dataResult()?.hasNextPage ?? false);
  readonly hasPrev = computed(() => this.dataResult()?.hasPreviousPage ?? false);

  readonly users = computed<UserRow[]>(() => {
    const data = this.dataResult()?.items;
    if (!data) return [];
    
    return data.map(u => {
      let status = u.isActive ? 'Active' : 'Locked';
      let statusBg = u.isActive ? '#DCFCE7' : '#FEE2E2';
      let statusColor = u.isActive ? '#10B981' : '#B91C1C';

      let initials = u.fullName ? u.fullName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'U';

      // Find dept name
      let deptName = 'All';
      if (u.departmentId) {
        const d = this.departments().find(x => x.departmentId === u.departmentId);
        deptName = d ? d.departmentName : `Dept ${u.departmentId}`;
      }

      return {
        id: u.id,
        name: u.fullName,
        email: u.email,
        avatar: '',
        initials,
        role: u.roles.join(', ') || 'User',
        roleValue: u.roles.length > 0 ? u.roles[0] : 'Citizen',
        department: deptName,
        departmentId: u.departmentId,
        status,
        statusBg,
        statusColor,
        lastLogin: this.datePipe.transform(u.createdAtUtc, 'medium') || 'Never',
        isActive: u.isActive
      };
    });
  });

  // Pagination display logic
  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, -1, total];
    }
    if (current >= total - 2) {
      return [1, -1, total - 3, total - 2, total - 1, total];
    }
    return [1, -1, current - 1, current, current + 1, -1, total];
  });

  // Modal State & Form
  readonly isModalOpen = signal<boolean>(false);
  readonly editingUserId = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  readonly submitError = signal<string | null>(null);

  readonly userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    phoneNumber: [''],
    role: ['Citizen', [Validators.required]],
    departmentId: [null as number | null]
  });

  constructor() {
    // Dynamic validation: departmentId is required if role is DepartmentStaff
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      const deptControl = this.userForm.get('departmentId');
      if (role === 'DepartmentStaff') {
        deptControl?.setValidators([Validators.required]);
      } else {
        deptControl?.clearValidators();
      }
      deptControl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.userService.getDepartments().subscribe({
      next: (depts) => {
        this.departments.set(depts);
      },
      error: (err) => console.error('Failed to load departments', err)
    });
  }

  openCreateModal() {
    this.submitError.set(null);
    this.editingUserId.set(null);
    this.userForm.reset({ role: 'Citizen' });
    
    // Enable email and password for creation
    this.userForm.get('email')?.enable();
    this.userForm.get('password')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();

    this.isModalOpen.set(true);
  }

  openEditModal(user: UserRow) {
    this.submitError.set(null);
    this.editingUserId.set(user.id);
    
    this.userForm.reset({
      email: user.email,
      fullName: user.name,
      phoneNumber: '', // We don't have this in table row, ideally fetch by ID but form supports empty
      role: user.roleValue,
      departmentId: user.departmentId || null
    });

    // Disable email and password fields for edit
    this.userForm.get('email')?.disable();
    this.userForm.get('password')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  submitUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const formValue = this.userForm.getRawValue(); // getRawValue includes disabled fields
    const editingId = this.editingUserId();

    if (editingId) {
      // Edit mode
      const request: UpdateUserByAdminRequest = {
        fullName: formValue.fullName!,
        phoneNumber: formValue.phoneNumber || undefined,
        role: formValue.role!,
        departmentId: formValue.departmentId || undefined
      };

      this.userService.updateUser(editingId, request).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.refreshTrigger.update(v => v + 1);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.submitError.set(err.error?.message || 'An error occurred while updating the user.');
        }
      });
    } else {
      // Create mode
      const request: CreateUserByAdminRequest = {
        email: formValue.email!,
        password: formValue.password!,
        fullName: formValue.fullName!,
        phoneNumber: formValue.phoneNumber || undefined,
        role: formValue.role!,
        departmentId: formValue.departmentId || undefined
      };

      this.userService.createUser(request).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.refreshTrigger.update(v => v + 1);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.submitError.set(err.error?.message || 'An error occurred while creating the user.');
        }
      });
    }
  }

  toggleLock(user: UserRow) {
    const newStatus = !user.isActive;
    this.userService.setUserStatus(user.id, newStatus).subscribe({
      next: () => {
        this.refreshTrigger.update(v => v + 1);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update user status.');
      }
    });
  }

  deleteUser(user: UserRow) {
    if (confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.refreshTrigger.update(v => v + 1);
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to delete user.');
        }
      });
    }
  }

  // Actions
  onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.keyword.set(val);
    this.page.set(1);
  }
  
  onRoleChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.role.set(val);
    this.page.set(1);
  }
  
  onDeptChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.departmentId.set(val);
    this.page.set(1);
  }
  
  onStatusChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.isActive.set(val);
    this.page.set(1);
  }
  
  prevPage() { if (this.hasPrev()) this.page.update(p => p - 1); }
  nextPage() { if (this.hasNext()) this.page.update(p => p + 1); }
  goToPage(p: number) { this.page.set(p); }
}

