# DataProcessor Class Documentation

## نظرة عامة

`DataProcessor` هو Class قوي ومرن لمعالجة البيانات القادمة من Backend قبل عرضها في UI. يمكن استخدامه لتحويل البيانات من شكل إلى آخر، وتطبيق قواعد معالجة مختلفة حسب الحاجة.

## المميزات الرئيسية

- ✅ **تفعيل/إلغاء تفعيل**: يمكن تشغيل أو إيقاف المعالج بسهولة
- ✅ **Singleton Pattern**: يتم إنشاء instance واحد فقط
- ✅ **Type Safety**: دعم كامل لـ TypeScript
- ✅ **قابل للتوسع**: يمكن إضافة معالجات جديدة بسهولة
- ✅ **Error Handling**: معالجة الأخطاء بشكل آمن
- ✅ **Logging**: تسجيل العمليات للمراقبة
- ✅ **بيانات محفوظة**: حفظ البيانات البديلة مسبقاً
- ✅ **استبدال بالـ ID**: استبدال البيانات بناءً على مطابقة الـ ID
- ✅ **إدارة البيانات**: إضافة، تعديل، حذف البيانات المحفوظة
- ✅ **معالجة الأدوار**: فلترة وتعديل أسماء الأدوار
- ✅ **إزالة الأدوار غير المرغوبة**: حذف أدوار محددة من العرض

## الاستخدام الأساسي

### 1. استيراد Class

```typescript
import { dataProcessor, BackendResponse, BranchesResponse, PortsResponse } from '@/utils/DataProcessor';
```

### 2. تفعيل/إلغاء تفعيل المعالج

```typescript
// تفعيل المعالج
dataProcessor.setEnabled(true);

// إلغاء تفعيل المعالج
dataProcessor.setEnabled(false);

// التحقق من حالة المعالج
const isEnabled = dataProcessor.getEnabled();
```

### 3. الحصول على البيانات المعالجة تلقائياً

```typescript
// الحصول على البيانات مع المعالجة التلقائية
const branchesResponse = await getBranches();
// البيانات الآن معالجة تلقائياً وتحولت إلى ports
```

### 4. استخدام الدوال المساعدة في الخدمات

```typescript
import { 
  getBranches, 
  setDataProcessorEnabled,
  getReplacementData,
  setReplacementData,
  setReplacementItem,
  removeReplacementItem,
  clearReplacementData
} from '@/services/branchService';

// الحصول على البيانات مع المعالجة التلقائية
const portsData = await getBranches();

// تفعيل/إلغاء تفعيل المعالج
setDataProcessorEnabled(true);

// إدارة البيانات المحفوظة
const savedData = getReplacementData();
setReplacementItem(newItem);
removeReplacementItem(itemId);
clearReplacementData();
```

### 5. إدارة البيانات المحفوظة

```typescript
// الحصول على البيانات المحفوظة
const savedData = dataProcessor.getReplacementData();

// تحديث البيانات المحفوظة
dataProcessor.setReplacementData(newDataArray);

// إضافة أو تحديث عنصر واحد
dataProcessor.setReplacementItem({
  id: 32,
  name: "منفذ مصراتة",
  code: "LYMRA",
  address: "مصراتة",
  phone: "0912345678",
  email: "info@misrataport.ly"
});

// حذف عنصر بالـ ID
dataProcessor.removeReplacementItem(32);

// مسح جميع البيانات المحفوظة
dataProcessor.clearReplacementData();
```

### 6. معالجة الأدوار

```typescript
// معالجة بيانات الأدوار
const rolesResponse = await GetAllRoles();
// سيتم تلقائياً:
// - إزالة: عميل، محاسب، مدقق
// - تغيير "مدير غرفة" إلى "مدير منفذ"

// أو استخدام المعالج مباشرة
const processedRoles = dataProcessor.processRoles(originalRolesData);
```

## مثال عملي

### معالجة الأدوار

