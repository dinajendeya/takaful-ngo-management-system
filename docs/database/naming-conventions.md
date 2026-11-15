# Database Naming Conventions

These conventions describe the naming patterns used by the database design.

## Tables and columns

- Use lowercase `snake_case` for table and column names.
- Use plural nouns for table names (for example, `families`, `donations`, and `inventory_transactions`).
- Use descriptive names for columns; use `id` for a table's primary key.
- Name foreign-key columns after the referenced entity with an `_id` suffix (for example, `family_id` and `created_by`).
- Name boolean columns with an `is_`, `has_`, or similarly clear state prefix where appropriate.
- Use `created_at` for record creation timestamps and descriptive event timestamps such as `received_at` or `distributed_at` for lifecycle events.

## Keys and relationships

- Use the internal numeric `id` as the primary key for entity tables.
- Use a separate `public_id` for identifiers exposed outside the database; its prefix and zero-padded number are documented in the SRS.
- Use a composite primary key for associative tables whose identity is the combination of their parent records (for example, `inventory_items` and `parcel_items`).
- Use foreign keys to express ownership and relationships; name each foreign-key column for the referenced entity or role.

## Enums and public identifiers

- Use uppercase `SNAKE_CASE` values for enumerations (for example, `BRANCH_MANAGER` and `ACCOUNT_TRANSFER`).
- Format public identifiers as an uppercase entity prefix, a hyphen, and a zero-padded sequence (for example, `FAM-000001`).
- Keep prefixes unique and consistent for each entity; see the public ID prefix table in [database-design.md](database-design.md#35-public-id-prefixes).
