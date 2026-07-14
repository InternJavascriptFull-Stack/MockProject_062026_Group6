BEGIN TRY

BEGIN TRAN;

CREATE TABLE [dbo].[roles] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [role_name] NVARCHAR(100) NOT NULL,
    [description] NVARCHAR(255),
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [roles_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIMEOFFSET NOT NULL,
    CONSTRAINT [roles_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [roles_role_name_key] UNIQUE NONCLUSTERED ([role_name])
);

CREATE TABLE [dbo].[permissions] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [action_code] NVARCHAR(100) NOT NULL,
    [is_phi_sensitive] BIT NOT NULL CONSTRAINT [permissions_is_phi_sensitive_df] DEFAULT 0,
    [created_at] DATETIMEOFFSET NOT NULL CONSTRAINT [permissions_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [permissions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [permissions_action_code_key] UNIQUE NONCLUSTERED ([action_code])
);

CREATE TABLE [dbo].[role_permissions] (
    [role_id] BIGINT NOT NULL,
    [permission_id] BIGINT NOT NULL,
    CONSTRAINT [role_permissions_pkey] PRIMARY KEY CLUSTERED ([role_id],[permission_id])
);

ALTER TABLE [dbo].[users] DROP CONSTRAINT [users_status_df];
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_status_df] DEFAULT 'INACTIVE' FOR [status];

ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_role_id_fkey] FOREIGN KEY ([role_id]) REFERENCES [dbo].[roles]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE [dbo].[role_permissions] ADD CONSTRAINT [role_permissions_role_id_fkey] FOREIGN KEY ([role_id]) REFERENCES [dbo].[roles]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE [dbo].[role_permissions] ADD CONSTRAINT [role_permissions_permission_id_fkey] FOREIGN KEY ([permission_id]) REFERENCES [dbo].[permissions]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
