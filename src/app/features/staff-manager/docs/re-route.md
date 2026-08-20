# Re-Route Issue Flow

## 1. Luồng Re-Route

```
Frontend: staff-manager-incident-detail.page.ts
  └─ dashboardService.post(`/issues/${issueId}/re-route`, { targetDepartmentId })

Backend: IssuesController.ReRoute (POST /api/issues/{issueId}/re-route)
  ├─ Quyền: Admin, DepartmentManager
  └─ Service: IssueAssignmentService.ReassignAsync()

Backend: IssueAssignmentService.ReassignAsync()
  ├─ 1. Load issue & current active assignment
  ├─ 2. Verify permission (Admin hoặc DepartmentManager của đơn vị hiện tại)
  ├─ 3. Remove members from current assignment → ghi IssueUpdate (REMOVE_MEMBER)
  ├─ 4. Close current assignment (StatusId = 5)
  ├─ 5. Create new assignment for target department
  ├─ 6. Reset issue.StatusId = 1 (NEW)
  ├─ 7. Reset issue.ResolvedAt = null
  └─ 8. Create notifications cho target department

Response: IssueAssignmentResponse (assignment mới)
```

## 2. Quyền Re-Route

| Role | Điều kiện | Mô tả |
|------|-----------|--------|
| Admin | Luôn được | Chuyển bất kỳ issue nào |
| DepartmentManager | Chỉ đơn vị đang phụ trách | `issue.DepartmentId` phải khớp `token.department_id` |

## 3. API Contract

```
POST /api/issues/{issueId}/re-route
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "targetDepartmentId": number
}

Response 200:
{
  "id": number,
  "issueId": number,
  "departmentId": number,
  "statusId": number,
  "assignedBy": string,
  "assignedAt": string,
  ...
}

Response 403: Không có quyền
Response 404: Issue không tồn tại
Response 409: Issue đang ở trạng thái không cho phép re-route
```

## 4. Staff Re-Route

```
Frontend: staff-manager-incident-detail.page.ts
  └─ Gọi POST /api/issues/{issueId}/re-route khi click button "Chuyển đơn vị"
  └─ Chỉ hiển thị button cho role Admin, DepartmentManager
```

## 5. DepartmentManager Re-Route

```
Frontend: department-manager-incident-detail.page.ts
  └─ Gọi POST /api/issues/{issueId}/re-route khi click button "Chuyển đơn vị"
  └─ Chỉ hiển thị button cho role Admin, DepartmentManager
```
