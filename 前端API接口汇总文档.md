# 前端API接口汇总文档

本文档汇总了前端代码中实际使用的所有API接口，用于后端接口对接和更新。

**API基础地址**: `https://eflfbpmxcpqg.sealoshzh.site/api`

---

## 1. 护士管理接口

### 1.1 获取护士列表
**接口路径**: `GET /api/nurse/list`

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| departmentId | string | 否 | 科室ID |
| level | string | 否 | 护士级别 (N4, N3, N2, N1, N0, 实习护士, 进修护士) |
| scheduleStatus | string | 否 | 排班状态 (on_duty, off_duty, leave, training, sick, maternity, study, support) |
| keyword | string | 否 | 搜索关键词（姓名或工号） |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20（前端使用1000获取全部） |

**使用场景**:
- 科室管理页面：加载科室护士列表
- 排班管理页面：加载可排班护士列表

**响应要求**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": "P3505",
        "name": "徐良宇",
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
        "annualLeave": 0,
        "storedLeave": 0.01,
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

**重要字段说明**:
- `graduationYear`: 护士年届（4位整型年份，1000-9999），可为null
- `annualLeave`: 年休（天数，浮点型），支持负数和小数，默认0
- `storedLeave`: 存休（天数，浮点型），支持负数和小数，默认0

---

### 1.2 获取单个护士详情
**接口路径**: `GET /api/nurse/{nurseId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nurseId | string | 是 | 护士工号 |

**使用场景**:
- 科室管理页面：编辑护士信息时获取详情

**响应要求**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "P3505",
    "name": "徐良宇",
    "level": "N4",
    "departmentId": "D001",
    "scheduleStatus": "on_duty",
    "weeklyShifts": 5,
    "lastSchedule": "2024-01-15 责任组长(白班)",
    "isTeamLeader": true,
    "mentor": "",
    "importDate": "2024-01-10",
    "graduationYear": 2020,
    "annualLeave": 0,
    "storedLeave": 0.01
  }
}
```

---

### 1.3 添加护士
**接口路径**: `POST /api/nurse/add`

