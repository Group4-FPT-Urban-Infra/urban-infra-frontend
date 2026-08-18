export type IncidentCategory =
  | 'infrastructure'
  | 'utilities'
  | 'sanitation'
  | 'public_safety'

export type IncidentPriority = 'low' | 'medium' | 'high'

export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved'

// === API Lookup Interfaces ===

export interface AreaLookupItem {
  areaId: number
  areaCode: string
  areaName: string
  areaType: string
  isActive: boolean
}

export interface IssueTypeLookupItem {
  issueTypeId: number
  parentIssueTypeId: number | null
  typeCode: string
  typeName: string
  iconUrl: string | null
  description: string | null
}

export interface PriorityLookupItem {
  priorityId: number
  priorityCode: string
  priorityName: string
  severityRank: number
  isActive: boolean
}

export interface NearbyIssueResponse {
  id: number
  publicCode: string
  title: string
  issueType: LookupItemResponse
  area: LookupItemResponse
  priority: LookupItemResponse
  status: LookupItemResponse
  latitude: number
  longitude: number
  thumbnailUrl: string | null
  upvoteCount: number
  hasUpvoted: boolean
  reportedAt: string
  distanceMeters: number
}

export interface LookupItemResponse {
  id: number
  name: string
  code: string
}

// === Local Types ===

export interface LocationData {
  latitude: number
  longitude: number
  address: string
  district?: string
  city?: string
}

export interface IncidentDetails {
  areaId: number | null
  issueTypeIds: number[]
  priorityId: number | null
  title: string
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
  status: string
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
  // Lookup data
  areas: AreaLookupItem[]
  issueTypes: IssueTypeLookupItem[]
  priorities: PriorityLookupItem[]
}

export interface CreateIncidentResult {
  success: boolean
  incidentId?: string
  publicCode?: string
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
