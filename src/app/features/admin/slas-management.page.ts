import { Component, signal, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { AdminSidebarComponent } from './admin-sidebar.component'
import { 
  SlaManagementService, 
  SlaPolicyResponse, 
  IssueTypeLookupResponse, 
  IssuePriorityResponse 
} from './services/sla-management.service'

@Component({
  selector: 'app-slas-management',
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
            <span class="font-bold text-[20px] text-[var(--color-on-surface)]">SLA Management</span>
          </div>
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px]" style="background-color: var(--color-primary-container); color: var(--color-on-primary)">UI</div>
        </header>

        <div class="flex-1 overflow-y-auto">
          <!-- Content Canvas -->
          <div class="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
            <!-- Page Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 class="text-[24px] md:text-[28px] font-bold text-[var(--color-on-surface)]">SLA Management</h2>
                <p class="text-[14px] text-[var(--color-on-surface-variant)] mt-1">Configure and monitor Service Level Agreements for incident response.</p>
              </div>
              <button (click)="openAddModal()" class="text-[12px] font-medium py-2 px-4 rounded-lg flex items-center gap-1 shadow-sm transition-colors" style="background-color: var(--color-primary-container); color: var(--color-on-primary-container);">
                <span class="material-symbols-outlined" style="font-size: 18px;">add</span>
                New Policy
              </button>
            </div>

            <!-- Toolbar: Search & Filters -->
            <div class="rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between" style="background-color: var(--color-surface-container-lowest); box-shadow: 0px 4px 20px rgba(0,0,0,0.05); border: 1px solid rgba(195, 198, 215, 0.3);">
              <!-- Search -->
              <div class="relative w-full sm:w-96">
                <span class="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2" style="font-size: 20px; color: var(--color-on-surface-variant)">search</span>
                <input [(ngModel)]="searchKeyword" (keyup.enter)="onSearch()" class="w-full pl-9 pr-2 py-2 rounded-lg outline-none transition-all text-[14px]" style="background-color: var(--color-surface); border: 1px solid var(--color-outline-variant); color: var(--color-on-surface);" placeholder="Search incident types (press enter)..." type="text"/>
              </div>

              <!-- Filters -->
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <div class="relative flex-1 sm:flex-none">
                  <select [(ngModel)]="selectedPriority" (change)="onFilter()" class="w-full sm:w-auto appearance-none rounded-lg pl-4 pr-8 py-2 text-[12px] font-medium outline-none cursor-pointer" style="background-color: var(--color-surface); border: 1px solid var(--color-outline-variant); color: var(--color-on-surface);">
                    <option [ngValue]="null">All Priorities</option>
                    @for (p of issuePriorities(); track p.priorityId) {
                      <option [ngValue]="p.priorityId">{{ p.priorityName }}</option>
                    }
                  </select>
                  <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style="font-size: 18px; color: var(--color-on-surface-variant)">arrow_drop_down</span>
                </div>
              </div>
            </div>

            <!-- Data Table Card -->
            <div class="rounded-xl overflow-hidden flex-1" style="background-color: var(--color-surface-container-lowest); box-shadow: 0px 4px 20px rgba(0,0,0,0.05); border: 1px solid rgba(195, 198, 215, 0.3);">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr style="background-color: var(--color-surface-container-low); border-bottom: 1px solid rgba(195, 198, 215, 0.5);">
                      <th class="text-[12px] font-semibold py-2 px-6" style="color: var(--color-on-surface-variant)">Incident Type</th>
                      <th class="text-[12px] font-semibold py-2 px-6" style="color: var(--color-on-surface-variant)">Priority</th>
                      <th class="text-[12px] font-semibold py-2 px-6" style="color: var(--color-on-surface-variant)">Response Time</th>
                      <th class="text-[12px] font-semibold py-2 px-6" style="color: var(--color-on-surface-variant)">Resolution Time</th>
                      <th class="text-[12px] font-semibold py-2 px-6" style="color: var(--color-on-surface-variant)">Status</th>
                      <th class="text-[12px] font-semibold py-2 px-6 text-right" style="color: var(--color-on-surface-variant)">Actions</th>
                    </tr>
                  </thead>
                  <tbody style="border-top: 1px solid rgba(195, 198, 215, 0.3);">
                    @for (policy of policies(); track policy.id) {
                    <tr class="transition-colors cursor-pointer group hover:bg-[var(--color-surface-container-low)]" style="border-bottom: 1px solid rgba(195, 198, 215, 0.3);">
                      <td class="py-4 px-6">
                        <div class="flex items-center gap-2">
                          <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background-color: var(--color-surface-variant); color: var(--color-on-surface-variant)">
                            <span class="material-symbols-outlined" style="font-size: 16px;">receipt_long</span>
                          </div>
                          <span class="text-[14px] font-medium" style="color: var(--color-on-surface)">{{ policy.issueTypeName }}</span>
                        </div>
                      </td>
                      <td class="py-4 px-6">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium" style="background-color: var(--color-surface-variant); color: var(--color-on-surface-variant)">{{ policy.priorityName }}</span>
                      </td>
                      <td class="py-4 px-6 text-[14px]" style="color: var(--color-on-surface-variant)">{{ formatMinutes(policy.firstResponseMinutes) }}</td>
                      <td class="py-4 px-6 text-[14px]" style="color: var(--color-on-surface-variant)">{{ formatMinutes(policy.resolutionMinutes) }}</td>
                      <td class="py-4 px-6">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium" style="background-color: rgba(108, 248, 187, 0.5); color: var(--color-secondary)">Active</span>
                      </td>
                      <td class="py-4 px-6 text-right">
                        <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button (click)="openEditModal(policy)" class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--color-surface-variant)]" style="color: var(--color-on-surface-variant)" title="Edit">
                            <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
                          </button>
                          <button (click)="deletePolicy(policy.id)" class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[rgba(255,218,214,0.5)]" style="color: var(--color-error)" title="Delete">
                            <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    }
                    @if (policies().length === 0) {
                      <tr>
                        <td colspan="6" class="py-8 text-center text-[14px] text-[var(--color-on-surface-variant)]">
                          No SLA policies found.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              
              <!-- Pagination -->
              <div class="px-6 py-2 flex items-center justify-between" style="border-top: 1px solid rgba(195, 198, 215, 0.3); background-color: var(--color-surface-container-lowest);">
                <span class="text-[14px]" style="color: var(--color-on-surface-variant)">
                  Showing {{ policies().length > 0 ? (currentPage() - 1) * pageSize() + 1 : 0 }} to {{ Math.min(currentPage() * pageSize(), totalItems()) }} of {{ totalItems() }} policies
                </span>
                <div class="flex items-center gap-2">
                  <button (click)="previousPage()" [disabled]="currentPage() === 1" class="text-[12px] font-medium py-1 px-3 rounded-md transition-colors disabled:opacity-50" style="background-color: var(--color-surface-container-high); color: var(--color-on-surface);">
                    Previous
                  </button>
                  <span class="text-[12px] font-medium text-[var(--color-on-surface)]">Page {{ currentPage() }}</span>
                  <button (click)="nextPage()" [disabled]="currentPage() * pageSize() >= totalItems()" class="text-[12px] font-medium py-1 px-3 rounded-md transition-colors disabled:opacity-50" style="background-color: var(--color-surface-container-high); color: var(--color-on-surface);">
                    Next
                  </button>
                </div>
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
              {{ editingPolicy() ? 'Edit SLA Policy' : 'New SLA Policy' }}
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
            <!-- Core Rules Card -->
            <div class="rounded-xl p-6 border shadow-sm relative overflow-hidden" style="background-color: var(--color-surface-container-lowest); border-color: var(--color-outline-variant);">
              <!-- Decorative top accent -->
              <div class="absolute top-0 left-0 w-full h-1 opacity-80" style="background-color: var(--color-surface-tint)"></div>
              
              <h3 class="text-[18px] font-semibold mb-4 flex items-center gap-2" style="color: var(--color-on-surface)">
                <span class="material-symbols-outlined text-[var(--color-primary)]">rule_settings</span>
                SLA Definition
              </h3>
              
              <div class="space-y-6">
                <!-- Category Dropdown -->
                <div>
                  <label class="block text-[12px] font-medium mb-1" style="color: var(--color-on-surface-variant)">Incident Category</label>
                  <div class="relative">
                    <select [(ngModel)]="modalForm.issueTypeId" class="w-full appearance-none rounded-lg px-4 py-2 text-[14px] outline-none transition-shadow shadow-sm" style="background-color: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); color: var(--color-on-surface);">
                      @for (cat of issueTypes(); track cat.issueTypeId) {
                        <option [ngValue]="cat.issueTypeId">{{ cat.typeName }}</option>
                      }
                    </select>
                    <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style="color: var(--color-outline)">expand_more</span>
                  </div>
                </div>
                
                <!-- Priority Level Segmented Control -->
                <div>
                  <label class="block text-[12px] font-medium mb-1" style="color: var(--color-on-surface-variant)">Priority Level</label>
                  <div class="flex p-1 rounded-lg border" style="background-color: var(--color-surface-container-low); border-color: rgba(195, 198, 215, 0.3);">
                    @for (p of issuePriorities(); track p.priorityId) {
                      <button 
                        (click)="modalForm.priorityId = p.priorityId"
                        class="flex-1 py-1 text-[12px] rounded-md transition-all"
                        [class]="modalForm.priorityId === p.priorityId 
                          ? 'font-semibold shadow-sm border bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] border-[rgba(195,198,215,0.5)]' 
                          : 'font-medium text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'"
                      >{{ p.priorityName }}</button>
                    }
                  </div>
                </div>
                
                <!-- Time Targets Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="p-4 rounded-lg border" style="background-color: var(--color-surface-bright); border-color: rgba(195, 198, 215, 0.3);">
                    <label class="block text-[12px] font-medium mb-2 flex items-center gap-1" style="color: var(--color-on-surface-variant)">
                      <span class="material-symbols-outlined text-[16px]">timer</span>
                      Target Response Time
                    </label>
                    <div class="flex items-center gap-2">
                      <input [(ngModel)]="modalForm.responseValue" class="w-20 rounded-lg px-2 py-2 text-[14px] outline-none text-center" style="background-color: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); color: var(--color-on-surface);" type="number" min="1"/>
                      <select [(ngModel)]="modalForm.responseUnit" class="flex-1 appearance-none rounded-lg px-2 py-2 text-[14px] outline-none" style="background-color: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); color: var(--color-on-surface);">
                        <option>Minutes</option>
                        <option>Hours</option>
                        <option>Days</option>
                        <option>Weeks</option>
                      </select>
                    </div>
                    <p class="text-[11px] font-medium mt-1" style="color: var(--color-outline)">Time to acknowledge incident.</p>
                  </div>
                  
                  <div class="p-4 rounded-lg border" style="background-color: var(--color-surface-bright); border-color: rgba(195, 198, 215, 0.3);">
                    <label class="block text-[12px] font-medium mb-2 flex items-center gap-1" style="color: var(--color-on-surface-variant)">
                      <span class="material-symbols-outlined text-[16px]">task_alt</span>
                      Target Resolution Time
                    </label>
                    <div class="flex items-center gap-2">
                      <input [(ngModel)]="modalForm.resolutionValue" class="w-20 rounded-lg px-2 py-2 text-[14px] outline-none text-center" style="background-color: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); color: var(--color-on-surface);" type="number" min="1"/>
                      <select [(ngModel)]="modalForm.resolutionUnit" class="flex-1 appearance-none rounded-lg px-2 py-2 text-[14px] outline-none" style="background-color: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); color: var(--color-on-surface);">
                        <option>Minutes</option>
                        <option>Hours</option>
                        <option>Days</option>
                        <option>Weeks</option>
                      </select>
                    </div>
                    <p class="text-[11px] font-medium mt-1" style="color: var(--color-outline)">Time to completely resolve.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal footer -->
          <div
            class="flex items-center justify-end gap-3 border-t px-6 py-4 shrink-0"
            style="border-color: var(--color-outline-variant)"
          >
            <button
              (click)="closeModal()"
              class="rounded-xl border px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-[var(--color-surface-container)]"
              style="border-color: var(--color-outline-variant); color: var(--color-on-surface)"
            >Cancel</button>
            <button
              (click)="saveModal()"
              class="rounded-xl px-5 py-2.5 text-[14px] font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
              style="background-color: var(--color-primary-container); color: var(--color-on-primary-container)"
            >
              {{ editingPolicy() ? 'Save Changes' : 'Create Policy' }}
            </button>
          </div>
        </div>
      </div>
    }
    </div>
  `
})
export class SlasManagementPage implements OnInit {
  private slaService = inject(SlaManagementService);
  Math = Math;

  policies = signal<SlaPolicyResponse[]>([]);
  issueTypes = signal<IssueTypeLookupResponse[]>([]);
  issuePriorities = signal<IssuePriorityResponse[]>([]);

  // Pagination & Filtering
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  searchKeyword = signal('');
  selectedPriority = signal<number | null>(null);

  showModal = signal(false);
  editingPolicy = signal<SlaPolicyResponse | null>(null);

  modalForm = {
    issueTypeId: null as number | null,
    priorityId: null as number | null,
    responseValue: 4,
    responseUnit: 'Hours',
    resolutionValue: 48,
    resolutionUnit: 'Hours'
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.slaService.getSlaPolicies(
      this.currentPage(),
      this.pageSize(),
      this.searchKeyword() || undefined,
      this.selectedPriority() || undefined
    ).subscribe(res => {
      this.policies.set(res.items);
      this.totalItems.set(res.totalCount);
    });

    this.slaService.getIssueTypes().subscribe(items => {
      const childTypes = items.filter(t => t.parentIssueTypeId != null);
      this.issueTypes.set(childTypes);
    });
    this.slaService.getIssuePriorities().subscribe(res => this.issuePriorities.set(res));
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadData();
  }

  onFilter() {
    this.currentPage.set(1);
    this.loadData();
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadData();
    }
  }

  nextPage() {
    if (this.currentPage() * this.pageSize() < this.totalItems()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadData();
    }
  }

  // Formatting helpers
  formatMinutes(minutes: number): string {
    if (!minutes) return '0m';
    if (minutes >= 10080 && minutes % 10080 === 0) {
      return `${minutes / 10080}w`;
    }
    if (minutes >= 1440 && minutes % 1440 === 0) {
      return `${minutes / 1440}d`;
    }
    if (minutes >= 60 && minutes % 60 === 0) {
      return `${minutes / 60}h`;
    }
    return `${minutes}m`;
  }

  parseMinutesToForm(minutes: number, isResolution: boolean) {
    let val = minutes;
    let unit = 'Minutes';
    if (minutes >= 10080 && minutes % 10080 === 0) {
      val = minutes / 10080;
      unit = 'Weeks';
    } else if (minutes >= 1440 && minutes % 1440 === 0) {
      val = minutes / 1440;
      unit = 'Days';
    } else if (minutes >= 60 && minutes % 60 === 0) {
      val = minutes / 60;
      unit = 'Hours';
    }

    if (isResolution) {
      this.modalForm.resolutionValue = val;
      this.modalForm.resolutionUnit = unit;
    } else {
      this.modalForm.responseValue = val;
      this.modalForm.responseUnit = unit;
    }
  }

  getFormMinutes(val: number, unit: string): number {
    if (unit === 'Weeks') return val * 10080;
    if (unit === 'Days') return val * 1440;
    if (unit === 'Hours') return val * 60;
    return val;
  }

  openAddModal() {
    this.editingPolicy.set(null);
    this.modalForm = {
      issueTypeId: this.issueTypes().length > 0 ? this.issueTypes()[0].issueTypeId : null,
      priorityId: this.issuePriorities().length > 0 ? this.issuePriorities()[0].priorityId : null,
      responseValue: 4,
      responseUnit: 'Hours',
      resolutionValue: 48,
      resolutionUnit: 'Hours'
    };
    this.showModal.set(true);
  }

  openEditModal(policy: SlaPolicyResponse) {
    this.editingPolicy.set(policy);
    this.modalForm.issueTypeId = policy.issueTypeId;
    this.modalForm.priorityId = policy.priorityId;
    this.parseMinutesToForm(policy.firstResponseMinutes, false);
    this.parseMinutesToForm(policy.resolutionMinutes, true);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveModal() {
    if (!this.modalForm.issueTypeId || !this.modalForm.priorityId) {
      alert("Please select category and priority.");
      return;
    }
    
    const request = {
      issueTypeId: this.modalForm.issueTypeId,
      priorityId: this.modalForm.priorityId,
      firstResponseMinutes: this.getFormMinutes(this.modalForm.responseValue, this.modalForm.responseUnit),
      resolutionMinutes: this.getFormMinutes(this.modalForm.resolutionValue, this.modalForm.resolutionUnit)
    };

    const editing = this.editingPolicy();
    if (editing) {
      this.slaService.updateSlaPolicy(editing.id, request).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: (err) => alert("Error updating SLA Policy: " + (err.error?.message || err.message))
      });
    } else {
      this.slaService.createSlaPolicy(request).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: (err) => alert("Error creating SLA Policy: " + (err.error?.message || err.message))
      });
    }
  }

  deletePolicy(id: string) {
    if (confirm("Are you sure you want to delete this policy?")) {
      this.slaService.deleteSlaPolicy(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert("Error deleting SLA Policy: " + (err.message))
      });
    }
  }
}
