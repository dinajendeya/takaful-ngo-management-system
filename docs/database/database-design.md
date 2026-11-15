# Database Design

Detailed relational design for the system. The diagram is in [erd.md](erd.md), and the naming rules are in [naming-conventions.md](naming-conventions.md).

### 3.1 Table Inventory by Module

#### Identity & Access (3)
- `branches`
- `users`
- `audit_logs`

#### Beneficiary (5)
- `addresses`
- `families`
- `family_members`
- `family_assessments`
- `family_requests`

#### Project & Distribution (3)
- `projects`
- `project_parcels`
- `distributions`

#### Inventory (4)
- `categories`
- `items`
- `inventories`
- `inventory_items`

#### Parcel (2)
- `parcel_templates`
- `parcel_items`

#### Donation (3)
- `donors`
- `donation_requests`
- `donations`

#### Financial (3)
- `financial_accounts`
- `expense_categories`
- `financial_transactions`

#### Inventory Movement (3)
- `inventory_transactions`
- `inventory_transaction_items`
- `inventory_transaction_parcels`

**Total: 26 tables**

---

### 3.2 Relationships (Text Form)

```
branches        1 — N  users
branches        1 — N  inventories
branches        1 — N  distributions

users           1 — N  families (created_by)
users           1 — N  families (verified_by)
users           1 — N  family_assessments (assessed_by)
users           1 — N  family_requests (reviewed_by)
users           1 — N  projects (created_by)
users           1 — N  distributions (distributed_by)
users           1 — N  donations (reviewed_by, via donation_requests)
users           1 — N  financial_transactions (created_by)
users           1 — N  inventory_transactions (created_by)
users           1 — N  audit_logs

addresses       1 — N  families (original_address_id)
addresses       1 — N  families (current_address_id)

families        1 — N  family_members
families        1 — 1  family_assessments
families        1 — N  family_requests
families        1 — N  distributions

family_members  1 — N  family_requests (requested_by)

categories      1 — N  items
items           1 — N  inventory_items
items           1 — N  parcel_items
items           1 — N  inventory_transaction_items

inventories     N — M  items (via inventory_items)
inventories     1 — N  inventory_transactions (source)
inventories     1 — N  inventory_transactions (destination)

parcel_templates N — M  items (via parcel_items)
parcel_templates 1 — N  project_parcels
parcel_templates 1 — N  distributions
parcel_templates 1 — N  inventory_transaction_parcels

projects        1 — N  project_parcels
projects        1 — N  distributions
projects        1 — N  donations
projects        1 — N  inventory_transactions
projects        1 — N  financial_transactions

donors          1 — N  donation_requests
donors          1 — N  donations
donors          1 — N  financial_transactions
donors          1 — N  inventory_transactions

donation_requests 1 — 0..1 donations

donations       1 — 0..1 financial_transactions
donations       1 — N  inventory_transactions

financial_accounts 1 — N  financial_transactions (source)
financial_accounts 1 — N  financial_transactions (destination)

expense_categories 1 — N  financial_transactions

inventory_transactions       1 — N  inventory_transaction_items
inventory_transactions       1 — N  inventory_transaction_parcels
```

---

### 3.3 Tree View of Entities

```
Branch
  |
  +---- Users
  |
  +---- Inventory
  |
  +---- Distribution

User
  |
  +---- Family (created_by)
  |
  +---- Family (verified_by)
  |
  +---- FamilyAssessment (assessed_by)
  |
  +---- FamilyRequest (reviewed_by)
  |
  +---- Project
  |
  +---- Distribution
  |
  +---- FinancialTransaction
  |
  +---- InventoryTransaction
  |
  +---- AuditLog

Address
  |
  +---- Family (original_address_id)
  |
  +---- Family (current_address_id)

Family
  |
  +---- FamilyMembers
  |
  +---- FamilyAssessment
  |
  +---- FamilyRequests
  |
  +---- Distribution

FamilyMember
  |
  +---- FamilyRequests (requested_by)

Category
  |
  +---- Item
          |
          +---- InventoryItem
          |
          +---- ParcelItem
          |
          +---- DonationItem
          |
          +---- InventoryTransactionItem

Inventory
  |
  +---- InventoryItem
  |
  +---- DonationItem
  |
  +---- DonationParcel
  |
  +---- InventoryTransaction (source)
  |
  +---- InventoryTransaction (destination)

ParcelTemplate
  |
  +---- ParcelItem
  |
  +---- ProjectParcel
  |
  +---- Distribution
  |
  +---- DonationParcel
  |
  +---- InventoryTransactionParcel

Project
  |
  +---- ProjectParcel
  |
  +---- Distribution
  |
  +---- Donation
  |
  +---- InventoryTransaction
  |
  +---- FinancialTransaction

Donor
  |
  +---- DonationRequest
          |
          +---- Donation
                  |
                  +---- DonationMoney
                  |
                  +---- DonationItem
                  |
                  +---- DonationParcel
                  |
                  +---- FinancialTransaction
                  |
                  +---- InventoryTransaction
  |
  +---- FinancialTransaction
  |
  +---- InventoryTransaction

FinancialAccount
  |
  +---- FinancialTransaction (source)
  |
  +---- FinancialTransaction (destination)

ExpenseCategory
  |
  +---- FinancialTransaction

InventoryTransaction
  |
  +---- InventoryTransactionItem
  |
  +---- InventoryTransactionParcel
```

