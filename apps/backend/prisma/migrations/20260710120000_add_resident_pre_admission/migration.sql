CREATE TABLE [dbo].[residents] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [residents_id_df] DEFAULT newid(),
    [resident_code] NVARCHAR(50) NOT NULL,
    [full_name] NVARCHAR(150) NOT NULL,
    [date_of_birth] DATE NOT NULL,
    [gender] VARCHAR(20) NOT NULL,
    [phone] NVARCHAR(30),
    [address] NVARCHAR(500),
    [admission_date] DATE NOT NULL,
    [room_number] NVARCHAR(50),
    [care_level] VARCHAR(40) NOT NULL,
    [status] VARCHAR(40) NOT NULL CONSTRAINT [residents_status_df] DEFAULT 'pending',
    [assigned_nurse] NVARCHAR(150),
    [assigned_doctor] NVARCHAR(150),
    [emergency_contact_name] NVARCHAR(150) NOT NULL,
    [emergency_contact_relationship] NVARCHAR(80),
    [emergency_contact_phone] NVARCHAR(30) NOT NULL,
    [emergency_contact_email] NVARCHAR(255),
    [primary_diagnosis] NVARCHAR(500),
    [allergies] NVARCHAR(1000),
    [current_medications] NVARCHAR(1000),
    [mobility_status] VARCHAR(40),
    [cognitive_status] VARCHAR(40),
    [fall_risk] VARCHAR(20),
    [pain_level] INT,
    [nutrition_notes] NVARCHAR(1000),
    [clinical_notes] NVARCHAR(1000),
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [residents_created_at_df] DEFAULT SYSDATETIMEOFFSET(),
    [updated_at] DATETIMEOFFSET NOT NULL,
    CONSTRAINT [residents_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [residents_resident_code_key] UNIQUE NONCLUSTERED ([resident_code])
);

CREATE TABLE [dbo].[pre_admission_screenings] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [pre_admission_screenings_id_df] DEFAULT newid(),
    [resident_id] UNIQUEIDENTIFIER,
    [full_name] NVARCHAR(150) NOT NULL,
    [date_of_birth] DATE NOT NULL,
    [gender] VARCHAR(20) NOT NULL,
    [phone] NVARCHAR(30),
    [address] NVARCHAR(500),
    [admission_date] DATE NOT NULL,
    [room_number] NVARCHAR(50),
    [care_level] VARCHAR(40) NOT NULL,
    [assigned_nurse] NVARCHAR(150),
    [assigned_doctor] NVARCHAR(150),
    [emergency_contact_name] NVARCHAR(150) NOT NULL,
    [emergency_contact_phone] NVARCHAR(30) NOT NULL,
    [primary_diagnosis] NVARCHAR(500),
    [mobility_status] VARCHAR(40),
    [cognitive_status] VARCHAR(40),
    [fall_risk] VARCHAR(20),
    [pain_level] INT,
    [nutrition_notes] NVARCHAR(1000),
    [clinical_notes] NVARCHAR(1000),
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [pre_admission_screenings_created_at_df] DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [pre_admission_screenings_pkey] PRIMARY KEY CLUSTERED ([id])
);

ALTER TABLE [dbo].[pre_admission_screenings]
ADD CONSTRAINT [pre_admission_screenings_resident_id_fkey]
FOREIGN KEY ([resident_id]) REFERENCES [dbo].[residents]([id])
ON DELETE SET NULL ON UPDATE CASCADE;
