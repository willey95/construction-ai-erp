-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EXECUTIVE', 'CFO', 'PM', 'STAFF', 'ACCOUNTING');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('REAL_ESTATE', 'SIMPLE_CONTRACT', 'INFRA', 'ENERGY');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JournalStatus" AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StatementType" AS ENUM ('CONSOLIDATED', 'SEPARATE');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "PipelineStatus" AS ENUM ('PROSPECTING', 'BIDDING', 'NEGOTIATING', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('CLIENT', 'SUBCONTRACTOR', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('FINANCIAL_ANALYST', 'RISK_MANAGER', 'SCHEDULE_OPTIMIZER', 'DATA_COLLECTOR', 'PATTERN_RECOGNITION', 'COORDINATOR', 'REPORT_GENERATOR', 'ONTOLOGY_MANAGER');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'RUNNING', 'SUCCESS', 'FAILED', 'IDLE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('PROJECT', 'ORGANIZATION', 'PERSON', 'LOCATION', 'DOCUMENT', 'TASK', 'MATERIAL', 'EQUIPMENT', 'COST_ITEM', 'RISK', 'MILESTONE', 'CONTRACT', 'REGULATION', 'CONCEPT', 'EVENT');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('HAS_SUBPROJECT', 'MANAGED_BY', 'LOCATED_IN', 'RELATED_TO', 'DEPENDS_ON', 'PART_OF', 'USES', 'PRODUCES', 'REQUIRES', 'AFFECTS', 'CONTAINS', 'FOLLOWS', 'PRECEDES', 'COLLABORATES_WITH', 'SUPPLIES', 'OWNS', 'REPORTS_TO', 'COMPLIES_WITH');

-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('STRUCTURED', 'SEMI_STRUCTURED', 'UNSTRUCTURED', 'GRAPH', 'TIME_SERIES');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('POSTGRESQL', 'NEO4J', 'REST_API', 'FILE_CSV', 'FILE_EXCEL', 'FILE_JSON', 'MANUAL');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PAUSED');

-- CreateEnum
CREATE TYPE "ETLJobType" AS ENUM ('FULL_SYNC', 'INCREMENTAL_SYNC', 'VALIDATION', 'TRANSFORMATION');

-- CreateEnum
CREATE TYPE "ETLStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'WARNING', 'DANGER', 'CRITICAL');

-- CreateEnum
CREATE TYPE "PowerPlantType" AS ENUM ('SOLAR', 'WIND', 'HYDRO', 'BIOMASS', 'ESS', 'HYBRID');

