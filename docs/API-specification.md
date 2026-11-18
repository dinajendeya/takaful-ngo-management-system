# API Specification

## Gaza Aid Distribution & NGO Management System

**Version:** 1.0  
**Document Type:** REST API Specification  
**Base URL:** `/api/v1`  
**Authentication:** JWT Bearer Token  
**Total Endpoints:** 157

---

## Standard Query Parameters

The following query parameters are standardized across all listing endpoints:

| Parameter | Purpose | Default |
|---|---|---|
| `page` | Current page number | 1 |
| `pageSize` | Items per page | 25 |
| `search` | Free-text search | None |
| `sortBy` | Sort field | `createdAt` |
| `sortDirection` | `asc` or `desc` | `desc` |

Example: `GET /api/v1/families?page=1&pageSize=25&sortBy=createdAt&sortDirection=desc`

---

## Module 01: Authentication

**Base URL:** `/api/v1/auth`  
**Endpoint Count:** 13

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Register Beneficiary Account | POST | `/register/beneficiary` | None | Public |
| Register Donor Account | POST | `/register/donor` | None | Public |
| Login | POST | `/login` | None | Public |
| Logout | POST | `/logout` | None | Authenticated Users |
| Refresh Token | POST | `/refresh` | None | Authenticated Users |
| Forgot Password | POST | `/forgot-password` | None | Public |
| Reset Password | POST | `/reset-password` | None | Public |
| Change Password | PUT | `/change-password` | None | Authenticated Users |
| Get My Profile | GET | `/me` | None | Authenticated Users |
| Update My Profile | PUT | `/me` | None | Authenticated Users |
| Verify Email | POST | `/verify-email` | None | Public |
| Resend Verification Email | POST | `/resend-verification` | None | Public |
| Get Session Info | GET | `/session` | None | Authenticated Users |

---

## Module 02: Branches

**Base URL:** `/api/v1/branches`  
**Endpoint Count:** 7

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Branch | POST | `/` | None | ADM |
| Get Branches | GET | `/` | `page`, `pageSize`, `search`, `governorate`, `sortBy`, `sortDirection` | ADM |
| Get Branch Details | GET | `/{branchId}` | None | ADM |
| Update Branch | PUT | `/{branchId}` | None | ADM |
| Deactivate Branch | PATCH | `/{branchId}/deactivate` | None | ADM |
| Activate Branch | PATCH | `/{branchId}/activate` | None | ADM |
| Get Branch Statistics | GET | `/{branchId}/statistics` | None | ADM, MGR |

---

## Module 03: Users

**Base URL:** `/api/v1/users`  
**Endpoint Count:** 10

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create User | POST | `/` | None | ADM |
| Get Users | GET | `/` | `page`, `pageSize`, `search`, `role`, `branchId`, `isActive`, `sortBy`, `sortDirection` | ADM |
| Get User | GET | `/{userId}` | None | ADM |
| Update User | PUT | `/{userId}` | None | ADM |
| Activate User | PATCH | `/{userId}/activate` | None | ADM |
| Deactivate User | PATCH | `/{userId}/deactivate` | None | ADM |
| Reset Password | POST | `/{userId}/reset-password` | None | ADM |
| Get User Activity | GET | `/{userId}/activity` | `page`, `pageSize`, `action`, `dateFrom`, `dateTo` | ADM |
| Get Users by Branch | GET | `/branch/{branchId}` | `page`, `pageSize`, `role` | ADM, MGR |
| Get User Statistics | GET | `/statistics` | None | ADM |

---

## Module 04: Families

**Base URL:** `/api/v1/families`  
**Endpoint Count:** 14

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Family | POST | `/` | None | ADM, MGR, RES |
| Get Families | GET | `/` | `page`, `pageSize`, `search`, `status`, `governorate`, `publicId`, `phone`, `createdBy`, `verifiedBy`, `createdFrom`, `createdTo`, `sortBy`, `sortDirection` | ADM, MGR, RES |
| Get Family Details | GET | `/{familyId}` | None | ADM, MGR, RES, MBR |
| Update Family | PUT | `/{familyId}` | None | ADM, MGR, RES |
| Verify Family | PATCH | `/{familyId}/verify` | None | ADM, MGR |
| Reject Family | PATCH | `/{familyId}/reject` | None | ADM, MGR |
| Request Reassessment | POST | `/{familyId}/reassessment` | None | ADM, MGR |
| Get Family Distribution History | GET | `/{familyId}/distributions` | `page`, `pageSize`, `projectId`, `dateFrom`, `dateTo` | ADM, MGR, RES, MBR |
| Get Family Statistics | GET | `/statistics` | `branchId`, `governorate` | ADM, MGR |
| Get Family Timeline | GET | `/{familyId}/timeline` | None | ADM, MGR, RES |
| Get Family Assessment History | GET | `/{familyId}/assessments` | `page`, `pageSize` | ADM, MGR, RES |
| Get Family Members Summary | GET | `/{familyId}/members-summary` | None | ADM, MGR, RES, MBR |
| Bulk Verify Families | PATCH | `/bulk/verify` | None | ADM, MGR |
| Export Families | GET | `/export` | `format`, `status`, `governorate`, `createdFrom`, `createdTo` | ADM, MGR |

---

## Module 05: Family Members

**Base URL:** `/api/v1/families/{familyId}/members`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Family Member | POST | `/` | None | ADM, MGR, RES |
| Get Family Members | GET | `/` | `page`, `pageSize`, `search`, `nationalId`, `isHeadOfFamily`, `gender`, `educationLevel`, `employmentStatus`, `hasDisability`, `hasChronicDisease`, `isOrphan`, `sortBy`, `sortDirection` | ADM, MGR, RES, MBR |
| Get Family Member | GET | `/{memberId}` | None | ADM, MGR, RES, MBR |
| Update Family Member | PUT | `/{memberId}` | None | ADM, MGR, RES |
| Delete Family Member | DELETE | `/{memberId}` | None | ADM, MGR |
| Set Head Of Family | PATCH | `/{memberId}/head` | None | ADM, MGR |
| Get Member Statistics | GET | `/statistics` | None | ADM, MGR, RES |
| Search Member by National ID | GET | `/search/national-id` | `nationalId` | ADM, MGR, RES |
| Export Family Members | GET | `/export` | `format` | ADM, MGR |

---

## Module 06: Family Assessments

**Base URL:** `/api/v1/families/{familyId}/assessment`  
**Endpoint Count:** 5

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Assessment | POST | `/` | None | ADM, MGR, RES |
| Get Assessment | GET | `/` | None | ADM, MGR, RES, MBR |
| Update Assessment | PUT | `/` | None | ADM, MGR, RES |
| Get Assessment History | GET | `/history` | `page`, `pageSize` | ADM, MGR, RES |
| Compare Assessments | GET | `/compare` | `assessmentId1`, `assessmentId2` | ADM, MGR, RES |

---

## Module 07: Family Requests

**Base URL:** `/api/v1/family-requests`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Family Request | POST | `/` | None | MBR |
| Get My Requests | GET | `/my` | `page`, `pageSize`, `status`, `sortBy`, `sortDirection` | MBR |
| Get Request Details | GET | `/{requestId}` | None | MBR, MGR, ADM |
| Cancel Request | PATCH | `/{requestId}/cancel` | None | MBR |
| Approve Request | PATCH | `/{requestId}/approve` | None | MGR, ADM |
| Reject Request | PATCH | `/{requestId}/reject` | None | MGR, ADM |
| Get Pending Requests | GET | `/pending` | `page`, `pageSize`, `status`, `familyId`, `requestedBy`, `sortBy`, `sortDirection` | MGR, ADM |
| Get Request Statistics | GET | `/statistics` | `branchId`, `dateFrom`, `dateTo` | ADM, MGR |
| Get Request History | GET | `/{requestId}/history` | None | ADM, MGR |

---

## Module 08: Projects

**Base URL:** `/api/v1/projects`  
**Endpoint Count:** 12

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Project | POST | `/` | None | ADM, MGR |
| Get Projects | GET | `/` | `page`, `pageSize`, `search`, `status`, `createdBy`, `startDate`, `endDate`, `sortBy`, `sortDirection` | ADM, MGR, RES, DNR |
| Get Project Details | GET | `/{projectId}` | None | ADM, MGR, RES, DNR |
| Update Project | PUT | `/{projectId}` | None | ADM, MGR |
| Activate Project | PATCH | `/{projectId}/activate` | None | ADM, MGR |
| Complete Project | PATCH | `/{projectId}/complete` | None | ADM, MGR |
| Cancel Project | PATCH | `/{projectId}/cancel` | None | ADM, MGR |
| Delete Draft Project | DELETE | `/{projectId}` | None | ADM, MGR |
| Get Project Summary | GET | `/{projectId}/summary` | None | ADM, MGR, DNR |
| Get Project Statistics | GET | `/statistics` | `branchId`, `status`, `dateFrom`, `dateTo` | ADM, MGR |
| Get Project Timeline | GET | `/{projectId}/timeline` | None | ADM, MGR |
| Export Project Report | GET | `/{projectId}/export` | `format` | ADM, MGR |

---

## Module 09: Project Beneficiaries