**البيانات الأصلية:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name_ar": "عميل",
      "name_en": "Client",
      "code": "client"
    },
    {
      "id": 3,
      "name_ar": "موظف",
      "name_en": "Staff",
      "code": "staff"
    },
    {
      "id": 4,
      "name_ar": "مسؤول",
      "name_en": "Admin",
      "code": "admin"
    },
    {
      "id": 5,
      "name_ar": "محاسب",
      "name_en": "Accountant",
      "code": "accountant"
    },
    {
      "id": 6,
      "name_ar": "مدقق",
      "name_en": "Auditor",
      "code": "auditor"
    },
    {
      "id": 13,
      "name_ar": "مدير غرفة",
      "name_en": "branch_admin",
      "code": "branch_admin"
    }
  ]
}
```

**البيانات المعالجة:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "name_ar": "موظف",
      "name_en": "Staff",
      "code": "staff"
    },
    {
      "id": 4,
      "name_ar": "مسؤول",
      "name_en": "Admin",
      "code": "admin"
    },
    {
      "id": 13,
      "name_ar": "مدير منفذ",
      "name_en": "Port Manager",
      "code": "port_manager"
    }
  ]
}
```

### البيانات الأصلية (Branches)

```json
{
  "success": true,
  "message": "Branches retrieved",
  "data": {
    "branches": [
      {
        "id": 32,
        "name": "الاتحاد",
        "code": "001",
        "address": "طرابلس",
        "phone": "1111111111111",
        "email": "glucc@gmail.com"
      }
    ]
  }
}
```

### البيانات المعالجة (Ports)

```json
{
  "success": true,
  "message": "Ports retrieved",
  "data": {
    "ports": [
      {
        "id": 32,
        "name": "منفذ الاتحاد",
        "code": "LYMRA",
        "address": "طرابلس",
        "phone": "+218-51-xxxxxxxx",
        "email": "info@misrataport.ly"
      }
    ]
  }
}
```

## آلية العمل

### 1. البيانات المحفوظة مسبقاً
يحتوي Class على بيانات محفوظة مسبقاً:

```typescript
private replacementData: PortData[] = [
  {
    "id": 32,
    "name": "منفذ مصراتة",
    "code": "LYMRA",
    "address": "مصراتة",
    "phone": "+218-51-xxxxxxxx",
    "email": "info@misrataport.ly"
  },
  // ... المزيد من البيانات
];
```

### 2. آلية الاستبدال
عند معالجة البيانات:

1. **البحث بالـ ID**: يتم البحث عن البيانات المحفوظة بناءً على الـ ID
2. **الاستبدال**: إذا وُجدت بيانات محفوظة بنفس الـ ID، يتم استبدالها
3. **التحويل**: إذا لم توجد بيانات محفوظة، يتم تحويل البيانات الأصلية

### 3. مثال على الاستبدال

**البيانات الأصلية من Backend:**
```json
{
  "id": 32,
  "name": "الاتحاد",
  "code": "001",
  "address": "طرابلس",
  "phone": "1111111111111",
  "email": "glucc@gmail.com"
}
```

**البيانات المحفوظة:**
```json
{
  "id": 32,
  "name": "منفذ مصراتة",
  "code": "LYMRA",
  "address": "مصراتة",
  "phone": "+218-51-xxxxxxxx",
  "email": "info@misrataport.ly"
}
```

**النتيجة النهائية:**
```json
{
  "id": 32,
  "name": "منفذ مصراتة",
  "code": "LYMRA",
  "address": "مصراتة",
  "phone": "+218-51-xxxxxxxx",
  "email": "info@misrataport.ly"
}
```

## قواعد التحويل (للبيانات غير المحفوظة)

### 1. تحويل الأسماء
- `"الاتحاد"` → `"منفذ الاتحاد"`
- `"طرابلس"` → `"منفذ طرابلس"`

