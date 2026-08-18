// BACKEND CONTRACT TO CONFIRM for all types

export interface StaffDashboardSummary {
  assignedTasks: number
  highPriorityTasks: number
  avgResolutionTimeHours: number
  pendingVerifications: number
}

export interface StaffTask {
  id: string // e.g., 'INC-2024-089'
  title: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: string
  location: string
  assignedAt: string // ISO date string
  slaStatus?: 'On Target' | 'At Risk' | 'Breached'
  dueDate?: string // ISO date string
  latitude?: number
  longitude?: number
}

export interface StaffActivity {
  id: string
  issueId: string
  issueTitle: string
  action: string // e.g., 'resolved', 'assigned', 'commented'
  actorName: string
  createdAt: string // ISO date string
}

export interface StaffPagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface StaffMapIssue {
  id: string | number
  latitude: number
  longitude: number
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: string
  title: string
  publicCode?: string
  category?: string
  thumbnailUrl?: string
}

export interface StaffIncident {
  id: string
  type: string
  typeIcon: string
  location: string
  district: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Unassigned'
  assignedTo: string
  assignedInitials: string
  reportedAt: string // ISO date string
  slaStatus?: 'On Target' | 'At Risk' | 'Breached'
}

export interface StaffIncidentDetail {
  id: string
  publicCode: string
  title: string
  category: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Assigned' | 'Rejected'
  reportedAt: string // ISO date string
  location: {
    address: string
    latitude: number
    longitude: number
  }
  description: string
  reporter: {
    name: string
    initials: string
    type: 'Verified Resident' | 'Anonymous'
    phone?: string
    email?: string
  }
  media: { url: string; type: 'image' | 'video' }[]
  internalNotes: { author: string; content: string; time: string }[]
  actionLog: { status: string; description: string; time: string }[]
  nearbyIncidents: { id: string; title: string; distance: number }[]
}

export interface StaffApiFilters {
  category?: string
  area?: string
  search?: string
  page?: number
  pageSize?: number
  assignment?: 'all' | 'mine' | 'unassigned'
  onlyMine?: boolean
  nearBreachOnly?: boolean
  unassignedOnly?: boolean
  fromDate?: string
  toDate?: string
  priorities?: string[]
  statuses?: string[]
}