**Base URL:** `/api/v1/projects/{projectId}/beneficiaries`  
**Endpoint Count:** 7

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Generate Beneficiary List | POST | `/generate` | `housingType`, `incomeLessThan`, `isDisplaced`, `isRegisteredInCamp`, `hasElectricity`, `hasInternet`, `hasDisability`, `hasChronicDisease`, `isOrphan`, `educationLevel`, `ageMin`, `ageMax` | ADM, MGR |
| View Beneficiary List | GET | `/` | `page`, `pageSize`, `search`, `sortBy`, `sortDirection` | ADM, MGR |
| Remove Family From List | DELETE | `/{familyId}` | None | ADM, MGR |
| Regenerate List | POST | `/regenerate` | None | ADM, MGR |
| Get Beneficiary Statistics | GET | `/statistics` | None | ADM, MGR |
| Export Beneficiary List | GET | `/export` | `format` | ADM, MGR |
| Check Family Eligibility | GET | `/check/{familyId}` | None | ADM, MGR |

---

## Module 10: Categories

**Base URL:** `/api/v1/categories`  
**Endpoint Count:** 6

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Category | POST | `/` | None | INV |
| Get Categories | GET | `/` | `page`, `pageSize`, `search`, `sortBy`, `sortDirection` | INV, ADM |
| Update Category | PUT | `/{categoryId}` | None | INV |
| View Category Details | GET | `/{categoryId}` | None | INV, ADM |
| Delete Category | DELETE | `/{categoryId}` | None | INV |
| Get Category Items | GET | `/{categoryId}/items` | `page`, `pageSize` | INV, ADM |

---

## Module 11: Items

**Base URL:** `/api/v1/items`  
**Endpoint Count:** 7

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Item | POST | `/` | None | INV |
| Get Items | GET | `/` | `page`, `pageSize`, `search`, `categoryId`, `sortBy`, `sortDirection` | INV, ADM, MGR |
| Get Item Details | GET | `/{itemId}` | None | INV, ADM, MGR |
| Update Item | PUT | `/{itemId}` | None | INV |
| Delete Item | DELETE | `/{itemId}` | None | INV |
| Get Item Stock Across Inventories | GET | `/{itemId}/stock` | None | INV, ADM |
| Get Item Movement History | GET | `/{itemId}/movements` | `page`, `pageSize`, `dateFrom`, `dateTo` | INV, ADM |

---

## Module 12: Parcel Templates

**Base URL:** `/api/v1/parcels`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Parcel Template | POST | `/` | None | INV |
| Get Parcels | GET | `/` | `page`, `pageSize`, `search`, `sortBy`, `sortDirection` | INV, ADM, MGR |
| Get Parcel Details | GET | `/{parcelId}` | None | INV, ADM, MGR |
| Update Parcel Template | PUT | `/{parcelId}` | None | INV |
| Add Parcel Item | POST | `/{parcelId}/items` | None | INV |
| Remove Parcel Item | DELETE | `/{parcelId}/items/{itemId}` | None | INV |
| Update Parcel Item Quantity | PATCH | `/{parcelId}/items/{itemId}` | None | INV |
| Get Parcel Items | GET | `/{parcelId}/items` | None | INV, ADM, MGR |
| Get Parcel Usage | GET | `/{parcelId}/usage` | `page`, `pageSize` | INV, ADM, MGR |

---

## Module 13: Inventories

**Base URL:** `/api/v1/inventories`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Inventory | POST | `/` | None | INV |
| List Inventories | GET | `/` | `page`, `pageSize`, `search`, `inventoryType`, `branchId`, `sortBy`, `sortDirection` | INV, ADM, MGR |
| Get Inventory Details | GET | `/{inventoryId}` | None | INV, ADM, MGR |
| Update Inventory | PUT | `/{inventoryId}` | None | INV |
| View Inventory Stock | GET | `/{inventoryId}/stock` | `page`, `pageSize`, `search`, `categoryId`, `sortBy`, `sortDirection` | INV, ADM, MGR |
| Get Inventory Summary | GET | `/{inventoryId}/summary` | None | INV, ADM |
| Get Low Stock Items | GET | `/low-stock` | `branchId`, `threshold` | INV, ADM |
| Get Inventory Movement History | GET | `/{inventoryId}/movements` | `page`, `pageSize`, `dateFrom`, `dateTo`, `transactionType` | INV, ADM |
| Export Inventory Report | GET | `/{inventoryId}/export` | `format` | INV, ADM |

---

## Module 14: Inventory Transactions

**Base URL:** `/api/v1/inventory-transactions`  
**Endpoint Count:** 10

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Donation Transaction | POST | `/donation` | None | INV |
| Create Transfer Transaction | POST | `/transfer` | None | INV |
| Create Project Allocation Transaction | POST | `/project-allocation` | None | INV |
| Create Distribution Transaction | POST | `/distribution` | None | INV |
| Create Adjustment Transaction | POST | `/adjustment` | None | INV |
| Get Transaction | GET | `/{transactionId}` | None | INV, ADM |
| Get Transactions | GET | `/` | `page`, `pageSize`, `transactionType`, `sourceType`, `destinationType`, `donationId`, `projectId`, `dateFrom`, `dateTo`, `sortBy`, `sortDirection` | INV, ADM |
| Get Transaction Items | GET | `/{transactionId}/items` | None | INV, ADM |
| Get Transaction Summary | GET | `/{transactionId}/summary` | None | INV, ADM |
| Get Transaction Statistics | GET | `/statistics` | `transactionType`, `dateFrom`, `dateTo`, `branchId` | INV, ADM |

---

## Module 15: Distributions

**Base URL:** `/api/v1/distributions`  
**Endpoint Count:** 7

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Distribution | POST | `/` | None | ADM, MGR |
| Get Distributions | GET | `/` | `page`, `pageSize`, `familyId`, `projectId`, `branchId`, `dateFrom`, `dateTo`, `sortBy`, `sortDirection` | ADM, MGR |
| Get Distribution | GET | `/{distributionId}` | None | ADM, MGR |
| Update Distribution Notes | PATCH | `/{distributionId}/notes` | None | ADM, MGR |
| Get Distribution Statistics | GET | `/statistics` | `branchId`, `projectId`, `dateFrom`, `dateTo` | ADM, MGR |
| Get Distribution Receipt | GET | `/{distributionId}/receipt` | None | ADM, MGR, MBR |
| Export Distributions | GET | `/export` | `format`, `projectId`, `branchId`, `dateFrom`, `dateTo` | ADM, MGR |

---

## Module 16: Donors

**Base URL:** `/api/v1/donors`  
**Endpoint Count:** 7

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Donor | POST | `/` | None | FIN, INV, ADM |
| Get Donors | GET | `/` | `page`, `pageSize`, `search`, `donorType`, `sortBy`, `sortDirection` | FIN, INV, ADM |
| Get Donor Details | GET | `/{donorId}` | None | FIN, INV, ADM |
| Update Donor | PUT | `/{donorId}` | None | FIN, INV |
| Get Donor Donation History | GET | `/{donorId}/donations` | `page`, `pageSize`, `status`, `donationType` | FIN, INV, ADM |
| Get Donor Statistics | GET | `/{donorId}/statistics` | None | FIN, INV, ADM |
| Get Top Donors | GET | `/top` | `limit`, `dateFrom`, `dateTo` | FIN, ADM |

---

## Module 17: Donation Requests

**Base URL:** `/api/v1/donation-requests`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Donation Request | POST | `/` | None | DNR |
| Get My Requests | GET | `/my` | `page`, `pageSize`, `status`, `donationType`, `sortBy`, `sortDirection` | DNR |
| Get Request Details | GET | `/{requestId}` | None | DNR, FIN, ADM, INV |
| Cancel Request | PATCH | `/{requestId}/cancel` | None | DNR |
| Approve Request | PATCH | `/{requestId}/approve` | None | FIN, INV, ADM |
| Reject Request | PATCH | `/{requestId}/reject` | None | FIN, INV, ADM |
| Get Pending Requests | GET | `/pending` | `page`, `pageSize`, `status`, `donationType`, `projectId`, `sortBy`, `sortDirection` | FIN, INV, ADM |
| Get Request Statistics | GET | `/statistics` | `status`, `donationType`, `dateFrom`, `dateTo` | FIN, ADM |
| Fulfill Request | POST | `/{requestId}/fulfill` | None | FIN, INV |

---

## Module 18: Donations

**Base URL:** `/api/v1/donations`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Walk-In Donation | POST | `/` | None | FIN, INV |
| Get Donations | GET | `/` | `page`, `pageSize`, `status`, `donorId`, `projectId`, `donationType`, `dateFrom`, `dateTo`, `sortBy`, `sortDirection` | FIN, INV, ADM |
| Get Donation Details | GET | `/{donationId}` | None | FIN, INV, ADM, DNR |
| Mark Donation Received | PATCH | `/{donationId}/received` | None | FIN, INV |
| Cancel Donation | PATCH | `/{donationId}/cancel` | None | FIN, INV, ADM |
| Get Donation Summary | GET | `/{donationId}/summary` | None | FIN, INV, ADM, DNR |
| Get Donation Traceability | GET | `/{donationId}/traceability` | None | FIN, INV, ADM |
| Get Donation Statistics | GET | `/statistics` | `donorId`, `projectId`, `donationType`, `dateFrom`, `dateTo` | FIN, ADM |
| Export Donations | GET | `/export` | `format`, `donorId`, `projectId`, `status`, `dateFrom`, `dateTo` | FIN, ADM |

---

## Module 19: Financial Accounts

