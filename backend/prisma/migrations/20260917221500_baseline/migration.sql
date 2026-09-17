-- CreateTable
CREATE TABLE "tenants" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "contact_person" VARCHAR(50),
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "config" JSONB DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "plan_type" VARCHAR(20),
    "plan_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "permissions" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "platform" VARCHAR(20) NOT NULL,
    "shop_url" VARCHAR(255),
    "api_key" VARCHAR(255),
    "api_secret" VARCHAR(255),
    "access_token" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_skills" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50),
    "sub_category" VARCHAR(50),
    "description" TEXT,
    "content" TEXT NOT NULL,
    "version" VARCHAR(20),
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "platforms" JSONB,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(3,2),
    "author_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "system_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_versions" (
    "id" SERIAL NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "changelog" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_skills" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "base_skill_id" INTEGER,
    "source_version" VARCHAR(20),
    "content" TEXT NOT NULL,
    "is_customized" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "gmv" DECIMAL(12,2),
    "orders" INTEGER,
    "uv" INTEGER,
    "pv" INTEGER,
    "conversion_rate" DECIMAL(5,2),
    "cart_rate" DECIMAL(5,2),
    "favorite_rate" DECIMAL(5,2),
    "raw_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analysis" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "shop_id" INTEGER,
    "analysis_date" DATE NOT NULL,
    "insights" JSONB,
    "suggestions" JSONB,
    "priority" VARCHAR(20),
    "status" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_configs" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "base_url" VARCHAR(255) NOT NULL,
    "api_key" VARCHAR(255) NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_tasks" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "task_type" VARCHAR(50) NOT NULL,
    "agent_id" VARCHAR(50),
    "skill_id" INTEGER,
    "skill_type" VARCHAR(20),
    "params" JSONB,
    "status" VARCHAR(20) NOT NULL,
    "result" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "agent_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitors" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "my_product_id" INTEGER,
    "competitor_name" VARCHAR(200) NOT NULL,
    "competitor_url" VARCHAR(500) NOT NULL,
    "platform" VARCHAR(20) NOT NULL,
    "monitored_metrics" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitor_snapshots" (
    "id" SERIAL NOT NULL,
    "competitor_id" INTEGER NOT NULL,
    "snapshot_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DECIMAL(10,2),
    "sales_volume" INTEGER,
    "rating" DECIMAL(3,2),
    "review_count" INTEGER,
    "title" VARCHAR(500),
    "raw_data" JSONB,

    CONSTRAINT "competitor_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitor_alerts" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "competitor_id" INTEGER NOT NULL,
    "alert_type" VARCHAR(50) NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitor_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_name_key" ON "tenants"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "shops_tenant_id_idx" ON "shops"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_skills_slug_key" ON "system_skills"("slug");

-- CreateIndex
CREATE INDEX "skill_versions_skill_id_idx" ON "skill_versions"("skill_id");

-- CreateIndex
CREATE INDEX "merchant_skills_tenant_id_idx" ON "merchant_skills"("tenant_id");

-- CreateIndex
CREATE INDEX "metrics_tenant_id_date_idx" ON "metrics"("tenant_id", "date");

-- CreateIndex
CREATE INDEX "metrics_shop_id_idx" ON "metrics"("shop_id");

-- CreateIndex
CREATE INDEX "ai_analysis_tenant_id_idx" ON "ai_analysis"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_configs_tenant_id_key" ON "ai_configs"("tenant_id");

-- CreateIndex
CREATE INDEX "agent_tasks_tenant_id_idx" ON "agent_tasks"("tenant_id");

-- CreateIndex
CREATE INDEX "agent_tasks_status_idx" ON "agent_tasks"("status");

-- CreateIndex
CREATE INDEX "competitors_tenant_id_idx" ON "competitors"("tenant_id");

-- CreateIndex
CREATE INDEX "competitor_snapshots_competitor_id_snapshot_time_idx" ON "competitor_snapshots"("competitor_id", "snapshot_time");

-- CreateIndex
CREATE INDEX "competitor_alerts_tenant_id_idx" ON "competitor_alerts"("tenant_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_versions" ADD CONSTRAINT "skill_versions_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "system_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_skills" ADD CONSTRAINT "merchant_skills_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_skills" ADD CONSTRAINT "merchant_skills_base_skill_id_fkey" FOREIGN KEY ("base_skill_id") REFERENCES "system_skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analysis" ADD CONSTRAINT "ai_analysis_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_configs" ADD CONSTRAINT "ai_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_snapshots" ADD CONSTRAINT "competitor_snapshots_competitor_id_fkey" FOREIGN KEY ("competitor_id") REFERENCES "competitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_alerts" ADD CONSTRAINT "competitor_alerts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
