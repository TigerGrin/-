# 医院实习排班系统 - API接口对接文档

## 基础信息

- **API根地址**: `https://eflfbpmxcpqg.sealoshzh.site/`
- **API基础路径**: `/api`
- **完整API地址**: `https://eflfbpmxcpqg.sealoshzh.site/api`
- **请求格式**: JSON (除文件上传接口外)
- **响应格式**: JSON
- **Content-Type**: `application/json`

---

## 通用响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

### HTTP状态码说明
- `200`: 请求成功
- `400`: 请求参数错误
- `401`: 未授权（需要登录）
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 1. 护士管理接口

### 1.1 获取护士列表

**接口地址**: `GET /api/nurse/list`

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| departmentId | string | 否 | 科室ID |
| level | string | 否 | 护士级别 (N4, N3, N2, N1, N0, 实习护士, 进修护士) |
| scheduleStatus | string | 否 | 排班状态 (on_duty, off_duty, leave, training, sick, maternity, study, support) |
| keyword | string | 否 | 搜索关键词（姓名或工号） |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |

**请求示例**:
```
GET /api/nurse/list?departmentId=D001&level=N4&page=1&pageSize=20
```

**成功响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": "N001",
        "name": "张三",
        "level": "N4",
        "departmentId": "D001",
        "departmentName": "中心监护室",
        "scheduleStatus": "on_duty",
        "weeklyShifts": 5,
        "lastSchedule": "2024-01-15 责任组长(白班)",
        "isTeamLeader": true,
        "mentor": "",
        "importDate": "2024-01-10",
        "graduationYear": 2020,
        "annualLeave": 10.5,
        "storedLeave": 3.5,
        "createdAt": "2024-01-10T10:00:00.000Z",
        "updatedAt": "2024-01-15T15:30:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

**失败响应**:
```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null
}
```

---

### 1.2 获取单个护士详情

**接口地址**: `GET /api/nurse/{nurseId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nurseId | string | 是 | 护士工号 |

**请求示例**:
```
GET /api/nurse/N001
```

**成功响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "N001",
    "name": "张三",
    "level": "N4",
    "departmentId": "D001",
    "scheduleStatus": "on_duty",
    "weeklyShifts": 5,
    "lastSchedule": "2024-01-15 责任组长(白班)",
    "isTeamLeader": true,
    "mentor": "",
    "importDate": "2024-01-10",
    "graduationYear": 2020,
    "annualLeave": 10.5,
    "storedLeave": 3.5
  }
}
```

**失败响应**:
```json
{
  "code": 404,
  "message": "护士不存在",
  "data": null
}
```

---

### 1.3 添加护士

**接口地址**: `POST /api/nurse/add`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "id": "N001",
  "name": "张三",
  "level": "N4",
  "departmentId": "D001",
  "scheduleStatus": "on_duty",
  "isTeamLeader": true,
  "mentor": "",
  "graduationYear": 2020,
  "annualLeave": 10.5,
  "storedLeave": 3.5
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 工号，唯一 |
| name | string | 是 | 姓名 |
| level | string | 是 | 护士级别 (N4, N3, N2, N1, N0, 实习护士, 进修护士) |
| departmentId | string | 是 | 科室ID |
| scheduleStatus | string | 否 | 排班状态，默认"on_duty" |
| isTeamLeader | boolean | 否 | 是否责任组长，默认false |
| mentor | string | 否 | 带班老师工号（实习护士和进修护士必填） |
| graduationYear | number | 否 | 护士年届（4位整型年份，1000-9999），默认null |
| annualLeave | number | 否 | 年休（天数，浮点型），默认0 |
| storedLeave | number | 否 | 存休（天数，浮点型），默认0 |