**Base URL:** `/api/v1/accounts`  
**Endpoint Count:** 8

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Account | POST | `/` | None | FIN |
| Get Accounts | GET | `/` | `page`, `pageSize`, `search`, `sortBy`, `sortDirection` | FIN, ADM |
| Get Account Details | GET | `/{accountId}` | None | FIN, ADM |
| Update Account | PUT | `/{accountId}` | None | FIN |
| View Balance | GET | `/{accountId}/balance` | None | FIN, ADM |
| View Transactions | GET | `/{accountId}/transactions` | `page`, `pageSize`, `transactionType`, `dateFrom`, `dateTo`, `sortBy`, `sortDirection` | FIN, ADM |
| Get Account Summary | GET | `/{accountId}/summary` | None | FIN, ADM |
| Get Account Balance History | GET | `/{accountId}/balance-history` | `dateFrom`, `dateTo`, `granularity` | FIN, ADM |

---

## Module 20: Financial Transactions

**Base URL:** `/api/v1/financial-transactions`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Donation Transaction | POST | `/donation` | None | FIN |
| Create Account Transfer | POST | `/transfer` | None | FIN |
| Create Project Allocation | POST | `/project-allocation` | None | FIN |
| Create Expense Transaction | POST | `/expense` | None | FIN |
| Get Transactions | GET | `/` | `page`, `pageSize`, `transactionType`, `sourceType`, `destinationType`, `donationId`, `projectId`, `dateFrom`, `dateTo`, `sortBy`, `sortDirection` | FIN, ADM |
| Get Transaction | GET | `/{transactionId}` | None | FIN, ADM |
| Get Transaction Summary | GET | `/{transactionId}/summary` | None | FIN, ADM |
| Get Transaction Statistics | GET | `/statistics` | `transactionType`, `dateFrom`, `dateTo` | FIN, ADM |
| Export Transactions | GET | `/export` | `format`, `transactionType`, `dateFrom`, `dateTo` | FIN, ADM |

---

## Module 21: Expense Categories

**Base URL:** `/api/v1/expense-categories`  
**Endpoint Count:** 6

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Expense Category | POST | `/` | None | FIN |
| Get Expense Categories | GET | `/` | `page`, `pageSize`, `search`, `sortBy`, `sortDirection` | FIN, ADM |
| Get Expense Category | GET | `/{expenseCategoryId}` | None | FIN, ADM |
| Update Expense Category | PUT | `/{expenseCategoryId}` | None | FIN |
| Delete Expense Category | DELETE | `/{expenseCategoryId}` | None | FIN |
| Get Expense Category Summary | GET | `/{expenseCategoryId}/summary` | `dateFrom`, `dateTo` | FIN, ADM |

---

## Module 22: Reports

**Base URL:** `/api/v1/reports`  
**Endpoint Count:** 13

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Dashboard Report | GET | `/dashboard` | `dateFrom`, `dateTo`, `branchId` | ADM |
| Beneficiary Report | GET | `/beneficiaries` | `branchId`, `status`, `dateFrom`, `dateTo` | ADM, MGR |
| Project Report | GET | `/projects/{projectId}` | `dateFrom`, `dateTo` | ADM, MGR |
| Inventory Report | GET | `/inventory` | `branchId`, `inventoryId`, `dateFrom`, `dateTo` | ADM, INV |
| Donation Report | GET | `/donations` | `donorId`, `projectId`, `dateFrom`, `dateTo` | ADM, FIN |
| Financial Report | GET | `/financial` | `accountId`, `dateFrom`, `dateTo` | ADM, FIN |
| Distribution Report | GET | `/distributions` | `branchId`, `projectId`, `dateFrom`, `dateTo` | ADM, MGR |
| Family Report | GET | `/families` | `branchId`, `governorate`, `dateFrom`, `dateTo` | ADM, MGR |
| Inventory Transaction Report | GET | `/inventory-transactions` | `branchId`, `transactionType`, `dateFrom`, `dateTo` | ADM, INV |
| Donor Impact Report | GET | `/donor-impact` | `donorId`, `projectId` | ADM, FIN, DNR |
| Project Funding Report | GET | `/project-funding` | `projectId`, `dateFrom`, `dateTo` | ADM, FIN |
| Audit Summary Report | GET | `/audit-summary` | `userId`, `dateFrom`, `dateTo` | ADM |
| Export Report | GET | `/export` | `reportType`, `format`, `dateFrom`, `dateTo` | ADM |

---

## Module 23: Audit Logs

**Base URL:** `/api/v1/audit-logs`  
**Endpoint Count:** 5

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Get Audit Logs | GET | `/` | `page`, `pageSize`, `entity`, `action`, `userId`, `dateFrom`, `dateTo`, `sortBy`, `sortDirection` | ADM, MGR, INV, FIN |
| Get Audit Log Details | GET | `/{auditLogId}` | None | ADM, MGR, INV, FIN |
| Get Entity Audit History | GET | `/entity/{entityName}/{entityId}` | `page`, `pageSize` | ADM, MGR, INV, FIN |
| Get User Activity Log | GET | `/user/{userId}` | `page`, `pageSize`, `action`, `dateFrom`, `dateTo` | ADM |
| Export Audit Logs | GET | `/export` | `format`, `entity`, `action`, `userId`, `dateFrom`, `dateTo` | ADM |

---

## Module 24: Notifications

**Base URL:** `/api/v1/notifications`  
**Endpoint Count:** 6

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Get My Notifications | GET | `/my` | `page`, `pageSize`, `isRead`, `sortBy`, `sortDirection` | Authenticated Users |
| Mark Notification as Read | PATCH | `/{notificationId}/read` | None | Authenticated Users |
| Mark All as Read | PATCH | `/read-all` | None | Authenticated Users |
| Get Unread Count | GET | `/unread-count` | None | Authenticated Users |
| Delete Notification | DELETE | `/{notificationId}` | None | Authenticated Users |
| Get Notification Preferences | GET | `/preferences` | None | Authenticated Users |

---

## Module 25: Dashboard & Analytics

**Base URL:** `/api/v1/analytics`  
**Endpoint Count:** 8

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Get Overall Dashboard | GET | `/dashboard` | `dateFrom`, `dateTo` | ADM |
| Get Beneficiary Analytics | GET | `/beneficiaries` | `branchId`, `governorate`, `dateFrom`, `dateTo` | ADM, MGR |
| Get Donation Analytics | GET | `/donations` | `dateFrom`, `dateTo`, `donationType` | ADM, FIN |
| Get Inventory Analytics | GET | `/inventory` | `branchId`, `dateFrom`, `dateTo` | ADM, INV |
| Get Financial Analytics | GET | `/financial` | `accountId`, `dateFrom`, `dateTo` | ADM, FIN |
| Get Project Analytics | GET | `/projects` | `branchId`, `status`, `dateFrom`, `dateTo` | ADM, MGR |
| Get Distribution Analytics | GET | `/distributions` | `branchId`, `projectId`, `dateFrom`, `dateTo` | ADM, MGR |
| Get Geo Analytics | GET | `/geo` | `dateFrom`, `dateTo` | ADM |

---

## Summary of Endpoints

### Per Module

| # | Module | Endpoints |
|---|---|---|
| 01 | Authentication | 13 |
| 02 | Branches | 7 |
| 03 | Users | 10 |
| 04 | Families | 14 |
| 05 | Family Members | 9 |
| 06 | Family Assessments | 5 |
| 07 | Family Requests | 9 |
| 08 | Projects | 12 |
| 09 | Project Beneficiaries | 7 |
| 10 | Categories | 6 |
| 11 | Items | 7 |
| 12 | Parcel Templates | 9 |
| 13 | Inventories | 9 |
| 14 | Inventory Transactions | 10 |
| 15 | Distributions | 7 |
| 16 | Donors | 7 |
| 17 | Donation Requests | 9 |
| 18 | Donations | 9 |
| 19 | Financial Accounts | 8 |
| 20 | Financial Transactions | 9 |
| 21 | Expense Categories | 6 |
| 22 | Reports | 13 |
| 23 | Audit Logs | 5 |
| 24 | Notifications | 6 |
| 25 | Dashboard & Analytics | 8 |

**Total: 215 Endpoints**

### Public vs Authenticated

| Category | Count |
|---|---|
| **Public Endpoints** | 8 |
| **Authenticated Endpoints** | 207 |
| **Total** | **215** |

### Public Endpoints

| # | Method | Path | Purpose |
|---|---|---|---|
| 1 | POST | `/auth/register/beneficiary` | Register beneficiary |
| 2 | POST | `/auth/register/donor` | Register donor |
| 3 | POST | `/auth/login` | Login |
| 4 | POST | `/auth/forgot-password` | Request password reset |
| 5 | POST | `/auth/reset-password` | Reset password |
| 6 | POST | `/auth/verify-email` | Verify email address |
| 7 | POST | `/auth/resend-verification` | Resend verification email |
| 8 | GET | `/health` | Health check (system) |

---

## New APIs Added (Beyond Original Suggestions)

The following endpoints were not in the original specification but have been added to provide production-grade functionality. They are explained below.

### 1. Authentication Enhancements

| Endpoint | Purpose |
|---|---|
| `POST /auth/verify-email` | Email verification for new registrations. Prevents fake accounts. |
| `POST /auth/resend-verification` | Resend verification email if the first one was lost. |
| `GET /auth/session` | Returns current session details (token expiry, IP, device). Useful for security dashboards. |

### 2. Branch Enhancements

| Endpoint | Purpose |
|---|---|
| `PATCH /branches/{branchId}/activate` | Counterpart to deactivate. Allows reversing an accidental deactivation. |
| `GET /branches/{branchId}/statistics` | Branch-level KPIs (families, distributions, projects) for the Branch Manager dashboard. |

