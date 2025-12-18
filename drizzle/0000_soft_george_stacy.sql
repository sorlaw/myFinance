CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` integer NOT NULL,
	`category` text NOT NULL,
	`type` text NOT NULL,
	`date` integer NOT NULL,
	`note` text
);
