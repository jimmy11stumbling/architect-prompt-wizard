
import { ProjectSpec } from "@/types/ipa-types";
import { StatusManager } from "../../status/statusManager";
import { AgentExecutor } from "./agentExecutor";
import { ResultGenerator } from "./resultGenerator";

export class GenerationManager {
  private statusManager: StatusManager;

  constructor(statusManager: StatusManager) {
    this.statusManager = statusManager;
  }

  async processAgent(currentStep: number, currentProjectSpec: ProjectSpec): Promise<void> {
    await AgentExecutor.executeAgent(currentStep - 1, currentProjectSpec, this.statusManager);
  }

  async generateFinalResult(currentProjectSpec: ProjectSpec): Promise<void> {
    await ResultGenerator.generateFinalResult(this.statusManager, currentProjectSpec);
  }
}
