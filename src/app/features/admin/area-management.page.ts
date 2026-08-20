import { Component, signal, computed, OnInit, inject, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { AdminSidebarComponent } from './admin-sidebar.component'
import {
  AreaManagementService,
  AreaResponse,
  CreateAreaRequest,
  UpdateAreaRequest,
} from './services/area-management.service'

const AREA_TYPES = ['City', 'District', 'Ward', 'Zone', 'Region'] as const
type AreaType = (typeof AREA_TYPES)[number]

interface ModalForm {
  parentAreaId: number | null
  areaCode: string
  areaName: string
  areaType: string
  centroidLatitude: number | null
  centroidLongitude: number | null
  isActive: boolean
}

const emptyForm = (): ModalForm => ({
  parentAreaId: null,
  areaCode: '',
  areaName: '',
  areaType: 'District',
  centroidLatitude: null,
  centroidLongitude: null,
  isActive: true,
})

@Component({
  selector: 'app-area-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  styles: [`
    .status-active { background-color:rgba(16,185,129,0.12); color:#059669; border:1px solid rgba(16,185,129,0.25); }
    .status-inactive { background-color:var(--color-surface-container-high); color:var(--color-on-surface-variant); border:1px solid rgba(195,198,215,0.4); }
    .modal-overlay { background:rgba(25,28,30,0.45); backdrop-filter:blur(4px); }
    tr.area-row:hover .row-actions { opacity:1; }
    .row-actions { opacity:0; transition:opacity 150ms; }
    .badge-city     { background:rgba(99,102,241,.14); color:#4f46e5; border:1px solid rgba(99,102,241,.25); }
    .badge-district { background:rgba(14,165,233,.14); color:#0284c7; border:1px solid rgba(14,165,233,.25); }
    .badge-ward     { background:rgba(16,185,129,.14); color:#059669; border:1px solid rgba(16,185,129,.25); }
    .badge-zone     { background:rgba(245,158,11,.14); color:#d97706; border:1px solid rgba(245,158,11,.25); }
    .badge-region   { background:rgba(168,85,247,.14); color:#7c3aed; border:1px solid rgba(168,85,247,.25); }
    .badge-default  { background:var(--color-surface-container-high); color:var(--color-on-surface-variant); border:1px solid rgba(195,198,215,.4); }
  `],
  templateUrl: './area-management.page.html',
})
export class AreaManagementPage implements OnInit {
  private readonly svc = inject(AreaManagementService)
  private readonly cdr = inject(ChangeDetectorRef)

  readonly areas = signal<AreaResponse[]>([])
  readonly loading = signal(false)
  readonly errorMessage = signal('')
  readonly viewMode = signal<'table' | 'tree' | 'grid'>('table')
  searchQuery = ''
  filterType = ''
  filterStatus = ''
  readonly areaTypes = AREA_TYPES

  readonly filteredAreas = computed(() => {
    let list = this.areas()
    const q = this.searchQuery.toLowerCase()
    if (q) list = list.filter(a => a.areaName.toLowerCase().includes(q) || a.areaCode.toLowerCase().includes(q))
    if (this.filterType) list = list.filter(a => a.areaType === this.filterType)
    if (this.filterStatus === 'active') list = list.filter(a => a.isActive)
    if (this.filterStatus === 'inactive') list = list.filter(a => !a.isActive)
    return list
  })

  readonly rootAreas = computed(() => this.filteredAreas().filter(a => !a.parentAreaId))

  readonly summaryCards = computed(() => {
    const list = this.areas()
    return [
      { label: 'Total Areas', icon: 'location_on', value: list.length },
      { label: 'Active', icon: 'check_circle', value: list.filter(a => a.isActive).length },
      { label: 'Root Areas', icon: 'public', value: list.filter(a => !a.parentAreaId).length },
      { label: 'With Coordinates', icon: 'my_location', value: list.filter(a => a.centroidLatitude !== null && a.centroidLatitude !== undefined).length },
    ]
  })

  // Modal state
  readonly showModal = signal(false)
  readonly savingModal = signal(false)
  readonly modalError = signal('')
  editingArea: AreaResponse | null = null
  parentForNew: AreaResponse | null = null
  modalForm: ModalForm = emptyForm()

  // Delete state
  deletingArea: AreaResponse | null = null
  readonly deletingInProgress = signal(false)
  readonly deleteError = signal('')

  // Toast
  readonly toastMessage = signal('')
  readonly toastSuccess = signal(true)
  private toastTimer: ReturnType<typeof setTimeout> | null = null

  ngOnInit(): void { this.loadAreas() }

  loadAreas(): void {
    this.loading.set(true)
    this.errorMessage.set('')
    this.svc.getAreas().subscribe({
      next: (data) => { this.areas.set(data); this.loading.set(false) },
      error: (err) => { this.errorMessage.set(err?.error?.detail ?? err?.message ?? 'Failed to load areas.'); this.loading.set(false) },
    })
  }

  applyFilters(): void { this.cdr.markForCheck() }

  openAddModal(): void {
    this.editingArea = null; this.parentForNew = null
    this.modalForm = emptyForm(); this.modalError.set(''); this.showModal.set(true)
  }

  openAddChildModal(parent: AreaResponse): void {
    this.editingArea = null; this.parentForNew = parent
    this.modalForm = { ...emptyForm(), parentAreaId: parent.areaId }
    this.modalError.set(''); this.showModal.set(true)
  }

  openEditModal(area: AreaResponse): void {
    this.editingArea = area; this.parentForNew = null
    this.modalForm = {
      parentAreaId: area.parentAreaId ?? null,
      areaCode: area.areaCode, areaName: area.areaName, areaType: area.areaType,
      centroidLatitude: area.centroidLatitude ?? null, centroidLongitude: area.centroidLongitude ?? null,
      isActive: area.isActive,
    }
    this.modalError.set(''); this.showModal.set(true)
  }

  closeModal(): void { this.showModal.set(false); this.editingArea = null; this.parentForNew = null }

  saveModal(): void {
    if (!this.modalForm.areaCode.trim()) { this.modalError.set('Area Code is required.'); return }
    if (!this.modalForm.areaName.trim()) { this.modalError.set('Area Name is required.'); return }
    if (!this.modalForm.areaType) { this.modalError.set('Area Type is required.'); return }
    const payload: CreateAreaRequest = {
      parentAreaId: this.modalForm.parentAreaId,
      areaCode: this.modalForm.areaCode.trim(), areaName: this.modalForm.areaName.trim(),
      areaType: this.modalForm.areaType, centroidLatitude: this.modalForm.centroidLatitude,
      centroidLongitude: this.modalForm.centroidLongitude, isActive: this.modalForm.isActive,
    }
    this.savingModal.set(true); this.modalError.set('')
    const obs$ = this.editingArea
      ? this.svc.updateArea(this.editingArea.areaId, payload as UpdateAreaRequest)
      : this.svc.createArea(payload)
    obs$.subscribe({
      next: () => { this.savingModal.set(false); this.closeModal(); this.loadAreas(); this.showToast(this.editingArea ? 'Area updated.' : 'Area created.', true) },
      error: (err) => { this.savingModal.set(false); this.modalError.set(err?.error?.detail ?? err?.error?.title ?? 'An error occurred.') },
    })
  }

  confirmDelete(area: AreaResponse): void { this.deletingArea = area; this.deleteError.set('') }

  deleteConfirmed(): void {
    if (!this.deletingArea) return
    this.deletingInProgress.set(true); this.deleteError.set('')
    this.svc.deleteArea(this.deletingArea.areaId).subscribe({
      next: () => { this.deletingInProgress.set(false); this.deletingArea = null; this.loadAreas(); this.showToast('Area deleted.', true) },
      error: (err) => { this.deletingInProgress.set(false); this.deleteError.set(err?.error?.detail ?? err?.error?.title ?? 'Delete failed.') },
    })
  }

  private showToast(message: string, success: boolean): void {
    this.toastMessage.set(message); this.toastSuccess.set(success)
    if (this.toastTimer) clearTimeout(this.toastTimer)
    this.toastTimer = setTimeout(() => this.toastMessage.set(''), 3500)
  }

  getAreaIcon(type: string): string {
    const m: Record<string,string> = { City:'location_city', District:'holiday_village', Ward:'home_work', Zone:'pentagon', Region:'map' }
    return m[type] ?? 'location_on'
  }
  getAreaIconStyle(area: AreaResponse): string {
    const m: Record<string,string> = {
      City:'background:rgba(99,102,241,.15); color:#4f46e5', District:'background:rgba(14,165,233,.15); color:#0284c7',
      Ward:'background:rgba(16,185,129,.15); color:#059669', Zone:'background:rgba(245,158,11,.15); color:#d97706',
      Region:'background:rgba(168,85,247,.15); color:#7c3aed',
    }
    return m[area.areaType] ?? 'background:var(--color-surface-container); color:var(--color-on-surface-variant)'
  }
  getAreaHeaderColor(area: AreaResponse): string {
    const m: Record<string,string> = {
      City:'background:linear-gradient(90deg,#6366f1,#818cf8)', District:'background:linear-gradient(90deg,#0ea5e9,#38bdf8)',
      Ward:'background:linear-gradient(90deg,#10b981,#34d399)', Zone:'background:linear-gradient(90deg,#f59e0b,#fbbf24)',
      Region:'background:linear-gradient(90deg,#a855f7,#c084fc)',
    }
    return m[area.areaType] ?? 'background:linear-gradient(90deg,var(--color-outline-variant),var(--color-surface-container))'
  }
  getTypeBadgeClass(type: string): string {
    const m: Record<string,string> = { City:'badge-city', District:'badge-district', Ward:'badge-ward', Zone:'badge-zone', Region:'badge-region' }
    return m[type] ?? 'badge-default'
  }
}
