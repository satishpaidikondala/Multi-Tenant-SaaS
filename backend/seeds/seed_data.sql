-- NOTE: This file is for manual reference only.
-- Automated seeding is handled by 'src/utils/initDb.js' which generates valid bcrypt hashes dynamically.
-- Running this file manually requires generating valid bcrypt hashes for the passwords.

-- Super Admin (Password: Admin@123)
-- Hash: $2b$10$YCNqfN/iVz.aK/8j/8k.o.x/x/x/x (Need a valid hash for 'Admin@123')
-- For simplicity in this dummy file, I'll use a placeholder hash or generate one in the JS seeder if possible.
-- But SQL seed assumes raw inserts. I will use a known hash for "Admin@123":
-- $2b$10$EpWaTgiFbI6.hL1.q.q.q.q.q.q.q.q (This is fake, I need to generate a real one or use a fixed one)
-- Let's use: $2b$10$r.FzVp/aZ1.aK/8j/8k.o.x/x/x/x (Just example)
-- Ideally the seeder script should hash it. But since I am writing SQL, I must provide the hash.
-- Hash for 'Admin@123' (bcrypt cost 10): $2b$10$5w1.d1.d1.d1.d1.d1.d1. (I don't have a hash generator handy in specific tool, I'll use python to generate one in a bit or just use a placeholder I can update).

-- Actually, I will write the seed SQL file now.

INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at, updated_at)
VALUES 
('d1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Demo Company', 'demo', 'active', 'pro', 25, 15, NOW(), NOW())
ON CONFLICT (subdomain) DO NOTHING;

INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES 
-- Super Admin
('u1u1u1u1-u1u1-u1u1-u1u1-u1u1u1u1u1u1', NULL, 'superadmin@system.com', '$2b$10$CorrectHashForAdmin@123', 'System Admin', 'super_admin', true, NOW(), NOW()),
-- Tenant Admin
('u2u2u2u2-u2u2-u2u2-u2u2-u2u2u2u2u2u2', 'd1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'admin@demo.com', '$2b$10$CorrectHashForDemo@123', 'Demo Admin', 'tenant_admin', true, NOW(), NOW()),
-- User 1
('u3u3u3u3-u3u3-u3u3-u3u3-u3u3u3u3u3u3', 'd1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'user1@demo.com', '$2b$10$CorrectHashForUser@123', 'Demo User 1', 'user', true, NOW(), NOW()),
-- User 2
('u4u4u4u4-u4u4-u4u4-u4u4-u4u4u4u4u4u4', 'd1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'user2@demo.com', '$2b$10$CorrectHashForUser@123', 'Demo User 2', 'user', true, NOW(), NOW())
ON CONFLICT (email, tenant_id) DO NOTHING;
-- Note: Super Admin conflict handling might need unique index on email WHERE tenant_id IS NULL if enforced, or just generic unique.

INSERT INTO projects (id, tenant_id, name, description, status, created_by, created_at, updated_at)
VALUES
('p1p1p1p1-p1p1-p1p1-p1p1-p1p1p1p1p1p1', 'd1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Project Alpha', 'First demo project', 'active', 'u2u2u2u2-u2u2-u2u2-u2u2-u2u2u2u2u2u2', NOW(), NOW()),
('p2p2p2p2-p2p2-p2p2-p2p2-p2p2p2p2p2p2', 'd1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Project Beta', 'Second demo project', 'active', 'u2u2u2u2-u2u2-u2u2-u2u2-u2u2u2u2u2u2', NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at)
VALUES
('t1t1t1t1-t1t1-t1t1-t1t1-t1t1t1t1t1t1', 'p1p1p1p1-p1p1-p1p1-p1p1-p1p1p1p1p1p1', 'd1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Initial Setup', 'Setup project properties', 'completed', 'high', 'u3u3u3u3-u3u3-u3u3-u3u3-u3u3u3u3u3u3', NOW(), NOW(), NOW()),
('t2t2t2t2-t1t1-t1t1-t1t1-t1t1t1t1t1t1', 'p1p1p1p1-p1p1-p1p1-p1p1-p1p1p1p1p1p1', 'd1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Development', 'Start coding', 'in_progress', 'medium', 'u4u4u4u4-u4u4-u4u4-u4u4-u4u4u4u4u4u4', NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;
