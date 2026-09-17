-- CreateTable
CREATE TABLE "data_syncs" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "shop_id" INTEGER,
    "status" VARCHAR(20) NOT NULL,
    "source" VARCHAR(30) NOT NULL DEFAULT 'mock_data',
    "records_synced" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "data_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "data_syncs_tenant_id_started_at_idx" ON "data_syncs"("tenant_id", "started_at");

-- CreateIndex
CREATE INDEX "data_syncs_shop_id_idx" ON "data_syncs"("shop_id");

-- AddForeignKey
ALTER TABLE "data_syncs" ADD CONSTRAINT "data_syncs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_syncs" ADD CONSTRAINT "data_syncs_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

