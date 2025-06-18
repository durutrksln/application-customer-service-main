CREATE TABLE IF NOT EXISTS connection_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    full_name VARCHAR(255) NOT NULL,
    tckn VARCHAR(11) NOT NULL,
    deed_file_data BYTEA NOT NULL,
    electrical_project_data BYTEA NOT NULL,
    building_permit_data BYTEA NOT NULL,
    requires_license BOOLEAN NOT NULL DEFAULT false,
    permit_document_data BYTEA,
    law_6292_data BYTEA,
    law_3194_data BYTEA,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_connection_applications_user_id ON connection_applications(user_id);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_connection_applications_status ON connection_applications(status); 