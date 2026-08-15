import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { EscalationRulesService, EscalationRuleResponse, CreateEscalationRuleRequest, UpdateEscalationRuleRequest } from './services/escalation-rules.service';
import { SlaManagementService, SlaPolicyResponse } from './services/sla-management.service';
import { DepartmentManagementService, DepartmentResponse } from './services/department-management.service';

@Component({
  selector: 'app-escalation-rules-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="flex min-h-screen overflow-hidden" style="background-color: var(--color-background)">
      <!-- Shared Sidebar -->
      <app-admin-sidebar #sidebar></app-admin-sidebar>

      <!-- Main Column -->
      <div
        class="flex flex-1 flex-col min-w-0 transition-all duration-300"
        [style.margin-left]="sidebar.open() ? '280px' : '0px'"
      >
        <!-- Top App Bar (Mobile) -->
        <header class="md:hidden sticky top-0 z-30 flex justify-between items-center w-full px-4 py-2 border-b border-[var(--color-outline-variant)]" style="background: rgba(248, 250, 252, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[var(--color-on-surface)]" (click)="sidebar.toggle()">menu</span>
            <span class="font-bold text-[20px] text-[var(--color-on-surface)]">Escalation Rules</span>
          </div>
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px]" style="background-color: var(--color-primary-container); color: var(--color-on-primary)">UI</div>
        </header>

        <div class="flex-1 overflow-y-auto">
          <!-- Content Canvas -->
          <div class="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
            <!-- Page Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 class="text-[24px] md:text-[28px] font-bold text-[var(--color-on-surface)]">Escalation Rules</h2>
                <p class="text-[14px] text-[var(--color-on-surface-variant)] mt-1">Configure auto-escalation rules when SLAs are breached.</p>
              </div>
              <button (click)="openAddModal()" class="text-[12px] font-medium py-2 px-4 rounded-lg flex items-center gap-1 shadow-sm transition-colors" style="background-color: var(--color-primary-container); color: var(--color-on-primary-container);">
                <span class="material-symbols-outlined" style="font-size: 18px;">add</span>
                New Rule
              </button>
            </div>

            <!-- Data Table Card -->
            <div class="rounded-xl overflow-hidden flex-1" style="background-color: var(--color-surface-container-lowest); box-shadow: 0px 4px 20px rgba(0,0,0,0.05); border: 1px solid rgba(195, 198, 215, 0.3);">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr style="background-color: var(--color-surface-container-low); border-bottom: 1px solid rgba(195, 198, 215, 0.5);">
                      <th class="text-[12px] font-semibold py-2 px-6" style="color: var(--color-on-surface-variant)">SLA Policy</th>
                      <th class="text-[12px] font-semibold py-2 px-6" style="color: var(--color-on-surface-variant)">Overdue</th>
                      <th class="text-[12px] font-semibold py-2 px-6" style="color: var(--color-on-surface-variant)">Level</th>
                      <th class="text-[12px] font-semibold py-2 px-6" style="color: var(--color-on-surface-variant)">Target</th>
                      <th class="text-[12px] font-semibold py-2 px-6" style="color: var(--color-on-surface-variant)">Status</th>
                      <th class="text-[12px] font-semibold py-2 px-6 text-right" style="color: var(--color-on-surface-variant)">Actions</th>
                    </tr>
                  </thead>
                  <tbody style="border-top: 1px solid rgba(195, 198, 215, 0.3);">
                    @for (rule of rules(); track rule.id) {
                    <tr class="transition-colors cursor-pointer group hover:bg-[var(--color-surface-container-low)]" style="border-bottom: 1px solid rgba(195, 198, 215, 0.3);">
                      <td class="py-4 px-6 text-[14px]" style="color: var(--color-on-surface)">
                         {{ getSlaPolicyName(rule.slaPolicyId) }}
                      </td>
                      <td class="py-4 px-6 text-[14px]" style="color: var(--color-error)">+{{ rule.overdueMinutes }} min</td>
                      <td class="py-4 px-6">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium" style="background-color: var(--color-surface-variant); color: var(--color-on-surface-variant)">Level {{ rule.escalationLevel }}</span>
                      </td>
                      <td class="py-4 px-6 text-[14px]" style="color: var(--color-on-surface-variant)">
                        @if (rule.targetDepartmentId) {
                          <div class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">domain</span> {{ rule.targetDepartmentName }}</div>
                        }
                        @if (rule.targetRoleName) {
                          <div class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">badge</span> {{ rule.targetRoleName }}</div>
                        }
                      </td>
                      <td class="py-4 px-6">
                        @if (rule.isActive) {
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium" style="background-color: rgba(108, 248, 187, 0.5); color: var(--color-secondary)">Active</span>
                        } @else {
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium" style="background-color: var(--color-surface-variant); color: var(--color-on-surface-variant)">Inactive</span>
                        }
                      </td>
                      <td class="py-4 px-6 text-right">
                        <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button (click)="openEditModal(rule)" class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--color-surface-variant)]" style="color: var(--color-on-surface-variant)" title="Edit">
                            <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
                          </button>
                          <button (click)="deleteRule(rule.id)" class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[rgba(255,218,214,0.5)]" style="color: var(--color-error)" title="Delete">
                            <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    }
                    @if (rules().length === 0) {
                      <tr>
                        <td colspan="6" class="py-8 text-center text-[14px] text-[var(--color-on-surface-variant)]">
                          No Escalation Rules found.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
    <!-- ── Add / Edit Modal ── -->
    @if (showModal()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(25,28,30,0.45); backdrop-filter: blur(4px);"
        (click)="closeModal()"
      >
        <div
          class="w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl flex flex-col"
          style="background-color: var(--color-surface); max-height: 90vh;"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal header -->
          <div
            class="flex items-center justify-between border-b px-6 py-4 shrink-0"
            style="border-color: var(--color-outline-variant)"
          >
            <h3 class="text-[18px] font-bold" style="color: var(--color-on-surface)">
              {{ editingRule() ? 'Edit Escalation Rule' : 'New Escalation Rule' }}
            </h3>
            <button
              (click)="closeModal()"
              class="rounded-xl p-2 transition-colors hover:bg-[var(--color-surface-container-high)]"
              style="color: var(--color-on-surface-variant)"
            >
              <span class="material-symbols-outlined" style="font-size:20px">close</span>
            </button>
          </div>

          <!-- Modal body -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <div class="rounded-xl p-6 border shadow-sm relative overflow-hidden" style="background-color: var(--color-surface-container-lowest); border-color: var(--color-outline-variant);">
              <div class="absolute top-0 left-0 w-full h-1 opacity-80" style="background-color: var(--color-surface-tint)"></div>
              
              <h3 class="text-[18px] font-semibold mb-4 flex items-center gap-2" style="color: var(--color-on-surface)">
                <span class="material-symbols-outlined text-[var(--color-primary)]">trending_up</span>
                Rule Details
              </h3>
              
              <div class="space-y-4">
                <!-- SLA Policy -->
                <div>
                  <label class="block text-[12px] font-medium mb-1" style="color: var(--color-on-surface-variant)">Triggering SLA Policy <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <select [(ngModel)]="modalForm.slaPolicyId" class="w-full appearance-none rounded-lg px-4 py-2 text-[14px] outline-none border transition-shadow focus:border-[var(--color-primary)]" style="background-color: var(--color-surface-container-lowest); border-color: var(--color-outline-variant); color: var(--color-on-surface);">
                      <option value="">-- Select SLA Policy --</option>
                      @for (p of slaPolicies(); track p.id) {
                        <option [value]="p.id">[{{ p.issueTypeName }}] - Priority: {{ p.priorityName }}</option>
                      }
                    </select>
                    <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style="color: var(--color-outline)">expand_more</span>
                  </div>
                </div>
                
                <!-- Timing & Level Grid -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[12px] font-medium mb-1" style="color: var(--color-on-surface-variant)">Overdue Minutes <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="modalForm.overdueMinutes" type="number" min="1" class="w-full rounded-lg px-4 py-2 text-[14px] outline-none border transition-shadow focus:border-[var(--color-primary)]" style="background-color: var(--color-surface-container-lowest); border-color: var(--color-outline-variant); color: var(--color-on-surface);"/>
                  </div>
                  <div>
                    <label class="block text-[12px] font-medium mb-1" style="color: var(--color-on-surface-variant)">Escalation Level <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="modalForm.escalationLevel" type="number" min="1" class="w-full rounded-lg px-4 py-2 text-[14px] outline-none border transition-shadow focus:border-[var(--color-primary)]" style="background-color: var(--color-surface-container-lowest); border-color: var(--color-outline-variant); color: var(--color-on-surface);"/>
                  </div>
                </div>

                <!-- Target Department -->
                <div>
                  <label class="block text-[12px] font-medium mb-1" style="color: var(--color-on-surface-variant)">Target Department</label>
                  <div class="relative">
                    <select [(ngModel)]="modalForm.targetDepartmentId" class="w-full appearance-none rounded-lg px-4 py-2 text-[14px] outline-none border transition-shadow focus:border-[var(--color-primary)]" style="background-color: var(--color-surface-container-lowest); border-color: var(--color-outline-variant); color: var(--color-on-surface);">
                      <option [ngValue]="null">-- None --</option>
                      @for (d of departments(); track d.departmentId) {
                        <option [ngValue]="d.departmentId">{{ d.departmentName }}</option>
                      }
                    </select>
                    <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style="color: var(--color-outline)">expand_more</span>
                  </div>
                </div>

                <!-- Target Role -->
                <div>
                  <label class="block text-[12px] font-medium mb-1" style="color: var(--color-on-surface-variant)">Target Role</label>
                  <div class="relative">
                    <select [(ngModel)]="modalForm.targetRoleName" class="w-full appearance-none rounded-lg px-4 py-2 text-[14px] outline-none border transition-shadow focus:border-[var(--color-primary)]" style="background-color: var(--color-surface-container-lowest); border-color: var(--color-outline-variant); color: var(--color-on-surface);">
                      <option [ngValue]="null">-- None --</option>
                      <option value="Admin">Admin</option>
                      <option value="DepartmentManager">Department Manager</option>
                      <option value="DepartmentStaff">Department Staff</option>
                      <option value="Citizen">Citizen</option>
                    </select>
                    <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style="color: var(--color-outline)">expand_more</span>
                  </div>
                  <p class="text-[11px] text-[var(--color-error)] mt-1" *ngIf="!modalForm.targetDepartmentId && !modalForm.targetRoleName">
                    Must select either Target Department or Target Role (or both).
                  </p>
                </div>

                <!-- Notification -->
                <div>
                  <label class="block text-[12px] font-medium mb-1" style="color: var(--color-on-surface-variant)">Notification Title</label>
                  <input [(ngModel)]="modalForm.notificationTitle" type="text" placeholder="E.g. SLA Breach Alert" class="w-full rounded-lg px-4 py-2 text-[14px] outline-none border transition-shadow focus:border-[var(--color-primary)]" style="background-color: var(--color-surface-container-lowest); border-color: var(--color-outline-variant); color: var(--color-on-surface);"/>
                </div>
                <div>
                  <label class="block text-[12px] font-medium mb-1" style="color: var(--color-on-surface-variant)">Notification Template</label>
                  <textarea [(ngModel)]="modalForm.notificationTemplate" rows="3" placeholder="You can use {IssueId}, {Time} variables." class="w-full rounded-lg px-4 py-2 text-[14px] outline-none border transition-shadow focus:border-[var(--color-primary)]" style="background-color: var(--color-surface-container-lowest); border-color: var(--color-outline-variant); color: var(--color-on-surface); resize: none;"></textarea>
                </div>

                <!-- Is Active -->
                <div class="flex items-center gap-2 pt-2">
                  <input type="checkbox" [(ngModel)]="modalForm.isActive" id="isActiveCheck" class="w-4 h-4 rounded" style="accent-color: var(--color-primary);">
                  <label for="isActiveCheck" class="text-[14px]" style="color: var(--color-on-surface)">Active</label>
                </div>

              </div>
            </div>
          </div>

          <!-- Modal footer -->
          <div
            class="flex items-center justify-end gap-2 border-t px-6 py-4 shrink-0"
            style="border-color: var(--color-outline-variant); background-color: var(--color-surface-container-lowest)"
          >
            <button
              (click)="closeModal()"
              class="rounded-lg px-4 py-2 text-[14px] font-medium transition-colors hover:bg-[var(--color-surface-container-high)]"
              style="color: var(--color-on-surface-variant)"
            >
              Cancel
            </button>
            <button
              (click)="saveRule()"
              [disabled]="saving() || !isValidForm"
              class="rounded-lg px-5 py-2 text-[14px] font-semibold transition-all disabled:opacity-50"
              style="background-color: var(--color-primary); color: var(--color-on-primary);"
            >
              {{ saving() ? 'Saving...' : 'Save Rule' }}
            </button>
          </div>
        </div>
      </div>
    }
      </div><!-- /main column -->
    </div>
  `
})
export class EscalationRulesManagementPage implements OnInit {
  private readonly ruleService = inject(EscalationRulesService);
  private readonly slaService = inject(SlaManagementService);
  private readonly deptService = inject(DepartmentManagementService);

  readonly rules = signal<EscalationRuleResponse[]>([]);
  readonly slaPolicies = signal<SlaPolicyResponse[]>([]);
  readonly departments = signal<DepartmentResponse[]>([]);

  readonly showModal = signal(false);
  readonly saving = signal(false);
  readonly editingRule = signal<EscalationRuleResponse | null>(null);

  modalForm = {
    slaPolicyId: '',
    overdueMinutes: 30,
    targetDepartmentId: null as number | null,
    targetRoleName: null as string | null,
    escalationLevel: 1,
    notificationTitle: '',
    notificationTemplate: '',
    isActive: true
  };

  ngOnInit() {
    this.loadRules();
    this.loadDependencies();
  }

  loadRules() {
    this.ruleService.getAll().subscribe({
      next: (res) => this.rules.set(res),
      error: (err) => alert('Failed to load escalation rules')
    });
  }

  loadDependencies() {
    this.slaService.getSlaPolicies(1, 100).subscribe(res => {
      this.slaPolicies.set(res.items);
    });
    this.deptService.getDepartments().subscribe(res => {
      this.departments.set(res);
    });
  }

  getSlaPolicyName(id: string): string {
    const policy = this.slaPolicies().find(p => p.id === id);
    if (!policy) return id;
    return `[${policy.issueTypeName}] - ${policy.priorityName}`;
  }

  openAddModal() {
    this.editingRule.set(null);
    this.modalForm = {
      slaPolicyId: '',
      overdueMinutes: 30,
      targetDepartmentId: null,
      targetRoleName: null,
      escalationLevel: 1,
      notificationTitle: '',
      notificationTemplate: '',
      isActive: true
    };
    this.showModal.set(true);
  }

  openEditModal(rule: EscalationRuleResponse) {
    this.editingRule.set(rule);
    this.modalForm = {
      slaPolicyId: rule.slaPolicyId,
      overdueMinutes: rule.overdueMinutes,
      targetDepartmentId: rule.targetDepartmentId ?? null,
      targetRoleName: rule.targetRoleName ?? null,
      escalationLevel: rule.escalationLevel,
      notificationTitle: rule.notificationTitle ?? '',
      notificationTemplate: rule.notificationTemplate ?? '',
      isActive: rule.isActive
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  get isValidForm(): boolean {
    if (!this.modalForm.slaPolicyId) return false;
    if (this.modalForm.overdueMinutes <= 0) return false;
    if (this.modalForm.escalationLevel <= 0) return false;
    if (!this.modalForm.targetDepartmentId && !this.modalForm.targetRoleName) return false;
    return true;
  }

  saveRule() {
    if (!this.isValidForm) return;

    this.saving.set(true);
    
    // Normalize empty strings to null
    const request = {
      ...this.modalForm,
      targetDepartmentId: this.modalForm.targetDepartmentId || undefined,
      targetRoleName: this.modalForm.targetRoleName || undefined,
      notificationTitle: this.modalForm.notificationTitle || undefined,
      notificationTemplate: this.modalForm.notificationTemplate || undefined,
    };

    const currentEditing = this.editingRule();
    const req$ = currentEditing
      ? this.ruleService.update(currentEditing.id, request)
      : this.ruleService.create(request);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadRules();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err.error?.message || 'Error saving rule';
        alert(msg);
      }
    });
  }

  deleteRule(id: string) {
    if (confirm('Are you sure you want to delete this escalation rule?')) {
      this.ruleService.delete(id).subscribe({
        next: () => this.loadRules(),
        error: () => alert('Error deleting rule')
      });
    }
  }
}