**请求体**:
```json
{
  "id": "P3505",
  "name": "徐良宇",
  "level": "N4",
  "departmentId": "D001",
  "scheduleStatus": "on_duty",
  "isTeamLeader": true,
  "mentor": "",
  "graduationYear": 2020,
  "annualLeave": 0,
  "storedLeave": 0.01
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 工号，唯一 |
| name | string | 是 | 姓名 |
| level | string | 是 | 护士级别 |
| departmentId | string | 是 | 科室ID |
| scheduleStatus | string | 否 | 排班状态，默认"on_duty" |
| isTeamLeader | boolean | 否 | 是否责任组长，默认false |
| mentor | string | 否 | 带班老师工号（实习护士和进修护士必填） |
| graduationYear | number\|null | 否 | 护士年届（4位整型年份，1000-9999），默认null |
| annualLeave | number | 否 | 年休（天数，浮点型，支持负数），默认0 |
| storedLeave | number | 否 | 存休（天数，浮点型，支持负数），默认0 |

**使用场景**:
- 科室管理页面：添加新护士

---

### 1.4 更新护士信息
**接口路径**: `PUT /api/nurse/{nurseId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nurseId | string | 是 | 护士工号 |

**请求体** (所有字段可选，只传需要更新的字段):
```json
{
  "name": "徐良宇",
  "level": "N3",
  "scheduleStatus": "leave",
  "isTeamLeader": false,
  "graduationYear": 2019,
  "annualLeave": -10.5,
  "storedLeave": -5.25
}
```

**使用场景**:
- 科室管理页面：编辑护士信息

**重要说明**:
- `annualLeave` 和 `storedLeave` 支持负数（表示欠休）
- 支持小数（0.01精度）

---

### 1.5 删除护士
**接口路径**: `DELETE /api/nurse/{nurseId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nurseId | string | 是 | 护士工号 |

**使用场景**:
- 科室管理页面：删除护士

---

### 1.6 批量导入护士（Excel解析）
**接口路径**: `POST /api/nurse/parse-excel`

**请求格式**: `multipart/form-data`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | Excel文件 (.xlsx, .xls)，最大10MB |
| departmentId | string | 是 | 科室ID |

**Excel文件格式**:
- 第一列: 工号（如: 6969, P1086）
- 第二列: 姓名（如: 郭晶晶）
- 第三列: 级别/角色（如: N4护士/责任组长, N3护士, N2护士）

**使用场景**:
- 科室管理页面：批量导入护士

**响应要求**:
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
      }
    ],
    "total": 14,
    "successCount": 14,
    "failCount": 0,
    "errors": []
  }
}
```

---

### 1.7 批量删除护士
**接口路径**: `DELETE /api/nurse/batch`

**请求体**:
```json
{
  "nurseIds": ["P3505", "P3314", "p3246"],
  "importDate": "2024-01-10"
}
```

**字段说明**:
- `nurseIds` (可选): 护士工号数组，与 `importDate` 二选一
- `importDate` (可选): 导入日期，按导入日期批量删除

**使用场景**:
- 科室管理页面：批量删除护士

---

## 2. 科室管理接口

### 2.1 获取科室列表
**接口路径**: `GET /api/department/list`

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 否 | 搜索关键词（科室名称） |

**使用场景**:
- 首页：加载科室列表
- 科室管理页面：选择科室

---

### 2.2 获取科室详情
**接口路径**: `GET /api/department/{departmentId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| departmentId | string | 是 | 科室ID |

**使用场景**:
- 科室管理页面：加载科室信息

**响应要求**:
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

---

### 2.3 创建科室
**接口路径**: `POST /api/department/add`

**请求体**:
```json
{
  "id": "D001",
  "name": "中心监护室",
  "director": "李主任",
  "capacity": 150
}
```

**使用场景**:
- 科室管理页面：创建新科室（如果后端支持）

---

### 2.4 更新科室信息
**接口路径**: `PUT /api/department/{departmentId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| departmentId | string | 是 | 科室ID |

**请求体** (所有字段可选):
```json
{
  "name": "中心监护室",
  "director": "李主任",
  "capacity": 150
}
```

**使用场景**:
- 科室管理页面：更新科室信息（如果后端支持）

---

## 3. 排班管理接口

### 3.1 获取排班列表
**接口路径**: `GET /api/schedule/list`

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| departmentId | string | 否 | 科室ID |
| nurseId | string | 否 | 护士工号 |
| startDate | string | 否 | 开始日期，格式: YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式: YYYY-MM-DD |
| shiftType | string | 否 | 班次类型，多个值用逗号分隔 |

**使用场景**:
- 排班管理页面：加载周排班数据

**响应要求**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "nurseId": "P3505",
        "nurseName": "徐良宇",
        "nurseLevel": "N4",
        "departmentId": "D001",
        "date": "2024-11-03",
        "shiftType": "day_team_leader",
        "shiftName": "责任组长(白班)",
        "createdAt": "2024-01-10T10:00:00.000Z",
        "updatedAt": "2024-01-10T10:00:00.000Z"
      }
    ]
  }
}
```

**重要说明**:
- 返回数据必须包含 `_id` 或 `id` 字段（用于删除和更新）
- `shiftName` 字段必须包含，用于前端显示

---

### 3.2 创建排班
**接口路径**: `POST /api/schedule/add`

**请求体**:
```json
{
  "nurseId": "P3505",
  "departmentId": "D001",
  "date": "2024-11-03",
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

**使用场景**:
- 排班管理页面：拖拽状态到单元格创建排班

**特殊状态处理**:
- `shiftType: "off_duty"` + `shiftName: "休息"` - 休息状态
- `shiftType: "off_duty"` + `shiftName: "调休"` - 调休状态
- `shiftType: "training"` + `shiftName: "院内培训"` - 培训状态

**响应要求**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "nurseId": "P3505",
    "nurseName": "徐良宇",
    "date": "2024-11-03",
    "shiftType": "day_team_leader",
    "shiftName": "责任组长(白班)",
    "createdAt": "2024-01-10T10:00:00.000Z"
  }
}
```

---

### 3.3 删除排班
**接口路径**: `DELETE /api/schedule/{scheduleId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| scheduleId | string | 是 | 排班ID (MongoDB ObjectId) |

**使用场景**:
- 排班管理页面：点击单元格删除排班

---

### 3.4 验证排班规则
**接口路径**: `POST /api/schedule/validate`

**请求体**:
```json
{
  "nurseId": "P3505",
  "date": "2024-11-03",
  "shiftType": "day_team_leader"
}
```

**使用场景**:
- 排班管理页面：创建排班前验证规则

**响应要求**:
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

或验证失败时:
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

**重要说明**:
- 休息、调休、培训等状态应跳过验证（前端处理）

---

### 3.5 批量创建排班
**接口路径**: `POST /api/schedule/batch`

**请求体**:
```json
{
  "departmentId": "D001",
  "schedules": [
    {
      "nurseId": "P3505",
      "date": "2024-11-03",
      "shiftType": "day_team_leader"
    },
    {
      "nurseId": "P3314",
      "date": "2024-11-03",
      "shiftType": "night_leader"
    }
  ]
}
```

**使用场景**:
- 批量导入排班（当前未使用，但接口已定义）

---

### 3.6 批量更新排班
**接口路径**: `PUT /api/schedule/batch`

**请求体**:
```json
{
  "updates": [
    {
      "scheduleId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "nurseId": "P3314",
      "date": "2024-11-03",
      "shiftType": "night_nurse",
      "shiftName": "护士(夜班)"
    }
  ]
}
```

**使用场景**:
- 批量修改排班（当前未使用，但接口已定义）

---

### 3.7 批量删除排班
**接口路径**: `DELETE /api/schedule/batch`

**请求体**:
```json
{
  "scheduleIds": [
    "65a1b2c3d4e5f6g7h8i9j0k1",
    "65a1b2c3d4e5f6g7h8i9j0k2"
  ]
}
```

**使用场景**:
- 批量删除排班（当前未使用，但接口已定义）

---

### 3.8 获取日历视图排班数据
**接口路径**: `GET /api/schedule/calendar`

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| departmentId | string | 否 | 科室ID |
| startDate | string | 是 | 开始日期，格式: YYYY-MM-DD |
| endDate | string | 是 | 结束日期，格式: YYYY-MM-DD |

**使用场景**:
- 日历视图排班（当前未使用，但接口已定义）

---

### 3.9 获取护士排班日历
**接口路径**: `GET /api/schedule/nurse-calendar/{nurseId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nurseId | string | 是 | 护士工号 |

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 是 | 开始日期，格式: YYYY-MM-DD |
| endDate | string | 是 | 结束日期，格式: YYYY-MM-DD |

**使用场景**:
- 查看护士个人排班日历（当前未使用，但接口已定义）

---

### 3.10 获取指定日期班次人员统计
**接口路径**: `GET /api/schedule/date-stats`

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| date | string | 是 | 日期，格式: YYYY-MM-DD |
| departmentId | string | 否 | 科室ID |

**使用场景**:
- 查看日期排班统计（当前未使用，但接口已定义）

---

### 3.11 更新排班
**接口路径**: `PUT /api/schedule/{scheduleId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| scheduleId | string | 是 | 排班ID (MongoDB ObjectId) |

**请求体** (所有字段可选):
```json
{
  "nurseId": "P3314",
  "date": "2024-11-03",
  "shiftType": "night_nurse",
  "shiftName": "护士(夜班)"
}
```

**使用场景**:
- 修改排班（当前未使用，但接口已定义）

---

## 4. 统计接口

### 4.1 获取科室统计信息
**接口路径**: `GET /api/statistics/department`

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| departmentId | string | 否 | 科室ID，不传则统计所有科室 |

**使用场景**:
- 首页：显示科室统计信息

**响应要求**:
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
**接口路径**: `GET /api/statistics/nurse/{nurseId}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nurseId | string | 是 | 护士工号 |

**请求参数** (Query参数):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期，格式: YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式: YYYY-MM-DD |

**使用场景**:
- 查看护士个人统计（当前未使用，但接口已定义）

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

#### 标准班次类型：
- `day_team_leader`: 责任组长(白班)
- `day_duty_nurse`: 责任护士(白班)
- `day_office`: 办公护士(白班)
- `day_treatment`: 治疗护士(白班)
- `backup_day`: 备白班
- `night_leader`: 组长(夜班)
- `night_nurse`: 护士(夜班)
- `backup_night`: 备夜班

#### 特殊状态类型：
- `off_duty`: 用于休息和调休状态
  - `shiftName: "休息"` - 休息状态
  - `shiftName: "调休"` - 调休状态
- `training`: 培训状态
  - `shiftName: "院内培训"` - 培训状态

---

## 前端实际使用的接口汇总

### 核心功能接口（必须实现）:

1. **护士管理**:
   - ✅ `GET /api/nurse/list` - 获取护士列表
   - ✅ `GET /api/nurse/{nurseId}` - 获取护士详情
   - ✅ `POST /api/nurse/add` - 添加护士（必须支持 graduationYear, annualLeave, storedLeave）
   - ✅ `PUT /api/nurse/{nurseId}` - 更新护士（必须支持 graduationYear, annualLeave, storedLeave）
   - ✅ `DELETE /api/nurse/{nurseId}` - 删除护士
   - ✅ `POST /api/nurse/parse-excel` - 批量导入护士
   - ✅ `DELETE /api/nurse/batch` - 批量删除护士

2. **科室管理**:
   - ✅ `GET /api/department/list` - 获取科室列表
   - ✅ `GET /api/department/{departmentId}` - 获取科室详情
   - ⚠️ `POST /api/department/add` - 创建科室（可选，前端有fallback逻辑）
   - ⚠️ `PUT /api/department/{departmentId}` - 更新科室（可选，前端有fallback逻辑）

3. **排班管理**:
   - ✅ `GET /api/schedule/list` - 获取排班列表（必须返回 _id 或 id 字段）
   - ✅ `POST /api/schedule/add` - 创建排班（必须支持 shiftName 字段）
   - ✅ `DELETE /api/schedule/{scheduleId}` - 删除排班
   - ✅ `POST /api/schedule/validate` - 验证排班规则

4. **统计接口**:
   - ✅ `GET /api/statistics/department` - 获取科室统计

### 已定义但未使用的接口（可选实现）:

- `POST /api/schedule/batch` - 批量创建排班
- `PUT /api/schedule/batch` - 批量更新排班
- `DELETE /api/schedule/batch` - 批量删除排班
- `PUT /api/schedule/{scheduleId}` - 更新排班
- `GET /api/schedule/calendar` - 获取日历视图排班数据
- `GET /api/schedule/nurse-calendar/{nurseId}` - 获取护士排班日历
- `GET /api/schedule/date-stats` - 获取指定日期班次人员统计
- `GET /api/statistics/nurse/{nurseId}` - 获取护士排班统计

---

## 重要注意事项

### 1. 字段要求
- **护士年届 (`graduationYear`)**: 必须支持 `null` 值，整数类型（1000-9999）
- **年休 (`annualLeave`)**: 必须支持负数（表示欠休），浮点型（0.01精度），最小值为-365
- **存休 (`storedLeave`)**: 必须支持负数（表示欠休），浮点型（0.01精度），最小值为-365
- **排班ID**: 必须返回 `_id` 或 `id` 字段，用于删除和更新操作
- **班次名称 (`shiftName`)**: 创建排班时必须返回，用于前端显示

### 2. 特殊状态处理
- 休息状态：`shiftType: "off_duty"` + `shiftName: "休息"`
- 调休状态：`shiftType: "off_duty"` + `shiftName: "调休"`
- 培训状态：`shiftType: "training"` + `shiftName: "院内培训"`

### 3. 验证规则
- 创建排班前会调用验证接口
- 休息、调休、培训状态应跳过验证（前端处理）

### 4. 错误处理
- 所有接口应返回统一的错误格式：
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

### 5. 日期格式
- 所有日期字段使用 `YYYY-MM-DD` 格式，例如：`2024-11-03`

---

## 版本信息

- **文档版本**: v1.2.0
- **更新日期**: 2024-11-03
- **前端版本**: 基于uni-app Vue3

---

## 联系方式

如有接口对接问题，请联系前端开发团队。