### 2. تحويل الأكواد
- `"001"` → `"LYMRA"`
- `"TNT"` → `"LYBEN"`
- `"003"` → `"LYTIP"`

### 3. تحويل أرقام الهاتف
- `"1111111111111"` → `"+218-51-xxxxxxxx"`
- `"0555555555"` → `"+218-61-xxxxxxxx"`

### 4. تحويل الإيميلات
- `"glucc@gmail.com"` → `"info@misrataport.ly"`
- `"T@yahoo.com"` → `"info@benghaziport.ly"`

## API Reference

### Methods

#### `setEnabled(enabled: boolean): void`
تفعيل أو إلغاء تفعيل المعالج

#### `getEnabled(): boolean`
التحقق من حالة المعالج

#### `processBranchesToPorts(response: BackendResponse<BranchesResponse>): BackendResponse<PortsResponse>`
تحويل بيانات الفروع إلى موانئ باستخدام البيانات المحفوظة

#### `processRoles(response: RolesResponse): RolesResponse`
معالجة بيانات الأدوار - إزالة الأدوار غير المرغوبة وتحديث الأسماء

#### `replaceWithSavedData(backendBranches: BranchData[]): PortData[]`
استبدال البيانات بناءً على مطابقة الـ ID

#### `processData<T, R>(data: T, processorType: string): R`
معالج عام للبيانات (قابل للتوسع)

#### `getReplacementData(): PortData[]`
الحصول على البيانات المحفوظة

#### `setReplacementData(newData: PortData[]): void`
تحديث البيانات المحفوظة

#### `setReplacementItem(item: PortData): void`
إضافة أو تحديث عنصر واحد

#### `removeReplacementItem(id: number): void`
حذف عنصر بالـ ID

#### `clearReplacementData(): void`
مسح جميع البيانات المحفوظة

#### `reset(): void`
إعادة تعيين المعالج إلى الحالة الافتراضية

#### `getStatus(): object`
الحصول على معلومات حالة المعالج

## التوسع المستقبلي

يمكن إضافة معالجات جديدة بسهولة:

```typescript
// إضافة معالج جديد
public processUsersToCustomers(data: any): any {
  if (!this.isEnabled) return data;
  
  // منطق التحويل هنا
  return transformedData;
}

// استخدام المعالج الجديد
const processedData = dataProcessor.processData(usersData, 'users-to-customers');
```

## أمثلة الاستخدام في React

```tsx
import React, { useState, useEffect } from 'react';
import { getBranchesAsPorts, setDataProcessorEnabled } from '@/services/branchService';

const MyComponent: React.FC = () => {
  const [portsData, setPortsData] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const response = await getBranchesAsPorts();
    if (response.success) {
      setPortsData(response.data);
    }
  };

  const toggleProcessor = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    setDataProcessorEnabled(newState);
    loadData(); // إعادة تحميل البيانات
  };

  return (
    <div>
      <button onClick={toggleProcessor}>
        {isEnabled ? 'Disable' : 'Enable'} Processor
      </button>
      {/* عرض البيانات */}
    </div>
  );
};
```

### معالجة المستخدمين (Users Processing)

#### الوصف
يقوم بمعالجة بيانات المستخدمين من `/admin/users` لإزالة المستخدمين ذوي الأدوار غير المرغوبة وتحديث أسماء الأدوار.

#### الميزات
- إزالة المستخدمين ذوي الأدوار: `client`, `accountant`, `auditor`
- تغيير `branch_admin` إلى `port_manager` في بيانات المستخدمين
- تحديث إحصائيات الصفحات (pagination) تلقائياً

#### مثال على الاستخدام
```typescript
import { dataProcessor } from '@/utils/DataProcessor';

// معالجة بيانات المستخدمين
const processedUsers = dataProcessor.processUsers(usersResponse);
```

### معالجة تسجيل الدخول (Login Processing)

#### الوصف
يقوم بمعالجة بيانات تسجيل الدخول من `/auth/login` لتحويل معلومات الفرع إلى منفذ.

