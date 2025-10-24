-- Add new columns to agents table for template information
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS workers_goals TEXT,
ADD COLUMN IF NOT EXISTS integrations TEXT,
ADD COLUMN IF NOT EXISTS qualification_criteria TEXT,
ADD COLUMN IF NOT EXISTS pain TEXT,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;

-- Create index for fast template queries
CREATE INDEX IF NOT EXISTS idx_agents_is_template ON agents(is_template) WHERE is_template = true;

-- Add comment explaining the new columns
COMMENT ON COLUMN agents.workers_goals IS 'Detailed description of AI worker goals and responsibilities';
COMMENT ON COLUMN agents.integrations IS 'Required integrations (CRM, ERP, etc.)';
COMMENT ON COLUMN agents.qualification_criteria IS 'Criteria for qualifying leads/customers';
COMMENT ON COLUMN agents.pain IS 'Customer pain points this template addresses';
COMMENT ON COLUMN agents.is_template IS 'Whether this agent is a reusable template';