CREATE TABLE IF NOT EXISTS evacuation_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    user_type VARCHAR(50) NOT NULL,
    nufus_cuzdani_path VARCHAR(255) NULL,
    mulkiyet_belgesi_path VARCHAR(255) NULL,
    tesisat_numarasi VARCHAR(100) NULL,
    dask_police_numarasi VARCHAR(100) NULL,
    zorunlu_deprem_sigortasi VARCHAR(100) NULL,
    iban VARCHAR(34) NULL,

    -- Fields for tenants (if user_type is 'kiraci')
    landlord_type VARCHAR(50) NULL,
    mulk_sahibi_ad_soyad VARCHAR(255) NULL,
    vergi_numarasi VARCHAR(50) NULL,
    tuzel_kisi_ad VARCHAR(100) NULL,
    tuzel_kisi_soyad VARCHAR(100) NULL,
    unvan VARCHAR(255) NULL,

    -- Application status and timestamps
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 