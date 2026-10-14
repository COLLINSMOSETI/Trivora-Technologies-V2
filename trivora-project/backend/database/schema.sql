CREATE TABLE IF NOT EXISTS admins (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40),
  service VARCHAR(100) NOT NULL,
  budget VARCHAR(80),
  message TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','in_progress','contacted','completed','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);

CREATE OR REPLACE FUNCTION set_inquiry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inquiries_set_updated_at ON inquiries;
CREATE TRIGGER inquiries_set_updated_at
BEFORE UPDATE ON inquiries
FOR EACH ROW
EXECUTE FUNCTION set_inquiry_updated_at();

CREATE TABLE IF NOT EXISTS services (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(140) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  starting_price_ksh INTEGER CHECK (starting_price_ksh IS NULL OR starting_price_ksh >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO services (name, slug, description, starting_price_ksh) VALUES
  ('Website Development','website-development','Responsive business, corporate, e-commerce and portfolio websites.',30000),
  ('System Integration','system-integration','Connect business tools, platforms, APIs and workflows.',NULL),
  ('Web & Mobile Apps','web-mobile-apps','Purpose-built web applications, mobile app projects and dashboards.',NULL),
  ('Maintenance & Support','maintenance-support','Updates, troubleshooting, performance improvements and ongoing care.',NULL)
ON CONFLICT (slug) DO NOTHING;