### 3. User Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /users/{userId}/activity` | Paginated activity log for a specific user. Complements audit logs. |
| `GET /users/branch/{branchId}` | Branch Manager needs to see their team, not just Admin. |
| `GET /users/statistics` | User counts by role and status for Admin dashboards. |

### 4. Family Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /families/statistics` | Aggregated family counts by status for dashboards. |
| `GET /families/{familyId}/timeline` | Unified timeline of assessments, requests, distributions, and verifications. |
| `GET /families/{familyId}/assessments` | Assessment version history (important when reassessments are requested). |
| `GET /families/{familyId}/members-summary` | Quick summary for beneficiary portal (names, ages, head-of-family). |
| `PATCH /families/bulk/verify` | Verify multiple families in one action. Essential for Branch Managers handling large batches. |
| `GET /families/export` | Export family data (CSV/Excel) for offline reporting and donor reports. |

### 5. Family Member Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /families/{familyId}/members/statistics` | Member counts by gender, age group, disability, chronic disease. |
| `GET /families/{familyId}/members/search/national-id` | Fast lookup by national ID — critical for duplicate detection. |
| `GET /families/{familyId}/members/export` | Export member data for reporting. |

### 6. Assessment Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /families/{familyId}/assessment/history` | Full assessment history. |
| `GET /families/{familyId}/assessment/compare` | Compare two assessments to see what changed. Useful for audit and reassessment decisions. |

### 7. Family Request Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /family-requests/statistics` | Request approval/rejection rates for Branch Manager dashboards. |
| `GET /family-requests/{requestId}/history` | Full audit trail of a request's status transitions. |

### 8. Project Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /projects/{projectId}/summary` | One-stop summary: beneficiaries, distributions, parcels, inventory, funding. |
| `GET /projects/statistics` | Aggregated project counts for dashboards. |
| `GET /projects/{projectId}/timeline` | Project lifecycle timeline (created, activated, distributions, completed). |
| `GET /projects/{projectId}/export` | Export project report for donors or internal review. |

### 9. Beneficiary List Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /projects/{projectId}/beneficiaries/statistics` | Summary of generated beneficiary list (counts, demographics). |
| `GET /projects/{projectId}/beneficiaries/export` | Export the beneficiary list. |
| `GET /projects/{projectId}/beneficiaries/check/{familyId}` | Check if a specific family is eligible before regenerating. |

### 10. Category & Item Enhancements

| Endpoint | Purpose |
|---|---|
| `DELETE /categories/{categoryId}` | Delete an empty category. |
| `GET /categories/{categoryId}/items` | List items in a category. |
| `DELETE /items/{itemId}` | Delete an item (only if not in use). |
| `GET /items/{itemId}/stock` | Cross-warehouse stock for an item. |
| `GET /items/{itemId}/movements` | Full movement history of an item. Critical for audit and traceability. |

### 11. Parcel Enhancements

| Endpoint | Purpose |
|---|---|
| `PATCH /parcels/{parcelId}/items/{itemId}` | Update quantity of an item already in the parcel. |
| `GET /parcels/{parcelId}/items` | List items in a parcel template. |
| `GET /parcels/{parcelId}/usage` | Which projects use this parcel. Prevents unsafe deletion. |

### 12. Inventory Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /inventories/{inventoryId}/summary` | Inventory valuation, total items, low-stock count. |
| `GET /inventories/low-stock` | System-wide low stock report. |
| `GET /inventories/{inventoryId}/movements` | Full movement history of a warehouse. |
| `GET /inventories/{inventoryId}/export` | Export warehouse report. |

### 13. Inventory Transaction Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /inventory-transactions/{transactionId}/items` | Line items of a transaction. |
| `GET /inventory-transactions/{transactionId}/summary` | Transaction summary (source, destination, items, totals). |
| `GET /inventory-transactions/statistics` | Aggregated transaction counts for dashboards. |

### 14. Distribution Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /distributions/statistics` | Distribution KPIs. |
| `GET /distributions/{distributionId}/receipt` | Printable receipt for beneficiary. Important for dignity and transparency. |
| `GET /distributions/export` | Export distribution data. |

### 15. Donor Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /donors/{donorId}/donations` | Full donation history of a donor. |
| `GET /donors/{donorId}/statistics` | Total donated, project count, impact. |
| `GET /donors/top` | Top donors leaderboard for recognition. |

### 16. Donation Request Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /donation-requests/statistics` | Approval/rejection rates. |
| `POST /donation-requests/{requestId}/fulfill` | Directly create a donation from an approved request (shortcut). |

### 17. Donation Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /donations/{donationId}/summary` | Full traceability: donor → donation → settlement → project → beneficiary. |
| `GET /donations/{donationId}/traceability` | Detailed chain of custody of a donation. |
| `GET /donations/statistics` | Donation KPIs. |
| `GET /donations/export` | Export donation data. |

### 18. Financial Account Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /accounts/{accountId}/summary` | Account summary: balance, inflow, outflow, transaction count. |
| `GET /accounts/{accountId}/balance-history` | Balance over time (daily/weekly/monthly). Essential for financial dashboards. |

### 19. Financial Transaction Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /financial-transactions/{transactionId}/summary` | Transaction summary with linked entities. |
| `GET /financial-transactions/statistics` | Financial KPIs. |
| `GET /financial-transactions/export` | Export ledger. |

### 20. Expense Category Enhancements

| Endpoint | Purpose |
|---|---|
| `DELETE /expense-categories/{expenseCategoryId}` | Delete unused category. |
| `GET /expense-categories/{expenseCategoryId}/summary` | Total spent per category over a period. |

### 21. Report Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /reports/families` | Family-level report. |
| `GET /reports/inventory-transactions` | Inventory movement report. |
| `GET /reports/donor-impact` | Donor-facing impact report. |
| `GET /reports/project-funding` | Funding per project. |
| `GET /reports/audit-summary` | Audit summary report. |
| `GET /reports/export` | Unified report export endpoint. |

### 22. Audit Log Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /audit-logs/entity/{entityName}/{entityId}` | Audit history of any single record. |
| `GET /audit-logs/user/{userId}` | All actions by a specific user. |
| `GET /audit-logs/export` | Export audit data for compliance. |

### 23. Notifications (New Module)

| Endpoint | Purpose |
|---|---|
| `GET /notifications/my` | All notifications for the current user. |
| `PATCH /notifications/{id}/read` | Mark one as read. |
| `PATCH /notifications/read-all` | Mark all as read. |
| `GET /notifications/unread-count` | Badge count. |
| `DELETE /notifications/{id}` | Delete a notification. |
| `GET /notifications/preferences` | User's notification preferences. |

**Why added:** The SRS mentions "Notifications: View verification result, distribution appointment, approval/rejection messages" for the Beneficiary role. This module fulfills that requirement.

### 24. Dashboard & Analytics (New Module)

| Endpoint | Purpose |
|---|---|
| `GET /analytics/dashboard` | Global dashboard (ADM). |
| `GET /analytics/beneficiaries` | Beneficiary analytics (growth, status distribution, geography). |
| `GET /analytics/donations` | Donation trends. |
| `GET /analytics/inventory` | Inventory turnover, stock levels. |
| `GET /analytics/financial` | Financial health. |
| `GET /analytics/projects` | Project performance. |
| `GET /analytics/distributions` | Distribution efficiency. |
| `GET /analytics/geo` | Geographic heatmap of need. |

**Why added:** Dashboards are essential for NGO decision-making. Field staff need KPIs; donors need impact metrics; managers need operational visibility.

---

## Final Summary

| Metric | Count |
|---|---|
| **Total Modules** | 25 |
| **Total Endpoints** | 215 |
| **Public Endpoints** | 8 |
| **Authenticated Endpoints** | 207 |
| **Average Endpoints per Module** | 8.6 |

### Module Distribution

- **Core Business Modules:** 1–18 (108 endpoints)
- **Financial Modules:** 19–21 (23 endpoints)
- **Reporting & Audit:** 22–23 (18 endpoints)
- **Cross-Cutting:** 24–25 (14 endpoints)

### Access Distribution

| Role | Accessible Endpoints (approx.) |
|---|---|
| ADM | ~210 (all except a few MBR/DNR-only) |
| MGR | ~95 |
| RES | ~50 |
| INV | ~85 |
| FIN | ~85 |
| DNR | ~20 |
| MBR | ~18 |
| Public | 8 |

### Design Principles Applied

1. **Consistent verb-to-action mapping:** `POST` = create/trigger, `GET` = read, `PUT` = full update, `PATCH` = partial action, `DELETE` = remove.
2. **Plural nouns for resources:** `/families`, `/donors`, `/inventories`.
3. **Nested resources for hierarchy:** `/families/{id}/members`, `/projects/{id}/beneficiaries`.
4. **State transitions as sub-resources:** `/verify`, `/reject`, `/activate`, `/cancel` — never buried in query params.
5. **Summary and statistics endpoints** for dashboard and reporting needs.
6. **Export endpoints** for offline reporting.
7. **Paginated listings** with standard `page`, `pageSize`, `sortBy`, `sortDirection`.
8. **Traceability endpoints** for audit-critical entities (donations, distributions, inventory items).
9. **Notification module** to satisfy beneficiary/donor communication requirements in the SRS.
10. **Analytics module** to satisfy Branch Manager and Admin reporting requirements.

---

*End of API Specification v1.0*# API Specification

## Gaza Aid Distribution & NGO Management System

