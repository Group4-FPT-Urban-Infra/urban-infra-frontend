import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { IncidentService } from './incident.service'
import type {
  AreaLookupItem,
  CreateIncidentPayload,
  CreateIncidentResult,
  CreateIncidentState,
  DuplicateIncident,
  IncidentDetails,
  IssueTypeLookupItem,
  LocationData,
  PhotoData,
  PriorityLookupItem,
} from './incident.types'

const INITIAL_STATE: CreateIncidentState = {
  currentStep: 0,
  location: null,
  details: {
    areaId: null,
    issueTypeIds: [],
    priorityId: null,
    title: '',
    description: '',
  },
  duplicateIncidents: [],
  photos: [],
  isCheckingDuplicates: false,
  isSubmitting: false,
  skipDuplicates: false,
  areas: [],
  issueTypes: [],
  priorities: [],
}

@Injectable({ providedIn: 'root' })
export class IncidentStore {
  private readonly service = inject(IncidentService)

  // --- State ---
  private readonly _state = signal<CreateIncidentState>({ ...INITIAL_STATE })

  // --- Selectors ---
  readonly state = this._state.asReadonly()
  readonly currentStep = computed(() => this._state().currentStep)
  readonly location = computed(() => this._state().location)
  readonly details = computed(() => this._state().details)
  readonly duplicateIncidents = computed(() => this._state().duplicateIncidents)
  readonly photos = computed(() => this._state().photos)
  readonly isCheckingDuplicates = computed(() => this._state().isCheckingDuplicates)
  readonly isSubmitting = computed(() => this._state().isSubmitting)
  readonly skipDuplicates = computed(() => this._state().skipDuplicates)

  // Lookup data selectors
  readonly areas = computed(() => this._state().areas)
  readonly issueTypes = computed(() => this._state().issueTypes)
  readonly priorities = computed(() => this._state().priorities)

  readonly canProceedFromLocation = computed(() => {
    const loc = this._state().location
    const details = this._state().details
    return (
      loc !== null &&
      loc.latitude !== 0 &&
      loc.longitude !== 0 &&
      details.areaId !== null
    )
  })

  readonly canProceedFromDetails = computed(() => {
    const d = this._state().details
    return (
      d.issueTypeIds.length > 0 &&
      d.title.trim().length >= 5 &&
      d.description.trim().length >= 10
    )
  })

  // --- Lookup Data Actions ---
  async loadAreas(): Promise<void> {
    try {
      const areas = await firstValueFrom(this.service.getAreas())
      this._state.update((s) => ({ ...s, areas }))
    } catch (error) {
      console.error('Failed to load areas:', error)
    }
  }

  async loadIssueTypes(): Promise<void> {
    try {
      const issueTypes = await firstValueFrom(this.service.getIssueTypes())
      this._state.update((s) => ({ ...s, issueTypes }))
    } catch (error) {
      console.error('Failed to load issue types:', error)
    }
  }

  async loadPriorities(): Promise<void> {
    try {
      const priorities = await firstValueFrom(this.service.getPriorities())
      this._state.update((s) => ({ ...s, priorities }))
    } catch (error) {
      console.error('Failed to load priorities:', error)
    }
  }

  // --- Field Setters ---
  setLocation(location: LocationData): void {
    this._state.update((s) => ({ ...s, location }))
  }

  setAreaId(areaId: number | null): void {
    this._state.update((s) => ({
      ...s,
      details: { ...s.details, areaId },
    }))
  }

  setIssueTypeIds(issueTypeIds: number[]): void {
    this._state.update((s) => ({
      ...s,
      details: { ...s.details, issueTypeIds: [...new Set(issueTypeIds)] },
    }))
  }

  setPriorityId(priorityId: number | null): void {
    this._state.update((s) => ({
      ...s,
      details: { ...s.details, priorityId },
    }))
  }

  setTitle(title: string): void {
    this._state.update((s) => ({
      ...s,
      details: { ...s.details, title },
    }))
  }

  setDescription(description: string): void {
    this._state.update((s) => ({
      ...s,
      details: { ...s.details, description },
    }))
  }

  addPhoto(photo: PhotoData): void {
    this._state.update((s) => ({
      ...s,
      photos: [...s.photos, photo],
    }))
  }

  removePhoto(index: number): void {
    this._state.update((s) => ({
      ...s,
      photos: s.photos.filter((_, i) => i !== index),
    }))
  }

  // --- Navigation Actions ---
  nextStep(): void {
    this._state.update((s) => ({
      ...s,
      currentStep: Math.min(s.currentStep + 1, 3),
    }))
  }

  previousStep(): void {
    this._state.update((s) => ({
      ...s,
      currentStep: Math.max(s.currentStep - 1, 0),
    }))
  }

  goToStep(step: number): void {
    if (step >= 0 && step <= 3) {
      this._state.update((s) => ({ ...s, currentStep: step }))
    }
  }

  // --- Duplicate Check Actions ---
  async checkDuplicates(): Promise<void> {
    const { location, details } = this._state()
    if (!location || details.issueTypeIds.length === 0) return

    this._state.update((s) => ({ ...s, isCheckingDuplicates: true }))
    try {
      const duplicates = await firstValueFrom(
        this.service.checkDuplicates(location, details.issueTypeIds[0])
      )
      this._state.update((s) => ({
        ...s,
        duplicateIncidents: duplicates,
        isCheckingDuplicates: false,
      }))
    } catch {
      this._state.update((s) => ({
        ...s,
        duplicateIncidents: [],
        isCheckingDuplicates: false,
      }))
    }
  }

  skipDuplicateCheck(): void {
    this._state.update((s) => ({
      ...s,
      skipDuplicates: true,
      duplicateIncidents: [],
    }))
  }

  async upvoteDuplicate(incidentId: string): Promise<void> {
    await firstValueFrom(this.service.upvoteIncident(incidentId))
  }

  removeDuplicate(incidentId: string): void {
    this._state.update((s) => ({
      ...s,
      duplicateIncidents: s.duplicateIncidents.filter((i) => i.id !== incidentId),
    }))
  }

  // --- Submit Action ---
  async submitIncident(): Promise<CreateIncidentResult> {
    const { location, details, photos } = this._state()
    if (!location) return { success: false }

    this._state.update((s) => ({ ...s, isSubmitting: true }))
    try {
      const payload: CreateIncidentPayload = { location, details, photos }
      const result = await firstValueFrom(this.service.createIncident(payload))
      this._state.update((s) => ({ ...s, isSubmitting: false }))
      return {
        success: true,
        incidentId: String(result.issues?.[0]?.id ?? result.id),
        reportId: String(result.id),
        publicCode: result.publicCode,
      }
    } catch (error) {
      console.error('Failed to create incident:', error)
      this._state.update((s) => ({ ...s, isSubmitting: false }))
      return { success: false }
    }
  }

  // --- Reset ---
  reset(): void {
    this._state.set({ ...INITIAL_STATE })
  }
}
