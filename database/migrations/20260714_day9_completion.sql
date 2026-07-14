/* DAY9 completion migration for configuration fields required by SC_010 and SC_011. */
IF COL_LENGTH('incident_severities', 'description') IS NULL
BEGIN
    ALTER TABLE incident_severities ADD description NVARCHAR(500) NULL;
END;
GO

IF COL_LENGTH('sla_configs', 'external_report_required') IS NULL
BEGIN
    ALTER TABLE sla_configs ADD external_report_required BIT NOT NULL CONSTRAINT DF_sla_configs_external_report_required DEFAULT (1);
END;
GO

IF COL_LENGTH('sla_configs', 'regulatory_body') IS NULL
BEGIN
    ALTER TABLE sla_configs ADD regulatory_body NVARCHAR(200) NULL;
END;
GO

UPDATE incident_severities
SET description = CASE UPPER(level_name)
    WHEN 'MINOR' THEN 'Low-risk event with no injury or clinical intervention required.'
    WHEN 'MODERATE' THEN 'Injury requiring minor treatment without hospitalization.'
    WHEN 'MAJOR' THEN 'Significant injury requiring clinical treatment or hospitalization.'
    WHEN 'CRITICAL' THEN 'Life-threatening event requiring emergency intervention.'
    ELSE COALESCE(description, 'Configured incident severity level.')
END
WHERE description IS NULL;
GO

UPDATE sla_configs
SET external_report_required = CASE WHEN UPPER(s.level_name) = 'MINOR' THEN 0 ELSE 1 END,
    regulatory_body = CASE WHEN UPPER(s.level_name) = 'MINOR' THEN NULL ELSE COALESCE(regulatory_body, 'CA Department of Public Health') END
FROM sla_configs c
INNER JOIN incident_severities s ON s.id = c.severity_id;
GO
