# Staff API Contract

This document outlines the API endpoints and data contracts for the Staff module.

**NOTE:** This is a frontend-defined contract. The backend implementation needs to confirm and align with these specifications.

## Base URL

All staff-related endpoints are prefixed with `/api/staff`.

## Authentication

All endpoints require authentication. The current user's identity and roles (Staff, DepartmentManager) are determined from the JWT token.

---

## 1. Dashboard

### Get Dashboard Summary

- **Purpose:** Fetches key performance indicators for the current staff member's dashboard.
- **Endpoint:** `GET /api/staff/dashboard/summary`
- **Response Shape (`StaffDashboardSummary`):**
  ```json
  {
    "assignedTasks": 12,
    "highPriorityTasks": 3,
    "avgResolutionTimeHours": 4.2,
    "pendingVerifications": 5
  }
  ```

### Get My Tasks

- **Purpose:** Retrieves a list of tasks/incidents currently assigned to the authenticated staff member.
- **Endpoint:** `GET /api/staff/tasks/my`
- **Response Shape (`StaffTask[]`):**
  ```json
  [
    {
      "id": "INC-2024-089",
      "title": "Traffic Signal Failure at Main & 5th",
      "priority": "Critical",
      "status": "In Progress",
      "location": "Main St & 5th Ave",
      "assignedAt": "2024-10-26T10:00:00Z",
      "slaStatus": "On Target",
      "dueDate": "2024-10-26T14:00:00Z"
    }
  ]
  ```

### Get Recent Activities

- **Purpose:** Fetches a feed of recent activities related to the staff member's incidents.
- **Endpoint:** `GET /api/staff/activities/recent`
- **Response Shape (`StaffActivity[]`):**
  ```json
  [
    {
      "id": "act_123",
      "issueId": "INC-2024-060",
      "issueTitle": "Fallen Tree",
      "action": "resolved incident",
      "actorName": "Unit 42",
      "createdAt": "2024-10-26T12:15:00Z"
    }
  ]
  ```

---

## 2. Incidents

### Get Staff Incidents (List)

- **Purpose:** Retrieves a paginated and filterable list of incidents for staff members.
- **Endpoint:** `GET /api/staff/incidents`
- **Query Params (`StaffApiFilters`):** `assignment` ('all' | 'mine' | 'unassigned'), `status`, `priority`, `search`, `page`, `pageSize`.
- **Response Shape (`StaffIncident[]`):** `TODO: BACKEND CONTRACT CONFIRMATION`

### Get Incident Detail

- **Purpose:** Fetches detailed information for a single incident.
- **Endpoint:** `GET /api/staff/incidents/{id}`
- **Response Shape (`StaffIncidentDetail`):** `TODO: BACKEND CONTRACT CONFIRMATION`

### Claim Incident

- **Purpose:** Allows a staff member to claim an unassigned incident.
- **Endpoint:** `POST /api/staff/incidents/{id}/claim`
- **Request Body:** Empty.
- **Response:** `200 OK` on success. `409 Conflict` if the incident is already claimed or unavailable.

---

## 3. Map

### Get Staff Map Issues

- **Purpose:** Retrieves a lightweight list of issues for display on the staff map, with staff-specific filters.
- **Endpoint:** `GET /api/staff/issues/map`
- **Query Params (`StaffApiFilters`):** `assignedToMe`, `status`, `priority`, `category`, `area`.
- **Response Shape (`StaffMapIssue[]`):**
  ```json
  [
    {
      "id": "inc_abc",
      "latitude": 10.7769,
      "longitude": 106.7009,
      "priority": "High",
      "status": "In Progress"
    }
  ]
  ```