**Version:** 1.0  
**Document Type:** REST API Specification  
**Base URL:** `/api/v1`  
**Authentication:** JWT Bearer Token  
**Total Endpoints:** 157

---

## Standard Query Parameters

The following query parameters are standardized across all listing endpoints:

| Parameter | Purpose | Default |
|---|---|---|
| `page` | Current page number | 1 |
| `pageSize` | Items per page | 25 |
| `search` | Free-text search | None |
| `sortBy` | Sort field | `createdAt` |
| `sortDirection` | `asc` or `desc` | `desc` |

Example: `GET /api/v1/families?page=1&pageSize=25&sortBy=createdAt&sortDirection=desc`

---

## Module 01: Authentication

**Base URL:** `/api/v1/auth`  
**Endpoint Count:** 13

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Register Beneficiary Account | POST | `/register/beneficiary` | None | Public |
| Register Donor Account | POST | `/register/donor` | None | Public |
| Login | POST | `/login` | None | Public |
| Logout | POST | `/logout` | None | Authenticated Users |
| Refresh Token | POST | `/refresh` | None | Authenticated Users |
| Forgot Password | POST | `/forgot-password` | None | Public |
| Reset Password | POST | `/reset-password` | None | Public |
| Change Password | PUT | `/change-password` | None | Authenticated Users |
| Get My Profile | GET | `/me` | None | Authenticated Users |
| Update My Profile | PUT | `/me` | None | Authenticated Users |
| Verify Email | POST | `/verify-email` | None | Public |
| Resend Verification Email | POST | `/resend-verification` | None | Public |
| Get Session Info | GET | `/session` | None | Authenticated Users |

---

## Module 02: Branches

**Base URL:** `/api/v1/branches`  
**Endpoint Count:** 7

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Branch | POST | `/` | None | ADM |
| Get Branches | GET | `/` | `page`, `pageSize`, `search`, `governorate`, `sortBy`, `sortDirection` | ADM |
| Get Branch Details | GET | `/{branchId}` | None | ADM |
| Update Branch | PUT | `/{branchId}` | None | ADM |
| Deactivate Branch | PATCH | `/{branchId}/deactivate` | None | ADM |
| Activate Branch | PATCH | `/{branchId}/activate` | None | ADM |
| Get Branch Statistics | GET | `/{branchId}/statistics` | None | ADM, MGR |

---

## Module 03: Users

**Base URL:** `/api/v1/users`  
**Endpoint Count:** 10

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create User | POST | `/` | None | ADM |
| Get Users | GET | `/` | `page`, `pageSize`, `search`, `role`, `branchId`, `isActive`, `sortBy`, `sortDirection` | ADM |
| Get User | GET | `/{userId}` | None | ADM |
| Update User | PUT | `/{userId}` | None | ADM |
| Activate User | PATCH | `/{userId}/activate` | None | ADM |
| Deactivate User | PATCH | `/{userId}/deactivate` | None | ADM |
| Reset Password | POST | `/{userId}/reset-password` | None | ADM |
| Get User Activity | GET | `/{userId}/activity` | `page`, `pageSize`, `action`, `dateFrom`, `dateTo` | ADM |
| Get Users by Branch | GET | `/branch/{branchId}` | `page`, `pageSize`, `role` | ADM, MGR |
| Get User Statistics | GET | `/statistics` | None | ADM |

---

## Module 04: Families

**Base URL:** `/api/v1/families`  
**Endpoint Count:** 14

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Family | POST | `/` | None | ADM, MGR, RES |
| Get Families | GET | `/` | `page`, `pageSize`, `search`, `status`, `governorate`, `publicId`, `phone`, `createdBy`, `verifiedBy`, `createdFrom`, `createdTo`, `sortBy`, `sortDirection` | ADM, MGR, RES |
| Get Family Details | GET | `/{familyId}` | None | ADM, MGR, RES, MBR |
| Update Family | PUT | `/{familyId}` | None | ADM, MGR, RES |
| Verify Family | PATCH | `/{familyId}/verify` | None | ADM, MGR |
| Reject Family | PATCH | `/{familyId}/reject` | None | ADM, MGR |
| Request Reassessment | POST | `/{familyId}/reassessment` | None | ADM, MGR |
| Get Family Distribution History | GET | `/{familyId}/distributions` | `page`, `pageSize`, `projectId`, `dateFrom`, `dateTo` | ADM, MGR, RES, MBR |
| Get Family Statistics | GET | `/statistics` | `branchId`, `governorate` | ADM, MGR |
| Get Family Timeline | GET | `/{familyId}/timeline` | None | ADM, MGR, RES |
| Get Family Assessment History | GET | `/{familyId}/assessments` | `page`, `pageSize` | ADM, MGR, RES |
| Get Family Members Summary | GET | `/{familyId}/members-summary` | None | ADM, MGR, RES, MBR |
| Bulk Verify Families | PATCH | `/bulk/verify` | None | ADM, MGR |
| Export Families | GET | `/export` | `format`, `status`, `governorate`, `createdFrom`, `createdTo` | ADM, MGR |

---

## Module 05: Family Members

**Base URL:** `/api/v1/families/{familyId}/members`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Family Member | POST | `/` | None | ADM, MGR, RES |
| Get Family Members | GET | `/` | `page`, `pageSize`, `search`, `nationalId`, `isHeadOfFamily`, `gender`, `educationLevel`, `employmentStatus`, `hasDisability`, `hasChronicDisease`, `isOrphan`, `sortBy`, `sortDirection` | ADM, MGR, RES, MBR |
| Get Family Member | GET | `/{memberId}` | None | ADM, MGR, RES, MBR |
| Update Family Member | PUT | `/{memberId}` | None | ADM, MGR, RES |
| Delete Family Member | DELETE | `/{memberId}` | None | ADM, MGR |
| Set Head Of Family | PATCH | `/{memberId}/head` | None | ADM, MGR |
| Get Member Statistics | GET | `/statistics` | None | ADM, MGR, RES |
| Search Member by National ID | GET | `/search/national-id` | `nationalId` | ADM, MGR, RES |
| Export Family Members | GET | `/export` | `format` | ADM, MGR |

---

## Module 06: Family Assessments

**Base URL:** `/api/v1/families/{familyId}/assessment`  
**Endpoint Count:** 5

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Assessment | POST | `/` | None | ADM, MGR, RES |
| Get Assessment | GET | `/` | None | ADM, MGR, RES, MBR |
| Update Assessment | PUT | `/` | None | ADM, MGR, RES |
| Get Assessment History | GET | `/history` | `page`, `pageSize` | ADM, MGR, RES |
| Compare Assessments | GET | `/compare` | `assessmentId1`, `assessmentId2` | ADM, MGR, RES |

---

## Module 07: Family Requests

**Base URL:** `/api/v1/family-requests`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Family Request | POST | `/` | None | MBR |
| Get My Requests | GET | `/my` | `page`, `pageSize`, `status`, `sortBy`, `sortDirection` | MBR |
| Get Request Details | GET | `/{requestId}` | None | MBR, MGR, ADM |
| Cancel Request | PATCH | `/{requestId}/cancel` | None | MBR |
| Approve Request | PATCH | `/{requestId}/approve` | None | MGR, ADM |
| Reject Request | PATCH | `/{requestId}/reject` | None | MGR, ADM |
| Get Pending Requests | GET | `/pending` | `page`, `pageSize`, `status`, `familyId`, `requestedBy`, `sortBy`, `sortDirection` | MGR, ADM |
| Get Request Statistics | GET | `/statistics` | `branchId`, `dateFrom`, `dateTo` | ADM, MGR |
| Get Request History | GET | `/{requestId}/history` | None | ADM, MGR |

---

## Module 08: Projects

**Base URL:** `/api/v1/projects`  
**Endpoint Count:** 12

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Project | POST | `/` | None | ADM, MGR |
| Get Projects | GET | `/` | `page`, `pageSize`, `search`, `status`, `createdBy`, `startDate`, `endDate`, `sortBy`, `sortDirection` | ADM, MGR, RES, DNR |
| Get Project Details | GET | `/{projectId}` | None | ADM, MGR, RES, DNR |
| Update Project | PUT | `/{projectId}` | None | ADM, MGR |
| Activate Project | PATCH | `/{projectId}/activate` | None | ADM, MGR |
| Complete Project | PATCH | `/{projectId}/complete` | None | ADM, MGR |
| Cancel Project | PATCH | `/{projectId}/cancel` | None | ADM, MGR |
| Delete Draft Project | DELETE | `/{projectId}` | None | ADM, MGR |
| Get Project Summary | GET | `/{projectId}/summary` | None | ADM, MGR, DNR |
| Get Project Statistics | GET | `/statistics` | `branchId`, `status`, `dateFrom`, `dateTo` | ADM, MGR |
| Get Project Timeline | GET | `/{projectId}/timeline` | None | ADM, MGR |
| Export Project Report | GET | `/{projectId}/export` | `format` | ADM, MGR |

---

## Module 09: Project Beneficiaries