---

### 3.4 Enumerations

```sql
user_role:                   ADMIN, BRANCH_MANAGER, FIELD_RESEARCHER,
                             INVENTORY_MANAGER, FINANCE_MANAGER

family_status:               PENDING, VERIFIED, REJECTED

gender:                      MALE, FEMALE

marital_status:              SINGLE, MARRIED, DIVORCED, WIDOWED

category:                    FOOD, CLEANING, BLANKETS, SCHOOL,
                             ELECTRONICS, MEDICAL, MONETARY, COURSE

employment_status:           EMPLOYED, UNEMPLOYED, SELF_EMPLOYED, STUDENT, RETIRED, FREELANCED, OTHER

education_level:             NONE, KINDERGARTEN, PRIMARY, PREPARATORY, SECONDARY, DIPLOMA, BACHELOR, MASTER, PHD


housing_type:                OWNER, RENT, HOSTING, TENT, FULL_HOUSE,
                             PARTIALLY_DESTROYED, TOTALLY_DESTROYED

inventory_type:              CENTRAL, BRANCH

project_status:              DRAFT, ACTIVE, COMPLETED, CANCELLED

donation_type:               MONETARY, ITEM, PARCEL

donation_status:             PENDING, RECEIVED, CANCELLED, REJECTED

donor_type: INDIVIDUAL, ORGANIZATION, COMPANY, NGO, GOVERNMENT

request_status:              PENDING, APPROVED, REJECTED, CANCELLED

financial_transaction_type:  DONATION, ACCOUNT_TRANSFER,
                             PROJECT_ALLOCATION, EXPENSE

financial_entity_type:       DONOR, ACCOUNT, PROJECT, EXPENSE_CATEGORY

inventory_transaction_type:  DONATION, TRANSFER, PROJECT_ALLOCATION,
                             DISTRIBUTION, ADJUSTMENT

inventory_entity_type:       DONOR, INVENTORY, PROJECT, BRANCH

audit_action:                CREATE, UPDATE, DELETE, LOGIN, LOGOUT,
                             VERIFY, REJECT, DISTRIBUTE, APPROVE,
                             CANCEL

gaza_governorate:            NORTH_GAZA, GAZA, DEIR_AL_BALAH, KHAN_YOUNIS,
                             RAFAH, ABROAD
project_expense_category: FOOD_AID, CASH_AID, MEDICAL_AID, EDUCATION_AID, HOUSING_AID, ORPHAN_AID, WATER_AID, WINTER_AID, EMERGENCY_AID, TRANSPORTATION, STORAGE, DISTRIBUTION, PROJECT_SUPPLIES, PROJECT_EQUIPMENT, STAFF_SALARIES, TRAINING, OTHER                             
```

---

### 3.5 Public ID Prefixes

| Entity | Prefix | Example |
|---|---|---|
| Admin | `ADM` | ADM-0001 |
| Branch Manager | `MGR` | MGR-0005 |
| Field Researcher | `RES` | RES-0015 |
| Inventory Manager | `INV` | INV-0002 |
| Finance Manager | `FIN` | FIN-00001 |
| Branch | `BRN` | BRN-0001 |
| Family | `FAM` | FAM-000001 |
| Family Member | `MBR` | MBR-000001 |
| Family Request | `FREQ` | FREQ-000001 |
| Inventory | `WHS` | WHS-0001 |
| Item | `ITM` | ITM-000001 |
| Parcel Template | `PRC` | PRC-0001 |
| Project | `PRJ` | PRJ-00001 |
| Distribution | `DST` | DST-000001 |
| Donor | `DNR` | DNR-00001 |
| Donation Request | `DREQ` | DREQ-00001 |
| Donation | `DON` | DON-00001 |
| Financial Account | `ACC` | ACC-0001 |
| Financial Transaction | `FINTRX` | FINTRX-00001 |
| Inventory Transaction | `INVTRX` | INVTRX-00001 |
| Expense Category | `EXP` | EXP-0001 |