**成功响应**:
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": "N001",
    "name": "张三",
    "level": "N4",
    "createdAt": "2024-01-10T10:00:00.000Z"
  }
}
```

**失败响应** (工号已存在):
```json
{
  "code": 400,
  "message": "工号已存在",
  "data": null
}
```

**失败响应** (缺少必填字段):
```json
{
  "code": 400,
  "message": "缺少必填字段",
  "data": null
}
```

**失败响应** (科室不存在):
```json
{
  "code": 400,
  "message": "科室不存在",
  "data": null
}
```

**失败响应** (实习/进修护士缺少带班老师):
```json
{
  "code": 400,
  "message": "实习护士和进修护士必须绑定带班老师",
  "data": null
}
```

**失败响应** (科室容量已满):
```json
{
  "code": 400,
  "message": "科室容量已满：当前有20名护士，科室容量为20，无法添加新护士",
  "data": null
}
```

---

### 1.4 更新护士信息

**接口地址**: `PUT /api/nurse/{nurseId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nurseId | string | 是 | 护士工号 |

**请求头**:
```
Content-Type: application/json
```

**请求体** (所有字段可选，只传需要更新的字段):
```json
{
  "name": "张三",
  "level": "N3",
  "scheduleStatus": "leave",
  "isTeamLeader": false,
  "graduationYear": 2019,
  "annualLeave": 12.0,
  "storedLeave": 4.5
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "N001",
    "name": "张三",
    "updatedAt": "2024-01-15T15:30:00.000Z"
  }
}
```

**失败响应**:
```json
{
  "code": 404,
  "message": "护士不存在",
  "data": null
}
```

---

### 1.5 删除护士

**接口地址**: `DELETE /api/nurse/{nurseId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nurseId | string | 是 | 护士工号 |

**请求示例**:
```
DELETE /api/nurse/N001
```

**成功响应**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**失败响应**:
```json
{
  "code": 404,
  "message": "护士不存在",
  "data": null
}
```

---

### 1.6 批量导入护士（Excel解析）

**接口地址**: `POST /api/nurse/parse-excel`

**请求头**:
```
Content-Type: multipart/form-data
```

**请求参数** (FormData):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | Excel文件 (.xlsx, .xls)，最大10MB |
| departmentId | string | 是 | 科室ID |

**Excel文件格式**:
- 第一列: 工号（如: 6969, P1086）
- 第二列: 姓名（如: 郭晶晶）
- 第三列: 级别/角色（如: N4护士/责任组长, N3护士, N2护士）

**请求示例** (使用FormData):
```javascript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('departmentId', 'D001');

fetch('/api/nurse/parse-excel', {
  method: 'POST',
  body: formData
});
```

**成功响应**:
```json
{
  "code": 200,
  "message": "解析成功",
  "data": {
    "success": true,
    "nurses": [
      {
        "id": "6969",
        "name": "郭晶晶",
        "level": "N4",
        "isTeamLeader": true
      },
      {
        "id": "3072",
        "name": "董斌",
        "level": "N3",
        "isTeamLeader": true
      }
    ],
    "total": 14,
    "successCount": 14,
    "failCount": 0,
    "errors": []
  }
}
```

**失败响应** (未上传文件):
```json
{
  "code": 400,
  "message": "请上传Excel文件",
  "data": null
}
```

**失败响应** (文件格式错误):
```json
{
  "code": 400,
  "message": "只支持 .xlsx 和 .xls 格式的Excel文件",
  "data": null
}
```

**失败响应** (文件过大):
```json
{
  "code": 400,
  "message": "文件大小超过限制（最大10MB）",
  "data": null
}
```

**失败响应** (科室容量不足):
```json
{
  "code": 400,
  "message": "科室容量不足：当前有5名护士，容量为20，只能再添加15名护士，但Excel中有55名新护士需要导入",
  "data": null
}
```

**失败响应** (部分失败):
```json
{
  "code": 200,
  "message": "解析成功",
  "data": {
    "success": true,
    "nurses": [...],
    "total": 14,
    "successCount": 12,
    "failCount": 2,
    "errors": [
      "第3行数据不完整",
      "第5行级别格式不正确: 未知级别"
    ]
  }
}
```

---

### 1.7 批量删除护士

**接口地址**: `DELETE /api/nurse/batch`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "nurseIds": ["N001", "N002", "N003"],
  "importDate": "2024-01-10"
}
```

**字段说明**:
- `nurseIds` (可选): 护士工号数组，与 `importDate` 二选一
- `importDate` (可选): 导入日期，按导入日期批量删除

**成功响应**:
```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": {
    "deletedCount": 3
  }
}
```

**失败响应**:
```json
{
  "code": 400,
  "message": "请提供要删除的护士工号列表或导入日期",
  "data": null
}
```

---

## 2. 科室管理接口

### 2.1 获取科室列表

**接口地址**: `GET /api/department/list`

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 否 | 搜索关键词（科室名称） |

**请求示例**:
```
GET /api/department/list?keyword=中心
```

**成功响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": "D001",
        "name": "中心监护室",
        "nurseCount": 9,
        "capacity": 150
      }
    ]
  }
}
```

---

### 2.2 创建科室

**接口地址**: `POST /api/department/add`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "id": "D001",
  "name": "中心监护室",
  "director": "李主任",
  "capacity": 150
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 科室ID，唯一 |
| name | string | 是 | 科室名称 |
| director | string | 否 | 主任姓名 |
| capacity | number | 否 | 容量，默认20（建议根据实际情况设置，如150） |

**成功响应**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "D001",
    "name": "中心监护室",
    "director": "李主任",
    "capacity": 150,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

**失败响应** (科室ID已存在):
```json
{
  "code": 400,
  "message": "科室ID已存在",
  "data": null
}
```

**失败响应** (缺少必填字段):
```json
{
  "code": 400,
  "message": "缺少必填字段（id和name）",
  "data": null
}
```

---

### 2.3 获取科室详情

**接口地址**: `GET /api/department/{departmentId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| departmentId | string | 是 | 科室ID |

**请求示例**:
```
GET /api/department/D001
```

**成功响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "D001",
    "name": "中心监护室",
    "director": "李主任",
    "nurseCount": 9,
    "capacity": 150,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

**失败响应**:
```json
{
  "code": 404,
  "message": "科室不存在",
  "data": null
}
```

---

### 2.4 更新科室信息

**接口地址**: `PUT /api/department/{departmentId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| departmentId | string | 是 | 科室ID |

**请求头**:
```
Content-Type: application/json
```

**请求体** (所有字段可选):
```json
{
  "name": "中心监护室",
  "director": "李主任",
  "capacity": 150
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "D001",
    "name": "中心监护室",
    "updatedAt": "2024-01-15T15:30:00.000Z"
  }
}
```

**失败响应**:
```json
{
  "code": 404,
  "message": "科室不存在",
  "data": null
}
```

---

## 3. 排班管理接口

### 3.1 获取排班列表

**接口地址**: `GET /api/schedule/list`

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| departmentId | string | 否 | 科室ID |
| nurseId | string | 否 | 护士工号 |
| startDate | string | 否 | 开始日期，格式: YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式: YYYY-MM-DD |
| shiftType | string | 否 | 班次类型，多个值用逗号分隔 |

**请求示例**:
```
GET /api/schedule/list?departmentId=D001&startDate=2024-01-01&endDate=2024-01-31
```

**成功响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "nurseId": "N001",
        "nurseName": "张三",
        "nurseLevel": "N4",
        "departmentId": "D001",
        "date": "2024-01-15",
        "shiftType": "day_team_leader",
        "shiftName": "责任组长(白班)",
        "createdAt": "2024-01-10T10:00:00.000Z",
        "updatedAt": "2024-01-10T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 3.2 创建排班

**接口地址**: `POST /api/schedule/add`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "nurseId": "N001",
  "departmentId": "D001",
  "date": "2024-01-15",
  "shiftType": "day_team_leader",
  "shiftName": "责任组长(白班)"
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nurseId | string | 是 | 护士工号 |
| departmentId | string | 是 | 科室ID |
| date | string | 是 | 排班日期，格式: YYYY-MM-DD |
| shiftType | string | 是 | 班次类型，详见数据字典 |
| shiftName | string | 否 | 班次名称，系统可根据shiftType自动生成 |

**成功响应**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "nurseId": "N001",
    "nurseName": "张三",
    "date": "2024-01-15",
    "shiftType": "day_team_leader",
    "shiftName": "责任组长(白班)",
    "createdAt": "2024-01-10T10:00:00.000Z"
  }
}
```

