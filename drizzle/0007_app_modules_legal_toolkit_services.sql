ALTER TABLE `users` MODIFY COLUMN `role` enum('user','consultant','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint

CREATE TABLE `legal_sources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('law','decree','legislative_decree','circular','practice','jurisprudence','contract','other') NOT NULL,
  `title` varchar(600) NOT NULL,
  `issuingBody` varchar(255),
  `officialUrl` varchar(1200),
  `publishedAt` varchar(32),
  `effectiveFrom` varchar(32),
  `effectiveTo` varchar(32),
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `summary` text,
  `body` text,
  `createdBy` int,
  `lastReviewedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);--> statement-breakpoint

CREATE TABLE `legal_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `legal_tags_name_unique` (`name`)
);--> statement-breakpoint

CREATE TABLE `legal_source_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sourceId` int NOT NULL,
  `tagId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
);--> statement-breakpoint

CREATE TABLE `legal_source_versions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sourceId` int NOT NULL,
  `version` varchar(32) NOT NULL,
  `changeNote` text,
  `createdBy` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
);--> statement-breakpoint

CREATE TABLE `checklists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(300) NOT NULL,
  `category` varchar(120) NOT NULL,
  `description` text,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `createdBy` int,
  `lastReviewedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);--> statement-breakpoint

CREATE TABLE `checklist_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `checklistId` int NOT NULL,
  `position` int NOT NULL,
  `text` varchar(800) NOT NULL,
  `notes` text,
  `isRequired` int NOT NULL DEFAULT 1,
  `referenceSourceId` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);--> statement-breakpoint

CREATE TABLE `templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(300) NOT NULL,
  `category` varchar(120) NOT NULL,
  `description` text,
  `format` enum('plaintext','markdown') NOT NULL DEFAULT 'markdown',
  `content` text NOT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `createdBy` int,
  `lastReviewedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);--> statement-breakpoint

CREATE TABLE `template_fields` (
  `id` int NOT NULL AUTO_INCREMENT,
  `templateId` int NOT NULL,
  `name` varchar(80) NOT NULL,
  `label` varchar(200) NOT NULL,
  `fieldType` enum('text','date','number','email') NOT NULL DEFAULT 'text',
  `required` int NOT NULL DEFAULT 1,
  `defaultValue` varchar(400),
  `helpText` varchar(600),
  `position` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
);--> statement-breakpoint

CREATE TABLE `files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ownerUserId` int,
  `originalName` varchar(255) NOT NULL,
  `mimeType` varchar(120) NOT NULL,
  `sizeBytes` int NOT NULL,
  `provider` enum('local','forge') NOT NULL DEFAULT 'local',
  `storageKey` varchar(1200) NOT NULL,
  `purpose` enum('service_request','service_doc','generic') NOT NULL DEFAULT 'generic',
  `visibility` enum('private','org','public') NOT NULL DEFAULT 'private',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
);--> statement-breakpoint

CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(300) NOT NULL,
  `category` varchar(120) NOT NULL,
  `description` text,
  `eligibility` text,
  `procedure` text,
  `slaDays` int,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `createdBy` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);--> statement-breakpoint

CREATE TABLE `service_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `serviceId` int NOT NULL,
  `title` varchar(300) NOT NULL,
  `fileId` int NOT NULL,
  `isRequired` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
);--> statement-breakpoint

CREATE TABLE `service_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `serviceId` int NOT NULL,
  `requesterUserId` int NOT NULL,
  `subject` varchar(300) NOT NULL,
  `notes` text,
  `status` enum('draft','submitted','in_review','needs_info','approved','rejected','closed') NOT NULL DEFAULT 'draft',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);--> statement-breakpoint

CREATE TABLE `service_request_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requestId` int NOT NULL,
  `fileId` int NOT NULL,
  `label` varchar(300),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
);--> statement-breakpoint

CREATE TABLE `service_request_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requestId` int NOT NULL,
  `fromStatus` varchar(32),
  `toStatus` varchar(32) NOT NULL,
  `note` text,
  `createdBy` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
);