**Base URL:** `/api/v1/projects/{projectId}/beneficiaries`  
**Endpoint Count:** 7

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Generate Beneficiary List | POST | `/generate` | `housingType`, `incomeLessThan`, `isDisplaced`, `isRegisteredInCamp`, `hasElectricity`, `hasInternet`, `hasDisability`, `hasChronicDisease`, `isOrphan`, `educationLevel`, `ageMin`, `ageMax` | ADM, MGR |
| View Beneficiary List | GET | `/` | `page`, `pageSize`, `search`, `sortBy`, `sortDirection` | ADM, MGR |
| Remove Family From List | DELETE | `/{familyId}` | None | ADM, MGR |
| Regenerate List | POST | `/regenerate` | None | ADM, MGR |
| Get Beneficiary Statistics | GET | `/statistics` | None | ADM, MGR |
| Export Beneficiary List | GET | `/export` | `format` | ADM, MGR |
| Check Family Eligibility | GET | `/check/{familyId}` | None | ADM, MGR |

---

## Module 10: Categories

**Base URL:** `/api/v1/categories`  
**Endpoint Count:** 6

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Category | POST | `/` | None | INV |
| Get Categories | GET | `/` | `page`, `pageSize`, `search`, `sortBy`, `sortDirection` | INV, ADM |
| Update Category | PUT | `/{categoryId}` | None | INV |
| View Category Details | GET | `/{categoryId}` | None | INV, ADM |
| Delete Category | DELETE | `/{categoryId}` | None | INV |
| Get Category Items | GET | `/{categoryId}/items` | `page`, `pageSize` | INV, ADM |

---

## Module 11: Items

**Base URL:** `/api/v1/items`  
**Endpoint Count:** 7

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Item | POST | `/` | None | INV |
| Get Items | GET | `/` | `page`, `pageSize`, `search`, `categoryId`, `sortBy`, `sortDirection` | INV, ADM, MGR |
| Get Item Details | GET | `/{itemId}` | None | INV, ADM, MGR |
| Update Item | PUT | `/{itemId}` | None | INV |
| Delete Item | DELETE | `/{itemId}` | None | INV |
| Get Item Stock Across Inventories | GET | `/{itemId}/stock` | None | INV, ADM |
| Get Item Movement History | GET | `/{itemId}/movements` | `page`, `pageSize`, `dateFrom`, `dateTo` | INV, ADM |

---

## Module 12: Parcel Templates

**Base URL:** `/api/v1/parcels`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Parcel Template | POST | `/` | None | INV |
| Get Parcels | GET | `/` | `page`, `pageSize`, `search`, `sortBy`, `sortDirection` | INV, ADM, MGR |
| Get Parcel Details | GET | `/{parcelId}` | None | INV, ADM, MGR |
| Update Parcel Template | PUT | `/{parcelId}` | None | INV |
| Add Parcel Item | POST | `/{parcelId}/items` | None | INV |
| Remove Parcel Item | DELETE | `/{parcelId}/items/{itemId}` | None | INV |
| Update Parcel Item Quantity | PATCH | `/{parcelId}/items/{itemId}` | None | INV |
| Get Parcel Items | GET | `/{parcelId}/items` | None | INV, ADM, MGR |
| Get Parcel Usage | GET | `/{parcelId}/usage` | `page`, `pageSize` | INV, ADM, MGR |

---

## Module 13: Inventories

**Base URL:** `/api/v1/inventories`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Inventory | POST | `/` | None | INV |
| List Inventories | GET | `/` | `page`, `pageSize`, `search`, `inventoryType`, `branchId`, `sortBy`, `sortDirection` | INV, ADM, MGR |
| Get Inventory Details | GET | `/{inventoryId}` | None | INV, ADM, MGR |
| Update Inventory | PUT | `/{inventoryId}` | None | INV |
| View Inventory Stock | GET | `/{inventoryId}/stock` | `page`, `pageSize`, `search`, `categoryId`, `sortBy`, `sortDirection` | INV, ADM, MGR |
| Get Inventory Summary | GET | `/{inventoryId}/summary` | None | INV, ADM |
| Get Low Stock Items | GET | `/low-stock` | `branchId`, `threshold` | INV, ADM |
| Get Inventory Movement History | GET | `/{inventoryId}/movements` | `page`, `pageSize`, `dateFrom`, `dateTo`, `transactionType` | INV, ADM |
| Export Inventory Report | GET | `/{inventoryId}/export` | `format` | INV, ADM |

---

## Module 14: Inventory Transactions

**Base URL:** `/api/v1/inventory-transactions`  
**Endpoint Count:** 10

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Donation Transaction | POST | `/donation` | None | INV |
| Create Transfer Transaction | POST | `/transfer` | None | INV |
| Create Project Allocation Transaction | POST | `/project-allocation` | None | INV |
| Create Distribution Transaction | POST | `/distribution` | None | INV |
| Create Adjustment Transaction | POST | `/adjustment` | None | INV |
| Get Transaction | GET | `/{transactionId}` | None | INV, ADM |
| Get Transactions | GET | `/` | `page`, `pageSize`, `transactionType`, `sourceType`, `destinationType`, `donationId`, `projectId`, `dateFrom`, `dateTo`, `sortBy`, `sortDirection` | INV, ADM |
| Get Transaction Items | GET | `/{transactionId}/items` | None | INV, ADM |
| Get Transaction Summary | GET | `/{transactionId}/summary` | None | INV, ADM |
| Get Transaction Statistics | GET | `/statistics` | `transactionType`, `dateFrom`, `dateTo`, `branchId` | INV, ADM |

---

## Module 15: Distributions

**Base URL:** `/api/v1/distributions`  
**Endpoint Count:** 7

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Distribution | POST | `/` | None | ADM, MGR |
| Get Distributions | GET | `/` | `page`, `pageSize`, `familyId`, `projectId`, `branchId`, `dateFrom`, `dateTo`, `sortBy`, `sortDirection` | ADM, MGR |
| Get Distribution | GET | `/{distributionId}` | None | ADM, MGR |
| Update Distribution Notes | PATCH | `/{distributionId}/notes` | None | ADM, MGR |
| Get Distribution Statistics | GET | `/statistics` | `branchId`, `projectId`, `dateFrom`, `dateTo` | ADM, MGR |
| Get Distribution Receipt | GET | `/{distributionId}/receipt` | None | ADM, MGR, MBR |
| Export Distributions | GET | `/export` | `format`, `projectId`, `branchId`, `dateFrom`, `dateTo` | ADM, MGR |

---

## Module 16: Donors

**Base URL:** `/api/v1/donors`  
**Endpoint Count:** 7

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Donor | POST | `/` | None | FIN, INV, ADM |
| Get Donors | GET | `/` | `page`, `pageSize`, `search`, `donorType`, `sortBy`, `sortDirection` | FIN, INV, ADM |
| Get Donor Details | GET | `/{donorId}` | None | FIN, INV, ADM |
| Update Donor | PUT | `/{donorId}` | None | FIN, INV |
| Get Donor Donation History | GET | `/{donorId}/donations` | `page`, `pageSize`, `status`, `donationType` | FIN, INV, ADM |
| Get Donor Statistics | GET | `/{donorId}/statistics` | None | FIN, INV, ADM |
| Get Top Donors | GET | `/top` | `limit`, `dateFrom`, `dateTo` | FIN, ADM |

---

## Module 17: Donation Requests

**Base URL:** `/api/v1/donation-requests`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Donation Request | POST | `/` | None | DNR |
| Get My Requests | GET | `/my` | `page`, `pageSize`, `status`, `donationType`, `sortBy`, `sortDirection` | DNR |
| Get Request Details | GET | `/{requestId}` | None | DNR, FIN, ADM, INV |
| Cancel Request | PATCH | `/{requestId}/cancel` | None | DNR |
| Approve Request | PATCH | `/{requestId}/approve` | None | FIN, INV, ADM |
| Reject Request | PATCH | `/{requestId}/reject` | None | FIN, INV, ADM |
| Get Pending Requests | GET | `/pending` | `page`, `pageSize`, `status`, `donationType`, `projectId`, `sortBy`, `sortDirection` | FIN, INV, ADM |
| Get Request Statistics | GET | `/statistics` | `status`, `donationType`, `dateFrom`, `dateTo` | FIN, ADM |
| Fulfill Request | POST | `/{requestId}/fulfill` | None | FIN, INV |

---

## Module 18: Donations

**Base URL:** `/api/v1/donations`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Walk-In Donation | POST | `/` | None | FIN, INV |
| Get Donations | GET | `/` | `page`, `pageSize`, `status`, `donorId`, `projectId`, `donationType`, `dateFrom`, `dateTo`, `sortBy`, `sortDirection` | FIN, INV, ADM |
| Get Donation Details | GET | `/{donationId}` | None | FIN, INV, ADM, DNR |
| Mark Donation Received | PATCH | `/{donationId}/received` | None | FIN, INV |
| Cancel Donation | PATCH | `/{donationId}/cancel` | None | FIN, INV, ADM |
| Get Donation Summary | GET | `/{donationId}/summary` | None | FIN, INV, ADM, DNR |
| Get Donation Traceability | GET | `/{donationId}/traceability` | None | FIN, INV, ADM |
| Get Donation Statistics | GET | `/statistics` | `donorId`, `projectId`, `donationType`, `dateFrom`, `dateTo` | FIN, ADM |
| Export Donations | GET | `/export` | `format`, `donorId`, `projectId`, `status`, `dateFrom`, `dateTo` | FIN, ADM |

---

## Module 19: Financial Accounts

