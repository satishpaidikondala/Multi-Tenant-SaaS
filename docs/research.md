# Research Document: Multi-Tenancy Patterns

## Multi-Tenancy Analysis

This project utilizes the **Shared Database, Shared Schema** approach. This was chosen for its cost-effectiveness and ease of maintenance. Data isolation is strictly enforced via a mandatory `tenant_id` column on every table.

## Technology Stack Justification

- **Node.js/Express:** Chosen for high performance and vast middleware ecosystem for JWT handling.
- **PostgreSQL:** Provides robust relational integrity and powerful indexing for `tenant_id` lookups.
- **React:** Enables a responsive, role-based UI.

## Security Considerations

Isolation is handled at the database query level. No client-provided IDs are trusted; the `tenant_id` is always extracted from the cryptographically signed JWT.
