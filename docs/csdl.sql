/* =====================================================================================
   NURSING HOME / ASSISTED LIVING MANAGEMENT SYSTEM — SCHEMA V3
   Dialect: Microsoft SQL Server (T-SQL) — giữ nguyên dialect gốc của file V2.
   Ghi chú kỹ thuật quan trọng (đọc trước khi dùng):
   - Yêu cầu "BIGINT AUTO_INCREMENT" (cú pháp MySQL) được dịch sang "BIGINT IDENTITY(1,1)".
   - Yêu cầu "TIMESTAMP WITH TIME ZONE" (cú pháp Postgres) được dịch sang "DATETIMEOFFSET(0)",
     kiểu dữ liệu tương đương của SQL Server, lưu offset múi giờ theo từng bản ghi.
   - Các cột "*_encrypted" dùng VARCHAR(512) để chứa dữ liệu đã mã hóa (ciphertext dạng
     Base64 của AES-256, hoặc dùng Always Encrypted / column-level encryption ở tầng ứng
     dụng / DB). Bản thân DDL không thực hiện mã hóa — đó là trách nhiệm của tầng service.
   - Khóa chính: dùng UNIQUEIDENTIFIER cho các thực thể "mặt tiền" (resident, user, invoice...)
     để tránh lộ số thứ tự bản ghi (PHI enumeration), và dùng BIGINT IDENTITY cho các bảng
     danh mục/log có khối lượng lớn (audit_logs, vital_signs, mar logs...) để tối ưu hiệu năng
     insert/index. Đây là điểm khác biệt so với yêu cầu "toàn bộ BIGINT AUTO_INCREMENT" —
     nêu rõ để nhóm review và quyết định.
===================================================================================== */

CREATE DATABASE NursingHomeManagement_V3;
GO
USE NursingHomeManagement_V3;
GO

-- =====================================================================================
-- PART 0: GLOBAL LOOKUP / RBAC (Role-Based Access Control)
-- =====================================================================================

