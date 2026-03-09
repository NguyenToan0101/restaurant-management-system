-- liquibase formatted sql

-- changeset developer:V008-create-staff-refresh-token
CREATE TABLE staff_refresh_token (
    id VARCHAR(255) PRIMARY KEY,
    token_hash VARCHAR(128) NOT NULL,
    staff_account_id UUID NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    client_ip VARCHAR(255),
    user_agent VARCHAR(255),
    CONSTRAINT fk_staff_refresh_token_staff_account FOREIGN KEY (staff_account_id) REFERENCES staff_account(staff_account_id)
);
