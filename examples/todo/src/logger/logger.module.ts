import { Module } from "@subversify/core";

import { LoggerService } from "./logger.service";

export class LoggerModule extends Module {
  bindings = [LoggerService];
  exposes = [LoggerService];
}
