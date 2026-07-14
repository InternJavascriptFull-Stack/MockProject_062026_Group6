# API Document

Tài liệu này mô tả contract API cho các chức năng backend hiện tại của dự án NHMS. Các endpoint nhóm `incident-severities` và `sla-configurations` được bám trực tiếp theo schema trong `docs/csdl.sql`. Riêng nhóm `equipment-supplies` hiện chưa thấy bảng tương ứng trong `docs/csdl.sql`, nên phần mô tả bên dưới là contract nghiệp vụ tạm thời để phục vụ triển khai backend và đồng bộ với mockup.

## Common API Rules

- Base URL: `/api`
- Authentication: JWT Bearer token cho toàn bộ API dưới đây
- Content-Type: `application/json`
- Data format: ISO 8601 cho ngày giờ nếu có trả về timestamp

---

## Function: Lấy danh sách mức độ sự cố

Description: API dùng để lấy toàn bộ danh sách mức độ sự cố đang được cấu hình trong hệ thống.
URL/API: `/api/incident-severities`
Method: GET
Authorization: Bearer JWT

Header:

```http
Authorization: Bearer {accessToken}
```

RequestParam: None
RequestBody: None

Response:

```text
Success (200 OK)
{
	"message": "Incident severities retrieved successfully.",
	"data": [
		{
			"id": 1,
			"levelName": "Minor",
			"chartLockTrigger": false
		},
		{
			"id": 2,
			"levelName": "Moderate",
			"chartLockTrigger": false
		},
		{
			"id": 3,
			"levelName": "Major",
			"chartLockTrigger": true
		},
		{
			"id": 4,
			"levelName": "Critical",
			"chartLockTrigger": true
		}
	]
}

Error (401 Unauthorized)
{
	"message": "Unauthorized."
}
```

---

## Function: Cập nhật mức độ sự cố

Description: API dùng để cập nhật thông tin hiển thị hoặc cấu hình khóa chart của một mức độ sự cố.
URL/API: `/api/incident-severities/{id}`
Method: PUT
Authorization: Bearer JWT

Header:

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

RequestParam:

- `id`: `number` - ID của mức độ sự cố

RequestBody:

```json
{
    "levelName": "Major",
    "chartLockTrigger": true
}
```

Response:

```text
Success (200 OK)
{
	"message": "Incident severity updated successfully.",
	"data": {
		"id": 3,
		"levelName": "Major",
		"chartLockTrigger": true
	}
}

Error (400 Bad Request)
{
	"message": "Validation failed.",
	"errors": [
		"levelName must be a string"
	]
}

Error (404 Not Found)
{
	"message": "Incident severity not found."
}
```

---

## Function: Lấy SLA config

Description: API dùng để lấy danh sách cấu hình SLA theo từng mức độ sự cố.
URL/API: `/api/sla-configurations`
Method: GET
Authorization: Bearer JWT

Header:

```http
Authorization: Bearer {accessToken}
```

RequestParam: None
RequestBody: None

Response:

```text
Success (200 OK)
{
	"message": "SLA configurations retrieved successfully.",
	"data": [
		{
			"id": 1,
			"severity": {
				"id": 4,
				"levelName": "Critical"
			},
			"slaWindowHrs": 24
		},
		{
			"id": 2,
			"severity": {
				"id": 3,
				"levelName": "Major"
			},
			"slaWindowHrs": 24
		},
		{
			"id": 3,
			"severity": {
				"id": 2,
				"levelName": "Moderate"
			},
			"slaWindowHrs": 48
		},
		{
			"id": 4,
			"severity": {
				"id": 1,
				"levelName": "Minor"
			},
			"slaWindowHrs": null
		}
	]
}

Error (401 Unauthorized)
{
	"message": "Unauthorized."
}
```

---

## Function: Cập nhật SLA config

Description: API dùng để cập nhật số giờ SLA cho một mức độ sự cố.
URL/API: `/api/sla-configurations/{id}`
Method: PUT
Authorization: Bearer JWT

Header:

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

RequestParam:

- `id`: `number` - ID của bản ghi SLA config

RequestBody:

```json
{
    "slaWindowHrs": 24
}
```

Response:

```text
Success (200 OK)
{
	"message": "SLA configuration updated successfully.",
	"data": {
		"id": 1,
		"severityId": 4,
		"slaWindowHrs": 24
	}
}

Error (400 Bad Request)
{
	"message": "Validation failed.",
	"errors": [
		"slaWindowHrs must be a positive integer"
	]
}

Error (404 Not Found)
{
	"message": "SLA configuration not found."
}
```

---

## Function: Lấy danh sách vật tư

Description: API dùng để lấy danh sách vật tư, thiết bị hoặc supply đang được quản lý trong hệ thống.
URL/API: `/api/equipment-supplies`
Method: GET
Authorization: Bearer JWT

