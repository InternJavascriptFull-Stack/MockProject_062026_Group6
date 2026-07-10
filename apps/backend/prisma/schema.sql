/* =====================================================================================
   NURSING HOME / ASSISTED LIVING MANAGEMENT SYSTEM — SCHEMA
   Dialect: Microsoft SQL Server (T-SQL)
   Ghi chú: Cấu trúc bảng và các ràng buộc (1-N, N-N, 1-1) được thiết kế bám sát 
   100% theo 57 Rules và Table Models (Hình ảnh).
===================================================================================== */

CREATE DATABASE NursingHomeManagement;
GO
USE NursingHomeManagement;
GO

-- =====================================================================================
-- PART 0: GLOBAL LOOKUP / RBAC (Role-Based Access Control)
-- =====================================================================================

CREATE TABLE roles (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    role_name       NVARCHAR(100) NOT NULL UNIQUE,
    description     NVARCHAR(500) NULL,
    is_deleted      BIT NOT NULL DEFAULT 0,
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE permissions (
    id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    action_code      NVARCHAR(100) NOT NULL UNIQUE,
    is_phi_sensitive BIT NOT NULL DEFAULT 0,
    created_at       DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE role_permissions (
    role_id         BIGINT NOT NULL REFERENCES roles(id),
    permission_id   BIGINT NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

-- =====================================================================================
-- PART 1: ADDRESS 
-- =====================================================================================

CREATE TABLE addresses (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    street_line1    NVARCHAR(200) NOT NULL,
    street_line2    NVARCHAR(200) NULL,
    city            NVARCHAR(100) NOT NULL,
    state           CHAR(2) NOT NULL CHECK (state = UPPER(state)),   
    zip_code        VARCHAR(10) NOT NULL CHECK (zip_code LIKE '[0-9][0-9][0-9][0-9][0-9]' OR zip_code LIKE '[0-9][0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]'),
    address_type    VARCHAR(20) NOT NULL DEFAULT 'HOME' CHECK (address_type IN ('HOME','MAILING','FACILITY','BILLING')),
    is_deleted      BIT NOT NULL DEFAULT 0,
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

-- =====================================================================================
-- PART 2: SECURITY & USER MANAGEMENT
-- =====================================================================================

CREATE TABLE users (
    id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    role_id             BIGINT NOT NULL REFERENCES roles(id),
    employee_code       NVARCHAR(50) NOT NULL UNIQUE,
    email               NVARCHAR(255) NOT NULL UNIQUE,
    password_hash       NVARCHAR(300) NOT NULL,
    first_name          NVARCHAR(100) NOT NULL,
    middle_name         NVARCHAR(100) NULL,
    last_name           NVARCHAR(100) NOT NULL,
    license_number      NVARCHAR(100) NULL,          
    phone_number        NVARCHAR(20) NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','LOCKED')),
    mfa_enabled         BIT NOT NULL DEFAULT 0,       
    last_login_at       DATETIMEOFFSET(0) NULL,
    is_deleted          BIT NOT NULL DEFAULT 0,
    deleted_at          DATETIMEOFFSET(0) NULL,
    created_at          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(status) WHERE is_deleted = 0;

-- =====================================================================================
-- PART 3: FACILITY & PHYSICAL STRUCTURE
-- =====================================================================================

CREATE TABLE facilities (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    address_id      BIGINT NULL REFERENCES addresses(id),
    facility_code   NVARCHAR(50) NOT NULL UNIQUE,
    name            NVARCHAR(200) NOT NULL,
    license_number  NVARCHAR(100) NOT NULL,           
    target_state    CHAR(2) NOT NULL,
    phone_number    NVARCHAR(20) NULL,
    is_deleted      BIT NOT NULL DEFAULT 0,
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE rooms (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    facility_id     UNIQUEIDENTIFIER NOT NULL REFERENCES facilities(id),
    room_number     NVARCHAR(20) NOT NULL,
    room_type       NVARCHAR(50) NOT NULL,
    is_deleted      BIT NOT NULL DEFAULT 0,
    CONSTRAINT uq_room_per_facility UNIQUE (facility_id, room_number)
);
CREATE INDEX idx_rooms_facility_id ON rooms(facility_id);

CREATE TABLE beds (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    room_id         UNIQUEIDENTIFIER NOT NULL REFERENCES rooms(id),
    bed_number      NVARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','OCCUPIED','MAINTENANCE')),
    CONSTRAINT uq_bed_per_room UNIQUE (room_id, bed_number)
);
CREATE INDEX idx_beds_room_id ON beds(room_id);
CREATE INDEX idx_beds_status ON beds(status);

CREATE TABLE staffing_configs (
    id                          BIGINT IDENTITY(1,1) PRIMARY KEY,
    facility_id                 UNIQUEIDENTIFIER NOT NULL REFERENCES facilities(id),
    min_hrs_per_resident_day    DECIMAL(5,2) NOT NULL,
    warn_below_percentage       INT NOT NULL,
    created_at                  DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_staffing_configs_facility_id ON staffing_configs(facility_id);

-- =====================================================================================
-- PART 4: CARE LEVEL & RATES
-- =====================================================================================

CREATE TABLE care_levels (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    level_code      VARCHAR(30) NOT NULL UNIQUE CHECK (level_code IN ('INDEPENDENT_LIVING','ASSISTED_LIVING','MEMORY_CARE','SKILLED_NURSING','HOSPICE')),
    level_name      NVARCHAR(100) NOT NULL,
    is_deleted      BIT NOT NULL DEFAULT 0
);

CREATE TABLE care_level_rates (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    care_level_id   BIGINT NOT NULL REFERENCES care_levels(id),
    facility_id     UNIQUEIDENTIFIER NOT NULL REFERENCES facilities(id),
    daily_rate      DECIMAL(18,2) NOT NULL,
    effective_from  DATE NOT NULL,
    effective_to    DATE NULL
);
CREATE INDEX idx_care_level_rates_lookup ON care_level_rates(care_level_id, facility_id, effective_from);

CREATE TABLE user_facilities (
    user_id         UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    facility_id     UNIQUEIDENTIFIER NOT NULL REFERENCES facilities(id),
    is_primary      BIT NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, facility_id)
);

-- =====================================================================================
-- PART 5: CONTACTS & RESIDENTS
-- =====================================================================================

CREATE TABLE contacts (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    address_id      BIGINT NULL REFERENCES addresses(id),
    first_name      NVARCHAR(100) NOT NULL,
    middle_name     NVARCHAR(100) NULL,
    last_name       NVARCHAR(100) NOT NULL,
    phone_primary   NVARCHAR(20) NOT NULL,
    phone_secondary NVARCHAR(20) NULL,
    email           NVARCHAR(255) NULL,
    is_deleted      BIT NOT NULL DEFAULT 0,
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE residents (
    id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    address_id          BIGINT NULL REFERENCES addresses(id),
    bed_id              UNIQUEIDENTIFIER NULL REFERENCES beds(id),
    first_name          NVARCHAR(100) NOT NULL,
    middle_name         NVARCHAR(100) NULL,
    last_name           NVARCHAR(100) NOT NULL,
    date_of_birth       DATE NOT NULL,
    gender              VARCHAR(20) NULL CHECK (gender IN ('MALE','FEMALE','OTHER','UNDISCLOSED')),
    marital_status      VARCHAR(20) NULL,
    religion_preference NVARCHAR(100) NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACTIVE','DISCHARGED','DECEASED')),
    is_chart_locked     BIT NOT NULL DEFAULT 0,
    is_deleted          BIT NOT NULL DEFAULT 0,
    deleted_at          DATETIMEOFFSET(0) NULL,
    created_at          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_residents_status ON residents(status) WHERE is_deleted = 0;
CREATE INDEX idx_residents_bed_id ON residents(bed_id);
CREATE INDEX idx_residents_dob ON residents(date_of_birth);

CREATE TABLE resident_sensitive_info (
    id                              BIGINT IDENTITY(1,1) PRIMARY KEY,
    resident_id                     UNIQUEIDENTIFIER NOT NULL UNIQUE REFERENCES residents(id),
    ssn_encrypted                   VARCHAR(512) NULL,      
    medical_record_number_encrypted VARCHAR(512) NULL,      
    primary_insurance_id_encrypted  VARCHAR(512) NULL,
    bank_account_encrypted          VARCHAR(512) NULL,      
    created_at                      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at                      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE resident_care_level_history (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    resident_id     UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    care_level_id   BIGINT NOT NULL REFERENCES care_levels(id),
    start_date      DATE NOT NULL,
    end_date        DATE NULL
);
CREATE INDEX idx_resident_care_level_history_resident_id ON resident_care_level_history(resident_id);

CREATE TABLE resident_contacts (
    id                          BIGINT IDENTITY(1,1) PRIMARY KEY,
    resident_id                 UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    contact_id                  UNIQUEIDENTIFIER NOT NULL REFERENCES contacts(id),
    relationship_type           VARCHAR(50) NOT NULL,   
    is_guarantor                BIT NOT NULL DEFAULT 0,
    is_emergency_contact        BIT NOT NULL DEFAULT 0,
    is_primary                  BIT NOT NULL DEFAULT 0,
    financial_responsibility_pct DECIMAL(5,2) NULL CHECK (financial_responsibility_pct BETWEEN 0 AND 100),
    created_at                  DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at                  DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT uq_resident_contact UNIQUE (resident_id, contact_id, relationship_type)
);
CREATE INDEX idx_resident_contacts_resident_id ON resident_contacts(resident_id);
CREATE INDEX idx_resident_contacts_contact_id ON resident_contacts(contact_id);

-- =====================================================================================
-- PART 6: INTAKE, EHR, ASSESSMENTS & VITALS
-- =====================================================================================

CREATE TABLE pre_admission_screenings (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    resident_id     UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    screened_by     UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    status          VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT','COMPLETED','REJECTED')),
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_pre_admission_screenings_resident_id ON pre_admission_screenings(resident_id);

CREATE TABLE admissions (
    id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    resident_id         UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    facility_id         UNIQUEIDENTIFIER NOT NULL REFERENCES facilities(id),
    admission_date      DATE NOT NULL,
    discharge_date      DATE NULL,
    discharge_reason    NVARCHAR(255) NULL,
    created_at          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_admissions_resident_id ON admissions(resident_id);

CREATE TABLE clinical_records (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    resident_id     UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    recorded_by     UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    record_type     VARCHAR(50) NOT NULL CHECK (record_type IN ('PROGRESS_NOTE','DIAGNOSIS','LAB_RESULT')),
    description     NVARCHAR(MAX) NOT NULL,
    is_deleted      BIT NOT NULL DEFAULT 0,
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_clinical_records_resident_id ON clinical_records(resident_id);

CREATE TABLE assessments (
    id                          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    suggested_care_level_id     BIGINT NOT NULL REFERENCES care_levels(id),
    confirmed_care_level_id     BIGINT NOT NULL REFERENCES care_levels(id),
    resident_id                 UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    assessed_by                 UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    adl_total_score             INT NOT NULL,
    is_overridden               BIT NOT NULL DEFAULT 0,
    created_at                  DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_assessments_resident_id ON assessments(resident_id);

CREATE TABLE assessment_metrics (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    category        VARCHAR(50) NOT NULL CHECK (category IN ('ADL','IADL','BRADEN','MORSE')),
    metric_name     NVARCHAR(100) NOT NULL
);

CREATE TABLE assessment_details (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    assessment_id   UNIQUEIDENTIFIER NOT NULL REFERENCES assessments(id),
    metric_id       BIGINT NOT NULL REFERENCES assessment_metrics(id),
    score           INT NOT NULL,
    notes           NVARCHAR(500) NULL
);
CREATE INDEX idx_assessment_details_assessment_id ON assessment_details(assessment_id);

CREATE TABLE vital_signs (
    id                          BIGINT IDENTITY(1,1) PRIMARY KEY,
    resident_id                 UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    recorded_by                 UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    blood_pressure_systolic     SMALLINT NULL,
    blood_pressure_diastolic    SMALLINT NULL,
    heart_rate_bpm              SMALLINT NULL,
    respiratory_rate            SMALLINT NULL,
    temperature_fahrenheit      DECIMAL(4,1) NULL,
    spo2_percentage             TINYINT NULL CHECK (spo2_percentage BETWEEN 0 AND 100),
    pain_scale                  TINYINT NULL CHECK (pain_scale BETWEEN 0 AND 10),
    notes                       NVARCHAR(500) NULL,
    recorded_at                 DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_vital_signs_resident_id_recorded_at ON vital_signs(resident_id, recorded_at DESC);

-- =====================================================================================
-- PART 7: CARE PLANNING
-- =====================================================================================

CREATE TABLE care_plans (
    id                          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    resident_id                 UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    status                      VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT','ACTIVE','RESOLVED','DISCONTINUED')),
    significant_change_flag     BIT NOT NULL DEFAULT 0,
    is_deleted                  BIT NOT NULL DEFAULT 0,
    created_at                  DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at                  DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_care_plans_resident_id ON care_plans(resident_id);

CREATE TABLE care_goals (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    care_plan_id    UNIQUEIDENTIFIER NOT NULL REFERENCES care_plans(id),
    status          VARCHAR(20) NOT NULL CHECK (status IN ('IN_PROGRESS','ACHIEVED','NOT_MET'))
);
CREATE INDEX idx_care_goals_care_plan_id ON care_goals(care_plan_id);

CREATE TABLE care_interventions (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    assigned_role   VARCHAR(50) NOT NULL,
    care_plan_id    UNIQUEIDENTIFIER NOT NULL REFERENCES care_plans(id)
);
CREATE INDEX idx_care_interventions_care_plan_id ON care_interventions(care_plan_id);

CREATE TABLE care_tasks (
    id                      UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    task_type               VARCHAR(50) NOT NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','COMPLETED','MISSED')),
    is_abnormal_flagged     BIT NOT NULL DEFAULT 0,
    care_intervention_id    UNIQUEIDENTIFIER NOT NULL REFERENCES care_interventions(id),
    assigned_cna_id         UNIQUEIDENTIFIER NULL REFERENCES users(id),
    scheduled_time          DATETIMEOFFSET(0) NOT NULL,
    completed_at            DATETIMEOFFSET(0) NULL
);
CREATE INDEX idx_care_tasks_intervention_id ON care_tasks(care_intervention_id);
CREATE INDEX idx_care_tasks_assigned_cna_id ON care_tasks(assigned_cna_id);

-- =====================================================================================
-- PART 8: eMAR (Medication Administration)
-- =====================================================================================

CREATE TABLE medication_orders (
    id                      UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    resident_id             UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    prescribed_by           UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    drug_name               NVARCHAR(200) NOT NULL,
    dosage                  NVARCHAR(100) NOT NULL,
    route                   VARCHAR(30) NOT NULL,          
    frequency               NVARCHAR(100) NOT NULL,        
    is_controlled_substance BIT NOT NULL DEFAULT 0,        
    status                  VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE','DISCONTINUED','ON_HOLD')),
    is_deleted              BIT NOT NULL DEFAULT 0,
    created_at              DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at              DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_medication_orders_resident_id ON medication_orders(resident_id);

CREATE TABLE medication_schedules (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id            UNIQUEIDENTIFIER NOT NULL REFERENCES medication_orders(id),
    scheduled_time      TIME NOT NULL,
    is_active           BIT NOT NULL DEFAULT 1
);
CREATE INDEX idx_medication_schedules_order_id ON medication_schedules(order_id);

CREATE TABLE medication_logs (
    id                          BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id                    UNIQUEIDENTIFIER NOT NULL REFERENCES medication_orders(id),
    administered_by             UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    witnessed_by                UNIQUEIDENTIFIER NULL REFERENCES users(id),
    status                      VARCHAR(20) NOT NULL CHECK (status IN ('ADMINISTERED','REFUSED','HELD','NOT_AVAILABLE')),
    is_clinically_justified     BIT NOT NULL DEFAULT 0,
    override_reason             NVARCHAR(500) NULL,
    logged_at                   DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_medication_logs_order_id_logged_at ON medication_logs(order_id, logged_at DESC);

-- =====================================================================================
-- PART 9: STAFF SCHEDULING
-- =====================================================================================

CREATE TABLE shifts (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    facility_id     UNIQUEIDENTIFIER NOT NULL REFERENCES facilities(id),
    shift_name      VARCHAR(20) NOT NULL CHECK (shift_name IN ('DAY','EVENING','NIGHT')),
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL
);
CREATE INDEX idx_shifts_facility_id ON shifts(facility_id);

CREATE TABLE shift_assignments (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    shift_id        BIGINT NOT NULL REFERENCES shifts(id),
    user_id         UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    work_date       DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED','CONFIRMED','CALLED_OUT','COMPLETED')),
    clock_in_at     DATETIMEOFFSET(0) NULL,
    clock_out_at    DATETIMEOFFSET(0) NULL,
    CONSTRAINT uq_shift_assignment UNIQUE (shift_id, user_id, work_date)
);
CREATE INDEX idx_shift_assignments_user_id_work_date ON shift_assignments(user_id, work_date);

-- =====================================================================================
-- PART 10: BILLING
-- =====================================================================================

CREATE TABLE insurance_providers (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    provider_name   NVARCHAR(200) NOT NULL,
    provider_type   VARCHAR(20) NOT NULL CHECK (provider_type IN ('MEDICARE','MEDICAID','PRIVATE','OTHER'))
);

CREATE TABLE resident_insurance_policies (
    id                          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    resident_id                 UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    insurance_provider_id       BIGINT NOT NULL REFERENCES insurance_providers(id),
    policy_number_encrypted     VARCHAR(512) NOT NULL,
    group_number                NVARCHAR(100) NULL,
    effective_from              DATE NOT NULL,
    effective_to                DATE NULL,
    is_primary                  BIT NOT NULL DEFAULT 0,
    is_deleted                  BIT NOT NULL DEFAULT 0,
    created_at                  DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_resident_insurance_policies_resident_id ON resident_insurance_policies(resident_id);

CREATE TABLE invoices (
    id                                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    resident_id                         UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    billing_period_start                DATE NOT NULL,
    billing_period_end                  DATE NOT NULL,
    total_amount                        DECIMAL(18,2) NOT NULL,
    medicare_covered_amount             DECIMAL(18,2) NOT NULL DEFAULT 0,
    medicaid_covered_amount             DECIMAL(18,2) NOT NULL DEFAULT 0,
    private_insurance_covered_amount    DECIMAL(18,2) NOT NULL DEFAULT 0,
    patient_responsibility_amount       DECIMAL(18,2) NOT NULL DEFAULT 0,  
    status                              VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SENT','PARTIALLY_PAID','PAID','OVERDUE','VOID')),
    due_date                            DATE NOT NULL,
    is_deleted                          BIT NOT NULL DEFAULT 0,
    created_at                          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at                          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_invoices_resident_id ON invoices(resident_id);

CREATE TABLE invoice_line_items (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    invoice_id      UNIQUEIDENTIFIER NOT NULL REFERENCES invoices(id),
    description     NVARCHAR(255) NOT NULL,
    item_type       VARCHAR(30) NOT NULL CHECK (item_type IN ('ROOM_BOARD','CARE_LEVEL','MEDICATION','THERAPY','OTHER')),
    amount          DECIMAL(18,2) NOT NULL
);
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

CREATE TABLE payments (
    id                          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    invoice_id                  UNIQUEIDENTIFIER NOT NULL REFERENCES invoices(id),
    payer_type                  VARCHAR(20) NOT NULL CHECK (payer_type IN ('MEDICARE','MEDICAID','PRIVATE_INSURANCE','FAMILY')),
    payment_method              VARCHAR(20) NOT NULL CHECK (payment_method IN ('CREDIT_CARD','ACH','CHECK','CASH','INSURANCE_DIRECT')),
    amount                      DECIMAL(18,2) NOT NULL,
    payment_token_encrypted     VARCHAR(512) NULL,
    received_by                 UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    paid_at                     DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);

-- =====================================================================================
-- PART 11: INCIDENT & RISK
-- =====================================================================================

CREATE TABLE incident_severities (
    id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    level_name              NVARCHAR(50) NOT NULL,
    chart_lock_trigger      BIT NOT NULL DEFAULT 0
);

CREATE TABLE sla_configs (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    sla_window_hrs  INT NOT NULL,
    severity_id     BIGINT NOT NULL REFERENCES incident_severities(id)
);

CREATE TABLE incidents (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    incident_type   VARCHAR(50) NOT NULL CHECK (incident_type IN ('FALL','MEDICATION_ERROR','ALTERCATION','SKIN_TEAR')),
    status          VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','UNDER_INVESTIGATION','CLOSED')),
    description     NVARCHAR(MAX) NULL,
    sla_deadline    DATETIMEOFFSET(0) NOT NULL,
    resident_id     UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    severity_id     BIGINT NOT NULL REFERENCES incident_severities(id),
    reported_by     UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    reported_at     DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_incidents_resident_id ON incidents(resident_id);

CREATE TABLE chart_lock_events (
    id                      UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    locked_by_system        BIT NOT NULL DEFAULT 1,
    unlock_reason           NVARCHAR(MAX) NULL,
    incident_id             UNIQUEIDENTIFIER NOT NULL REFERENCES incidents(id),
    unlocked_by             UNIQUEIDENTIFIER NULL REFERENCES users(id),
    event_time              DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_chart_lock_events_incident_id ON chart_lock_events(incident_id);

-- =====================================================================================
-- PART 12: AUDIT, PHI ACCESS LOG & NOTIFICATIONS
-- =====================================================================================

CREATE TABLE audit_logs (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    table_name      NVARCHAR(100) NOT NULL,
    record_id       NVARCHAR(100) NOT NULL,     
    action          VARCHAR(20) NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
    old_data        NVARCHAR(MAX) NULL,   
    new_data        NVARCHAR(MAX) NULL,          
    performed_by    UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    performed_at    DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    ip_address      VARCHAR(45) NULL
);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);

CREATE TABLE phi_access_logs (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    table_name      NVARCHAR(100) NOT NULL,
    record_id       NVARCHAR(100) NOT NULL,
    accessed_by     UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    access_type     VARCHAR(20) NOT NULL CHECK (access_type IN ('VIEW','PRINT','EXPORT','DOWNLOAD')),
    access_reason   NVARCHAR(255) NULL,
    ip_address      VARCHAR(45) NULL,
    accessed_at     DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_phi_access_logs_table_record ON phi_access_logs(table_name, record_id);
CREATE INDEX idx_phi_access_logs_accessed_by ON phi_access_logs(accessed_by);

CREATE TABLE notifications (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title           NVARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL,
    is_read         BIT NOT NULL DEFAULT 0,
    user_id         UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);
GO