**失败响应** (缺少必填字段):
```json
{
  "code": 400,
  "message": "缺少必填字段",
  "data": null
}
```

**失败响应** (护士不存在):
```json
{
  "code": 400,
  "message": "护士不存在",
  "data": null
}
```

**失败响应** (已有排班):
```json
{
  "code": 400,
  "message": "该护士在此日期已有排班",
  "data": null
}
```

---

### 3.3 批量创建排班

**接口地址**: `POST /api/schedule/batch`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "departmentId": "D001",
  "schedules": [
    {
      "nurseId": "N001",
      "date": "2024-01-15",
      "shiftType": "day_team_leader"
    },
    {
      "nurseId": "N002",
      "date": "2024-01-15",
      "shiftType": "night_leader"
    }
  ]
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "批量创建成功",
  "data": {
    "successCount": 2,
    "failCount": 0,
    "errors": []
  }
}
```

**失败响应** (部分失败):
```json
{
  "code": 200,
  "message": "批量创建成功",
  "data": {
    "successCount": 1,
    "failCount": 1,
    "errors": [
      "护士不存在: N002",
      "护士N001在2024-01-15已有排班"
    ]
  }
}
```

---

### 3.4 更新排班

**接口地址**: `PUT /api/schedule/{scheduleId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| scheduleId | string | 是 | 排班ID (MongoDB ObjectId) |

**请求头**:
```
Content-Type: application/json
```

**请求体** (所有字段可选):
```json
{
  "nurseId": "N002",
  "date": "2024-01-15",
  "shiftType": "night_nurse",
  "shiftName": "护士(夜班)"
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "nurseId": "N002",
    "updatedAt": "2024-01-15T15:30:00.000Z"
  }
}
```

**失败响应**:
```json
{
  "code": 404,
  "message": "排班不存在",
  "data": null
}
```

**失败响应** (排班冲突):
```json
{
  "code": 400,
  "message": "该护士在新日期已有排班",
  "data": null
}
```

---

### 3.5 删除排班

**接口地址**: `DELETE /api/schedule/{scheduleId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| scheduleId | string | 是 | 排班ID (MongoDB ObjectId) |

**请求示例**:
```
DELETE /api/schedule/65a1b2c3d4e5f6g7h8i9j0k1
```

**成功响应**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**失败响应**:
```json
{
  "code": 404,
  "message": "排班不存在",
  "data": null
}
```

---

### 3.6 验证排班规则

**接口地址**: `POST /api/schedule/validate`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "nurseId": "N001",
  "date": "2024-01-15",
  "shiftType": "day_team_leader"
}
```

**成功响应** (验证通过):
```json
{
  "code": 200,
  "message": "验证完成",
  "data": {
    "valid": true,
    "errors": [],
    "warnings": []
  }
}
```

**成功响应** (验证不通过):
```json
{
  "code": 200,
  "message": "验证完成",
  "data": {
    "valid": false,
    "errors": [
      "责任组长必须由责任组长身份的护士担任",
      "夜班后必须休息至少2天（上次夜班：2024-01-13）"
    ],
    "warnings": [
      "夜班间隔不均匀，建议调整"
    ]
  }
}
```

**失败响应**:
```json
{
  "code": 400,
  "message": "缺少必填字段",
  "data": null
}
```

---

### 3.7 获取日历视图排班数据（按日期分组）

**接口地址**: `GET /api/schedule/calendar`

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| departmentId | string | 否 | 科室ID |
| startDate | string | 是 | 开始日期，格式: YYYY-MM-DD |
| endDate | string | 是 | 结束日期，格式: YYYY-MM-DD |

**请求示例**:
```
GET /api/schedule/calendar?departmentId=D001&startDate=2024-01-01&endDate=2024-01-31
```

**成功响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "calendar": [
      {
        "date": "2024-01-01",
        "isWorkday": false,
        "schedules": [
          {
            "id": "65a1b2c3d4e5f6g7h8i9j0k1",
            "nurseId": "N001",
            "nurseName": "张三",
            "nurseLevel": "N4",
            "shiftType": "day_team_leader",
            "shiftName": "责任组长(白班)",
            "departmentId": "D001",
            "createdAt": "2024-01-01T10:00:00.000Z",
            "updatedAt": "2024-01-01T10:00:00.000Z"
          }
        ]
      },
      {
        "date": "2024-01-02",
        "isWorkday": true,
        "schedules": []
      }
    ]
  }
}
```

**失败响应**:
```json
{
  "code": 400,
  "message": "请提供开始日期和结束日期",
  "data": null
}
```

---

### 3.8 批量更新排班

**接口地址**: `PUT /api/schedule/batch`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "updates": [
    {
      "scheduleId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "nurseId": "N002",
      "date": "2024-01-15",
      "shiftType": "night_nurse",
      "shiftName": "护士(夜班)"
    },
    {
      "scheduleId": "65a1b2c3d4e5f6g7h8i9j0k2",
      "shiftType": "day_duty_nurse"
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| updates | array | 是 | 更新数据数组 |
| updates[].scheduleId | string | 是 | 排班ID (MongoDB ObjectId) |
| updates[].nurseId | string | 否 | 护士工号 |
| updates[].date | string | 否 | 排班日期，格式: YYYY-MM-DD |
| updates[].shiftType | string | 否 | 班次类型 |
| updates[].shiftName | string | 否 | 班次名称 |

**成功响应**:
```json
{
  "code": 200,
  "message": "批量更新成功",
  "data": {
    "successCount": 2,
    "failCount": 0,
    "errors": []
  }
}
```

**失败响应** (部分失败):
```json
{
  "code": 200,
  "message": "批量更新成功",
  "data": {
    "successCount": 1,
    "failCount": 1,
    "errors": [
      "排班不存在: 65a1b2c3d4e5f6g7h8i9j0k2",
      "护士N002在2024-01-15已有排班"
    ]
  }
}
```

---

### 3.9 批量删除排班

**接口地址**: `DELETE /api/schedule/batch`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "scheduleIds": [
    "65a1b2c3d4e5f6g7h8i9j0k1",
    "65a1b2c3d4e5f6g7h8i9j0k2",
    "65a1b2c3d4e5f6g7h8i9j0k3"
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| scheduleIds | array | 是 | 排班ID数组 (MongoDB ObjectId) |

**成功响应**:
```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": {
    "deletedCount": 3
  }
}
```

**失败响应**:
```json
{
  "code": 400,
  "message": "请提供排班ID列表",
  "data": null
}
```

---

### 3.10 获取护士排班日历

**接口地址**: `GET /api/schedule/nurse-calendar/{nurseId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nurseId | string | 是 | 护士工号 |

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 是 | 开始日期，格式: YYYY-MM-DD |
| endDate | string | 是 | 结束日期，格式: YYYY-MM-DD |

**请求示例**:
```
GET /api/schedule/nurse-calendar/N001?startDate=2024-01-01&endDate=2024-01-31
```

**成功响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "nurseId": "N001",
    "nurseName": "张三",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "calendar": [
      {
        "date": "2024-01-01",
        "isWorkday": false,
        "schedules": [
          {
            "id": "65a1b2c3d4e5f6g7h8i9j0k1",
            "shiftType": "day_team_leader",
            "shiftName": "责任组长(白班)",
            "departmentId": "D001",
            "createdAt": "2024-01-01T10:00:00.000Z",
            "updatedAt": "2024-01-01T10:00:00.000Z"
          }
        ]
      },
      {
        "date": "2024-01-02",
        "isWorkday": true,
        "schedules": []
      }
    ]
  }
}
```

**失败响应**:
```json
{
  "code": 404,
  "message": "护士不存在",
  "data": null
}
```

---

### 3.11 获取指定日期班次人员统计

**接口地址**: `GET /api/schedule/date-stats`

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| date | string | 是 | 日期，格式: YYYY-MM-DD |
| departmentId | string | 否 | 科室ID |

**请求示例**:
```
GET /api/schedule/date-stats?date=2024-01-15&departmentId=D001
```

**成功响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "date": "2024-01-15",
    "isWorkday": true,
    "shifts": {
      "day_team_leader": {
        "shiftType": "day_team_leader",
        "shiftName": "责任组长(白班)",
        "required": 1,
        "current": 1,
        "nurses": [
          {
            "nurseId": "N001",
            "nurseName": "张三",
            "nurseLevel": "N4"
          }
        ]
      },
      "day_duty_nurse": {
        "shiftType": "day_duty_nurse",
        "shiftName": "责任护士(白班)",
        "required": "9-10",
        "current": 9,
        "nurses": []
      },
      "day_office": {
        "shiftType": "day_office",
        "shiftName": "办公护士(白班)",
        "required": 1,
        "current": 1,
        "nurses": []
      },
      "day_treatment": {
        "shiftType": "day_treatment",
        "shiftName": "治疗护士(白班)",
        "required": 1,
        "current": 1,
        "nurses": []
      },
      "backup_day": {
        "shiftType": "backup_day",
        "shiftName": "备白班",
        "required": 1,
        "current": 0,
        "nurses": []
      },
      "night_leader": {
        "shiftType": "night_leader",
        "shiftName": "组长(夜班)",
        "required": 1,
        "current": 1,
        "nurses": []
      },
      "night_nurse": {
        "shiftType": "night_nurse",
        "shiftName": "护士(夜班)",
        "required": "根据床位数",
        "current": 3,
        "nurses": []
      },
      "backup_night": {
        "shiftType": "backup_night",
        "shiftName": "备夜班",
        "required": 1,
        "current": 0,
        "nurses": []
      }
    }
  }
}
```