**Base URL:** `/api/v1/accounts`  
**Endpoint Count:** 8

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Account | POST | `/` | None | FIN |
| Get Accounts | GET | `/` | `page`, `pageSize`, `search`, `sortBy`, `sortDirection` | FIN, ADM |
| Get Account Details | GET | `/{accountId}` | None | FIN, ADM |
| Update Account | PUT | `/{accountId}` | None | FIN |
| View Balance | GET | `/{accountId}/balance` | None | FIN, ADM |
| View Transactions | GET | `/{accountId}/transactions` | `page`, `pageSize`, `transactionType`, `dateFrom`, `dateTo`, `sortBy`, `sortDirection` | FIN, ADM |
| Get Account Summary | GET | `/{accountId}/summary` | None | FIN, ADM |
| Get Account Balance History | GET | `/{accountId}/balance-history` | `dateFrom`, `dateTo`, `granularity` | FIN, ADM |

---

## Module 20: Financial Transactions

**Base URL:** `/api/v1/financial-transactions`  
**Endpoint Count:** 9

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Donation Transaction | POST | `/donation` | None | FIN |
| Create Account Transfer | POST | `/transfer` | None | FIN |
| Create Project Allocation | POST | `/project-allocation` | None | FIN |
| Create Expense Transaction | POST | `/expense` | None | FIN |
| Get Transactions | GET | `/` | `page`, `pageSize`, `transactionType`, `sourceType`, `destinationType`, `donationId`, `projectId`, `dateFrom`, `dateTo`, `sortBy`, `sortDirection` | FIN, ADM |
| Get Transaction | GET | `/{transactionId}` | None | FIN, ADM |
| Get Transaction Summary | GET | `/{transactionId}/summary` | None | FIN, ADM |
| Get Transaction Statistics | GET | `/statistics` | `transactionType`, `dateFrom`, `dateTo` | FIN, ADM |
| Export Transactions | GET | `/export` | `format`, `transactionType`, `dateFrom`, `dateTo` | FIN, ADM |

---

## Module 21: Expense Categories

**Base URL:** `/api/v1/expense-categories`  
**Endpoint Count:** 6

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Create Expense Category | POST | `/` | None | FIN |
| Get Expense Categories | GET | `/` | `page`, `pageSize`, `search`, `sortBy`, `sortDirection` | FIN, ADM |
| Get Expense Category | GET | `/{expenseCategoryId}` | None | FIN, ADM |
| Update Expense Category | PUT | `/{expenseCategoryId}` | None | FIN |
| Delete Expense Category | DELETE | `/{expenseCategoryId}` | None | FIN |
| Get Expense Category Summary | GET | `/{expenseCategoryId}/summary` | `dateFrom`, `dateTo` | FIN, ADM |

---

## Module 22: Reports

**Base URL:** `/api/v1/reports`  
**Endpoint Count:** 13

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Dashboard Report | GET | `/dashboard` | `dateFrom`, `dateTo`, `branchId` | ADM |
| Beneficiary Report | GET | `/beneficiaries` | `branchId`, `status`, `dateFrom`, `dateTo` | ADM, MGR |
| Project Report | GET | `/projects/{projectId}` | `dateFrom`, `dateTo` | ADM, MGR |
| Inventory Report | GET | `/inventory` | `branchId`, `inventoryId`, `dateFrom`, `dateTo` | ADM, INV |
| Donation Report | GET | `/donations` | `donorId`, `projectId`, `dateFrom`, `dateTo` | ADM, FIN |
| Financial Report | GET | `/financial` | `accountId`, `dateFrom`, `dateTo` | ADM, FIN |
| Distribution Report | GET | `/distributions` | `branchId`, `projectId`, `dateFrom`, `dateTo` | ADM, MGR |
| Family Report | GET | `/families` | `branchId`, `governorate`, `dateFrom`, `dateTo` | ADM, MGR |
| Inventory Transaction Report | GET | `/inventory-transactions` | `branchId`, `transactionType`, `dateFrom`, `dateTo` | ADM, INV |
| Donor Impact Report | GET | `/donor-impact` | `donorId`, `projectId` | ADM, FIN, DNR |
| Project Funding Report | GET | `/project-funding` | `projectId`, `dateFrom`, `dateTo` | ADM, FIN |
| Audit Summary Report | GET | `/audit-summary` | `userId`, `dateFrom`, `dateTo` | ADM |
| Export Report | GET | `/export` | `reportType`, `format`, `dateFrom`, `dateTo` | ADM |

---

## Module 23: Audit Logs

**Base URL:** `/api/v1/audit-logs`  
**Endpoint Count:** 5

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Get Audit Logs | GET | `/` | `page`, `pageSize`, `entity`, `action`, `userId`, `dateFrom`, `dateTo`, `sortBy`, `sortDirection` | ADM, MGR, INV, FIN |
| Get Audit Log Details | GET | `/{auditLogId}` | None | ADM, MGR, INV, FIN |
| Get Entity Audit History | GET | `/entity/{entityName}/{entityId}` | `page`, `pageSize` | ADM, MGR, INV, FIN |
| Get User Activity Log | GET | `/user/{userId}` | `page`, `pageSize`, `action`, `dateFrom`, `dateTo` | ADM |
| Export Audit Logs | GET | `/export` | `format`, `entity`, `action`, `userId`, `dateFrom`, `dateTo` | ADM |

---

## Module 24: Notifications

**Base URL:** `/api/v1/notifications`  
**Endpoint Count:** 6

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Get My Notifications | GET | `/my` | `page`, `pageSize`, `isRead`, `sortBy`, `sortDirection` | Authenticated Users |
| Mark Notification as Read | PATCH | `/{notificationId}/read` | None | Authenticated Users |
| Mark All as Read | PATCH | `/read-all` | None | Authenticated Users |
| Get Unread Count | GET | `/unread-count` | None | Authenticated Users |
| Delete Notification | DELETE | `/{notificationId}` | None | Authenticated Users |
| Get Notification Preferences | GET | `/preferences` | None | Authenticated Users |

---

## Module 25: Dashboard & Analytics

**Base URL:** `/api/v1/analytics`  
**Endpoint Count:** 8

| Action | Method | Path | Query Parameters | Allowed Users |
|---|---|---|---|---|
| Get Overall Dashboard | GET | `/dashboard` | `dateFrom`, `dateTo` | ADM |
| Get Beneficiary Analytics | GET | `/beneficiaries` | `branchId`, `governorate`, `dateFrom`, `dateTo` | ADM, MGR |
| Get Donation Analytics | GET | `/donations` | `dateFrom`, `dateTo`, `donationType` | ADM, FIN |
| Get Inventory Analytics | GET | `/inventory` | `branchId`, `dateFrom`, `dateTo` | ADM, INV |
| Get Financial Analytics | GET | `/financial` | `accountId`, `dateFrom`, `dateTo` | ADM, FIN |
| Get Project Analytics | GET | `/projects` | `branchId`, `status`, `dateFrom`, `dateTo` | ADM, MGR |
| Get Distribution Analytics | GET | `/distributions` | `branchId`, `projectId`, `dateFrom`, `dateTo` | ADM, MGR |
| Get Geo Analytics | GET | `/geo` | `dateFrom`, `dateTo` | ADM |

---

## Summary of Endpoints

### Per Module

| # | Module | Endpoints |
|---|---|---|
| 01 | Authentication | 13 |
| 02 | Branches | 7 |
| 03 | Users | 10 |
| 04 | Families | 14 |
| 05 | Family Members | 9 |
| 06 | Family Assessments | 5 |
| 07 | Family Requests | 9 |
| 08 | Projects | 12 |
| 09 | Project Beneficiaries | 7 |
| 10 | Categories | 6 |
| 11 | Items | 7 |
| 12 | Parcel Templates | 9 |
| 13 | Inventories | 9 |
| 14 | Inventory Transactions | 10 |
| 15 | Distributions | 7 |
| 16 | Donors | 7 |
| 17 | Donation Requests | 9 |
| 18 | Donations | 9 |
| 19 | Financial Accounts | 8 |
| 20 | Financial Transactions | 9 |
| 21 | Expense Categories | 6 |
| 22 | Reports | 13 |
| 23 | Audit Logs | 5 |
| 24 | Notifications | 6 |
| 25 | Dashboard & Analytics | 8 |

**Total: 215 Endpoints**

### Public vs Authenticated

| Category | Count |
|---|---|
| **Public Endpoints** | 8 |
| **Authenticated Endpoints** | 207 |
| **Total** | **215** |

### Public Endpoints

| # | Method | Path | Purpose |
|---|---|---|---|
| 1 | POST | `/auth/register/beneficiary` | Register beneficiary |
| 2 | POST | `/auth/register/donor` | Register donor |
| 3 | POST | `/auth/login` | Login |
| 4 | POST | `/auth/forgot-password` | Request password reset |
| 5 | POST | `/auth/reset-password` | Reset password |
| 6 | POST | `/auth/verify-email` | Verify email address |
| 7 | POST | `/auth/resend-verification` | Resend verification email |
| 8 | GET | `/health` | Health check (system) |

---

## New APIs Added (Beyond Original Suggestions)

The following endpoints were not in the original specification but have been added to provide production-grade functionality. They are explained below.

### 1. Authentication Enhancements

| Endpoint | Purpose |
|---|---|
| `POST /auth/verify-email` | Email verification for new registrations. Prevents fake accounts. |
| `POST /auth/resend-verification` | Resend verification email if the first one was lost. |
| `GET /auth/session` | Returns current session details (token expiry, IP, device). Useful for security dashboards. |

### 2. Branch Enhancements

| Endpoint | Purpose |
|---|---|
| `PATCH /branches/{branchId}/activate` | Counterpart to deactivate. Allows reversing an accidental deactivation. |
| `GET /branches/{branchId}/statistics` | Branch-level KPIs (families, distributions, projects) for the Branch Manager dashboard. |

