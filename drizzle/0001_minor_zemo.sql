CREATE TABLE `ccnl_additional_costs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ccnlId` int NOT NULL,
	`tfr` varchar(16) NOT NULL,
	`socialContributions` varchar(16) NOT NULL,
	`otherBenefits` varchar(16) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ccnl_additional_costs_id` PRIMARY KEY(`id`),
	CONSTRAINT `ccnl_additional_costs_ccnlId_unique` UNIQUE(`ccnlId`)
);
--> statement-breakpoint
CREATE TABLE `ccnl_contributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ccnlId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`percentage` varchar(16) NOT NULL DEFAULT '0',
	`amount` varchar(16) NOT NULL DEFAULT '0',
	`isPercentage` int NOT NULL DEFAULT 0,
	`category` enum('bilateral','pension','health','other') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ccnl_contributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ccnl_levels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ccnlId` int NOT NULL,
	`level` varchar(64) NOT NULL,
	`description` varchar(255) NOT NULL,
	`baseSalaryMonthly` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ccnl_levels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ccnls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`sector` varchar(255) NOT NULL,
	`sectorCategory` varchar(64) NOT NULL,
	`issuer` varchar(255) NOT NULL,
	`validFrom` varchar(32) NOT NULL,
	`validTo` varchar(32) NOT NULL,
	`description` text,
	`isENGEB` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ccnls_id` PRIMARY KEY(`id`),
	CONSTRAINT `ccnls_externalId_unique` UNIQUE(`externalId`)
);
