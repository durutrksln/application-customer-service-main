CREATE TABLE IF NOT EXISTS evacuation_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    user_type VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    tckn VARCHAR(11) NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    evacuation_reason TEXT NOT NULL,
    evacuation_date DATE NOT NULL,
    tesisat_numarasi VARCHAR(50),
    dask_police_numarasi VARCHAR(50),
    zorunlu_deprem_sigortasi VARCHAR(50),
    iban VARCHAR(50),
    landlord_type VARCHAR(50),
    mulk_sahibi_ad_soyad VARCHAR(255),
    vergi_numarasi VARCHAR(50),
    tuzel_kisi_ad VARCHAR(255),
    tuzel_kisi_soyad VARCHAR(255),
    unvan VARCHAR(255),
    nufus_cuzdani_data BYTEA NOT NULL,
    mulkiyet_belgesi_data BYTEA NOT NULL,
    requires_license BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_evacuation_applications_user_id ON evacuation_applications(user_id);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_evacuation_applications_status ON evacuation_applications(status); 