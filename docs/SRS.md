# Software Requirements Specification (SRS)
## Gaza Aid Distribution & NGO Management System

**Version:** 2.0  
**Document Type:** Software Requirements Specification  
**Prepared for:** Gaza-based Humanitarian NGO  
**Status:** Revised Draft for Review  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Users & Roles](#2-users--roles)
3. [Database Design](#3-database-design)
4. [Functional Requirements](#4-functional-requirements)
5. [User Stories](#5-user-stories)
6. [Appendix](#6-appendix)

---

## 1. Introduction

### 1.1 Purpose

This document defines the complete software requirements for an integrated NGO Management System designed to operate in the Gaza Strip. The system enables fair, transparent, and auditable distribution of humanitarian aid to families in need, while providing full lifecycle management of beneficiaries, inventory, projects, donations, and financial resources.

### 1.2 Scope

The system is a web-based ERP-style platform consisting of eight integrated business modules:

1. **Identity & Access Management** — employees, branches, authentication, audit
2. **Beneficiary Management** — families, family members, assessments, addresses, family requests
3. **Project & Aid Distribution** — projects, parcels, distributions, beneficiary selection
4. **Inventory & Warehouse Management** — warehouses, stock, items, categories
5. **Parcel Management** — reusable parcel templates and their contents
6. **Donor Management** — donors, donation requests, donations (money, items, parcels)
7. **Financial Management** — accounts, expense categories, financial ledger
8. **Inventory Movement Management** — every stock movement tracked as a transaction

The system serves seven actors: Admin, Branch Manager, Field Researcher, Inventory Manager, Finance Manager, Donor, and Family Member/Beneficiary.

### 1.3 Objectives

- **Fair distribution:** Provide rule-based, filter-driven beneficiary selection so aid reaches the most needy families first.
- **Traceability:** Track every donated item, parcel, and monetary unit from donor to beneficiary.
- **Accountability:** Maintain immutable audit logs for all sensitive operations (verify, reject, distribute, transfer).
- **Decentralization:** Allow branch-level operation across Gaza governorates while maintaining central oversight.
- **Financial integrity:** Provide a double-entry-style ledger linking donations to projects and expenses.
- **Least privilege:** Enforce strict role-based access so each actor sees only what they need.
- **Donor transparency:** Give donors visibility into how their contributions were used.
- **Beneficiary dignity:** Give families a limited portal to view their status, aid history, and submit correction requests.
- **Clean separation of concerns:** Donations, financial transactions, and inventory transactions represent distinct business events and must remain normalized without duplication.

### 1.4 Problems the System Solves

| Problem | Solution |
|---|---|
| Duplicate/ghost beneficiaries | Unique national ID per family member; verification workflow |
| Unequal aid distribution | Assessment-driven eligibility filtering and project beneficiary generation |
| Lost or unaccounted inventory | Every movement is a transaction with source/destination and audit log |
| Donor distrust | Donor portal shows donation status, utilization, and impact |
| No financial oversight | Central ledger links donations → accounts → projects → expenses |
| Paper-based family records | Digitized family, member, assessment, and address records |
| Unclear staff responsibility | Seven well-defined roles with explicit permissions |
| No accountability for changes | JSONB before/after audit records for every critical mutation |
| Cross-branch inconsistencies | Branch scoping + central Admin oversight + branch audit logs |
| Unverified donor pledges | Dedicated donation request workflow with review and approval |
| Beneficiaries can't correct data | Dedicated family request workflow with before/after JSONB |
| Duplicate donation data across tables | Donations are the single source of truth; money lives in financial transactions, quantities live in inventory transactions |

---

## 2. Users & Roles

Each user is identified by a **public ID prefix** shown below.

---

### 2.1 Admin — Prefix: `ADM`

**Role:** System owner. Full oversight of users, branches, families, projects, inventory, and finance. Only role that can create other users.

#### User Management
- Create: Branch Manager, Field Researcher, Inventory Manager, Finance Manager, Admin
- View: all users, user details, user activity, user audit logs
- Update: personal info, role, active status, assigned branch, reset password
- Deactivate: any user

#### Branch Management
- Create, view, update branches (name, phone, address, governorate)
- Deactivate branches

#### Family Management
- View: all families, all members, all assessments, all distributions, all family requests
- Review: approve/reject family requests
- Update: family info, status, verification info, assessment data
- Verify family
- Reject family

#### Donation Management
- View: all donation requests, all donations
- Review: approve/reject donation requests

#### Projects
- Create, update (info, dates, status, parcels, allocations), activate, close
- Delete draft projects only

#### Inventory
- View: all inventories, all transactions, all stock

#### Finance
- View: accounts, transactions, donations, expenses

#### Audit
- View: entire audit log

---

### 2.2 Branch Manager — Prefix: `MGR`

**Role:** Branch operations lead. Manages families, projects, and distributions within the branch.

#### Authentication
- Login, logout, change password, update own profile

#### Family
- Create: family, family members
- View: branch families, members, assessments, distribution history, family requests
- Review: approve/reject family requests within branch scope
- Update: phones, addresses, status, members, assessment
- Verify family, reject family
- Request reassessment

#### Projects
- Create project
- Update: info, dates, status, project parcel quantities
- Select beneficiaries: apply filters, generate list, remove family, regenerate
- View: all branch projects

#### Distribution
- Create distribution records
- Update distribution notes
- View distribution history

#### Inventory
- View: branch stock, transactions, parcel availability
- Request: inventory transfer, parcel allocation

#### Reports
- View: branch, beneficiary, project, distribution reports

#### Audit
- View: branch audit logs

---

### 2.3 Field Researcher — Prefix: `RES`

**Role:** Field data collector. Registers families and conducts assessments.

#### Authentication
- Login, logout, change password, update own profile

#### Family
- Create: family, family members
- View: families they created, assessment results, verification results
- Update: phones, addresses, members, assessment
- Submit family for verification

#### Assessments
- Create family assessment
- Update: housing, camp registration, internet, electricity, income, living conditions, displacement

---

### 2.4 Inventory Manager — Prefix: `INV`

**Role:** Warehouse and stock operator.

#### Authentication
- Login, logout, change password, update profile

#### Categories
- Create, update, view categories

#### Items
- Create, update, view items

#### Parcel Templates
- Create, update, view parcel templates and contents

#### Inventory
- Create, update, view inventories, stock, and transactions

#### Inventory Transactions
- Create: donation, transfer, allocation, adjustment
- Update: notes before approval

#### Donations (physical)
- Register item donations, parcel donations (create inventory transactions linked to donations)
- View donors and donations

#### Donation Requests
- View requests requiring physical fulfillment
- Fulfill approved item/parcel donation requests

#### Reports
- View: warehouse, stock, low-stock reports

---

### 2.5 Finance Manager — Prefix: `FIN`

**Role:** Financial controller.

#### Authentication
- Login, logout, change password, update profile

#### Donors
- Create, update, view donors

#### Donations (monetary)
- Register monetary donations (create financial transaction linked to donation)
- View donation history

#### Donation Requests
- Review and approve/reject monetary donation requests
- Fulfill approved monetary donation requests by recording the received funds

#### Financial Accounts
- Create, update, view balances and transactions

#### Financial Transactions
- Create: donation, account transfer, project allocation, expense
- Record: salary, electricity, rent, water, transportation, office, maintenance expenses

#### Projects
- View project funding and allocations

#### Reports
- View: financial, donation, expense, account reports

---

### 2.6 Donor — Prefix: `DNR`

**Role:** External contributor with read-mostly access to their own contributions.

#### Authentication
- Register, login, logout, change password, update profile

#### Donation Requests
- Create donation pledge request (monetary or physical)
- View own requests and their status
- Cancel own pending requests

#### Donations
- View own donations, history, status

#### Projects
- View funded projects, summaries, beneficiary counts, distribution stats

#### Reports
- View own donation utilization, impact, and financial summary

---

### 2.7 Family Member / Beneficiary — Prefix: `MBR`

**Role:** Beneficiary with a limited self-service portal.

#### Authentication
- Register, login, logout, change password, update profile photo

#### Family
- View: own family info, assessment status, family members

#### Requests
- Submit: information correction request, phone update request, address update request, reassessment request
- View own requests and their status
- Cancel own pending requests

#### Aid
- View: project eligibility, aid history, distribution records, upcoming distributions

#### Notifications
- View: verification results, distribution appointments, approval/rejection messages, request status changes

---

### 2.8 Permission Summary Matrix

| Action | ADM | MGR | RES | INV | FIN | DNR | MBR |
|---|---|---|---|---|---|---|---|
| Login | Y | Y | Y | Y | Y | Y | Y |
| Create Users | Y | N | N | N | N | N | N |
| Create Families | Y | Y | Y | N | N | N | N |
| Verify Families | Y | Y | N | N | N | N | N |
| Create Assessment | Y | Y | Y | N | N | N | N |
| Create Project | Y | Y | N | N | N | N | N |
| Generate Beneficiaries | Y | Y | N | N | N | N | N |
| Distribute Aid | Y | Y | N | N | N | N | N |
| Create Items | Y | N | N | Y | N | N | N |
| Manage Inventory | Y | N | N | Y | N | N | N |
| Create Donors | Y | N | N | Y | Y | N | N |
| Review Donation Requests | Y | N | N | N | Y | N | N |
| Register Monetary Donations | Y | N | N | N | Y | N | N |
| Register Physical Donations | Y | N | N | Y | N | N | N |
| Record Expenses | Y | N | N | N | Y | N | N |
| Review Family Requests | Y | Y | N | N | N | N | N |
| Submit Donation Pledge | N | N | N | N | N | Y | N |
| Submit Family Correction | N | N | N | N | N | N | Y |
| View Own Aid History | N | N | N | N | N | N | Y |
| View Audit Logs | All | Branch | N | Inventory | Finance | N | N |

---

## 3. Database Design

### 3.1 Overview

The system uses a relational database organized into **26 tables across eight business domains**. The design supports auditable beneficiary, aid-distribution, inventory, donation, and financial workflows.

| Domain | Tables | Count |
|---|---|---:|
| Identity & access | `branches`, `users`, `audit_logs` | 3 |
| Beneficiary management | `addresses`, `families`, `family_members`, `family_assessments`, `family_requests` | 5 |
| Projects & distribution | `projects`, `project_parcels`, `distributions` | 3 |
| Inventory | `categories`, `items`, `inventories`, `inventory_items` | 4 |
| Parcel management | `parcel_templates`, `parcel_items` | 2 |
| Donor management | `donors`, `donation_requests`, `donations` | 3 |
| Financial management | `financial_accounts`, `expense_categories`, `financial_transactions` | 3 |
| Inventory movement | `inventory_transactions`, `inventory_transaction_items`, `inventory_transaction_parcels` | 3 |

The main relationships connect branches and users to operational records; families to members, assessments, requests, and distributions; projects to parcels, distributions, donations, and transactions; and donors to donation requests and received donations. Join tables represent many-to-many relationships such as items stocked in inventories and items included in parcel templates.

Donation records capture contribution provenance and status. Monetary amounts are recorded in `financial_transactions`, while item and parcel quantities are recorded in `inventory_transactions` and their detail tables. This keeps financial and physical settlement history separate and auditable.

The detailed table definitions, enums, constraints, consistency rules, and recommended indexes are in [database/database-design.md](database/database-design.md). The relationship diagram is in [database/erd.md](database/erd.md), and database naming guidance is in [database/naming-conventions.md](database/naming-conventions.md).

---

## 4. Functional Requirements

Functional requirements are numbered `FRnn-xxx` where `nn` is the module and `xxx` is the sub-requirement.

### 4.1 Module 01 — Identity & Access

- **FR01-001** The system shall authenticate users via email and password.
- **FR01-002** The system shall issue a session token upon successful login and invalidate it on logout.
- **FR01-003** The system shall allow any authenticated user to change their own password.
- **FR01-004** The system shall allow Admin (ADM) to create users of any role.
- **FR01-005** The system shall allow Admin to update user role, branch, status, and personal data.
- **FR01-006** The system shall allow Admin to reset any user's password.
- **FR01-007** The system shall allow Admin to deactivate users (soft delete); physical deletes are forbidden.
- **FR01-008** The system shall allow Admin to create, view, update, and deactivate branches.
- **FR01-009** The system shall enforce public ID generation per entity prefix (e.g., `ADM-0001`, `FAM-000001`).
- **FR01-010** The system shall record every create/update/delete/login/logout/verify/reject/distribute/approve/cancel action in `audit_logs` with before/after JSONB snapshots.
- **FR01-011** The system shall allow Admin to view the entire audit log.
- **FR01-012** The system shall allow Branch Manager to view branch-scoped audit logs.
- **FR01-013** The system shall allow Inventory Manager to view inventory-related audit logs.
- **FR01-014** The system shall allow Finance Manager to view finance-related audit logs.

### 4.2 Module 02 — Beneficiary Management

- **FR02-001** The system shall allow MGR and RES to create a family record with an original address and current address.
- **FR02-002** The system shall allow MGR and RES to add family members with unique national IDs.
- **FR02-003** The system shall enforce one head-of-family flag per family.
- **FR02-004** The system shall allow RES to create one family assessment per family.
- **FR02-005** The system shall allow RES to update an assessment only while the family is `PENDING`.
- **FR02-006** The system shall allow MGR and ADM to verify or reject a family.
- **FR02-007** The system shall record verifier identity and timestamp on verification.
- **FR02-008** The system shall allow MGR to request reassessment, which re-opens the assessment for RES editing.
- **FR02-009** The system shall allow MBR (beneficiary) to view their own family, members, and assessment status.
- **FR02-010** The system shall allow MBR to submit a *family request* (`family_requests`) containing `before_data`, `after_data`, and `justification`.
- **FR02-011** The system shall support family request types: information correction, phone update, address update, and reassessment.
- **FR02-012** The system shall allow MBR to cancel their own family request while it is `PENDING`.
- **FR02-013** The system shall allow MGR (branch scope) and ADM (global) to review family requests and transition them to `APPROVED` or `REJECTED`.
- **FR02-014** The system shall require `reviewed_by` and `reviewed_at` to be set when a family request status is `APPROVED` or `REJECTED`.
- **FR02-015** The system shall require `rejection_reason` when a family request is `REJECTED`.
- **FR02-016** The system shall apply the approved `after_data` to the family record on approval, and record the change in `audit_logs`.
- **FR02-017** The system shall prevent RES from verifying, rejecting, or distributing.

### 4.3 Module 03 — Project & Distribution

- **FR03-001** The system shall allow ADM and MGR to create projects in `DRAFT` status.
- **FR03-002** The system shall allow ADM and MGR to activate projects (→ `ACTIVE`), close them (→ `COMPLETED`), or cancel them.
- **FR03-003** The system shall only allow deletion of projects in `DRAFT` status.
- **FR03-004** The system shall allow attaching parcel templates to a project with initial and available quantities.
- **FR03-005** The system shall allow MGR to generate a beneficiary list by applying filters on family attributes and assessment data.
- **FR03-006** The system shall allow MGR to remove any family from the generated list and regenerate.
- **FR03-007** The system shall allow MGR and ADM to record a distribution (family, branch, project, parcel, user, timestamp).
- **FR03-008** The system shall decrement `project_parcels.available_quantity` on every distribution.
- **FR03-009** The system shall allow MGR to update distribution notes only.
- **FR03-010** The system shall prevent deletion of completed distributions.
- **FR03-011** The system shall record each distribution in `audit_logs` with action `DISTRIBUTE`.
- **FR03-012** The system shall show DNR (donor) aggregated beneficiary counts and distribution statistics for their funded projects.

### 4.4 Module 04 — Inventory

- **FR04-001** The system shall allow INV to create and update categories.
- **FR04-002** The system shall prevent deletion of categories that have items.
- **FR04-003** The system shall allow INV to create and update items (name, unit, category, description).
- **FR04-004** The system shall allow INV to create inventories of type `CENTRAL` or `BRANCH`.
- **FR04-005** The system shall allow INV to update inventory metadata (name, location).
- **FR04-006** The system shall maintain `inventory_items.quantity` as the on-hand stock per item per warehouse.
- **FR04-007** The system shall prevent negative stock quantities at the database level.
- **FR04-008** The system shall produce low-stock reports to INV.

### 4.5 Module 05 — Parcel Management

- **FR05-001** The system shall allow INV to create parcel templates.
- **FR05-002** The system shall allow INV to add items with positive quantities to a parcel template.
- **FR05-003** The system shall prevent editing a parcel template that is already used in an active project.
- **FR05-004** The system shall allow the same parcel template to be reused in multiple projects.

### 4.6 Module 06 — Donor Management & Donations

**Donation Requests**

- **FR06-001** The system shall allow DNR (donor) to submit a donation request with `donation_type` (`MONETARY`, `ITEM`, or `PARCEL`), optional `project_id`, and a free-text `note`.
- **FR06-002** The system shall create the request in `PENDING` status.
- **FR06-003** The system shall allow DNR to cancel their own `PENDING` request (→ `CANCELLED`).
- **FR06-004** The system shall allow FIN to review monetary donation requests and ADM to review any request.
- **FR06-005** The system shall allow the reviewer to transition the request to `APPROVED` or `REJECTED`, requiring `reviewed_by` and `reviewed_at`.
- **FR06-006** The system shall require `rejection_reason` when a donation request is `REJECTED`.
- **FR06-007** The system shall prevent DNR from seeing other donors' requests.

**Donations**

- **FR06-008** The system shall allow FIN and INV to create donors and update their information.
- **FR06-009** The system shall allow an approved donation request to be fulfilled by creating a `donation` row with `donation_request_id` linking back to the request.
- **FR06-010** The system shall allow a donation to be created without a prior request (walk-in donation), still recording `received_at` and `donation_type`.
- **FR06-011** The system shall store the donation's `project_id` when the donation is purpose-bound; `NULL` means it is a general donation to be allocated later.
- **FR06-012** The system shall NOT store `amount`, `currency`, or quantity on the donation row.
- **FR06-013** The system shall enforce one-to-one `donation → financial_transaction` for `MONETARY` donations via a partial unique index on `financial_transactions(donation_id)`.
- **FR06-014** The system shall allow one-to-many `donation → inventory_transactions` for `ITEM` and `PARCEL` donations.
- **FR06-015** The system shall enforce the following consistency rules:
  - `MONETARY` donation: exactly one `financial_transactions` row (with `donation_id`), zero `inventory_transactions` rows.
  - `ITEM` / `PARCEL` donation: at least one `inventory_transactions` row (with `donation_id`), zero `financial_transactions` rows.
- **FR06-016** The system shall allow `ITEM` and `PARCEL` donation lines to be split across multiple warehouses via multiple `inventory_transactions`, each referencing a different destination inventory.
- **FR06-017** The system shall allow DNR to view only their own donations.
- **FR06-018** The system shall prevent DNR from seeing other donors, family data, financial accounts, or inventory.
- **FR06-019** The system shall link donations to projects when specified.
- **FR06-020** The system shall track donation status transitions: `PENDING → RECEIVED`, `PENDING → CANCELLED`, `PENDING → REJECTED`.
- **FR06-021** The system shall set the donation status to `RECEIVED` when the linked financial or inventory transaction is recorded.

### 4.7 Module 07 — Financial Management

- **FR07-001** The system shall allow FIN to create financial accounts with a currency.
- **FR07-002** The system shall allow FIN to create expense categories.
- **FR07-003** The system shall allow FIN to record financial transactions of type `DONATION`, `ACCOUNT_TRANSFER`, `PROJECT_ALLOCATION`, or `EXPENSE`.
- **FR07-004** The system shall store each financial transaction with polymorphic `(source_type, source_id)` and `(destination_type, destination_id)`.
- **FR07-005** The system shall allow a monetary donation to be settled by creating exactly one financial transaction with `donation_id` set, source type `DONOR`, destination type `ACCOUNT`.
- **FR07-006** The system shall compute account balances as the sum of inflows minus outflows per account.
- **FR07-007** The system shall prevent deletion of completed financial transactions.
- **FR07-008** The system shall allow FIN to view project funding and allocations but not create or activate projects.
- **FR07-009** The system shall produce financial, donation, expense, and account reports for FIN.

### 4.8 Module 08 — Inventory Movement

- **FR08-001** The system shall record every inventory movement as a row in `inventory_transactions` with source and destination.
- **FR08-002** The system shall support transaction types `DONATION`, `TRANSFER`, `PROJECT_ALLOCATION`, `DISTRIBUTION`, and `ADJUSTMENT`.
- **FR08-003** The system shall record line items in `inventory_transaction_items` and/or `inventory_transaction_parcels`.
- **FR08-004** The system shall update the affected inventories' stock as a consequence of each inventory transaction, maintaining consistency.
- **FR08-005** The system shall allow INV to update only notes on pending transactions before approval.
- **FR08-006** The system shall lock completed transactions from edits.
- **FR08-007** The system shall allow MGR to request a transfer; only INV may execute it.
- **FR08-008** The system shall allow ADM and INV to view all inventory transactions.
- **FR08-009** The system shall allow a `DONATION`-type inventory transaction to set `donation_id` linking back to the donation row.
- **FR08-010** The system shall allow one donation to be fulfilled by multiple inventory transactions, each into a different destination inventory.
- **FR08-011** The system shall increment `inventory_items.quantity` when an inventory transaction moves goods into an inventory.

### 4.9 Module 09 — Cross-Cutting / Non-Functional

- **FR09-001** The system shall enforce role-based access control on every endpoint.
- **FR09-002** The system shall scope Branch Manager and Field Researcher queries to their own branch.
- **FR09-003** The system shall log all authentication events (login, logout) in `audit_logs`.
- **FR09-004** The system shall hash passwords using a modern adaptive hash (e.g., bcrypt/argon2id).
- **FR09-005** The system shall reject invalid enum values at the database level.
- **FR09-006** The system shall paginate all listing endpoints with a default page size of 25.
- **FR09-007** The system shall provide soft-delete (deactivation) for users, families, donors, and projects, never physical delete for auditable entities.
- **FR09-008** The system shall support Arabic and English labels for all UI strings (RTL layout for Arabic).
- **FR09-009** The system shall back up the database daily and retain backups for 30 days.
- **FR09-010** The system shall record IP address in audit logs when available.
- **FR09-011** The system shall generate UUID public IDs for `donation_requests` and `family_requests` via `uuid_generate_v4()`.
- **FR09-012** The system shall expose a unified request timeline to DNR and MBR showing all their submitted requests and their current status.

---

## 5. User Stories

User stories are numbered `USnn-xxx` with the pattern: *As a [role], I want to [action] so that [benefit].*

### 5.1 Identity & Access

- **US01-001** As an Admin, I want to create users of any role so that the NGO can onboard staff.
- **US01-002** As an Admin, I want to reset a user's password so that staff can regain access after a lockout.
- **US01-003** As an Admin, I want to deactivate a user so that departed staff lose access immediately without deleting history.
- **US01-004** As an Admin, I want to view the full audit log so that I can investigate any suspicious activity.
- **US01-005** As a Branch Manager, I want to view only my branch's audit log so that I can monitor my team without seeing other branches.
- **US01-006** As any user, I want to change my own password so that my account remains secure.

### 5.2 Beneficiary Management

- **US02-001** As a Field Researcher, I want to register a family and its members so that they can be considered for aid.
- **US02-002** As a Field Researcher, I want to record the family assessment so that eligibility can be evaluated fairly.
- **US02-003** As a Field Researcher, I want to submit the family for verification so that a manager can approve it.
- **US02-004** As a Branch Manager, I want to verify or reject a family so that only eligible families enter aid pipelines.
- **US02-005** As a Branch Manager, I want to request reassessment so that families whose situation changed are re-evaluated.
- **US02-006** As a Family Member (Beneficiary), I want to view my family's status and aid history so that I know where I stand.
- **US02-007** As a Family Member, I want to submit a correction request containing the before/after values and my justification so that the NGO can review it without me editing verified data directly.
- **US02-008** As a Family Member, I want to cancel my own pending request so that I can withdraw a mistake.
- **US02-009** As a Branch Manager, I want to review correction requests from my branch's families and approve or reject them with a reason so that the family record stays accurate and auditable.
- **US02-010** As an Admin, I want approved family requests to automatically apply the proposed changes to the family record and log the change so that the process is consistent and traceable.

### 5.3 Project & Distribution

- **US03-001** As a Branch Manager, I want to create a project so that I can plan an aid cycle.
- **US03-002** As a Branch Manager, I want to generate a beneficiary list from filters so that the most needy families are selected fairly.
- **US03-003** As a Branch Manager, I want to remove a family from the generated list so that duplicates or ineligible families are excluded.
- **US03-004** As a Branch Manager, I want to record a distribution so that the family's receipt of aid is documented.
- **US03-005** As a Branch Manager, I want to see distribution history so that I can report on project progress.
- **US03-006** As a Donor, I want to see how many families received aid from my funded project so that I trust the NGO's use of my donation.

### 5.4 Inventory

- **US04-001** As an Inventory Manager, I want to create items and categories so that stock is organized consistently.
- **US04-002** As an Inventory Manager, I want to create a branch warehouse so that each branch can hold its own stock.
- **US04-003** As an Inventory Manager, I want a low-stock report so that I can replenish warehouses before stockouts.
- **US04-004** As a Branch Manager, I want to view branch stock so that I know what can be distributed locally.

### 5.5 Parcel Management

- **US05-001** As an Inventory Manager, I want to define a parcel template so that I can reuse the same bundle in many projects.
- **US05-002** As an Inventory Manager, I want to update a parcel's contents before it is used in an active project so that mistakes can be corrected.

### 5.6 Donor Management & Donations

- **US06-001** As a Donor, I want to submit a donation request specifying its type and optional project so that the NGO can evaluate and approve it before I transfer anything.
- **US06-002** As a Donor, I want to cancel my own pending request so that I can withdraw a mistake.
- **US06-003** As a Finance Manager, I want to review and approve or reject monetary donation requests with a reason so that the NGO has an auditable decision record.
- **US06-004** As a Finance Manager, I want to record the received monetary donation as a financial transaction linked to the donation so that the ledger and the donation reference stay in sync.
- **US06-005** As an Inventory Manager, I want to register a physical item or parcel donation as one or more inventory transactions linked to the donation so that goods are tracked into the correct warehouses.
- **US06-006** As an Inventory Manager, I want to split a single physical donation across multiple warehouses so that the destination of each portion is recorded separately.
- **US06-007** As a Donor, I want to see only my own donations and requests so that my privacy is protected.
- **US06-008** As an Admin, I want the system to reject a monetary donation that has an inventory transaction attached so that the data model stays consistent.

### 5.7 Financial Management

- **US07-001** As a Finance Manager, I want to create financial accounts so that funds are separated (bank, cash, emergency).
- **US07-002** As a Finance Manager, I want to record an expense so that the organization's spending is documented and categorized.
- **US07-003** As a Finance Manager, I want to transfer funds between accounts so that I can move money where it's needed.
- **US07-004** As a Finance Manager, I want to see account balances so that I know how much is available.
- **US07-005** As an Admin, I want to view all financial transactions so that I can audit the books.
- **US07-006** As a Finance Manager, I want the database to prevent me from recording two financial transactions against the same donation so that double-counting is impossible.

### 5.8 Inventory Movement

- **US08-001** As an Inventory Manager, I want to transfer stock from central to a branch warehouse so that branches have aid to distribute.
- **US08-002** As an Inventory Manager, I want to allocate inventory to a project so that project distributions are backed by reserved stock.
- **US08-003** As a Branch Manager, I want to request an inventory transfer so that my branch is replenished.
- **US08-004** As an Inventory Manager, I want completed transactions to be locked so that historical records cannot be altered.
- **US08-005** As an Inventory Manager, I want every donation-driven movement to carry the `donation_id` so that I can trace stock back to its source.

### 5.9 Cross-Cutting

- **US09-001** As any user, I want to log in with email and password so that I can access only the functions my role permits.
- **US09-002** As an Admin, I want every sensitive change to be logged with before/after values so that auditors can reconstruct any decision.
- **US09-003** As an NGO auditor, I want the system to prevent physical deletes on auditable entities so that history is never lost.
- **US09-004** As a Donor or Beneficiary, I want a single timeline of my submitted requests and their statuses so that I always know what is pending.

---

## 6. Appendix

### 6.1 Assumptions

- Each family has exactly one head-of-family.
- A family assessment is created once and updated in place unless reassessment is requested.
- The NGO operates one central warehouse and one warehouse per branch.
- Multiple currencies are possible; the system stores a `currency` column on all monetary entities (financial accounts, financial transactions, `donation_money`).
- Public IDs are generated by the application, never entered manually, except `donation_requests` and `family_requests` which use UUIDs.
- A donation may be created either from an approved `donation_request` or as a walk-in donation recorded directly by FIN or INV.
- Every donation produces exactly one settlement path: either a `financial_transaction` (monetary) or one or more `inventory_transactions` (physical). It can never produce both.

### 6.2 Out of Scope (v1)

- Mobile offline mode for field researchers.
- SMS notifications.
- Biometric identification of beneficiaries.
- Multi-tenant operation for multiple NGOs.
- Public API for third-party integrations.
- Automatic FX conversion between currencies.

### 6.3 Design Rationale — Why Donations Are Settled Elsewhere

The donation record is the **single source of truth for *intent* and *provenance*** — who donated, for what purpose, and whether the NGO has received it. It intentionally does **not** store money amounts or item quantities because those belong to the settlement events:

| Business Event | Stored In | Why |
|---|---|---|
| Donor pledges a donation | `donation_requests` | Pre-receipt intent, may be rejected |
| Donation is received (metadata) | `donations` | Links donor, project, type, status |
| Money is received | `financial_transactions` (with `donation_id`) | Money movement belongs to the ledger |
| Items/parcels are received | `inventory_transactions` (with `donation_id`) | Physical stock movement belongs to inventory history |

This separation avoids the common anti-pattern of storing `amount` and `quantity` in three places, prevents drift between tables, and mirrors how real ERP systems model **header (intent) vs. lines (settlement)**.

### 6.4 Glossary

| Term | Definition |
|---|---|
| Family | A household registered as a beneficiary unit. |
| Assessment | Structured survey capturing family socioeconomic and housing conditions. |
| Family Request | A proposed change to a family's record submitted by a beneficiary and reviewed by staff. |
| Parcel | A predefined bundle of items (e.g., Winter Parcel = 2 blankets + 1 heater). |
| Distribution | A recorded event where a family receives a parcel from a project. |
| Donation Request | A donor's pledge that requires NGO review before receipt. |
| Donation | The received contribution (monetary or physical), linked to donor and optionally project. |
| Financial Transaction | An atomic movement of money between a source and destination; sole holder of monetary amounts. |
| Inventory Transaction | An atomic movement of items/parcels between a source and destination; sole holder of physical quantities. |
| Settlement | The act of creating the financial or inventory transaction that fulfills a donation. |

---

*End of SRS v2.0*