#### الميزات
- تحويل أسماء الفروع إلى أسماء المنافذ
- تحديث أكواد الفروع إلى أكواد المنافذ
- تنسيق أرقام الهواتف
- دعم البيانات المحفوظة مسبقاً

#### مثال على الاستخدام
```typescript
import { dataProcessor } from '@/utils/DataProcessor';

// معالجة بيانات تسجيل الدخول
const processedLogin = dataProcessor.processLogin(loginResponse);
```

### تحويل الأدوار (Role Conversion)

#### الوصف
يقوم بتحويل دور `branch_admin` إلى `port_manager` في أي مكان في التطبيق.

#### الميزات
- تحويل `branch_admin` إلى `port_manager`
- يعمل مع أي نص أو كود دور
- يمكن استخدامه في أي مكان في التطبيق

#### مثال على الاستخدام
```typescript
import { dataProcessor } from '@/utils/DataProcessor';

// تحويل دور branch_admin إلى port_manager
const convertedRole = dataProcessor.convertBranchAdminToPortManager("branch_admin");
// النتيجة: "port_manager"

const otherRole = dataProcessor.convertBranchAdminToPortManager("admin");
// النتيجة: "admin" (لا يتغير)
```

#### البيانات الأصلية (Users)
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": {
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total": 11,
      "total_pages": 2
    },
    "users": [
      {
        "id": 68,
        "username": "AhmedQassem@G.com",
        "email": "AhmedQassem@G.com",
        "first_name": "احمد",
        "last_name": "قاسم",
        "phone": "55623654785",
        "role": "admin"
      },
      {
        "id": 67,
        "username": "finance-1",
        "email": "fin@gucc.ly",
        "first_name": "سامي",
        "last_name": "الاتحادي",
        "phone": "0913434444",
        "role": "accountant"
      },
      {
        "id": 66,
        "username": "Osama-02",
        "email": "osama@gucc.ly",
        "first_name": "أسامة",
        "last_name": "بن سونس",
        "phone": "0913434444",
        "role": "auditor"
      },
      {
        "id": 65,
        "username": "sami-1",
        "email": "ggucc@gucc.ly",
        "first_name": "sami",
        "last_name": "ali",
        "phone": "0913434444",
        "role": "staff"
      },
      {
        "id": 64,
        "username": "zyad-1",
        "email": "gucc@gucc.ly",
        "first_name": "زياد",
        "last_name": "وادي",
        "phone": "0913434444",
        "role": "branch_admin"
      }
    ]
  },
  "timestamp": "2025-09-23T19:44:07.3459576Z"
}
```

#### البيانات المعالجة (Processed Users)
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": {
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total": 3,
      "total_pages": 1
    },
    "users": [
      {
        "id": 68,
        "username": "AhmedQassem@G.com",
        "email": "AhmedQassem@G.com",
        "first_name": "احمد",
        "last_name": "قاسم",
        "phone": "55623654785",
        "role": "admin"
      },
      {
        "id": 65,
        "username": "sami-1",
        "email": "ggucc@gucc.ly",
        "first_name": "sami",
        "last_name": "ali",
        "phone": "0913434444",
        "role": "staff"
      },
      {
        "id": 64,
        "username": "zyad-1",
        "email": "gucc@gucc.ly",
        "first_name": "زياد",
        "last_name": "وادي",
        "phone": "0913434444",
        "role": "port_manager"
      }
    ]
  },
  "timestamp": "2025-09-23T19:44:07.3459576Z"
}
```

## ملاحظات مهمة

1. **الأمان**: المعالج يعيد البيانات الأصلية في حالة حدوث خطأ
2. **الأداء**: المعالج يعمل فقط عند التفعيل
3. **المرونة**: يمكن إضافة معالجات جديدة بسهولة
4. **المراقبة**: جميع العمليات مسجلة في Console

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى مراجعة الكود في `utils/DataProcessor.ts`
