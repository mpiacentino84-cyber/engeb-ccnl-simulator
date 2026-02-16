ALTER TABLE `ccnls` ADD `numeroLavoratori` int;--> statement-breakpoint
ALTER TABLE `ccnls` ADD `numeroAziende` int;--> statement-breakpoint
ALTER TABLE `ccnls` ADD `fonteDati` varchar(128) DEFAULT 'simulato';--> statement-breakpoint
ALTER TABLE `ccnls` ADD `dataAggiornamentoDati` timestamp;