---

### 3.6 Table Definitions

#### Module 1 — Identity & Access

**`branches`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| name | VARCHAR(150) | NOT NULL, UNIQUE | |
| governorate | VARCHAR(100) | NOT NULL | |
| address | TEXT | | |
| phone | VARCHAR(30) | | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**`users`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| branch_id | BIGINT | | branches(id) |
| full_name | VARCHAR(150) | NOT NULL | |
| email | VARCHAR(255) | NOT NULL, UNIQUE | |
| password_hash | TEXT | NOT NULL | |
| role | user_role | NOT NULL | |
| address | TEXT | NOT NULL | |
| phone | VARCHAR(30) | | |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**`audit_logs`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| user_id | BIGINT | | users(id) |
| entity_name | VARCHAR(100) | NOT NULL | |
| entity_id | BIGINT | NOT NULL | |
| action | audit_action | NOT NULL | |
| old_values | JSONB | | |
| new_values | JSONB | | |
| ip_address | VARCHAR(100) | | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

---

#### Module 2 — Beneficiary Management

**`addresses`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| governorate | gaza_governorate | NOT NULL | |
| city | VARCHAR(100) | | |
| neighborhood | VARCHAR(200) | | |
| street | VARCHAR(200) | | |
| nearby_landmark | VARCHAR(200) | | |
| additional_details | TEXT | | |

**`families`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| primary_phone | VARCHAR(30) | NOT NULL | |
| emergency_phone | VARCHAR(30) | | |
| original_address_id | BIGINT | NOT NULL | addresses(id) |
| current_address_id | BIGINT | NOT NULL | addresses(id) |
| status | family_status | NOT NULL, DEFAULT 'PENDING' | |
| created_by | BIGINT | NOT NULL | users(id) |
| verified_by | BIGINT | | users(id) |
| verified_at | TIMESTAMP | | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**`family_members`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| family_id | BIGINT | NOT NULL | families(id) ON DELETE CASCADE |
| national_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| full_name | VARCHAR(200) | NOT NULL | |
| gender | gender | NOT NULL | |
| birth_date | DATE | NOT NULL | |
| relationship | VARCHAR(100) | NOT NULL | |
| is_head_of_family | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| education_level | education_level | | |
| education_major | VARCHAR(200) | | |
| education_fees | NUMERIC(10,2) | | |
| employment_status | employment_status | NOT NULL, DEFAULT UNEMPLOYED | |
| monthly_income | NUMERIC(10,2) | DEFAULT 0 | |
| has_disability | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| disability_type | VARCHAR(150) | | |
| has_chronic_disease | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| disease_name | VARCHAR(150) | | |
| marital_status | marital_status | NOT NULL, DEFAULT SINGLE | |
| is_orphan | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| is_based_in_gaza | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| created_by | BIGINT | NOT NULL | users(id) |

**`family_assessments`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| family_id | BIGINT | NOT NULL, UNIQUE | families(id) ON DELETE CASCADE |
| assessed_by | BIGINT | NOT NULL | users(id) |
| monthly_family_income | NUMERIC(10,2) | NOT NULL | |
| rent_cost | NUMERIC(10,2) | | |
| housing_type | housing_type | NOT NULL | |
| is_displaced | BOOLEAN | NOT NULL | |
| is_registered_in_camp | BOOLEAN | NOT NULL | |
| has_electricity | BOOLEAN | NOT NULL | |
| has_internet | BOOLEAN | NOT NULL | |
| notes | TEXT | | |
| assessed_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**`family_requests`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | UUID | NOT NULL, UNIQUE, DEFAULT uuid_generate_v4() | |
| family_id | BIGINT | NOT NULL | families(id) |
| requested_by | BIGINT | NOT NULL | family_members(id) |
| before_data | JSONB | NOT NULL | |
| after_data | JSONB | NOT NULL | |
| justification | TEXT | | |
| status | request_status | NOT NULL, DEFAULT 'PENDING' | |
| reviewed_by | BIGINT | | users(id) |
| reviewed_at | TIMESTAMPTZ | | |
| rejection_reason | TEXT | | |

**Review Consistency Constraint:**
```
CHECK (
  (status IN ('APPROVED','REJECTED')
   AND reviewed_at IS NOT NULL
   AND reviewed_by IS NOT NULL)
   OR
  (status IN ('PENDING','CANCELLED'))
)
```

---

