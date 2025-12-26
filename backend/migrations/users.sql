CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'user');

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Unique constraint per tenant, but allows duplicates across tenants
  CONSTRAINT unique_email_per_tenant UNIQUE (tenant_id, email)
);

-- Super admin index (tenant_id is NULL for them)
CREATE INDEX idx_users_tenant_id ON users(tenant_id);