export type IncidentCategory =
  | 'infrastructure'
  | 'utilities'
  | 'sanitation'
  | 'public_safety'

export type IncidentPriority = 'low' | 'medium' | 'high'

export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved'

export interface LocationData {
  latitude: number
  longitude: number
  address: string
  district?: string
  city?: string
}

export interface IncidentDetails {
  category: IncidentCategory | null
  priority: IncidentPriority
  description: string
}

export interface PhotoData {
  file: File
  preview: string
}

export interface DuplicateIncident {
  id: string
  title: string
  description: string
  status: IncidentStatus
  distance: number
  timeAgo: string
  icon: string
}

export interface CreateIncidentPayload {
  location: LocationData
  details: IncidentDetails
  photos: PhotoData[]
}

export interface CreateIncidentState {
  currentStep: number
  location: LocationData | null
  details: IncidentDetails
  duplicateIncidents: DuplicateIncident[]
  photos: PhotoData[]
  isCheckingDuplicates: boolean
  isSubmitting: boolean
  skipDuplicates: boolean
}

export const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  infrastructure: 'Infrastructure Damage (Roads, Bridges)',
  utilities: 'Utility Outage (Water, Power)',
  sanitation: 'Sanitation & Waste',
  public_safety: 'Public Safety Hazard',
}

export const PRIORITY_LABELS: Record<IncidentPriority, string> = {
  low: 'Low (Routine)',
  medium: 'Medium (Standard Response)',
  high: 'High (Immediate Attention)',
}