#### Module 3 — Project & Distribution

**`projects`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| name | VARCHAR(200) | NOT NULL | |
| description | TEXT | | |
| start_date | DATE | NOT NULL | |
| end_date | DATE | | |
| status | project_status | NOT NULL, DEFAULT 'DRAFT' | |
| created_by | BIGINT | NOT NULL | users(id) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**`project_parcels`**

| Column | Type | Constraints | References |
|---|---|---|---|
| project_id | BIGINT | PK, NOT NULL | projects(id) ON DELETE CASCADE |
| parcel_template_id | BIGINT | PK, NOT NULL | parcel_templates(id) |
| initial_quantity | INTEGER | NOT NULL, CHECK >= 0 | |
| available_quantity | INTEGER | NOT NULL, CHECK >= 0 | |

**`distributions`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| family_id | BIGINT | NOT NULL | families(id) |
| branch_id | BIGINT | NOT NULL | branches(id) |
| project_id | BIGINT | NOT NULL | projects(id) |
| parcel_template_id | BIGINT | NOT NULL | parcel_templates(id) |
| distributed_by | BIGINT | NOT NULL | users(id) |
| distributed_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| notes | TEXT | | |

---

#### Module 4 — Inventory

**`categories`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| name | VARCHAR(100) | NOT NULL, UNIQUE | |
| description | TEXT | | |

**`items`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| category_id | BIGINT | NOT NULL | categories(id) |
| name | VARCHAR(150) | NOT NULL | |
| unit | VARCHAR(50) | NOT NULL | |
| description | TEXT | | |

**`inventories`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| inventory_type | inventory_type | NOT NULL | |
| name | VARCHAR(150) | NOT NULL | |
| branch_id | BIGINT | | branches(id) |
| location | TEXT | | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**`inventory_items`**

| Column | Type | Constraints | References |
|---|---|---|---|
| inventory_id | BIGINT | PK, NOT NULL | inventories(id) ON DELETE CASCADE |
| item_id | BIGINT | PK, NOT NULL | items(id) |
| quantity | INTEGER | NOT NULL, CHECK >= 0 | |

---

#### Module 5 — Parcel Management

**`parcel_templates`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| name | VARCHAR(150) | NOT NULL | |
| description | TEXT | | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**`parcel_items`**

| Column | Type | Constraints | References |
|---|---|---|---|
| parcel_template_id | BIGINT | PK, NOT NULL | parcel_templates(id) ON DELETE CASCADE |
| item_id | BIGINT | PK, NOT NULL | items(id) |
| quantity | INTEGER | NOT NULL, CHECK > 0 | |

---

#### Module 6 — Donor Management

**`donors`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| name | VARCHAR(255) | NOT NULL | |
| contact_person | VARCHAR(255) | | |
| phone | VARCHAR(30) | | |
| email | VARCHAR(255) | | |
| donor_type | doner_type | | |
| notes | TEXT | | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**`donation_requests`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | UUID | NOT NULL, UNIQUE, DEFAULT uuid_generate_v4() | |
| donor_id | BIGINT | NOT NULL | donors(id) |
| donation_type | donation_type | NOT NULL | |
| project_id | BIGINT | | projects(id) |
| note | TEXT | | |
| status | request_status | NOT NULL, DEFAULT 'PENDING' | |
| requested_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| reviewed_at | TIMESTAMPTZ | | |
| reviewed_by | BIGINT | | users(id) |
| rejection_reason | TEXT | | |

**Review Consistency Constraint:**
```
CHECK (
  (status IN ('APPROVED','REJECTED')
   AND reviewed_at IS NOT NULL
   AND reviewed_by IS NOT NULL)
   OR
  (status IN ('PENDING','CANCELLED'))
)
```

**`donations`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | UUID | NOT NULL, UNIQUE | |
| donation_request_id | BIGINT | UNIQUE | donation_requests(id) |
| donor_id | BIGINT | NOT NULL | donors(id) |
| project_id | BIGINT | | projects(id) |
| donation_type | donation_type | NOT NULL | |
| status | donation_status | NOT NULL, DEFAULT 'PENDING' | |
| received_at | TIMESTAMPTZ | NOT NULL | |
| note | TEXT | | |


---

#### Module 7 — Financial

**`financial_accounts`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| name | VARCHAR(255) | NOT NULL | |
| currency | VARCHAR(10) | NOT NULL | |
| description | TEXT | | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**`expense_categories`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| name | project_espenses_category(100) | NOT NULL, UNIQUE | |
| description | TEXT | | |

