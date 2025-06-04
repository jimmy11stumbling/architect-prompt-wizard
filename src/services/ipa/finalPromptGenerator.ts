
import { AgentStatus } from "@/types/ipa-types";
import { BlueprintBuilder } from "./finalPrompt/blueprintBuilder";

export class FinalPromptGenerator {
  static async generate(agents: AgentStatus[]): Promise<string> {
    return BlueprintBuilder.build(agents);
  }

  private static estimateCharacterCount(agentOutputs: any[]): string {
    return BlueprintBuilder.estimateCharacterCount(agentOutputs);
  }
}
