ALTER TABLE `ccnls` MODIFY COLUMN `name` varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE `ccnls` MODIFY COLUMN `issuer` varchar(255);--> statement-breakpoint
ALTER TABLE `ccnls` MODIFY COLUMN `validFrom` varchar(32);--> statement-breakpoint
ALTER TABLE `ccnls` MODIFY COLUMN `validTo` varchar(32);