**失败响应**:
```json
{
  "code": 400,
  "message": "请提供日期参数",
  "data": null
}
```

---

## 4. 统计接口

### 4.1 获取科室统计信息

**接口地址**: `GET /api/statistics/department`

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| departmentId | string | 否 | 科室ID，不传则统计所有科室 |

**请求示例**:
```
GET /api/statistics/department?departmentId=D001
```

**成功响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "departmentId": "D001",
    "departmentName": "中心监护室",
    "totalNurses": 9,
    "onDutyCount": 7,
    "offDutyCount": 1,
    "leaveCount": 1,
    "weeklyShifts": 88,
    "levelDistribution": {
      "N4": 1,
      "N3": 8,
      "N2": 3,
      "N1": 2,
      "N0": 1
    }
  }
}
```

---

### 4.2 获取护士排班统计

**接口地址**: `GET /api/statistics/nurse/{nurseId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nurseId | string | 是 | 护士工号 |

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式: YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式: YYYY-MM-DD |

**请求示例**:
```
GET /api/statistics/nurse/N001?startDate=2024-01-01&endDate=2024-01-31
```

**成功响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "nurseId": "N001",
    "nurseName": "张三",
    "weeklyShifts": 5,
    "monthlyShifts": 20,
    "lastSchedule": "2024-01-15 责任组长(白班)",
    "shiftStatistics": {
      "day": 12,
      "night": 8,
      "off": 10
    }
  }
}
```

**失败响应**:
```json
{
  "code": 404,
  "message": "护士不存在",
  "data": null
}
```

---

## 数据字典

### 护士级别 (level)
- `N4`: N4护士（最高级别）
- `N3`: N3护士
- `N2`: N2护士
- `N1`: N1护士
- `N0`: N0护士（最低级别）
- `实习护士`: 实习护士（需要绑定带班老师）
- `进修护士`: 进修护士（需要绑定带班老师）

### 排班状态 (scheduleStatus)
- `on_duty`: 在岗
- `off_duty`: 休假
- `leave`: 请假
- `training`: 培训
- `sick`: 病假
- `maternity`: 怀孕请假
- `study`: 进修
- `support`: 外派支援

### 班次类型 (shiftType)

#### 白班类型：
- `day_team_leader`: 责任组长(白班) - 10小时，工作日各1人，周末/节假日1人
- `day_duty_nurse`: 责任护士(白班) - 12小时，约9-10人
- `day_office`: 办公护士(白班) - 8小时，N2级以上，各1人
- `day_treatment`: 治疗护士(白班) - 8小时，N1及以上，各1人
- `backup_day`: 备白班 - 8小时（8:00-16:00），选择夜休第3天位置人员

#### 夜班类型：
- `night_leader`: 组长(夜班) - 12小时，N3及以上，1人
- `night_nurse`: 护士(夜班) - 12小时
- `backup_night`: 备夜班 - 12小时（20:00-次日08:00），选择夜休第2天位置人员

---

## 前端对接示例

### JavaScript (Fetch API)

```javascript
// 获取护士列表
async function getNurseList(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`https://eflfbpmxcpqg.sealoshzh.site/api/nurse/list?${queryString}`);
  const result = await response.json();
  
  if (result.code === 200) {
    console.log('获取成功', result.data);
    return result.data;
  } else {
    console.error('获取失败', result.message);
    throw new Error(result.message);
  }
}

