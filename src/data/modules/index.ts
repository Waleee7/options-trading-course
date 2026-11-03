import type { Module } from "../types";
import { truthModules } from "./truth";
import { mechanicsModules } from "./mechanics";
import { greeksModules } from "./greeks";
import { volatilityModules } from "./volatility";
import { strategyModules } from "./strategies";
import { riskModules } from "./risk";
import { processModules } from "./process";

export const modules: Module[] = [
  ...truthModules,
  ...mechanicsModules,
  ...greeksModules,
  ...volatilityModules,
  ...strategyModules,
  ...riskModules,
  ...processModules,
];

export const getModule = (id: string): Module | undefined => modules.find((m) => m.id === id);
export const moduleIndex = (id: string): number => modules.findIndex((m) => m.id === id);
export const totalXp = (): number => modules.reduce((s, m) => s + m.xp, 0);