**`financial_transactions`**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| transaction_type | financial_transaction_type | NOT NULL | |
| source_type | financial_entity_type | NOT NULL | |
| source_id | BIGINT | NOT NULL | |
| destination_type | financial_entity_type | NOT NULL | |
| destination_id | BIGINT | NOT NULL | |
| amount | NUMERIC(15,2) | NOT NULL, CHECK > 0 | |
| currency | VARCHAR(10) | NOT NULL | |
| donation_id | BIGINT | | donations(id) |
| notes | TEXT | | |
| created_by | BIGINT | NOT NULL | users(id) or doner(id) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

**Partial Unique Constraint:**
```
CREATE UNIQUE INDEX ux_financial_transaction_donation
ON financial_transactions(donation_id)
WHERE donation_id IS NOT NULL;
```

> Enforces **one monetary financial transaction per donation** (1:1 for monetary donations).

---

#### Module 8 — Inventory Movement

**`inventory_transactions`
the parent for the inventory_transaction_items and the inventory_transaction_parcels**

| Column | Type | Constraints | References |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| public_id | VARCHAR(20) | NOT NULL, UNIQUE | |
| transaction_type | inventory_transaction_type | NOT NULL | |
| source_type | inventory_entity_type | NOT NULL | |
| source_id | BIGINT | NOT NULL | |
| destination_type | inventory_entity_type | NOT NULL | |
| destination_id | BIGINT | NOT NULL | |
| donation_id | BIGINT | | donations(id) |
| notes | TEXT | | |
| created_by | BIGINT | NOT NULL | users(id) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |

> A single donation may generate **multiple** inventory transactions (e.g., 100 blankets → central warehouse, 50 food boxes → Rafah warehouse, 25 jackets → Khan Younis warehouse). Hence the 1:N relationship.

**`inventory_transaction_items`**

| Column | Type | Constraints | References |
|---|---|---|---|
| transaction_id | BIGINT | PK, NOT NULL | inventory_transactions(id) ON DELETE CASCADE |
| item_id | BIGINT | PK, NOT NULL | items(id) |
| quantity | INTEGER | NOT NULL, CHECK > 0 | |

**`inventory_transaction_parcels`**

| Column | Type | Constraints | References |
|---|---|---|---|
| transaction_id | BIGINT | PK, NOT NULL | inventory_transactions(id) ON DELETE CASCADE |
| parcel_template_id | BIGINT | PK, NOT NULL | parcel_templates(id) |
| quantity | INTEGER | NOT NULL, CHECK > 0 | |

---

### 3.7 Donation Consistency Rules

The following invariants must be enforced (via application logic and/or database constraints/triggers):

| Donation Type | Required | Forbidden |
|---|---|---|
| `MONETARY` | Exactly one `financial_transactions` row with `donation_id` set | Any `inventory_transactions` row with `donation_id` set |
| `ITEM` | At least one `inventory_transactions` row with `donation_id` set, referencing `inventory_transaction_items` | Any `financial_transactions` row with `donation_id` set |
| `PARCEL` | At least one `inventory_transactions` row with `donation_id` set, referencing `inventory_transaction_parcels` | Any `financial_transactions` row with `donation_id` set |

**Donation lifecycle:**

```
PENDING → RECEIVED   (when financial or inventory transaction is recorded)
PENDING → CANCELLED  (when donor cancels before receipt)
PENDING → REJECTED   (when NGO rejects on review)
```

A donation whose linked `donation_request` is `REJECTED` must not transition to `RECEIVED`.

---

### 3.8 Recommended Indexes

```sql
CREATE UNIQUE INDEX idx_family_public_id ON families(public_id);
CREATE UNIQUE INDEX idx_member_national_id ON family_members(national_id);
CREATE INDEX idx_family_status ON families(status);
CREATE INDEX idx_distribution_family ON distributions(family_id);
CREATE INDEX idx_distribution_project ON distributions(project_id);
CREATE INDEX idx_inventory_item ON inventory_items(item_id);
CREATE INDEX idx_project_status ON projects(status);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_family_requests_family ON family_requests(family_id);
CREATE INDEX idx_family_requests_status ON family_requests(status);
CREATE INDEX idx_donation_requests_donor ON donation_requests(donor_id);
CREATE INDEX idx_donation_requests_status ON donation_requests(status);
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_project ON donations(project_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_financial_tx_donation ON financial_transactions(donation_id);
CREATE INDEX idx_inventory_tx_donation ON inventory_transactions(donation_id);
CREATE UNIQUE INDEX ux_financial_transaction_donation
    ON financial_transactions(donation_id)
    WHERE donation_id IS NOT NULL;
```

---