### 3. User Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /users/{userId}/activity` | Paginated activity log for a specific user. Complements audit logs. |
| `GET /users/branch/{branchId}` | Branch Manager needs to see their team, not just Admin. |
| `GET /users/statistics` | User counts by role and status for Admin dashboards. |

### 4. Family Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /families/statistics` | Aggregated family counts by status for dashboards. |
| `GET /families/{familyId}/timeline` | Unified timeline of assessments, requests, distributions, and verifications. |
| `GET /families/{familyId}/assessments` | Assessment version history (important when reassessments are requested). |
| `GET /families/{familyId}/members-summary` | Quick summary for beneficiary portal (names, ages, head-of-family). |
| `PATCH /families/bulk/verify` | Verify multiple families in one action. Essential for Branch Managers handling large batches. |
| `GET /families/export` | Export family data (CSV/Excel) for offline reporting and donor reports. |

### 5. Family Member Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /families/{familyId}/members/statistics` | Member counts by gender, age group, disability, chronic disease. |
| `GET /families/{familyId}/members/search/national-id` | Fast lookup by national ID — critical for duplicate detection. |
| `GET /families/{familyId}/members/export` | Export member data for reporting. |

### 6. Assessment Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /families/{familyId}/assessment/history` | Full assessment history. |
| `GET /families/{familyId}/assessment/compare` | Compare two assessments to see what changed. Useful for audit and reassessment decisions. |

### 7. Family Request Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /family-requests/statistics` | Request approval/rejection rates for Branch Manager dashboards. |
| `GET /family-requests/{requestId}/history` | Full audit trail of a request's status transitions. |

### 8. Project Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /projects/{projectId}/summary` | One-stop summary: beneficiaries, distributions, parcels, inventory, funding. |
| `GET /projects/statistics` | Aggregated project counts for dashboards. |
| `GET /projects/{projectId}/timeline` | Project lifecycle timeline (created, activated, distributions, completed). |
| `GET /projects/{projectId}/export` | Export project report for donors or internal review. |

### 9. Beneficiary List Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /projects/{projectId}/beneficiaries/statistics` | Summary of generated beneficiary list (counts, demographics). |
| `GET /projects/{projectId}/beneficiaries/export` | Export the beneficiary list. |
| `GET /projects/{projectId}/beneficiaries/check/{familyId}` | Check if a specific family is eligible before regenerating. |

### 10. Category & Item Enhancements

| Endpoint | Purpose |
|---|---|
| `DELETE /categories/{categoryId}` | Delete an empty category. |
| `GET /categories/{categoryId}/items` | List items in a category. |
| `DELETE /items/{itemId}` | Delete an item (only if not in use). |
| `GET /items/{itemId}/stock` | Cross-warehouse stock for an item. |
| `GET /items/{itemId}/movements` | Full movement history of an item. Critical for audit and traceability. |

### 11. Parcel Enhancements

| Endpoint | Purpose |
|---|---|
| `PATCH /parcels/{parcelId}/items/{itemId}` | Update quantity of an item already in the parcel. |
| `GET /parcels/{parcelId}/items` | List items in a parcel template. |
| `GET /parcels/{parcelId}/usage` | Which projects use this parcel. Prevents unsafe deletion. |

### 12. Inventory Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /inventories/{inventoryId}/summary` | Inventory valuation, total items, low-stock count. |
| `GET /inventories/low-stock` | System-wide low stock report. |
| `GET /inventories/{inventoryId}/movements` | Full movement history of a warehouse. |
| `GET /inventories/{inventoryId}/export` | Export warehouse report. |

### 13. Inventory Transaction Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /inventory-transactions/{transactionId}/items` | Line items of a transaction. |
| `GET /inventory-transactions/{transactionId}/summary` | Transaction summary (source, destination, items, totals). |
| `GET /inventory-transactions/statistics` | Aggregated transaction counts for dashboards. |

### 14. Distribution Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /distributions/statistics` | Distribution KPIs. |
| `GET /distributions/{distributionId}/receipt` | Printable receipt for beneficiary. Important for dignity and transparency. |
| `GET /distributions/export` | Export distribution data. |

### 15. Donor Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /donors/{donorId}/donations` | Full donation history of a donor. |
| `GET /donors/{donorId}/statistics` | Total donated, project count, impact. |
| `GET /donors/top` | Top donors leaderboard for recognition. |

### 16. Donation Request Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /donation-requests/statistics` | Approval/rejection rates. |
| `POST /donation-requests/{requestId}/fulfill` | Directly create a donation from an approved request (shortcut). |

### 17. Donation Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /donations/{donationId}/summary` | Full traceability: donor → donation → settlement → project → beneficiary. |
| `GET /donations/{donationId}/traceability` | Detailed chain of custody of a donation. |
| `GET /donations/statistics` | Donation KPIs. |
| `GET /donations/export` | Export donation data. |

### 18. Financial Account Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /accounts/{accountId}/summary` | Account summary: balance, inflow, outflow, transaction count. |
| `GET /accounts/{accountId}/balance-history` | Balance over time (daily/weekly/monthly). Essential for financial dashboards. |

### 19. Financial Transaction Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /financial-transactions/{transactionId}/summary` | Transaction summary with linked entities. |
| `GET /financial-transactions/statistics` | Financial KPIs. |
| `GET /financial-transactions/export` | Export ledger. |

### 20. Expense Category Enhancements

| Endpoint | Purpose |
|---|---|
| `DELETE /expense-categories/{expenseCategoryId}` | Delete unused category. |
| `GET /expense-categories/{expenseCategoryId}/summary` | Total spent per category over a period. |

### 21. Report Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /reports/families` | Family-level report. |
| `GET /reports/inventory-transactions` | Inventory movement report. |
| `GET /reports/donor-impact` | Donor-facing impact report. |
| `GET /reports/project-funding` | Funding per project. |
| `GET /reports/audit-summary` | Audit summary report. |
| `GET /reports/export` | Unified report export endpoint. |

### 22. Audit Log Enhancements

| Endpoint | Purpose |
|---|---|
| `GET /audit-logs/entity/{entityName}/{entityId}` | Audit history of any single record. |
| `GET /audit-logs/user/{userId}` | All actions by a specific user. |
| `GET /audit-logs/export` | Export audit data for compliance. |

### 23. Notifications (New Module)

| Endpoint | Purpose |
|---|---|
| `GET /notifications/my` | All notifications for the current user. |
| `PATCH /notifications/{id}/read` | Mark one as read. |
| `PATCH /notifications/read-all` | Mark all as read. |
| `GET /notifications/unread-count` | Badge count. |
| `DELETE /notifications/{id}` | Delete a notification. |
| `GET /notifications/preferences` | User's notification preferences. |

**Why added:** The SRS mentions "Notifications: View verification result, distribution appointment, approval/rejection messages" for the Beneficiary role. This module fulfills that requirement.

### 24. Dashboard & Analytics (New Module)

| Endpoint | Purpose |
|---|---|
| `GET /analytics/dashboard` | Global dashboard (ADM). |
| `GET /analytics/beneficiaries` | Beneficiary analytics (growth, status distribution, geography). |
| `GET /analytics/donations` | Donation trends. |
| `GET /analytics/inventory` | Inventory turnover, stock levels. |
| `GET /analytics/financial` | Financial health. |
| `GET /analytics/projects` | Project performance. |
| `GET /analytics/distributions` | Distribution efficiency. |
| `GET /analytics/geo` | Geographic heatmap of need. |

**Why added:** Dashboards are essential for NGO decision-making. Field staff need KPIs; donors need impact metrics; managers need operational visibility.

---

## Final Summary

| Metric | Count |
|---|---|
| **Total Modules** | 25 |
| **Total Endpoints** | 215 |
| **Public Endpoints** | 8 |
| **Authenticated Endpoints** | 207 |
| **Average Endpoints per Module** | 8.6 |

### Module Distribution

- **Core Business Modules:** 1–18 (108 endpoints)
- **Financial Modules:** 19–21 (23 endpoints)
- **Reporting & Audit:** 22–23 (18 endpoints)
- **Cross-Cutting:** 24–25 (14 endpoints)

### Access Distribution

| Role | Accessible Endpoints (approx.) |
|---|---|
| ADM | ~210 (all except a few MBR/DNR-only) |
| MGR | ~95 |
| RES | ~50 |
| INV | ~85 |
| FIN | ~85 |
| DNR | ~20 |
| MBR | ~18 |
| Public | 8 |

### Design Principles Applied

1. **Consistent verb-to-action mapping:** `POST` = create/trigger, `GET` = read, `PUT` = full update, `PATCH` = partial action, `DELETE` = remove.
2. **Plural nouns for resources:** `/families`, `/donors`, `/inventories`.
3. **Nested resources for hierarchy:** `/families/{id}/members`, `/projects/{id}/beneficiaries`.
4. **State transitions as sub-resources:** `/verify`, `/reject`, `/activate`, `/cancel` — never buried in query params.
5. **Summary and statistics endpoints** for dashboard and reporting needs.
6. **Export endpoints** for offline reporting.
7. **Paginated listings** with standard `page`, `pageSize`, `sortBy`, `sortDirection`.
8. **Traceability endpoints** for audit-critical entities (donations, distributions, inventory items).
9. **Notification module** to satisfy beneficiary/donor communication requirements in the SRS.
10. **Analytics module** to satisfy Branch Manager and Admin reporting requirements.

---

End of API Specification v1.0