// 添加护士
async function addNurse(nurseData) {
  const response = await fetch('https://eflfbpmxcpqg.sealoshzh.site/api/nurse/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nurseData)
  });
  
  const result = await response.json();
  
  if (result.code === 200) {
    console.log('添加成功', result.data);
    return result.data;
  } else {
    console.error('添加失败', result.message);
    throw new Error(result.message);
  }
}

// 上传Excel文件
async function uploadExcel(file, departmentId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('departmentId', departmentId);
  
  const response = await fetch('https://eflfbpmxcpqg.sealoshzh.site/api/nurse/parse-excel', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (result.code === 200) {
    console.log('上传成功', result.data);
    return result.data;
  } else {
    console.error('上传失败', result.message);
    throw new Error(result.message);
  }
}

// 创建排班
async function createSchedule(scheduleData) {
  const response = await fetch('https://eflfbpmxcpqg.sealoshzh.site/api/schedule/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(scheduleData)
  });
  
  const result = await response.json();
  
  if (result.code === 200) {
    console.log('创建成功', result.data);
    return result.data;
  } else {
    console.error('创建失败', result.message);
    throw new Error(result.message);
  }
}

// 验证排班规则
async function validateSchedule(validateData) {
  const response = await fetch('https://eflfbpmxcpqg.sealoshzh.site/api/schedule/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(validateData)
  });
  
  const result = await response.json();
  
  if (result.code === 200) {
    return result.data; // { valid: boolean, errors: [], warnings: [] }
  } else {
    throw new Error(result.message);
  }
}
```

### Axios 示例

```javascript
import axios from 'axios';

// 配置axios基础URL
const api = axios.create({
  baseURL: 'https://eflfbpmxcpqg.sealoshzh.site/api',
  timeout: 10000
});

