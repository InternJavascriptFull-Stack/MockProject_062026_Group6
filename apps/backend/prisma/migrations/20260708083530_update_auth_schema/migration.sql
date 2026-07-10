BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [employee_code] NVARCHAR(50) NOT NULL,
    [email] NVARCHAR(255) NOT NULL,
    [password_hash] NVARCHAR(300) NOT NULL,
    [first_name] NVARCHAR(100) NOT NULL,
    [middle_name] NVARCHAR(100),
    [last_name] NVARCHAR(100) NOT NULL,
    [license_number] NVARCHAR(100),
    [phone_number] NVARCHAR(20),
    [status] VARCHAR(20) NOT NULL CONSTRAINT [users_status_df] DEFAULT 'PENDING',
    [mfa_enabled] BIT NOT NULL CONSTRAINT [users_mfa_enabled_df] DEFAULT 0,
    [last_login_at] DATETIMEOFFSET,
    [role_id] BIGINT NOT NULL,
    [is_deleted] BIT NOT NULL CONSTRAINT [users_is_deleted_df] DEFAULT 0,
    [deleted_at] DATETIMEOFFSET,
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIMEOFFSET NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_employee_code_key] UNIQUE NONCLUSTERED ([employee_code]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
