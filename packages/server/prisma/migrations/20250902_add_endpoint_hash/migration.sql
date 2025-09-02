-- Remove old unique constraint on endpoint first
ALTER TABLE `push_subscriptions` DROP INDEX `push_subscriptions_endpoint_key`;

-- AlterTable
ALTER TABLE `push_subscriptions` 
ADD COLUMN `endpointHash` VARCHAR(191) NOT NULL DEFAULT '',
MODIFY `endpoint` TEXT NOT NULL,
MODIFY `p256dh` TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `push_subscriptions_endpointHash_key` ON `push_subscriptions`(`endpointHash`);