// 请求拦截器（可添加token等）
api.interceptors.request.use(config => {
  // const token = localStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

// 响应拦截器（统一处理错误）
api.interceptors.response.use(
  response => {
    const { code, message, data } = response.data;
    if (code === 200) {
      return data;
    } else {
      return Promise.reject(new Error(message));
    }
  },
  error => {
    return Promise.reject(error);
  }
);

// 使用示例
export const nurseAPI = {
  // 获取护士列表
  getList: (params) => api.get('/nurse/list', { params }),
  
  // 获取护士详情
  getDetail: (nurseId) => api.get(`/nurse/${nurseId}`),
  
  // 添加护士
  add: (data) => api.post('/nurse/add', data),
  
  // 更新护士
  update: (nurseId, data) => api.put(`/nurse/${nurseId}`, data),
  
  // 删除护士
  delete: (nurseId) => api.delete(`/nurse/${nurseId}`),
  
  // 批量导入Excel
  parseExcel: (file, departmentId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('departmentId', departmentId);
    return api.post('/nurse/parse-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // 批量删除
  batchDelete: (data) => api.delete('/nurse/batch', { data })
};

export const departmentAPI = {
  // 获取科室列表
  getList: (params) => api.get('/department/list', { params }),
  
  // 创建科室
  add: (data) => api.post('/department/add', data),
  
  // 获取科室详情
  getDetail: (departmentId) => api.get(`/department/${departmentId}`),
  
  // 更新科室
  update: (departmentId, data) => api.put(`/department/${departmentId}`, data)
};

export const scheduleAPI = {
  // 获取排班列表
  getList: (params) => api.get('/schedule/list', { params }),
  
  // 获取日历视图排班数据（按日期分组）
  getCalendar: (params) => api.get('/schedule/calendar', { params }),
  
  // 获取护士排班日历
  getNurseCalendar: (nurseId, params) => api.get(`/schedule/nurse-calendar/${nurseId}`, { params }),
  
  // 创建排班
  add: (data) => api.post('/schedule/add', data),
  
  // 批量创建排班
  batchAdd: (data) => api.post('/schedule/batch', data),
  
  // 批量更新排班
  batchUpdate: (data) => api.put('/schedule/batch', data),
  
  // 批量删除排班
  batchDelete: (data) => api.delete('/schedule/batch', { data }),
  
  // 更新排班
  update: (scheduleId, data) => api.put(`/schedule/${scheduleId}`, data),
  
  // 删除排班
  delete: (scheduleId) => api.delete(`/schedule/${scheduleId}`),
  
  // 验证排班规则
  validate: (data) => api.post('/schedule/validate', data),
  
  // 获取日期统计
  getDateStats: (params) => api.get('/schedule/date-stats', { params })
};

export const statisticsAPI = {
  // 获取科室统计
  getDepartment: (params) => api.get('/statistics/department', { params }),
  
  // 获取护士统计
  getNurse: (nurseId, params) => api.get(`/statistics/nurse/${nurseId}`, { params })
};
```

---

## 常见问题 (FAQ)

### 1. 日期格式
所有日期字段使用 `YYYY-MM-DD` 格式，例如：`2024-01-15`

### 2. 排班ID格式
排班ID是MongoDB的ObjectId字符串，格式如：`65a1b2c3d4e5f6g7h8i9j0k1`

### 3. 文件上传限制
- 文件格式：仅支持 `.xlsx` 和 `.xls`
- 文件大小：最大10MB
- Content-Type：`multipart/form-data`

### 4. 分页处理
列表接口支持分页，默认参数：
- `page`: 1（第一页）
- `pageSize`: 20（每页20条）

### 5. 批量操作错误处理
批量操作接口（如批量创建排班、Excel导入）即使部分失败，也会返回 `code: 200`，需要在 `data.errors` 中检查错误详情。

### 6. 排班验证
创建排班前建议先调用 `/api/schedule/validate` 接口进行规则验证，避免创建后才发现不符合规则。

### 7. 科室容量限制
- **添加护士时**：系统会检查科室当前护士数量，如果已达到容量限制，将无法添加新护士
- **批量导入时**：系统会计算Excel中需要新增的护士数量，如果加上当前护士数量超过容量，导入将被拒绝
- **容量更新**：可以通过 `PUT /api/department/{departmentId}` 接口更新科室容量
- **默认容量**：新建科室时，如果不指定容量，默认为150
- **当前容量**：中心监护室(D001)的容量已设置为150

### 8. 详细排班界面接口
- **日历视图**：使用 `GET /api/schedule/calendar` 获取按日期分组的排班数据，方便前端展示日历视图
- **批量操作**：支持批量更新 (`PUT /api/schedule/batch`) 和批量删除 (`DELETE /api/schedule/batch`) 排班
- **护士日历**：使用 `GET /api/schedule/nurse-calendar/{nurseId}` 获取特定护士的排班日历
- **日期范围**：日历视图接口会返回指定日期范围内的所有日期（包括没有排班的日期），方便前端完整展示

---

## 错误码说明

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 200 | 请求成功 | 正常处理 |
| 400 | 请求参数错误 | 检查请求参数是否正确 |
| 401 | 未授权 | 需要登录或token过期 |
| 403 | 无权限 | 检查用户权限 |
| 404 | 资源不存在 | 检查ID是否正确 |
| 500 | 服务器内部错误 | 联系后端开发人员 |

---

## 注意事项

1. **请求头设置**
   - JSON请求：`Content-Type: application/json`
   - 文件上传：`Content-Type: multipart/form-data`（浏览器会自动设置）

2. **路径参数**
   - 路径中的参数如 `{nurseId}`、`{scheduleId}` 需要替换为实际值
   - 例如：`/api/nurse/N001` 而不是 `/api/nurse/{nurseId}`

3. **可选参数**
   - Query参数中标注"可选"的参数可以不传
   - 请求体中标注"可选"的字段可以不传，系统会使用默认值

4. **数据验证**
   - 所有必填字段必须传递，否则返回400错误
   - 枚举值必须严格匹配数据字典中的值

5. **时间戳格式**
   - 返回的时间戳为ISO 8601格式：`2024-01-10T10:00:00.000Z`
   - 前端需要根据需要进行格式化显示

6. **实习/进修护士**
   - 实习护士和进修护士必须绑定带班老师（`mentor`字段）
   - 创建或更新时如果不传`mentor`会返回错误

7. **科室容量限制**
   - 添加护士或批量导入时会检查科室容量（`capacity`字段）
   - 如果当前护士数量已达到或超过容量限制，将无法添加新护士
   - 批量导入时，如果Excel中的新护士数量加上当前护士数量超过容量，导入会被拒绝
   - 可以通过更新科室接口修改容量限制

---

## 快速测试

### 使用 curl 测试接口

```bash
# 获取护士列表
curl -X GET "https://eflfbpmxcpqg.sealoshzh.site/api/nurse/list?page=1&pageSize=10"

# 创建科室
curl -X POST "https://eflfbpmxcpqg.sealoshzh.site/api/department/add" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "D001",
    "name": "中心监护室",
    "director": "李主任",
    "capacity": 150
  }'

# 添加护士
curl -X POST "https://eflfbpmxcpqg.sealoshzh.site/api/nurse/add" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "N001",
    "name": "张三",
    "level": "N4",
    "departmentId": "D001",
    "isTeamLeader": true
  }'

# 获取排班列表
curl -X GET "https://eflfbpmxcpqg.sealoshzh.site/api/schedule/list?startDate=2024-01-01&endDate=2024-01-31"

# 创建排班
curl -X POST "https://eflfbpmxcpqg.sealoshzh.site/api/schedule/add" \
  -H "Content-Type: application/json" \
  -d '{
    "nurseId": "N001",
    "departmentId": "D001",
    "date": "2024-01-15",
    "shiftType": "day_team_leader"
  }'
```

---

## TypeScript 类型定义

### 公共类型

```typescript
// 通用响应类型
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

// 分页响应类型
interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 护士级别枚举
type NurseLevel = 'N4' | 'N3' | 'N2' | 'N1' | 'N0' | '实习护士' | '进修护士';

// 排班状态枚举
type ScheduleStatus = 
  | 'on_duty'    // 在岗
  | 'off_duty'   // 休假
  | 'leave'      // 请假
  | 'training'   // 培训
  | 'sick'       // 病假
  | 'maternity'  // 怀孕请假
  | 'study'      // 进修
  | 'support';   // 外派支援

// 班次类型枚举
type ShiftType = 
  | 'day_team_leader'  // 责任组长(白班)
  | 'day_duty_nurse'    // 责任护士(白班)
  | 'day_office'        // 办公护士(白班)
  | 'day_treatment'     // 治疗护士(白班)
  | 'backup_day'        // 备白班
  | 'night_leader'      // 组长(夜班)
  | 'night_nurse'       // 护士(夜班)
  | 'backup_night';     // 备夜班
```

### 护士相关类型

```typescript
// 护士信息
interface Nurse {
  id: string;
  name: string;
  level: NurseLevel;
  departmentId: string;
  departmentName?: string;
  scheduleStatus: ScheduleStatus;
  weeklyShifts: number;
  lastSchedule?: string;
  isTeamLeader: boolean;
  mentor?: string;
  importDate?: string;
  graduationYear: number | null;
  annualLeave: number;
  storedLeave: number;
  createdAt?: string;
  updatedAt?: string;
}

// 添加护士请求
interface AddNurseRequest {
  id: string;
  name: string;
  level: NurseLevel;
  departmentId: string;
  scheduleStatus?: ScheduleStatus;
  isTeamLeader?: boolean;
  mentor?: string;
  graduationYear?: number | null;
  annualLeave?: number;
  storedLeave?: number;
}

// 更新护士请求（所有字段可选）
interface UpdateNurseRequest {
  name?: string;
  level?: NurseLevel;
  departmentId?: string;
  scheduleStatus?: ScheduleStatus;
  isTeamLeader?: boolean;
  mentor?: string;
  graduationYear?: number | null;
  annualLeave?: number;
  storedLeave?: number;
}

// 获取护士列表请求
interface GetNurseListRequest {
  departmentId?: string;
  level?: NurseLevel;
  scheduleStatus?: ScheduleStatus;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

// 批量删除请求
interface BatchDeleteNurseRequest {
  nurseIds?: string[];
  importDate?: string;
}
```

### 科室相关类型

```typescript
// 科室信息
interface Department {
  id: string;
  name: string;
  director?: string;
  nurseCount?: number;
  capacity: number;
  createdAt?: string;
  updatedAt?: string;
}

// 创建科室请求
interface AddDepartmentRequest {
  id: string;
  name: string;
  director?: string;
  capacity?: number;
}

// 更新科室请求
interface UpdateDepartmentRequest {
  name?: string;
  director?: string;
  capacity?: number;
}
```

### 排班相关类型

```typescript
// 排班信息
interface Schedule {
  _id?: string;
  id?: string;
  nurseId: string;
  nurseName?: string;
  nurseLevel?: string;
  departmentId: string;
  date: string;  // YYYY-MM-DD
  shiftType: ShiftType;
  shiftName: string;
  createdAt?: string;
  updatedAt?: string;
}

// 创建排班请求
interface CreateScheduleRequest {
  nurseId: string;
  departmentId: string;
  date: string;  // YYYY-MM-DD
  shiftType: ShiftType;
  shiftName?: string;
}

// 批量创建排班请求
interface BatchCreateScheduleRequest {
  departmentId: string;
  schedules: Array<{
    nurseId: string;
    date: string;
    shiftType: ShiftType;
    shiftName?: string;
  }>;
}

// 验证排班请求
interface ValidateScheduleRequest {
  nurseId: string;
  date: string;
  shiftType: ShiftType;
}

// 验证排班响应
interface ValidateScheduleResponse {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// 班次统计信息
interface ShiftStats {
  shiftType: ShiftType;
  shiftName: string;
  required: number | string;
  current: number;
  nurses: Array<{
    nurseId: string;
    nurseName: string;
    nurseLevel: string;
  }>;
}

// 日期统计响应
interface DateStatsResponse {
  date: string;
  isWorkday: boolean;
  shifts: Record<ShiftType, ShiftStats>;
}

// 日历视图排班项
interface CalendarScheduleItem {
  id: string;
  nurseId: string;
  nurseName: string;
  nurseLevel: string;
  shiftType: ShiftType;
  shiftName: string;
  departmentId: string;
  createdAt?: string;
  updatedAt?: string;
}

// 日历视图日期项
interface CalendarDateItem {
  date: string;  // YYYY-MM-DD
  isWorkday: boolean;
  schedules: CalendarScheduleItem[];
}

// 日历视图响应
interface CalendarViewResponse {
  startDate: string;
  endDate: string;
  calendar: CalendarDateItem[];
}

// 批量更新排班请求
interface BatchUpdateScheduleRequest {
  updates: Array<{
    scheduleId: string;  // MongoDB ObjectId
    nurseId?: string;
    date?: string;
    shiftType?: ShiftType;
    shiftName?: string;
  }>;
}

// 批量更新排班响应
interface BatchUpdateScheduleResponse {
  successCount: number;
  failCount: number;
  errors: string[];
}

// 批量删除排班请求
interface BatchDeleteScheduleRequest {
  scheduleIds: string[];  // MongoDB ObjectId数组
}

// 批量删除排班响应
interface BatchDeleteScheduleResponse {
  deletedCount: number;
}

// 护士排班日历响应
interface NurseCalendarResponse {
  nurseId: string;
  nurseName: string;
  startDate: string;
  endDate: string;
  calendar: CalendarDateItem[];
}
```

### 统计相关类型

```typescript
// 科室统计响应
interface DepartmentStatistics {
  departmentId: string;
  departmentName: string;
  totalNurses: number;
  onDutyCount: number;
  offDutyCount: number;
  leaveCount: number;
  weeklyShifts: number;
  levelDistribution: Record<NurseLevel, number>;
}

// 护士统计响应
interface NurseStatistics {
  nurseId: string;
  nurseName: string;
  weeklyShifts: number;
  monthlyShifts: number;
  lastSchedule: string;
  shiftStatistics: {
    day: number;
    night: number;
    off: number;
  };
}
```

---

## 接口汇总表

### 护士管理接口

| 接口路径 | 方法 | 说明 | 必填参数 |
|---------|------|------|---------|
| `/api/nurse/list` | GET | 获取护士列表 | 无 |
| `/api/nurse/{nurseId}` | GET | 获取护士详情 | nurseId |
| `/api/nurse/add` | POST | 添加护士 | id, name, level, departmentId |
| `/api/nurse/{nurseId}` | PUT | 更新护士信息 | nurseId |
| `/api/nurse/{nurseId}` | DELETE | 删除护士 | nurseId |
| `/api/nurse/parse-excel` | POST | 批量导入护士 | file, departmentId |
| `/api/nurse/batch` | DELETE | 批量删除护士 | nurseIds 或 importDate |

### 科室管理接口

| 接口路径 | 方法 | 说明 | 必填参数 |
|---------|------|------|---------|
| `/api/department/list` | GET | 获取科室列表 | 无 |
| `/api/department/add` | POST | 创建科室 | id, name |
| `/api/department/{departmentId}` | GET | 获取科室详情 | departmentId |
| `/api/department/{departmentId}` | PUT | 更新科室信息 | departmentId |

### 排班管理接口

| 接口路径 | 方法 | 说明 | 必填参数 |
|---------|------|------|---------|
| `/api/schedule/list` | GET | 获取排班列表 | 无 |
| `/api/schedule/calendar` | GET | 获取日历视图排班数据（按日期分组） | startDate, endDate |
| `/api/schedule/nurse-calendar/{nurseId}` | GET | 获取护士排班日历 | nurseId, startDate, endDate |
| `/api/schedule/add` | POST | 创建排班 | nurseId, departmentId, date, shiftType |
| `/api/schedule/batch` | POST | 批量创建排班 | departmentId, schedules |
| `/api/schedule/batch` | PUT | 批量更新排班 | updates |
| `/api/schedule/batch` | DELETE | 批量删除排班 | scheduleIds |
| `/api/schedule/{scheduleId}` | PUT | 更新排班 | scheduleId |
| `/api/schedule/{scheduleId}` | DELETE | 删除排班 | scheduleId |
| `/api/schedule/validate` | POST | 验证排班规则 | nurseId, date, shiftType |
| `/api/schedule/date-stats` | GET | 获取指定日期班次人员统计 | date |

### 统计接口

| 接口路径 | 方法 | 说明 | 必填参数 |
|---------|------|------|---------|
| `/api/statistics/department` | GET | 获取科室统计 | 无 |
| `/api/statistics/nurse/{nurseId}` | GET | 获取护士统计 | nurseId |

---

## 版本信息

- **文档版本**: v1.1.0
- **更新日期**: 2024-01-15
- **API版本**: v1.1.0

---

## 联系方式

如有接口对接问题，请联系后端开发团队。
