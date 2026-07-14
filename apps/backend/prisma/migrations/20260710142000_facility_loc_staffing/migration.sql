BEGIN TRY

BEGIN TRAN;

CREATE TABLE [dbo].[facilities] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [facility_code] NVARCHAR(50) NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [license_number] NVARCHAR(100) NOT NULL,
    [target_state] CHAR(2) NOT NULL,
    [timezone] NVARCHAR(100) NOT NULL CONSTRAINT [facilities_timezone_df] DEFAULT N'America/Los_Angeles (Pacific)',
    [address_id] BIGINT,
    [phone_number] NVARCHAR(20),
    [is_deleted] BIT NOT NULL CONSTRAINT [facilities_is_deleted_df] DEFAULT 0,
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [facilities_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIMEOFFSET NOT NULL,
    CONSTRAINT [facilities_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [facilities_facility_code_key] UNIQUE NONCLUSTERED ([facility_code])
);

CREATE TABLE [dbo].[rooms] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [room_number] NVARCHAR(20) NOT NULL,
    [room_type] NVARCHAR(50) NOT NULL,
    [facility_id] BIGINT NOT NULL,
    [is_deleted] BIT NOT NULL CONSTRAINT [rooms_is_deleted_df] DEFAULT 0,
    CONSTRAINT [rooms_pkey] PRIMARY KEY CLUSTERED ([id])
);

CREATE TABLE [dbo].[beds] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [bed_number] NVARCHAR(20) NOT NULL,
    [status] VARCHAR(20) NOT NULL CONSTRAINT [beds_status_df] DEFAULT 'AVAILABLE',
    [room_id] BIGINT NOT NULL,
    CONSTRAINT [beds_pkey] PRIMARY KEY CLUSTERED ([id])
);

CREATE TABLE [dbo].[staffing_configs] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [min_hrs_per_resident_day] DECIMAL(5,2) NOT NULL,
    [warn_below_percentage] INT NOT NULL,
    [shift_breakdown_json] NVARCHAR(2000) NOT NULL CONSTRAINT [staffing_configs_shift_breakdown_json_df] DEFAULT N'',
    [facility_id] BIGINT NOT NULL,
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [staffing_configs_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [staffing_configs_pkey] PRIMARY KEY CLUSTERED ([id])
);

CREATE TABLE [dbo].[care_levels] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [level_code] VARCHAR(30) NOT NULL,
    [level_name] NVARCHAR(100) NOT NULL,
    [is_deleted] BIT NOT NULL CONSTRAINT [care_levels_is_deleted_df] DEFAULT 0,
    CONSTRAINT [care_levels_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [care_levels_level_code_key] UNIQUE NONCLUSTERED ([level_code])
);

CREATE TABLE [dbo].[care_level_rates] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [care_level_id] BIGINT NOT NULL,
    [facility_id] BIGINT NOT NULL,
    [daily_rate] DECIMAL(18,2) NOT NULL,
    [effective_from] DATE NOT NULL,
    [effective_to] DATE,
    CONSTRAINT [care_level_rates_pkey] PRIMARY KEY CLUSTERED ([id])
);

CREATE TABLE [dbo].[facility_room_rates] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [facility_id] BIGINT NOT NULL,
    [room_type] NVARCHAR(50) NOT NULL,
    [daily_rate] DECIMAL(18,2) NOT NULL,
    [effective_from] DATE NOT NULL,
    CONSTRAINT [facility_room_rates_pkey] PRIMARY KEY CLUSTERED ([id])
);

CREATE TABLE [dbo].[facility_clinical_capabilities] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [facility_id] BIGINT NOT NULL,
    [capability] NVARCHAR(200) NOT NULL,
    [supported] BIT NOT NULL CONSTRAINT [facility_clinical_capabilities_supported_df] DEFAULT 1,
    [note] NVARCHAR(500),
    CONSTRAINT [facility_clinical_capabilities_pkey] PRIMARY KEY CLUSTERED ([id])
);

CREATE UNIQUE INDEX [uq_room_per_facility] ON [dbo].[rooms]([facility_id], [room_number]);
CREATE INDEX [idx_rooms_facility_id] ON [dbo].[rooms]([facility_id]);
CREATE UNIQUE INDEX [uq_bed_per_room] ON [dbo].[beds]([room_id], [bed_number]);
CREATE INDEX [idx_beds_room_id] ON [dbo].[beds]([room_id]);
CREATE INDEX [idx_beds_status] ON [dbo].[beds]([status]);
CREATE INDEX [idx_staffing_configs_facility_id] ON [dbo].[staffing_configs]([facility_id]);
CREATE INDEX [idx_care_level_rates_lookup] ON [dbo].[care_level_rates]([care_level_id], [facility_id], [effective_from]);
CREATE UNIQUE INDEX [uq_facility_room_rate] ON [dbo].[facility_room_rates]([facility_id], [room_type]);
CREATE UNIQUE INDEX [uq_facility_clinical_capability] ON [dbo].[facility_clinical_capabilities]([facility_id], [capability]);

ALTER TABLE [dbo].[rooms] ADD CONSTRAINT [rooms_facility_id_fkey] FOREIGN KEY ([facility_id]) REFERENCES [dbo].[facilities]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE [dbo].[beds] ADD CONSTRAINT [beds_room_id_fkey] FOREIGN KEY ([room_id]) REFERENCES [dbo].[rooms]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE [dbo].[staffing_configs] ADD CONSTRAINT [staffing_configs_facility_id_fkey] FOREIGN KEY ([facility_id]) REFERENCES [dbo].[facilities]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE [dbo].[care_level_rates] ADD CONSTRAINT [care_level_rates_care_level_id_fkey] FOREIGN KEY ([care_level_id]) REFERENCES [dbo].[care_levels]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE [dbo].[care_level_rates] ADD CONSTRAINT [care_level_rates_facility_id_fkey] FOREIGN KEY ([facility_id]) REFERENCES [dbo].[facilities]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE [dbo].[facility_room_rates] ADD CONSTRAINT [facility_room_rates_facility_id_fkey] FOREIGN KEY ([facility_id]) REFERENCES [dbo].[facilities]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE [dbo].[facility_clinical_capabilities] ADD CONSTRAINT [facility_clinical_capabilities_facility_id_fkey] FOREIGN KEY ([facility_id]) REFERENCES [dbo].[facilities]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