Header:

```http
Authorization: Bearer {accessToken}
```

RequestParam:

- `search` _(optional)_: `string` - Từ khóa tìm theo tên vật tư hoặc mã vật tư
- `category` _(optional)_: `string` - Lọc theo nhóm vật tư
- `status` _(optional)_: `string` - Lọc theo trạng thái `ACTIVE | INACTIVE | OUT_OF_STOCK | DISCONTINUED`

RequestBody: None

Response:

```text
Success (200 OK)
{
	"message": "Equipment supplies retrieved successfully.",
	"data": [
		{
			"id": "8c0f5df8-5d0c-4a47-8d91-5f9a3d3fd001",
			"code": "EQ-1042",
			"name": "Hoyer Lift",
			"category": "Mobility",
			"unit": "item",
			"quantityOnHand": 22,
			"reorderThreshold": 5,
			"status": "ACTIVE",
			"lastUpdatedAt": "2026-07-07T09:30:00+07:00"
		}
	]
}

Error (401 Unauthorized)
{
	"message": "Unauthorized."
}
```

---

## Function: Thêm vật tư

Description: API dùng để tạo mới một vật tư hoặc thiết bị trong danh mục quản lý.
URL/API: `/api/equipment-supplies`
Method: POST
Authorization: Bearer JWT

Header:

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

RequestParam: None
RequestBody:

```json
{
    "code": "EQ-2001",
    "name": "Wheelchair - Standard",
    "category": "Mobility",
    "unit": "item",
    "quantityOnHand": 10,
    "reorderThreshold": 3,
    "status": "ACTIVE"
}
```

Response:

```text
Success (201 Created)
{
	"message": "Equipment supply created successfully.",
	"data": {
		"id": "b8c17b58-4f27-4a0b-ae3d-64d7b1f8a901",
		"code": "EQ-2001",
		"name": "Wheelchair - Standard",
		"category": "Mobility",
		"unit": "item",
		"quantityOnHand": 10,
		"reorderThreshold": 3,
		"status": "ACTIVE"
	}
}

Error (409 Conflict)
{
	"message": "Equipment code already exists."
}
```

---

## Function: Cập nhật vật tư

Description: API dùng để cập nhật thông tin của một vật tư hoặc thiết bị đã tồn tại.
URL/API: `/api/equipment-supplies/{id}`
Method: PUT
Authorization: Bearer JWT

Header:

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

RequestParam:

- `id`: `string` - ID của vật tư

RequestBody:

```json
{
    "name": "Wheelchair - Standard",
    "category": "Mobility",
    "unit": "item",
    "quantityOnHand": 12,
    "reorderThreshold": 4,
    "status": "ACTIVE"
}
```

Response:

```text
Success (200 OK)
{
	"message": "Equipment supply updated successfully.",
	"data": {
		"id": "b8c17b58-4f27-4a0b-ae3d-64d7b1f8a901",
		"code": "EQ-2001",
		"name": "Wheelchair - Standard",
		"category": "Mobility",
		"unit": "item",
		"quantityOnHand": 12,
		"reorderThreshold": 4,
		"status": "ACTIVE"
	}
}

Error (404 Not Found)
{
	"message": "Equipment supply not found."
}
```

---

## Function: Cập nhật trạng thái vật tư

Description: API dùng để thay đổi trạng thái hoạt động của vật tư mà không ảnh hưởng các trường còn lại.
URL/API: `/api/equipment-supplies/{id}/status`
Method: PATCH
Authorization: Bearer JWT

Header:

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

RequestParam:

- `id`: `string` - ID của vật tư

RequestBody:

```json
{
    "status": "OUT_OF_STOCK"
}
```

Response:

```text
Success (200 OK)
{
	"message": "Equipment supply status updated successfully.",
	"data": {
		"id": "b8c17b58-4f27-4a0b-ae3d-64d7b1f8a901",
		"status": "OUT_OF_STOCK"
	}
}

Error (400 Bad Request)
{
	"message": "Validation failed.",
	"errors": [
		"status must be one of ACTIVE, INACTIVE, OUT_OF_STOCK, DISCONTINUED"
	]
}

Error (404 Not Found)
{
	"message": "Equipment supply not found."
}
```

---

## Notes for Backend Implementation

- `incident_severities` and `sla_configs` are directly aligned with the existing SQL schema in `docs/csdl.sql`.
- `sla_configs` currently references `incident_severities` through `severity_id`; therefore the GET response should include the related severity object for UI convenience.
- `equipment-supplies` is a business contract prepared from the current mockup and should be mapped to the final database design when the corresponding table/schema is confirmed.
- If the team decides to add filters or paging later, keep the response shape backward compatible by wrapping items in `{ data, meta }` rather than changing the endpoint contract.
