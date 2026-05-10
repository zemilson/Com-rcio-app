CREATE TABLE `admin_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceUrl` text NOT NULL,
	`parserType` enum('json','rss','html','csv') NOT NULL,
	`cssSelector` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastClonedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clone_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceUrl` text NOT NULL,
	`parserType` enum('json','rss','html','csv') NOT NULL,
	`offersCount` int NOT NULL,
	`status` enum('success','error') NOT NULL,
	`errorMessage` text,
	`clonedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clone_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` longtext,
	`price` decimal(10,2),
	`originalPrice` decimal(10,2),
	`image` text,
	`source` varchar(255) NOT NULL,
	`sourceUrl` text,
	`originalUrl` text,
	`expiresAt` timestamp,
	`clonedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_comparisons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerId` int NOT NULL,
	`store` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`url` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `price_comparisons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planType` enum('monthly','annual') NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`mercadoPagoId` varchar(255),
	`status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trial_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceId` varchar(255) NOT NULL,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trial_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `deviceId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_deviceId_unique` UNIQUE(`deviceId`);