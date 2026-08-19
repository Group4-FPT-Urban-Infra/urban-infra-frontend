import { Component, signal, computed, OnInit, inject, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { AdminSidebarComponent } from './admin-sidebar.component'
import {
  DepartmentManagementService,
  DepartmentResponse,
  CreateDepartmentRequest,
  DepartmentMemberResponse,
} from './services/department-management.service'
import { AreaManagementService, AreaResponse } from './services/area-management.service'
import { IncidentCategoryService, IssueTypeResponse } from './services/incident-category.service'
import { RoutingRulesService, RoutingRuleResponse } from './services/routing-rules.service'
import { forkJoin } from 'rxjs'

// ── Local UI model (kept exactly as before) ──────────────────────────────────
interface Department {
  id: number
  name: string
  head: string
  headInitials: string
  headVacant?: boolean
  assignedAreas: string[]
  assignedCategories: string[]
  status: 'Active' | 'Inactive'
  staffCount: number
  childCount: number
  children: Department[]
  originalName?: string
  originalCode?: string
  originalEmail?: string
  originalPhone?: string
  originalAddress?: string
  originalParentDepartmentId?: number
  routingRules: RoutingRuleResponse[]
}

@Component({
  selector: 'app-department-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  styles: [`
    .avatar-ring    { box-shadow: 0 0 0 2px var(--color-surface), 0 0 0 3px var(--color-outline-variant); }
    tr.dept-row:hover .row-actions { opacity:1; }
    .row-actions    { opacity:0; transition:opacity 150ms; }
    .status-active  { background-color:rgba(16,185,129,0.12); color:#059669; border:1px solid rgba(16,185,129,0.25); }
    .status-inactive{ background-color:var(--color-surface-container-high); color:var(--color-on-surface-variant); border:1px solid rgba(195,198,215,0.4); }
    .modal-overlay  { background:rgba(25,28,30,0.45); backdrop-filter:blur(4px); }
  `],
  templateUrl: './department-management.page.html',
})
export class DepartmentManagementPage implements OnInit {
  private readonly deptService = inject(DepartmentManagementService)
  private readonly areaService = inject(AreaManagementService)
  private readonly issueTypeService = inject(IncidentCategoryService)
  private readonly routingRulesService = inject(RoutingRulesService)
  private readonly cdr = inject(ChangeDetectorRef)

  // ── Filters & view ──
  searchQuery    = ''
  filterStatus   = ''
  filterDistrict = ''
  readonly viewMode = signal<'table' | 'tree' | 'grid'>('table')

  // ── Loading / error ──
  readonly loading      = signal(false)
  readonly errorMessage = signal('')

  // ── Modal ──
  readonly showModal  = signal(false)
  readonly savingModal = signal(false)
  readonly modalError = signal('')
  editingDept: Department | null = null
  availableStaff: DepartmentMemberResponse[] = []
  hasExistingHead = false
  modalForm = {
    parentDepartmentId: null as number | null,
    departmentCode: '',
    name: '',
    headUserId: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active' as 'Active' | 'Inactive',
  }

  // ── Assign Modal ──
  readonly showAssignModal = signal(false)
  readonly savingAssignModal = signal(false)
  readonly assignModalError = signal('')
  assigningDept: Department | null = null
  availableAreas: AreaResponse[] = []
  availableIssueTypes: IssueTypeResponse[] = []
  assignForm = {
    areaId: '',
    issueTypeId: ''
  }

  // ── Delete ──
  deletingDept: Department | null = null
  readonly deletingInProgress = signal(false)
  readonly deleteError        = signal('')

  // ── Toast ──
  readonly toastMessage = signal('')
  readonly toastSuccess = signal(true)
  private toastTimer: ReturnType<typeof setTimeout> | null = null

  // ── Data ──
  departments: Department[] = []

  // ── KPI Cards (kept as-is, updated in loadDepartments) ──
  summaryCards = [
    { label: 'Total Departments', icon: 'corporate_fare', value: '0', large: true },
    { label: 'Active Staff',      icon: 'groups',         value: '0', large: true },
    { label: 'Avg. Response Time', icon: 'timer',         value: '0h', large: true },
    { label: 'Most Active',       icon: 'local_fire_department', value: '-', large: false },
  ]

  // ── Derived ──
  get filteredDepts(): Department[] {
    return this.departments.filter((d) => {
      const matchSearch   = !this.searchQuery   || d.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      const matchStatus   = !this.filterStatus   || d.status === this.filterStatus
      const matchDistrict = !this.filterDistrict || d.assignedAreas.some((x) => x.includes(this.filterDistrict))
      return matchSearch && matchStatus && matchDistrict
    })
  }

  get rootDepts(): Department[] {
    return this.filteredDepts.filter(d => d.childCount === 0 || !d.originalCode?.includes('_'))
      .map(d => ({ ...d, children: this.departments.filter(c => c.id !== d.id && c.name !== d.name) }))
  }

  // ── Lifecycle ──
  ngOnInit(): void { 
    this.loadDropdownData()
    this.loadDepartments() 
  }

  loadDropdownData(): void {
    this.areaService.getAreas().subscribe(res => this.availableAreas = res)
    this.issueTypeService.search({ pageSize: 100 }).subscribe(res => {
      if (res.success && res.data) {
        this.availableIssueTypes = res.data.items
      }
    })
  }

  // ── Load (logic kept exactly as before) ──────────────────────────────────
  loadDepartments(): void {
    this.loading.set(true)
    this.errorMessage.set('')
    forkJoin({
      depts: this.deptService.getDepartments(),
      rules: this.routingRulesService.getAll()
    }).subscribe({
      next: (res) => {
        const rules = res.rules || []
        this.departments = (res.depts || []).map(d => this.mapToDepartment(d, rules))
        this.summaryCards[0].value = this.departments.length.toString()
        this.loading.set(false)
        this.cdr.detectChanges()
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? err?.message ?? 'Failed to load departments.')
        this.loading.set(false)
      }
    })
  }

  mapToDepartment(d: DepartmentResponse, rules: RoutingRuleResponse[]): Department {
    const deptRules = rules.filter(r => r.departmentId === d.departmentId)
    const areas = Array.from(new Set(deptRules.map(r => r.areaName))).filter(Boolean)
    const categories = Array.from(new Set(deptRules.map(r => r.issueTypeName))).filter(Boolean)

    return {
      id:             d.departmentId,
      name:           d.departmentName,
      head:           d.managerFullName || '',
      headInitials:   d.managerFullName ? this.getInitials(d.managerFullName) : '',
      headVacant:     !d.managerFullName,
      assignedAreas:  areas,
      assignedCategories: categories,
      status:         d.isActive ? 'Active' : 'Inactive',
      staffCount:     0,
      childCount:     d.childDepartments?.length ?? 0,
      children:       (d.childDepartments || []).map(child => this.mapToDepartment(child, rules)),
      originalName:   d.departmentName,
      originalCode:   d.departmentCode,
      originalEmail:  d.email,
      originalPhone:  d.phone,
      originalAddress: d.address,
      originalParentDepartmentId: d.parentDepartmentId,
      routingRules:   deptRules
    }
  }

  // ── Icon helpers (kept exactly as before) ──────────────────────────────
  getDeptIcon(name: string): string {
    const map: Record<string, string> = {
      'Public Works': 'construction', 'Utilities': 'electrical_services',
      'Sanitation': 'delete_sweep', 'Parks & Recreation': 'park',
      'Transportation': 'commute', 'Emergency Services': 'emergency',
      'Dept. of Housing': 'apartment', 'Environmental': 'eco',
    }
    return map[name] ?? 'corporate_fare'
  }

  getDeptIconStyle(dept: Department): string {
    const colors: Record<string, string> = {
      'Public Works':      'background-color:rgba(0,74,198,0.12); color:var(--color-primary)',
      'Utilities':         'background-color:rgba(120,75,0,0.12); color:var(--color-tertiary)',
      'Sanitation':        'background-color:rgba(0,108,73,0.12); color:var(--color-secondary)',
      'Parks & Recreation':'background-color:rgba(0,108,73,0.1); color:var(--color-secondary)',
      'Transportation':    'background-color:rgba(0,74,198,0.1); color:var(--color-primary)',
      'Emergency Services':'background-color:rgba(186,26,26,0.12); color:var(--color-error)',
      'Dept. of Housing':  'background-color:rgba(120,75,0,0.1); color:var(--color-tertiary)',
      'Environmental':     'background-color:rgba(0,108,73,0.1); color:var(--color-secondary)',
    }
    return colors[dept.name] ?? 'background-color:var(--color-surface-container-high); color:var(--color-on-surface-variant)'
  }

  getDeptHeaderColor(dept: Department): string {
    if (dept.status === 'Inactive') return 'background-color:var(--color-surface-container-highest)'
    const colors: Record<string, string> = {
      'Public Works':      'background:linear-gradient(90deg,var(--color-primary),var(--color-primary-container))',
      'Utilities':         'background:linear-gradient(90deg,var(--color-tertiary),#ffa000)',
      'Sanitation':        'background:linear-gradient(90deg,var(--color-secondary),var(--color-secondary-container))',
      'Transportation':    'background:linear-gradient(90deg,#3b82f6,#60a5fa)',
      'Emergency Services':'background:linear-gradient(90deg,var(--color-error),#ef4444)',
    }
    return colors[dept.name] ?? 'background:linear-gradient(90deg,var(--color-outline-variant),var(--color-surface-container))'
  }

  // ── Modal logic (kept exactly as before, + savingModal + modalError) ──
  openAddModal(): void {
    this.editingDept    = null
    this.availableStaff = []
    this.hasExistingHead = false
    this.modalForm = { parentDepartmentId: null, departmentCode: '', name: '', headUserId: '', email: '', phone: '', address: '', status: 'Active' }
    this.modalError.set('')
    this.showModal.set(true)
  }

  openEditModal(dept: Department): void {
    this.editingDept    = dept
    this.availableStaff = []
    this.hasExistingHead = false
    this.modalForm = {
      parentDepartmentId: dept.originalParentDepartmentId ?? null,
      departmentCode: dept.originalCode || dept.name,
      name:           dept.originalName || '',
      headUserId:     '',
      email:          dept.originalEmail || '',
      phone:          dept.originalPhone || '',
      address:        dept.originalAddress || '',
      status:         dept.status,
    }
    this.modalError.set('')

    this.deptService.getDepartmentMembers(dept.id).subscribe({
      next: (members) => {
        this.availableStaff = members
        const manager = members.find(m => m.isManager)
        if (manager) { this.modalForm.headUserId = manager.userId; this.hasExistingHead = true }
      },
      error: (err) => console.error('Failed to load department members', err),
    })

    this.showModal.set(true)
  }

  closeModal(): void {
    this.showModal.set(false)
    this.editingDept = null
    this.modalError.set('')
  }

  saveModal(): void {
    if (!this.modalForm.name.trim() || !this.modalForm.departmentCode.trim()) {
      this.modalError.set('Department Code and Name are required.')
      return
    }

    const request: CreateDepartmentRequest = {
      parentDepartmentId: this.modalForm.parentDepartmentId ?? undefined,
      departmentName: this.modalForm.name,
      departmentCode: this.modalForm.departmentCode,
      email:          this.modalForm.email  || undefined,
      phone:          this.modalForm.phone  || undefined,
      address:        this.modalForm.address || undefined,
      isActive:       this.modalForm.status === 'Active',
    }

    this.savingModal.set(true)
    this.modalError.set('')

    if (this.editingDept) {
      this.deptService.updateDepartment(this.editingDept.id, request).subscribe({
        next: () => {
          if (this.modalForm.headUserId && !this.hasExistingHead) {
            this.deptService.assignMember(this.editingDept!.id, {
              userId:    this.modalForm.headUserId,
              isManager: true,
            }).subscribe({
              next:  () => { this.savingModal.set(false); this.loadDepartments(); this.closeModal(); this.showToast('Department updated.', true) },
              error: (err) => { this.savingModal.set(false); this.modalError.set(err?.error?.message ?? 'Error setting department head') },
            })
          } else {
            this.savingModal.set(false)
            this.loadDepartments()
            this.closeModal()
            this.showToast('Department updated.', true)
          }
        },
        error: (err) => { this.savingModal.set(false); this.modalError.set(err?.error?.message ?? 'Error updating department') },
      })
    } else {
      this.deptService.createDepartment(request).subscribe({
        next:  () => { this.savingModal.set(false); this.loadDepartments(); this.closeModal(); this.showToast('Department created.', true) },
        error: (err) => { this.savingModal.set(false); this.modalError.set(err?.error?.message ?? 'Error creating department') },
      })
    }
  }

  removeDepartmentHead(): void {
    if (!this.editingDept || !this.modalForm.headUserId) return

    this.savingModal.set(true)
    this.modalError.set('')
    this.deptService.removeMember(this.editingDept.id, this.modalForm.headUserId).subscribe({
      next: () => {
        this.savingModal.set(false)
        this.modalForm.headUserId = ''
        this.hasExistingHead = false
        this.availableStaff = this.availableStaff.filter(member => member.isActive)
        this.loadDepartments()
        this.showToast('Department head removed.', true)
      },
      error: (err) => {
        this.savingModal.set(false)
        this.modalError.set(err?.error?.message ?? 'Error removing department head')
      },
    })
  }

  // ── Delete ──
  confirmDelete(dept: Department): void {
    this.deletingDept = dept
    this.deleteError.set('')
  }

  // ── Assign ──
  openAssignModal(dept: Department): void {
    this.assigningDept = dept
    this.assignForm = { areaId: '', issueTypeId: '' }
    this.assignModalError.set('')
    this.showAssignModal.set(true)
  }

  closeAssignModal(): void {
    this.showAssignModal.set(false)
    this.assigningDept = null
    this.assignModalError.set('')
  }

  saveAssignModal(): void {
    if (!this.assignForm.areaId || !this.assignForm.issueTypeId) {
      this.assignModalError.set('Area and Incident Category are required.')
      return
    }

    if (!this.assigningDept) return

    this.savingAssignModal.set(true)
    this.assignModalError.set('')

    this.routingRulesService.create({
      departmentId: this.assigningDept.id,
      areaId: Number(this.assignForm.areaId),
      issueTypeId: Number(this.assignForm.issueTypeId),
      isActive: true
    }).subscribe({
      next: () => {
        this.savingAssignModal.set(false)
        this.loadDepartments()
        this.closeAssignModal()
        this.showToast('Assignment created successfully.', true)
      },
      error: (err) => {
        this.savingAssignModal.set(false)
        this.assignModalError.set(err?.error?.message ?? 'Error creating assignment')
      }
    })
  }

  deleteConfirmed(): void {
    if (!this.deletingDept) return
    this.deletingInProgress.set(true)
    this.deleteError.set('')
    this.deptService.deleteDepartment(this.deletingDept.id).subscribe({
      next: () => {
        this.deletingInProgress.set(false)
        this.deletingDept = null
        this.loadDepartments()
        this.showToast('Department deleted.', true)
      },
      error: (err) => {
        this.deletingInProgress.set(false)
        this.deleteError.set(err?.error?.message ?? err?.error?.title ?? 'Delete failed.')
      },
    })
  }

  // ── Toast ──
  private showToast(message: string, success: boolean): void {
    this.toastMessage.set(message)
    this.toastSuccess.set(success)
    if (this.toastTimer) clearTimeout(this.toastTimer)
    this.toastTimer = setTimeout(() => this.toastMessage.set(''), 3500)
  }

  private getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  }
}
