import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { IncidentService } from './incident.service'
import type {
  CreateIncidentPayload,
  CreateIncidentState,
  DuplicateIncident,
  IncidentDetails,
  LocationData,
  PhotoData,
} from './incident.types'

const INITIAL_STATE: CreateIncidentState = {
  currentStep: 0,
  location: null,
  details: {
    category: null,
    priority: 'medium',
    description: '',
  },
  duplicateIncidents: [],
  photos: [],
  isCheckingDuplicates: false,
  isSubmitting: false,
  skipDuplicates: false,
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

  readonly canProceedFromLocation = computed(() => {
    const loc = this._state().location
    return loc !== null && loc.latitude !== 0 && loc.longitude !== 0
  })

  readonly canProceedFromDetails = computed(() => {
    const d = this._state().details
    return d.category !== null && d.description.trim().length >= 10
  })

  // --- Actions ---
  setLocation(location: LocationData): void {
    this._state.update((s) => ({ ...s, location }))
  }

  setDetails(details: IncidentDetails): void {
    this._state.update((s) => ({ ...s, details }))
  }

  setCategory(category: IncidentDetails['category']): void {
    this._state.update((s) => ({
      ...s,
      details: { ...s.details, category },
    }))
  }

  setPriority(priority: IncidentDetails['priority']): void {
    this._state.update((s) => ({
      ...s,
      details: { ...s.details, priority },
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

  async checkDuplicates(): Promise<void> {
    const { location, details } = this._state()
    if (!location || !details.category) return

    this._state.update((s) => ({ ...s, isCheckingDuplicates: true }))
    try {
      const duplicates = await firstValueFrom(
        this.service.checkDuplicates(location, details)
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

  async submitIncident(): Promise<{ success: boolean; incidentId?: string }> {
    const { location, details, photos } = this._state()
    if (!location) return { success: false }

    this._state.update((s) => ({ ...s, isSubmitting: true }))
    try {
      const payload: CreateIncidentPayload = { location, details, photos }
      const result = await firstValueFrom(this.service.createIncident(payload))
      this._state.update((s) => ({ ...s, isSubmitting: false }))
      return { success: true, incidentId: result.id }
    } catch {
      this._state.update((s) => ({ ...s, isSubmitting: false }))
      return { success: false }
    }
  }

  reset(): void {
    this._state.set({ ...INITIAL_STATE })
  }
}
