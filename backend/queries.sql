-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    mobile NUMERIC NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role text not null default 'customer'::text,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personal Details table
CREATE TABLE personal_details (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    aadhaar_number VARCHAR(12) NOT NULL,
    pan_card_number VARCHAR(10) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    marital_status TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    street_address TEXT NOT NULL,
    pin_code VARCHAR(6) NOT NULL,
    country VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    residence_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id),
    UNIQUE(aadhaar_number),
    UNIQUE(pan_card_number)
);

-- Income Details table
CREATE TABLE income_details (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    employment_type VARCHAR(20) NOT NULL,
    employer_type VARCHAR(50), -- Only for salaried
    gross_salary NUMERIC, -- Only for salaried
    net_salary NUMERIC, -- Only for salaried
    rent_income NUMERIC,
    annual_bonus NUMERIC, -- Only for salaried
    pension NUMERIC, -- Only for salaried
    monthly_incentive NUMERIC, -- Only for salaried
    gross_itr_income NUMERIC, -- Only for self-employed/professional
    net_itr_income NUMERIC, -- Only for self-employed/professional
    gst_return NUMERIC, -- Only for self-employed/professional
    existing_loan BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Existing Loans table
CREATE TABLE existing_loans (
    id SERIAL PRIMARY KEY,
    income_detail_id INTEGER NOT NULL REFERENCES income_details(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    emi_rate NUMERIC NOT NULL,
    outstanding_amount NUMERIC NOT NULL,
    balance_tenure NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property Details table
CREATE TABLE property_details (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    is_property_selected BOOLEAN NOT NULL,
    property_status VARCHAR(50),
    property_type VARCHAR(50),
    country VARCHAR(50),
    state VARCHAR(50),
    district VARCHAR(50),
    city VARCHAR(50),
    street_address TEXT,
    building_name VARCHAR(100),
    wing VARCHAR(20),
    flat_number VARCHAR(20),
    floor_number VARCHAR(20),
    carpet_area VARCHAR(20),
    agreement_value VARCHAR(20),
    gst_charges VARCHAR(20),
    other_charges VARCHAR(20),
    stamp_duty VARCHAR(20),
    registration_fees VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Co-Applicants table
CREATE TABLE co_applicants (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER NOT NULL REFERENCES users(id),      -- main applicant
    first_name        TEXT    NOT NULL,
    middle_name       TEXT,
    last_name         TEXT    NOT NULL,
    email             VARCHAR(255) NOT NULL,
    mobile            VARCHAR(15)  NOT NULL,
    aadhaar_number    VARCHAR(12)  NOT NULL,
    pan_card_number   VARCHAR(10)  NOT NULL,
    gender            VARCHAR(10)  NOT NULL,
    marital_status    VARCHAR(20)  NOT NULL,
    relationship_to_applicant VARCHAR(30) NOT NULL,
    date_of_birth     DATE    NOT NULL,
    street_address    TEXT,
    pin_code          VARCHAR(6),
    country           VARCHAR(50),
    state             VARCHAR(50),
    district          VARCHAR(50),
    city              VARCHAR(50),
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Co-Applicant Income Details table
CREATE TABLE co_applicant_income_details (
    id                     SERIAL PRIMARY KEY,
    co_applicant_id        INTEGER NOT NULL REFERENCES co_applicants(id) ON DELETE CASCADE,
    employment_type        VARCHAR(20)  NOT NULL,          -- salaried / self-employed / professional
    employer_type          VARCHAR(50),                    -- salaried only
    gross_salary           NUMERIC,
    net_salary             NUMERIC,
    rent_income            NUMERIC,
    pension                NUMERIC,
    existing_loan          BOOLEAN    NOT NULL,
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Co-Applicant Existing Loans table
CREATE TABLE co_applicant_existing_loans (
    id                       SERIAL PRIMARY KEY,
    co_applicant_income_id   INTEGER NOT NULL
                              REFERENCES co_applicant_income_details(id) ON DELETE CASCADE,
    co_applicant_id          INTEGER NOT NULL REFERENCES co_applicants(id) ON DELETE CASCADE,
    type                     VARCHAR(50)  NOT NULL,
    emi_rate                 NUMERIC      NOT NULL,
    outstanding_amount       NUMERIC      NOT NULL,
    balance_tenure           NUMERIC      NOT NULL,
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan Request table (one row per user)
CREATE TABLE loan_requests (
    user_id     INTEGER PRIMARY KEY REFERENCES users(id),
    loan_type   VARCHAR(50) NOT NULL,
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    doc_type    VARCHAR(50)  NOT NULL,          -- e.g. 'passport'
    storage_key TEXT         NOT NULL,          -- path inside bucket
    public_url  TEXT,                           -- filled if bucket is public
    size_bytes  INTEGER      NOT NULL,
    mime_type   VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    file_name   TEXT
);

-- Document submissions table
CREATE TABLE document_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    form_type VARCHAR(50) NOT NULL,
    address_proof VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link documents to submissions
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS submission_id INTEGER REFERENCES document_submissions(id);

-- ============================================================================
-- SALES MANAGER SPECIFIC TABLES
-- ============================================================================

-- Leads table for sales manager functionality
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id),
    sales_manager_id INTEGER NOT NULL REFERENCES users(id),
    loan_type VARCHAR(50) NOT NULL DEFAULT 'home_loan',
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, under_review
    notes TEXT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank Sanctions table
CREATE TABLE bank_sanctions (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id),
    bank_name VARCHAR(100) NOT NULL,
    sanctioned_amount NUMERIC NOT NULL,
    interest_rate NUMERIC,
    tenure_months INTEGER,
    sanction_letter_url TEXT,
    sanctioned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disbursements table
CREATE TABLE disbursements (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id),
    bank_sanction_id INTEGER REFERENCES bank_sanctions(id),
    disbursed_amount NUMERIC NOT NULL,
    disbursement_type VARCHAR(20) DEFAULT 'full', -- full, partial
    disbursement_stage VARCHAR(50), -- stage_1, stage_2, etc.
    disbursed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Manager Targets table
CREATE TABLE sales_targets (
    id SERIAL PRIMARY KEY,
    sales_manager_id INTEGER NOT NULL REFERENCES users(id),
    target_period VARCHAR(20) NOT NULL, -- monthly, quarterly, yearly
    target_amount NUMERIC NOT NULL,
    achieved_amount NUMERIC DEFAULT 0,
    target_year INTEGER NOT NULL,
    target_month INTEGER, -- for monthly targets
    target_quarter INTEGER, -- for quarterly targets
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table for task management (Enhanced existing table)
DROP TABLE IF EXISTS tasks CASCADE;
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    assigned_to INTEGER NOT NULL REFERENCES users(id),
    assigned_by INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) DEFAULT 'custom', -- custom, call, visit, document, review, follow-up
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled, rescheduled
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    is_prebuilt BOOLEAN DEFAULT FALSE,
    prebuilt_template_id INTEGER,
    related_entity_type VARCHAR(50), -- lead, customer, loan, disbursement
    related_entity_id INTEGER,
    metadata JSONB, -- Additional task-specific data
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prebuilt Task Templates table
CREATE TABLE prebuilt_task_templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    estimated_duration INTEGER, -- in minutes
    category VARCHAR(50), -- document_collection, follow_up, verification, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Comments table for task collaboration
CREATE TABLE task_comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE, -- internal comment vs customer-facing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Status History table for tracking status changes
CREATE TABLE task_status_history (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Attachments table for file attachments
CREATE TABLE task_attachments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id),
    file_name VARCHAR(255),
    file_url TEXT,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Notifications table for reminders and updates
CREATE TABLE task_notifications (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    notification_type VARCHAR(30) NOT NULL, -- reminder, status_change, assignment, comment
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    sent_via JSONB, -- email, sms, push
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default prebuilt task templates
INSERT INTO prebuilt_task_templates (title, description, task_type, priority, category, estimated_duration) VALUES
('Call lead before appointment', 'Contact the lead to confirm appointment details and provide necessary information', 'call', 'high', 'follow_up', 15),
('Upload signed loan documents', 'Collect and upload all signed loan documents to the system', 'document', 'high', 'document_collection', 30),
('Confirm disbursement UTR', 'Verify and confirm the UTR number for disbursement transaction', 'verification', 'urgent', 'verification', 10),
('Ask Customer for Marriage Certificate', 'Request marriage certificate from customer for documentation', 'document', 'medium', 'document_collection', 20),
('Ask Customer for Bank Statement of Last Month', 'Request latest bank statement from customer', 'document', 'medium', 'document_collection', 15),
('Schedule home visit for loan signing', 'Arrange home visit appointment for loan document signing', 'visit', 'medium', 'appointment', 45),
('Collect address proof from customer', 'Obtain valid address proof document from customer', 'document', 'medium', 'document_collection', 20),
('Follow-up on document verification', 'Check status of document verification process', 'follow_up', 'medium', 'follow_up', 10),
('Confirm bank sanction approval', 'Verify bank sanction status and approval details', 'verification', 'high', 'verification', 15),
('Update customer on application status', 'Provide status update to customer regarding their application', 'call', 'medium', 'follow_up', 10);

-- Add indexes for better performance
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_status_history_task_id ON task_status_history(task_id);
CREATE INDEX idx_task_notifications_user_id ON task_notifications(user_id);
CREATE INDEX idx_task_notifications_is_read ON task_notifications(is_read);
CREATE INDEX idx_prebuilt_task_templates_active ON prebuilt_task_templates(is_active);

-- Add foreign key constraint for prebuilt template reference
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_prebuilt_template 
    FOREIGN KEY (prebuilt_template_id) REFERENCES prebuilt_task_templates(id);

-- Reports table for storing generated reports
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    generated_by INTEGER NOT NULL REFERENCES users(id),
    report_type VARCHAR(50) NOT NULL, -- leads, sanctions, disbursements, performance
    report_data JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LFI Sanctions table for storing approved loan offers
CREATE TABLE lfi_sanctions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    bank_name VARCHAR(100) NOT NULL,
    max_amount NUMERIC NOT NULL,
    tenure_years INTEGER NOT NULL,
    interest_rate VARCHAR(20) NOT NULL,
    loan_eligibility NUMERIC NOT NULL,
    tenure_applicant INTEGER,
    tenure_co_applicant INTEGER,
    total_emi NUMERIC NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, expired, withdrawn
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_leads_sales_manager ON leads(sales_manager_id);
CREATE INDEX idx_leads_customer ON leads(customer_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_bank_sanctions_lead ON bank_sanctions(lead_id);
CREATE INDEX idx_disbursements_lead ON disbursements(lead_id);
CREATE INDEX idx_lfi_sanctions_user ON lfi_sanctions(user_id);
CREATE INDEX idx_lfi_sanctions_status ON lfi_sanctions(status);

-- Quick Eligibility Checks table for storing fast eligibility submissions
CREATE TABLE IF NOT EXISTS quick_eligibility_checks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    sales_manager_id INTEGER NOT NULL REFERENCES users(id),
    eligibility_result VARCHAR(50), -- eligible, ineligible, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_quick_eligibility_sales_mgr ON quick_eligibility_checks(sales_manager_id);
CREATE INDEX IF NOT EXISTS idx_quick_eligibility_user ON quick_eligibility_checks(user_id);

-- enable RLS for clarity (it already is, but makes the intent explicit)
alter table storage.objects enable row level security;

-- Allow anyone (anon or authenticated) to insert into the
--  loan-documents bucket, **but nowhere else**.
create policy "Anon insert loan-documents"
on storage.objects
for insert
with check ( bucket_id = 'loan-documents' );

-- ============================================================================
-- ROI CONFIGURATION TABLES
-- ============================================================================

-- Bank master table to store bank information
CREATE TABLE IF NOT EXISTS bank_master (
    id SERIAL PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL UNIQUE,
    bank_code VARCHAR(20) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ROI configuration ranges for different banks
CREATE TABLE IF NOT EXISTS bank_roi_config (
    id SERIAL PRIMARY KEY,
    bank_id INTEGER NOT NULL REFERENCES bank_master(id) ON DELETE CASCADE,
    cibil_min_score INTEGER NOT NULL,
    cibil_max_score INTEGER NOT NULL,
    loan_amount_min NUMERIC NOT NULL,
    loan_amount_max NUMERIC NOT NULL,
    roi_salaried NUMERIC(5,2) NOT NULL, -- Interest rate for salaried customers
    roi_non_salaried NUMERIC(5,2) NOT NULL, -- Interest rate for non-salaried customers
    processing_fee NUMERIC(5,2), -- Processing fee percentage
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure no overlapping ranges for the same bank
    CONSTRAINT check_cibil_range CHECK (cibil_min_score <= cibil_max_score),
    CONSTRAINT check_loan_amount_range CHECK (loan_amount_min <= loan_amount_max),
    CONSTRAINT check_cibil_valid_range CHECK (cibil_min_score >= 300 AND cibil_max_score <= 900),
    CONSTRAINT check_roi_positive CHECK (roi_salaried >= 0 AND roi_non_salaried >= 0)
);

-- Insert default banks
INSERT INTO bank_master (bank_name, bank_code) VALUES 
('HDFC Bank', 'HDFC'),
('SBI Bank', 'SBI')
ON CONFLICT (bank_name) DO NOTHING;

-- Create indexes for ROI configuration
CREATE INDEX IF NOT EXISTS idx_bank_roi_config_bank_id ON bank_roi_config(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_roi_config_active ON bank_roi_config(is_active);
CREATE INDEX IF NOT EXISTS idx_bank_roi_config_cibil_range ON bank_roi_config(cibil_min_score, cibil_max_score);
CREATE INDEX IF NOT EXISTS idx_bank_roi_config_loan_amount_range ON bank_roi_config(loan_amount_min, loan_amount_max);
CREATE INDEX IF NOT EXISTS idx_bank_master_active ON bank_master(is_active);

-- Create indexes for existing tables (keeping existing indexes)
CREATE INDEX IF NOT EXISTS idx_leads_sales_manager ON leads(sales_manager_id);

-- ============================================================================
-- BUILDER PROJECT TABLES
-- ============================================================================

-- Builder Projects table
CREATE TABLE IF NOT EXISTS builder_projects (
    id SERIAL PRIMARY KEY,
    builder_id INTEGER NOT NULL REFERENCES users(id), -- builder user who created the project
    project_name VARCHAR(255) NOT NULL,
    developer_name VARCHAR(255) NOT NULL,
    rera_number VARCHAR(100) NOT NULL UNIQUE,
    total_inventory INTEGER,
    number_of_tenants INTEGER,
    number_of_sale_flats INTEGER,
    number_of_commercial_units INTEGER,
    project_type VARCHAR(50), -- Re-development, FREE HOLD
    address_line1 TEXT,
    address_line2 TEXT,
    landmark VARCHAR(255),
    cts_number VARCHAR(100),
    pincode VARCHAR(6),
    state VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Wings table
CREATE TABLE IF NOT EXISTS project_wings (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES builder_projects(id) ON DELETE CASCADE,
    wing_number VARCHAR(10) NOT NULL,
    number_of_floors INTEGER NOT NULL,
    number_of_flats_per_floor INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, wing_number)
);

-- Project Banks table (APF numbers for different banks)
CREATE TABLE IF NOT EXISTS project_banks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES builder_projects(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    apf_number VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, bank_name)
);

-- APF Documents table
CREATE TABLE IF NOT EXISTS apf_documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES builder_projects(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- development_agreement, power_of_attorney, etc.
    file_path TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    upload_status VARCHAR(20) DEFAULT 'pending', -- pending, uploaded, verified, rejected
    uploaded_at TIMESTAMP,
    verified_at TIMESTAMP,
    verified_by INTEGER REFERENCES users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Inventory table
CREATE TABLE IF NOT EXISTS project_inventory (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES builder_projects(id) ON DELETE CASCADE,
    wing_id INTEGER NOT NULL REFERENCES project_wings(id) ON DELETE CASCADE,
    wing VARCHAR(10) NOT NULL,
    floor VARCHAR(10) NOT NULL,
    flat_number VARCHAR(20) NOT NULL,
    rera_carpet_area VARCHAR(50), -- e.g., "650 sq ft"
    customer_id INTEGER REFERENCES users(id), -- if flat is sold/booked
    customer_name VARCHAR(255),
    booking_status VARCHAR(20) DEFAULT 'available', -- available, booked, sold, blocked
    booking_date TIMESTAMP,
    agreement_value NUMERIC,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, wing, floor, flat_number)
);

-- Note: APF documents will be created automatically when a project is created via the createDefaultAPFDocuments function

-- Create indexes for builder project tables
CREATE INDEX IF NOT EXISTS idx_builder_projects_builder_id ON builder_projects(builder_id);
CREATE INDEX IF NOT EXISTS idx_builder_projects_status ON builder_projects(status);
CREATE INDEX IF NOT EXISTS idx_builder_projects_rera ON builder_projects(rera_number);
CREATE INDEX IF NOT EXISTS idx_project_wings_project_id ON project_wings(project_id);
CREATE INDEX IF NOT EXISTS idx_project_banks_project_id ON project_banks(project_id);
CREATE INDEX IF NOT EXISTS idx_apf_documents_project_id ON apf_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_apf_documents_status ON apf_documents(upload_status);
CREATE INDEX IF NOT EXISTS idx_project_inventory_project_id ON project_inventory(project_id);
CREATE INDEX IF NOT EXISTS idx_project_inventory_customer_id ON project_inventory(customer_id);
CREATE INDEX IF NOT EXISTS idx_project_inventory_status ON project_inventory(booking_status);