-- EN: System roles (Admin, DON - Director of Nursing, RN, LPN, CNA, Billing, Front Desk...)
-- VI: Vai trò hệ thống, dùng để phân quyền truy cập PHI theo nguyên tắc "minimum necessary".
CREATE TABLE roles (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    role_name       NVARCHAR(100) NOT NULL UNIQUE,
    description     NVARCHAR(500) NULL,
    is_deleted      BIT NOT NULL DEFAULT 0,
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

-- EN: Fine-grained permission codes (e.g. RESIDENT_PHI_VIEW, MAR_ADMINISTER, BILLING_EDIT).
-- VI: Danh sách quyền hạn chi tiết, đặc biệt tách riêng quyền xem PHI/PII để audit chặt.
CREATE TABLE permissions (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    action_code     NVARCHAR(100) NOT NULL UNIQUE,
    is_phi_sensitive BIT NOT NULL DEFAULT 0,
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE role_permissions (
    role_id         BIGINT NOT NULL REFERENCES roles(id),
    permission_id   BIGINT NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

-- =====================================================================================
-- PART 1: SECURITY & USER MANAGEMENT
-- =====================================================================================

-- EN: Staff/system users (nurses, CNAs, admins, billing). Password never stored in plain text.
-- VI: Tài khoản nhân viên hệ thống. Không lưu mật khẩu dạng plain text, chỉ lưu hash.
CREATE TABLE users (
    id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_code       NVARCHAR(50) NOT NULL UNIQUE,
    email               NVARCHAR(255) NOT NULL UNIQUE,
    password_hash       NVARCHAR(300) NOT NULL,
    first_name          NVARCHAR(100) NOT NULL,
    middle_name         NVARCHAR(100) NULL,
    last_name           NVARCHAR(100) NOT NULL,
    license_number      NVARCHAR(100) NULL,          -- RN/LPN professional license #
    phone_number        NVARCHAR(20) NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','LOCKED')),
    mfa_enabled         BIT NOT NULL DEFAULT 0,       -- HIPAA: khuyến nghị bắt buộc MFA cho tài khoản có quyền PHI
    last_login_at       DATETIMEOFFSET(0) NULL,
    role_id             BIGINT NOT NULL REFERENCES roles(id),
    is_deleted          BIT NOT NULL DEFAULT 0,
    deleted_at          DATETIMEOFFSET(0) NULL,
    created_at          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(status) WHERE is_deleted = 0;

-- =====================================================================================
-- PART 2: ADDRESS (dùng chung cho facility, resident, contact — chuẩn hóa theo Mỹ)
-- =====================================================================================

-- EN: Reusable US-format address. state is the 2-letter USPS code; zip_code supports ZIP+4.
-- VI: Bảng địa chỉ dùng chung, chuẩn hóa theo định dạng Mỹ (state 2 ký tự, zip 5 hoặc 9 số).
CREATE TABLE addresses (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    street_line1    NVARCHAR(200) NOT NULL,
    street_line2    NVARCHAR(200) NULL,
    city            NVARCHAR(100) NOT NULL,
    state           CHAR(2) NOT NULL CHECK (state = UPPER(state)),   -- vd: CA, NY, TX
    zip_code        VARCHAR(10) NOT NULL CHECK (zip_code LIKE '[0-9][0-9][0-9][0-9][0-9]'
                                              OR zip_code LIKE '[0-9][0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]'),
    address_type    VARCHAR(20) NOT NULL DEFAULT 'HOME' CHECK (address_type IN ('HOME','MAILING','FACILITY','BILLING')),
    is_deleted      BIT NOT NULL DEFAULT 0,
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

-- =====================================================================================
-- PART 3: FACILITY & PHYSICAL STRUCTURE
-- =====================================================================================

-- EN: A licensed facility/location (each facility is licensed per-state in the US).
-- VI: Cơ sở/chi nhánh viện dưỡng lão. Mỗi bang tại Mỹ có quy định cấp phép riêng.
CREATE TABLE facilities (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    facility_code   NVARCHAR(50) NOT NULL UNIQUE,
    name            NVARCHAR(200) NOT NULL,
    license_number  NVARCHAR(100) NOT NULL,           -- state facility license #
    target_state    CHAR(2) NOT NULL,
    address_id      BIGINT NULL REFERENCES addresses(id),
    phone_number    NVARCHAR(20) NULL,
    is_deleted      BIT NOT NULL DEFAULT 0,
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE user_facilities (
    user_id         UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    facility_id     UNIQUEIDENTIFIER NOT NULL REFERENCES facilities(id),
    is_primary      BIT NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, facility_id)
);

CREATE TABLE rooms (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    room_number     NVARCHAR(20) NOT NULL,
    room_type       NVARCHAR(50) NOT NULL,
    facility_id     UNIQUEIDENTIFIER NOT NULL REFERENCES facilities(id),
    is_deleted      BIT NOT NULL DEFAULT 0,
    CONSTRAINT uq_room_per_facility UNIQUE (facility_id, room_number)
);
CREATE INDEX idx_rooms_facility_id ON rooms(facility_id);

CREATE TABLE beds (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    bed_number      NVARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','OCCUPIED','MAINTENANCE')),
    room_id         UNIQUEIDENTIFIER NOT NULL REFERENCES rooms(id),
    CONSTRAINT uq_bed_per_room UNIQUE (room_id, bed_number)
);
CREATE INDEX idx_beds_room_id ON beds(room_id);
CREATE INDEX idx_beds_status ON beds(status);

-- EN: Minimum-staffing config per facility (federal/state ratio compliance, e.g. CMS rule).
-- VI: Cấu hình định mức nhân sự tối thiểu mỗi cơ sở, phục vụ tuân thủ quy định của CMS/bang.
CREATE TABLE staffing_configs (
    id                          BIGINT IDENTITY(1,1) PRIMARY KEY,
    min_hrs_per_resident_day    DECIMAL(5,2) NOT NULL,
    warn_below_percentage       INT NOT NULL,
    facility_id                 UNIQUEIDENTIFIER NOT NULL REFERENCES facilities(id),
    created_at                  DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_staffing_configs_facility_id ON staffing_configs(facility_id);

-- =====================================================================================
-- PART 4: CARE LEVEL (thay cho loc_rates — chuẩn hóa thuật ngữ ngành Mỹ)
-- =====================================================================================

-- EN: Level of Care catalogue used across the US industry: Independent Living, Assisted
--     Living, Memory Care, Skilled Nursing, Hospice.
-- VI: Danh mục "Mức độ chăm sóc" theo chuẩn ngành viện dưỡng lão Mỹ.
CREATE TABLE care_levels (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    level_code      VARCHAR(30) NOT NULL UNIQUE CHECK (level_code IN
                        ('INDEPENDENT_LIVING','ASSISTED_LIVING','MEMORY_CARE','SKILLED_NURSING','HOSPICE')),
    level_name      NVARCHAR(100) NOT NULL,
    is_deleted      BIT NOT NULL DEFAULT 0
);

-- EN: Historical daily rate per care level (rates change over time / by facility).
-- VI: Lịch sử đơn giá theo ngày của từng mức độ chăm sóc (giá thay đổi theo thời gian).
CREATE TABLE care_level_rates (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    care_level_id   BIGINT NOT NULL REFERENCES care_levels(id),
    facility_id     UNIQUEIDENTIFIER NOT NULL REFERENCES facilities(id),
    daily_rate      DECIMAL(18,2) NOT NULL,
    effective_from  DATE NOT NULL,
    effective_to    DATE NULL
);
CREATE INDEX idx_care_level_rates_lookup ON care_level_rates(care_level_id, facility_id, effective_from);

-- =====================================================================================
-- PART 5: RESIDENTS & PII/PHI
-- =====================================================================================

-- EN: Core resident demographic record. Only "minimum necessary" identifying data lives
--     here; the highest-risk identifiers (SSN, MRN, insurance ID) are isolated in
--     resident_sensitive_info for stricter access control and encryption.
-- VI: Hồ sơ nhân khẩu học cơ bản của Cư dân (KHÔNG gọi patients/customers theo đúng chuẩn
--     ngành). Các định danh rủi ro cao (SSN, MRN, số bảo hiểm) tách riêng ra bảng
--     resident_sensitive_info để kiểm soát truy cập và mã hóa chặt hơn.
CREATE TABLE residents (
    id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    first_name          NVARCHAR(100) NOT NULL,
    middle_name         NVARCHAR(100) NULL,
    last_name           NVARCHAR(100) NOT NULL,
    date_of_birth       DATE NOT NULL,
    gender              VARCHAR(20) NULL CHECK (gender IN ('MALE','FEMALE','OTHER','UNDISCLOSED')),
    marital_status      VARCHAR(20) NULL,
    religion_preference NVARCHAR(100) NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACTIVE','DISCHARGED','DECEASED')),
    is_chart_locked     BIT NOT NULL DEFAULT 0,
    address_id          BIGINT NULL REFERENCES addresses(id),   -- địa chỉ trước khi nhập viện
    bed_id              UNIQUEIDENTIFIER NULL REFERENCES beds(id),
    is_deleted          BIT NOT NULL DEFAULT 0,
    deleted_at          DATETIMEOFFSET(0) NULL,
    created_at          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_residents_status ON residents(status) WHERE is_deleted = 0;
CREATE INDEX idx_residents_bed_id ON residents(bed_id);
CREATE INDEX idx_residents_dob ON residents(date_of_birth);
CREATE INDEX idx_residents_name ON residents(last_name, first_name);

-- EN: Highest-sensitivity identifiers, 1:1 with resident. All *_encrypted columns store
--     ciphertext (application/column-level encryption) — never plain values.
-- VI: Thông tin nhạy cảm nhất của Cư dân (SSN, MRN, số bảo hiểm...), quan hệ 1-1 với
--     residents. Toàn bộ cột *_encrypted lưu dữ liệu ĐÃ MÃ HÓA, tuyệt đối không lưu thô.
CREATE TABLE resident_sensitive_info (
    id                              BIGINT IDENTITY(1,1) PRIMARY KEY,
    resident_id                     UNIQUEIDENTIFIER NOT NULL UNIQUE REFERENCES residents(id),
    ssn_encrypted                   VARCHAR(512) NULL,      -- Social Security Number
    medical_record_number_encrypted VARCHAR(512) NULL,      -- MRN
    primary_insurance_id_encrypted  VARCHAR(512) NULL,
    bank_account_encrypted          VARCHAR(512) NULL,      -- dùng cho auto-pay, nếu có
    created_at                      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at                      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE resident_care_level_history (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    start_date      DATE NOT NULL,
    end_date        DATE NULL,
    resident_id     UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    care_level_id   BIGINT NOT NULL REFERENCES care_levels(id)
);
CREATE INDEX idx_resident_care_level_history_resident_id ON resident_care_level_history(resident_id);

-- EN: A "person" record reusable as guarantor and/or emergency contact — the same person
--     (e.g. one adult child) is often both, so a single contact entity avoids duplication.
-- VI: Thực thể "người liên hệ" dùng chung cho cả Người bảo hộ tài chính lẫn Người liên hệ
--     khẩn cấp — vì trong thực tế thường là cùng một người (con trai/con gái).
CREATE TABLE contacts (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    first_name      NVARCHAR(100) NOT NULL,
    middle_name     NVARCHAR(100) NULL,
    last_name       NVARCHAR(100) NOT NULL,
    phone_primary   NVARCHAR(20) NOT NULL,
    phone_secondary NVARCHAR(20) NULL,
    email           NVARCHAR(255) NULL,
    address_id      BIGINT NULL REFERENCES addresses(id),
    is_deleted      BIT NOT NULL DEFAULT 0,
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

-- EN: N:N junction — one resident can have many contacts (children), and one contact can
--     be guarantor/emergency contact for many residents (e.g. both parents).
-- VI: Bảng trung gian N-N: một Cư dân có nhiều người liên hệ, một người liên hệ có thể
--     gửi/bảo hộ nhiều Cư dân (ví dụ gửi cả cha lẫn mẹ vào viện).
CREATE TABLE resident_contacts (
    id                          BIGINT IDENTITY(1,1) PRIMARY KEY,
    resident_id                 UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    contact_id                  UNIQUEIDENTIFIER NOT NULL REFERENCES contacts(id),
    relationship_type           VARCHAR(50) NOT NULL,   -- SON, DAUGHTER, SPOUSE, LEGAL_GUARDIAN, FRIEND...
    is_guarantor                BIT NOT NULL DEFAULT 0,
    is_emergency_contact        BIT NOT NULL DEFAULT 0,
    is_primary                  BIT NOT NULL DEFAULT 0,
    financial_responsibility_pct DECIMAL(5,2) NULL CHECK (financial_responsibility_pct BETWEEN 0 AND 100),
    created_at                  DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT uq_resident_contact UNIQUE (resident_id, contact_id, relationship_type)
);
CREATE INDEX idx_resident_contacts_resident_id ON resident_contacts(resident_id);
CREATE INDEX idx_resident_contacts_contact_id ON resident_contacts(contact_id);

-- =====================================================================================
-- PART 6: MODULE M1 — INTAKE & EHR
-- =====================================================================================

CREATE TABLE pre_admission_screenings (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    status          VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT','COMPLETED','REJECTED')),
    resident_id     UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    screened_by     UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_pre_admission_screenings_resident_id ON pre_admission_screenings(resident_id);

CREATE TABLE admissions (
    id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    admission_date      DATE NOT NULL,
    discharge_date      DATE NULL,
    discharge_reason    NVARCHAR(255) NULL,
    resident_id         UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    facility_id         UNIQUEIDENTIFIER NOT NULL REFERENCES facilities(id),
    created_at          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_admissions_resident_id ON admissions(resident_id);

-- EN: Progress notes, diagnoses, lab results — high-value PHI, every read must be audited
--     (see phi_access_logs).
-- VI: Ghi chú lâm sàng (tiến triển, chẩn đoán, kết quả xét nghiệm) — PHI giá trị cao,
--     mọi lượt xem phải được ghi log tại bảng phi_access_logs.
CREATE TABLE clinical_records (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    record_type     VARCHAR(50) NOT NULL CHECK (record_type IN ('PROGRESS_NOTE','DIAGNOSIS','LAB_RESULT')),
    description     NVARCHAR(MAX) NOT NULL,
    resident_id     UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    recorded_by     UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    is_deleted      BIT NOT NULL DEFAULT 0,
    created_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_clinical_records_resident_id ON clinical_records(resident_id);

CREATE TABLE assessments (
    id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    adl_total_score     INT NOT NULL,
    is_overridden       BIT NOT NULL DEFAULT 0,
    suggested_care_level_id BIGINT NOT NULL REFERENCES care_levels(id),
    confirmed_care_level_id BIGINT NOT NULL REFERENCES care_levels(id),
    resident_id         UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    assessed_by         UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    created_at          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_assessments_resident_id ON assessments(resident_id);

CREATE TABLE assessment_metrics (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    category        VARCHAR(50) NOT NULL CHECK (category IN ('ADL','IADL','BRADEN','MORSE')),
    metric_name     NVARCHAR(100) NOT NULL
);

CREATE TABLE assessment_details (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    score           INT NOT NULL,
    notes           NVARCHAR(500) NULL,
    assessment_id   UNIQUEIDENTIFIER NOT NULL REFERENCES assessments(id),
    metric_id       BIGINT NOT NULL REFERENCES assessment_metrics(id)
);
CREATE INDEX idx_assessment_details_assessment_id ON assessment_details(assessment_id);

-- EN: Vital signs log (BP, HR, temperature, SpO2, pain scale). High-frequency append-only
--     table -> BIGINT identity for insert performance.
-- VI: Nhật ký chỉ số sinh tồn — bảng ghi liên tục tần suất cao, dùng BIGINT identity để
--     tối ưu tốc độ insert/index.
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
-- PART 7: MODULE M2 — CARE PLANNING
-- =====================================================================================

CREATE TABLE care_plans (
    id                          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    status                      VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT','ACTIVE','RESOLVED','DISCONTINUED')),
    significant_change_flag     BIT NOT NULL DEFAULT 0,
    resident_id                 UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    is_deleted                  BIT NOT NULL DEFAULT 0,
    created_at                  DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at                  DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_care_plans_resident_id ON care_plans(resident_id);

CREATE TABLE care_goals (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    status          VARCHAR(20) NOT NULL CHECK (status IN ('IN_PROGRESS','ACHIEVED','NOT_MET')),
    care_plan_id    UNIQUEIDENTIFIER NOT NULL REFERENCES care_plans(id)
);
CREATE INDEX idx_care_goals_care_plan_id ON care_goals(care_plan_id);

CREATE TABLE care_interventions (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    assigned_role   VARCHAR(50) NOT NULL,   -- NURSE, CNA, THERAPIST...
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
CREATE INDEX idx_care_tasks_scheduled_time ON care_tasks(scheduled_time);

-- =====================================================================================
-- PART 8: MODULE M3 — eMAR (Electronic Medication Administration Record)
-- =====================================================================================

CREATE TABLE medication_orders (
    id                      UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    drug_name               NVARCHAR(200) NOT NULL,
    dosage                  NVARCHAR(100) NOT NULL,
    route                   VARCHAR(30) NOT NULL,          -- ORAL, IV, TOPICAL, INJECTION...
    frequency                NVARCHAR(100) NOT NULL,        -- vd: "Every 8 hours"
    is_controlled_substance BIT NOT NULL DEFAULT 0,        -- DEA Schedule II-V, cần đối chiếu kép
    status                  VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE','DISCONTINUED','ON_HOLD')),
    resident_id             UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    prescribed_by           UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    is_deleted              BIT NOT NULL DEFAULT 0,
    created_at              DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at              DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_medication_orders_resident_id ON medication_orders(resident_id);
CREATE INDEX idx_medication_orders_status ON medication_orders(status);

-- EN: Scheduled dose times generated from an order's frequency (feeds the eMAR pass list).
-- VI: Các mốc giờ phát thuốc được sinh ra từ tần suất của y lệnh (phục vụ danh sách eMAR).
CREATE TABLE medication_schedules (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id            UNIQUEIDENTIFIER NOT NULL REFERENCES medication_orders(id),
    scheduled_time      TIME NOT NULL,
    is_active           BIT NOT NULL DEFAULT 1
);
CREATE INDEX idx_medication_schedules_order_id ON medication_schedules(order_id);

-- EN: Actual administration event, renamed from mar_logs to match "eMAR" module naming.
--     Controlled-substance doses should require a witness (witnessed_by) per most state regs.
-- VI: Sự kiện phát thuốc thực tế (đổi tên từ mar_logs cho khớp thuật ngữ module eMAR).
--     Thuốc thuộc danh mục kiểm soát nên có người chứng kiến (witnessed_by) theo quy định bang.
CREATE TABLE medication_logs (
    id                          BIGINT IDENTITY(1,1) PRIMARY KEY,
    status                      VARCHAR(20) NOT NULL CHECK (status IN ('ADMINISTERED','REFUSED','HELD','NOT_AVAILABLE')),
    is_clinically_justified     BIT NOT NULL DEFAULT 0,
    override_reason             NVARCHAR(500) NULL,
    order_id                    UNIQUEIDENTIFIER NOT NULL REFERENCES medication_orders(id),
    administered_by             UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    witnessed_by                UNIQUEIDENTIFIER NULL REFERENCES users(id),
    logged_at                   DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_medication_logs_order_id_logged_at ON medication_logs(order_id, logged_at DESC);
CREATE INDEX idx_medication_logs_administered_by ON medication_logs(administered_by);

-- =====================================================================================
-- PART 9: STAFF SCHEDULING (Phân ca trực)
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
-- PART 10: BILLING (Medicare / Medicaid / Private Insurance / Co-pay)
-- =====================================================================================

CREATE TABLE insurance_providers (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    provider_name   NVARCHAR(200) NOT NULL,
    provider_type   VARCHAR(20) NOT NULL CHECK (provider_type IN ('MEDICARE','MEDICAID','PRIVATE','OTHER'))
);

-- EN: policy_number stored encrypted — it is a PHI-adjacent financial identifier.
-- VI: policy_number lưu ở dạng mã hóa vì gắn với danh tính bảo hiểm cá nhân (PHI-adjacent).
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

-- EN: Invoice explicitly splits payer responsibility across Medicare, Medicaid, private
--     insurance, and the family's own out-of-pocket / co-pay amount.
-- VI: Hóa đơn tách rõ phần Medicare, Medicaid, bảo hiểm tư nhân chi trả, và phần gia đình
--     tự trả (co-pay/out-of-pocket) — theo đúng yêu cầu nghiệp vụ Mỹ.
CREATE TABLE invoices (
    id                                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    resident_id                         UNIQUEIDENTIFIER NOT NULL REFERENCES residents(id),
    billing_period_start                DATE NOT NULL,
    billing_period_end                  DATE NOT NULL,
    total_amount                        DECIMAL(18,2) NOT NULL,
    medicare_covered_amount             DECIMAL(18,2) NOT NULL DEFAULT 0,
    medicaid_covered_amount             DECIMAL(18,2) NOT NULL DEFAULT 0,
    private_insurance_covered_amount    DECIMAL(18,2) NOT NULL DEFAULT 0,
    patient_responsibility_amount       DECIMAL(18,2) NOT NULL DEFAULT 0,  -- co-pay / out-of-pocket
    status                              VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                                            CHECK (status IN ('DRAFT','SENT','PARTIALLY_PAID','PAID','OVERDUE','VOID')),
    due_date                            DATE NOT NULL,
    is_deleted                          BIT NOT NULL DEFAULT 0,
    created_at                          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at                          DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_invoices_resident_id ON invoices(resident_id);
CREATE INDEX idx_invoices_status ON invoices(status);

CREATE TABLE invoice_line_items (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    invoice_id      UNIQUEIDENTIFIER NOT NULL REFERENCES invoices(id),
    description     NVARCHAR(255) NOT NULL,
    item_type       VARCHAR(30) NOT NULL CHECK (item_type IN ('ROOM_BOARD','CARE_LEVEL','MEDICATION','THERAPY','OTHER')),
    amount          DECIMAL(18,2) NOT NULL
);
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

-- EN: payment_token_encrypted stores a tokenized payment reference only (per PCI-DSS, raw
--     card/bank numbers must never be persisted in application databases).
-- VI: payment_token_encrypted chỉ lưu token thanh toán đã mã hóa (theo PCI-DSS, tuyệt đối
--     không lưu số thẻ/số tài khoản gốc trong database ứng dụng).
CREATE TABLE payments (
    id                          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    invoice_id                  UNIQUEIDENTIFIER NOT NULL REFERENCES invoices(id),
    payer_type                  VARCHAR(20) NOT NULL CHECK (payer_type IN ('MEDICARE','MEDICAID','PRIVATE_INSURANCE','FAMILY')),
    payment_method               VARCHAR(20) NOT NULL CHECK (payment_method IN ('CREDIT_CARD','ACH','CHECK','CASH','INSURANCE_DIRECT')),
    amount                      DECIMAL(18,2) NOT NULL,
    payment_token_encrypted     VARCHAR(512) NULL,
    received_by                 UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    paid_at                     DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);

-- =====================================================================================
-- PART 11: MODULE M7 — INCIDENT & RISK
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
CREATE INDEX idx_incidents_status ON incidents(status);

CREATE TABLE chart_lock_events (
    id                      UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    locked_by_system        BIT NOT NULL DEFAULT 1,
    unlock_reason           NVARCHAR(MAX) NULL,
    incident_id              UNIQUEIDENTIFIER NOT NULL REFERENCES incidents(id),
    unlocked_by              UNIQUEIDENTIFIER NULL REFERENCES users(id),
    event_time               DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX idx_chart_lock_events_incident_id ON chart_lock_events(incident_id);

-- =====================================================================================
-- PART 12: AUDIT, PHI ACCESS LOG & NOTIFICATIONS (HIPAA compliance core)
-- =====================================================================================

-- EN: Write-audit trail (INSERT/UPDATE/DELETE) with before/after JSON snapshots.
-- VI: Nhật ký ghi vết thay đổi (thêm/sửa/xóa), lưu cả giá trị cũ và mới dạng JSON.
CREATE TABLE audit_logs (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    table_name      NVARCHAR(100) NOT NULL,
    record_id       NVARCHAR(100) NOT NULL,     -- lưu dạng string để tương thích cả GUID lẫn BIGINT
    action          VARCHAR(20) NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
    old_data        NVARCHAR(MAX) NULL,          -- JSON snapshot trước khi thay đổi
    new_data        NVARCHAR(MAX) NULL,          -- JSON snapshot sau khi thay đổi
    performed_by    UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    performed_at    DATETIMEOFFSET(0) NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    ip_address      VARCHAR(45) NULL
);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_performed_at ON audit_logs(performed_at);

-- EN: READ-audit trail — HIPAA requires logging who *viewed* PHI, not just who changed it
--     (this is the piece the original schema was missing entirely).
-- VI: Nhật ký ghi vết TRUY CẬP/XEM PHI — HIPAA yêu cầu log cả hành vi xem, không chỉ sửa/xóa
--     (đây là phần schema gốc hoàn toàn chưa có).
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