-- CreateEnum
CREATE TYPE "PlantStatus" AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'STOPPED', 'CONSTRUCTION', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "EnergyAlertType" AS ENUM ('LOW_PRODUCTION', 'EQUIPMENT_FAILURE', 'WEATHER_RISK', 'MAINTENANCE_DUE', 'GRID_ISSUE', 'PERFORMANCE_DROP');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "department" TEXT,
    "position" TEXT,
    "role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "project_code" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "project_type" "ProjectType" NOT NULL,
    "client" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "contract_price" DECIMAL(15,2) NOT NULL,
    "contract_date" DATE NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "construction_period" INTEGER NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNED',
    "progress_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_assumptions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "profit_margin" DECIMAL(5,4) NOT NULL,
    "cost_ratio" DECIMAL(5,4) NOT NULL,
    "period_invoicing" INTEGER NOT NULL,
    "period_receivable" INTEGER NOT NULL,
    "retention_rate" DECIMAL(5,4) NOT NULL,
    "retention_period" INTEGER NOT NULL,
    "pay_m_subcon" INTEGER NOT NULL,
    "pay_m_material" INTEGER NOT NULL,
    "curve_type" TEXT NOT NULL DEFAULT 's_curve_normal',
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_assumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_progress" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "progress_date" DATE NOT NULL,
    "planned_rate" DECIMAL(5,4) NOT NULL,
    "actual_rate" DECIMAL(5,4),
    "cumulative_rate" DECIMAL(5,4) NOT NULL,
    "revenue" DECIMAL(15,2) NOT NULL,
    "cost" DECIMAL(15,2) NOT NULL,
    "profit" DECIMAL(15,2) NOT NULL,
    "cumulative_revenue" DECIMAL(15,2) NOT NULL,
    "cumulative_cost" DECIMAL(15,2) NOT NULL,
    "cumulative_profit" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_flows" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "flow_date" DATE NOT NULL,
    "invoice_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "received_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "retention_received" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "subcontract_payment" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "material_payment" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "other_payment" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_cash_flow" DECIMAL(15,2) NOT NULL,
    "cumulative_cash" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_journals" (
    "id" TEXT NOT NULL,
    "journal_number" TEXT NOT NULL,
    "journal_date" DATE NOT NULL,
    "project_id" TEXT,
    "debit_account" TEXT NOT NULL,
    "debit_amount" DECIMAL(15,2) NOT NULL,
    "credit_account" TEXT NOT NULL,
    "credit_amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "status" "JournalStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "posted_at" TIMESTAMP(3),
    "posted_by" TEXT,

    CONSTRAINT "accounting_journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_statements" (
    "id" TEXT NOT NULL,
    "statement_date" DATE NOT NULL,
    "statement_type" "StatementType" NOT NULL,
    "period_type" "PeriodType" NOT NULL,
    "revenue" DECIMAL(15,2),
    "cost_of_sales" DECIMAL(15,2),
    "gross_profit" DECIMAL(15,2),
    "operating_income" DECIMAL(15,2),
    "net_income" DECIMAL(15,2),
    "total_assets" DECIMAL(15,2),
    "total_liabilities" DECIMAL(15,2),
    "total_equity" DECIMAL(15,2),
    "detailed_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_pipeline" (
    "id" TEXT NOT NULL,
    "pipeline_code" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "project_type" "ProjectType" NOT NULL,
    "estimated_amount" DECIMAL(15,2) NOT NULL,
    "construction_period" INTEGER NOT NULL,
    "bidding_date" DATE,
    "decision_date" DATE,
    "win_probability" DECIMAL(5,2),
    "status" "PipelineStatus" NOT NULL DEFAULT 'PROSPECTING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "company_code" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_type" "CompanyType" NOT NULL,
    "business_number" TEXT,
    "representative" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "credit_rating" TEXT,
    "payment_terms" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_of_accounts" (
    "id" TEXT NOT NULL,
    "account_code" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_type" "AccountType" NOT NULL,
    "account_category" TEXT NOT NULL,
    "parent_account_id" TEXT,
    "level" INTEGER NOT NULL,
    "is_control_account" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "capabilities" TEXT[],
    "status" "AgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_run_at" TIMESTAMP(3),

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_logs" (
    "id" TEXT NOT NULL,
    "agent_name" TEXT NOT NULL,
    "agent_type" "AgentType" NOT NULL,
    "action" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "duration" INTEGER,
    "error_msg" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_tasks" (
    "id" TEXT NOT NULL,
    "agent_name" TEXT NOT NULL,
    "agent_type" "AgentType" NOT NULL,
    "task_type" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "status" "TaskStatus" NOT NULL,
    "project_id" TEXT,
    "payload" JSONB NOT NULL,
    "result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "agent_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ontology_entities" (
    "id" TEXT NOT NULL,
    "neo4j_id" TEXT,
    "entity_type" "EntityType" NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "source" TEXT NOT NULL,
    "confidence" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "ontology_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ontology_relations" (
    "id" TEXT NOT NULL,
    "neo4j_id" TEXT,
    "from_entity_id" TEXT NOT NULL,
    "to_entity_id" TEXT NOT NULL,
    "relation_type" "RelationType" NOT NULL,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "weight" DECIMAL(5,4) NOT NULL DEFAULT 1.0,
    "confidence" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ontology_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datasets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "data_type" "DataType" NOT NULL,
    "schema" JSONB,
    "sample_data" JSONB,
    "record_count" INTEGER NOT NULL DEFAULT 0,
    "source_type" "SourceType" NOT NULL,
    "source_config" JSONB NOT NULL,
    "etl_schedule" TEXT,
    "last_sync_at" TIMESTAMP(3),
    "sync_status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "datasets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataset_entities" (
    "id" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "source_field" TEXT NOT NULL,
    "mapping_rule" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dataset_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etl_jobs" (
    "id" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,
    "job_type" "ETLJobType" NOT NULL,
    "status" "ETLStatus" NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "duration" INTEGER,
    "records_processed" INTEGER NOT NULL DEFAULT 0,
    "records_success" INTEGER NOT NULL DEFAULT 0,
    "records_failed" INTEGER NOT NULL DEFAULT 0,
    "error_log" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etl_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "project_id" TEXT,
    "user_id" TEXT,
    "severity" "NotificationSeverity" NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metrics" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "action_required" BOOLEAN NOT NULL DEFAULT false,
    "action_taken" BOOLEAN NOT NULL DEFAULT false,
    "agent_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),
    "action_taken_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "power_plants" (
    "id" TEXT NOT NULL,
    "plant_code" TEXT NOT NULL,
    "plant_name" TEXT NOT NULL,
    "plant_type" "PowerPlantType" NOT NULL,
    "region" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "capacity" DECIMAL(10,2) NOT NULL,
    "installed_date" DATE NOT NULL,
    "status" "PlantStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "last_maintenance_at" TIMESTAMP(3),
    "next_maintenance_at" TIMESTAMP(3),
    "contract_type" TEXT,
    "unit_price" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "power_plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_productions" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "production" DECIMAL(12,2) NOT NULL,
    "temperature" DECIMAL(5,2),
    "humidity" DECIMAL(5,2),
    "irradiance" DECIMAL(8,2),
    "wind_speed" DECIMAL(6,2),
    "efficiency" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "energy_productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_sales" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "sale_date" DATE NOT NULL,
    "sold_amount" DECIMAL(12,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_revenue" DECIMAL(15,2) NOT NULL,
    "market_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "energy_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_settlements" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "settlement_month" DATE NOT NULL,
    "smp_revenue" DECIMAL(15,2) NOT NULL,
    "rec_revenue" DECIMAL(15,2) NOT NULL,
    "incentive" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(15,2) NOT NULL,
    "operation_cost" DECIMAL(15,2) NOT NULL,
    "maintenance_cost" DECIMAL(15,2) NOT NULL,
    "total_cost" DECIMAL(15,2) NOT NULL,
    "net_profit" DECIMAL(15,2) NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "settled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "energy_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_alerts" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "alert_type" "EnergyAlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metrics" JSONB,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "energy_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_permissions_user_id_idx" ON "user_permissions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_user_id_resource_action_key" ON "user_permissions"("user_id", "resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "projects_project_code_key" ON "projects"("project_code");

-- CreateIndex
CREATE INDEX "projects_project_type_idx" ON "projects"("project_type");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_start_date_end_date_idx" ON "projects"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "project_assumptions_project_id_idx" ON "project_assumptions"("project_id");

-- CreateIndex
CREATE INDEX "project_assumptions_effective_from_effective_to_idx" ON "project_assumptions"("effective_from", "effective_to");

-- CreateIndex
CREATE INDEX "project_progress_project_id_month_idx" ON "project_progress"("project_id", "month");

-- CreateIndex
CREATE UNIQUE INDEX "project_progress_project_id_month_key" ON "project_progress"("project_id", "month");

-- CreateIndex
CREATE INDEX "cash_flows_project_id_idx" ON "cash_flows"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "cash_flows_project_id_month_key" ON "cash_flows"("project_id", "month");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_journals_journal_number_key" ON "accounting_journals"("journal_number");

-- CreateIndex
CREATE INDEX "accounting_journals_journal_date_idx" ON "accounting_journals"("journal_date");

-- CreateIndex
CREATE INDEX "accounting_journals_project_id_idx" ON "accounting_journals"("project_id");

-- CreateIndex
CREATE INDEX "accounting_journals_status_idx" ON "accounting_journals"("status");

-- CreateIndex
CREATE INDEX "financial_statements_statement_date_idx" ON "financial_statements"("statement_date");

-- CreateIndex
CREATE UNIQUE INDEX "financial_statements_statement_date_statement_type_period_t_key" ON "financial_statements"("statement_date", "statement_type", "period_type");

-- CreateIndex
CREATE UNIQUE INDEX "project_pipeline_pipeline_code_key" ON "project_pipeline"("pipeline_code");

-- CreateIndex
CREATE INDEX "project_pipeline_status_idx" ON "project_pipeline"("status");

-- CreateIndex
CREATE INDEX "project_pipeline_bidding_date_decision_date_idx" ON "project_pipeline"("bidding_date", "decision_date");

-- CreateIndex
CREATE UNIQUE INDEX "companies_company_code_key" ON "companies"("company_code");

-- CreateIndex
CREATE UNIQUE INDEX "companies_business_number_key" ON "companies"("business_number");

-- CreateIndex
CREATE INDEX "companies_company_type_idx" ON "companies"("company_type");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_accounts_account_code_key" ON "chart_of_accounts"("account_code");

-- CreateIndex
CREATE INDEX "chart_of_accounts_account_type_idx" ON "chart_of_accounts"("account_type");

-- CreateIndex
CREATE INDEX "chart_of_accounts_parent_account_id_idx" ON "chart_of_accounts"("parent_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "agents_name_key" ON "agents"("name");

-- CreateIndex
CREATE INDEX "agents_status_idx" ON "agents"("status");

-- CreateIndex
CREATE INDEX "agents_name_idx" ON "agents"("name");

-- CreateIndex
CREATE INDEX "agent_logs_agent_name_timestamp_idx" ON "agent_logs"("agent_name", "timestamp");

-- CreateIndex
CREATE INDEX "agent_logs_status_idx" ON "agent_logs"("status");

-- CreateIndex
CREATE INDEX "agent_logs_agent_type_idx" ON "agent_logs"("agent_type");

-- CreateIndex
CREATE INDEX "agent_tasks_status_priority_idx" ON "agent_tasks"("status", "priority");

-- CreateIndex
CREATE INDEX "agent_tasks_agent_name_idx" ON "agent_tasks"("agent_name");

-- CreateIndex
CREATE INDEX "agent_tasks_agent_type_idx" ON "agent_tasks"("agent_type");

-- CreateIndex
CREATE UNIQUE INDEX "ontology_entities_neo4j_id_key" ON "ontology_entities"("neo4j_id");

-- CreateIndex
CREATE INDEX "ontology_entities_entity_type_idx" ON "ontology_entities"("entity_type");

-- CreateIndex
CREATE INDEX "ontology_entities_name_idx" ON "ontology_entities"("name");

-- CreateIndex
CREATE INDEX "ontology_entities_source_idx" ON "ontology_entities"("source");

-- CreateIndex
CREATE UNIQUE INDEX "ontology_relations_neo4j_id_key" ON "ontology_relations"("neo4j_id");

-- CreateIndex
CREATE INDEX "ontology_relations_from_entity_id_idx" ON "ontology_relations"("from_entity_id");

-- CreateIndex
CREATE INDEX "ontology_relations_to_entity_id_idx" ON "ontology_relations"("to_entity_id");

-- CreateIndex
CREATE INDEX "ontology_relations_relation_type_idx" ON "ontology_relations"("relation_type");

-- CreateIndex
CREATE UNIQUE INDEX "datasets_name_key" ON "datasets"("name");

-- CreateIndex
CREATE INDEX "datasets_data_type_idx" ON "datasets"("data_type");

-- CreateIndex
CREATE INDEX "datasets_source_type_idx" ON "datasets"("source_type");

-- CreateIndex
CREATE INDEX "datasets_sync_status_idx" ON "datasets"("sync_status");

-- CreateIndex
CREATE INDEX "dataset_entities_dataset_id_idx" ON "dataset_entities"("dataset_id");

-- CreateIndex
CREATE INDEX "dataset_entities_entity_id_idx" ON "dataset_entities"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "dataset_entities_dataset_id_entity_id_key" ON "dataset_entities"("dataset_id", "entity_id");

-- CreateIndex
CREATE INDEX "etl_jobs_dataset_id_idx" ON "etl_jobs"("dataset_id");

-- CreateIndex
CREATE INDEX "etl_jobs_status_idx" ON "etl_jobs"("status");

-- CreateIndex
CREATE INDEX "etl_jobs_started_at_idx" ON "etl_jobs"("started_at");

-- CreateIndex
CREATE INDEX "notifications_project_id_idx" ON "notifications"("project_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_severity_idx" ON "notifications"("severity");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "power_plants_plant_code_key" ON "power_plants"("plant_code");

-- CreateIndex
CREATE INDEX "power_plants_plant_type_idx" ON "power_plants"("plant_type");

-- CreateIndex
CREATE INDEX "power_plants_region_idx" ON "power_plants"("region");

-- CreateIndex
CREATE INDEX "power_plants_status_idx" ON "power_plants"("status");

-- CreateIndex
CREATE INDEX "energy_productions_plant_id_idx" ON "energy_productions"("plant_id");

-- CreateIndex
CREATE INDEX "energy_productions_recorded_at_idx" ON "energy_productions"("recorded_at");

-- CreateIndex
CREATE INDEX "energy_sales_plant_id_idx" ON "energy_sales"("plant_id");

-- CreateIndex
CREATE INDEX "energy_sales_sale_date_idx" ON "energy_sales"("sale_date");

-- CreateIndex
CREATE INDEX "energy_settlements_plant_id_idx" ON "energy_settlements"("plant_id");

-- CreateIndex
CREATE INDEX "energy_settlements_settlement_month_idx" ON "energy_settlements"("settlement_month");

-- CreateIndex
CREATE INDEX "energy_settlements_status_idx" ON "energy_settlements"("status");

-- CreateIndex
CREATE INDEX "energy_alerts_plant_id_idx" ON "energy_alerts"("plant_id");

-- CreateIndex
CREATE INDEX "energy_alerts_alert_type_idx" ON "energy_alerts"("alert_type");

-- CreateIndex
CREATE INDEX "energy_alerts_severity_idx" ON "energy_alerts"("severity");

-- CreateIndex
CREATE INDEX "energy_alerts_is_resolved_idx" ON "energy_alerts"("is_resolved");

-- CreateIndex
CREATE INDEX "energy_alerts_created_at_idx" ON "energy_alerts"("created_at");

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assumptions" ADD CONSTRAINT "project_assumptions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_progress" ADD CONSTRAINT "project_progress_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_flows" ADD CONSTRAINT "cash_flows_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_journals" ADD CONSTRAINT "accounting_journals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_journals" ADD CONSTRAINT "accounting_journals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_journals" ADD CONSTRAINT "accounting_journals_posted_by_fkey" FOREIGN KEY ("posted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_parent_account_id_fkey" FOREIGN KEY ("parent_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ontology_relations" ADD CONSTRAINT "ontology_relations_from_entity_id_fkey" FOREIGN KEY ("from_entity_id") REFERENCES "ontology_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ontology_relations" ADD CONSTRAINT "ontology_relations_to_entity_id_fkey" FOREIGN KEY ("to_entity_id") REFERENCES "ontology_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_entities" ADD CONSTRAINT "dataset_entities_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_entities" ADD CONSTRAINT "dataset_entities_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "ontology_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etl_jobs" ADD CONSTRAINT "etl_jobs_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_productions" ADD CONSTRAINT "energy_productions_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "power_plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_sales" ADD CONSTRAINT "energy_sales_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "power_plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_settlements" ADD CONSTRAINT "energy_settlements_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "power_plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_alerts" ADD CONSTRAINT "energy_alerts_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "power_plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
