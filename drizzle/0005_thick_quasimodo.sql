CREATE TABLE `ccnl_monthly_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ccnlId` int NOT NULL,
	`referenceMonth` varchar(7) NOT NULL,
	`numCompanies` int NOT NULL,
	`numWorkers` int NOT NULL,
	`numWorkersMale` int,
	`numWorkersFemale` int,
	`dataSource` enum('cnel_inps','estimate','manual') NOT NULL DEFAULT 'estimate',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ccnl_monthly_stats_id` PRIMARY KEY(`id`)
);
