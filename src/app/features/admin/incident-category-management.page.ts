import { Component, signal, computed, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { AdminSidebarComponent } from './admin-sidebar.component'
import {
  IncidentCategoryService,
  IssueTypeResponse,
} from './services/incident-category.service'

interface ModalForm {
  typeCode: string
  typeName: string
  iconUrl: string
  description: string
  isActive: boolean
  parentIssueTypeId: number | null
}

const emptyForm = (): ModalForm => ({
  typeCode: '',
  typeName: '',
  iconUrl: '',
  description: '',
  isActive: true,
  parentIssueTypeId: null,
})

@Component({
  selector: 'app-incident-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  styles: [`
    .status-active   { background-color:rgba(16,185,129,0.12); color:#059669; border:1px solid rgba(16,185,129,0.25); }
    .status-inactive { background-color:var(--color-surface-container-high); color:var(--color-on-surface-variant); border:1px solid rgba(195,198,215,0.4); }
    .modal-overlay   { background:rgba(25,28,30,0.45); backdrop-filter:blur(4px); }
    tr.cat-row:hover .row-actions { opacity:1; }
    .row-actions { opacity:0; transition:opacity 150ms; }
  `],
  templateUrl: './incident-category-management.page.html',
})
export class IncidentCategoryManagementPage implements OnInit {
  private readonly svc = inject(IncidentCategoryService)
  readonly Math = Math

  // ── Data ──
  readonly categories    = signal<IssueTypeResponse[]>([])
  readonly allRootCategories = signal<IssueTypeResponse[]>([])
  readonly isLoading     = signal(false)
  readonly errorMessage  = signal('')
  readonly viewMode      = signal<'table' | 'tree' | 'grid'>('table')

  // ── Filters ──
  searchQuery  = ''
  filterStatus = ''
  filterLevel  = ''

  // ── Pagination ──
  readonly currentPage = signal(1)
  readonly pageSize    = signal(10)
  readonly totalItems  = signal(0)
  readonly totalPages  = signal(1)

  // ── Computed: root categories for tree view ──
  readonly rootCategories = computed(() =>
    this.categories().filter(c => !c.parentIssueTypeId)
  )

  // ── KPI Cards ──
  readonly summaryCards = computed(() => {
    const list = this.categories()
    return [
      { label: 'Total Categories', icon: 'category',       value: this.totalItems() },
      { label: 'Active',           icon: 'check_circle',   value: list.filter(c => c.isActive).length },
      { label: 'Root Types',       icon: 'account_tree',   value: list.filter(c => !c.parentIssueTypeId).length },
      { label: 'With Sub-types',   icon: 'subdirectory_arrow_right', value: list.filter(c => (c.subIssueTypes?.length ?? 0) > 0).length },
    ]
  })

  // ── Modal ──
  readonly showModal  = signal(false)
  readonly isSaving   = signal(false)
  readonly editingId  = signal<number | null>(null)
  readonly modalError = signal('')
  parentForNew: IssueTypeResponse | null = null
  formData: ModalForm = emptyForm()

  // ── Delete ──
  deletingCategory: IssueTypeResponse | null = null
  readonly deletingInProgress = signal(false)
  readonly deleteError        = signal('')

  // ── Toast ──
  readonly toastMessage = signal('')
  readonly toastSuccess = signal(true)
  private toastTimer: ReturnType<typeof setTimeout> | null = null

  ngOnInit(): void {
    this.loadData()
    this.loadAllRoots()
  }

  // ── Load ──
  loadData(): void {
    this.isLoading.set(true)
    this.errorMessage.set('')

    const request: Record<string, unknown> = {
      keyword:  this.searchQuery || undefined,
      page:     this.currentPage(),
      pageSize: this.pageSize(),
    }
    if (this.filterStatus === 'active')   request['isActiveOnly'] = true
    if (this.filterLevel  === 'root')     request['isRootOnly']   = true
    if (this.filterLevel  === 'sub')      request['isSubCategoryOnly'] = true

    this.svc.search(request as Parameters<typeof this.svc.search>[0]).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories.set(res.data.items)
          this.totalItems.set(res.data.totalItems)
          this.totalPages.set(res.data.totalPages)
          this.currentPage.set(res.data.page)
        }
        this.isLoading.set(false)
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? err?.message ?? 'Failed to load categories.')
        this.isLoading.set(false)
      },
    })
  }

  loadAllRoots(): void {
    this.svc.search({ isRootOnly: true, pageSize: 200 }).subscribe({
      next: (res) => {
        if (res.success && res.data) this.allRootCategories.set(res.data.items)
      },
    })
  }

  onSearch(): void {
    this.currentPage.set(1)
    this.loadData()
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page)
      this.loadData()
    }
  }

  getPageArray(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  }

  // ── Modals ──
  openAddModal(): void {
    this.editingId.set(null)
    this.parentForNew = null
    this.formData = emptyForm()
    this.modalError.set('')
    this.showModal.set(true)
  }

  openAddChildModal(cat: IssueTypeResponse): void {
    this.editingId.set(null)
    this.parentForNew = cat
    this.formData = { ...emptyForm(), parentIssueTypeId: cat.issueTypeId }
    this.modalError.set('')
    this.showModal.set(true)
  }

  openEditModal(cat: IssueTypeResponse): void {
    this.editingId.set(cat.issueTypeId)
    this.parentForNew = null
    this.formData = {
      typeCode:          cat.typeCode,
      typeName:          cat.typeName,
      iconUrl:           cat.iconUrl ?? '',
      description:       cat.description ?? '',
      isActive:          cat.isActive,
      parentIssueTypeId: cat.parentIssueTypeId ?? null,
    }
    this.modalError.set('')
    this.showModal.set(true)
  }

  closeModal(): void {
    this.showModal.set(false)
    this.editingId.set(null)
    this.parentForNew = null
  }

  saveCategory(): void {
    if (!this.formData.typeCode.trim()) { this.modalError.set('Category Code is required.'); return }
    if (!this.formData.typeName.trim()) { this.modalError.set('Category Name is required.'); return }

    const payload = {
      typeCode:          this.formData.typeCode.trim(),
      typeName:          this.formData.typeName.trim(),
      iconUrl:           this.formData.iconUrl.trim() || undefined,
      description:       this.formData.description.trim() || undefined,
      isActive:          this.formData.isActive,
      parentIssueTypeId: this.formData.parentIssueTypeId ?? undefined,
    }

    this.isSaving.set(true)
    this.modalError.set('')

    const id = this.editingId()
    const obs$ = id
      ? this.svc.update(id, payload)
      : this.svc.create(payload)

    obs$.subscribe({
      next: (res) => {
        this.isSaving.set(false)
        if (res.success) {
          this.closeModal()
          this.loadData()
          this.loadAllRoots()
          this.showToast(id ? 'Category updated.' : 'Category created.', true)
        } else {
          this.modalError.set(res.message ?? 'An error occurred.')
        }
      },
      error: (err) => {
        this.isSaving.set(false)
        this.modalError.set(err?.error?.message ?? err?.error?.title ?? 'An error occurred.')
      },
    })
  }

  // ── Delete ──
  confirmDelete(cat: IssueTypeResponse): void {
    this.deletingCategory = cat
    this.deleteError.set('')
  }

  deleteConfirmed(): void {
    if (!this.deletingCategory) return
    this.deletingInProgress.set(true)
    this.deleteError.set('')
    this.svc.delete(this.deletingCategory.issueTypeId).subscribe({
      next: (res) => {
        this.deletingInProgress.set(false)
        if (res.success) {
          this.deletingCategory = null
          this.loadData()
          this.loadAllRoots()
          this.showToast('Category deleted.', true)
        } else {
          this.deleteError.set(res.message ?? 'Delete failed.')
        }
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
}
