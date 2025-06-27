
import { useState, useEffect } from "react";
import { systemIntegrationService } from "../systemIntegrationService";
import { IntegratedQueryRequest, IntegratedQueryResponse, SystemHealthStatus } from "../types";

export const useSystemIntegration = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      setIsLoading(true);
      await systemIntegrationService.initialize();
      setIsInitialized(true);
      await checkSystemHealth();
    } catch (error) {
      console.error("Failed to initialize system:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSystemHealth = async () => {
    try {
      const health = await systemIntegrationService.getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      console.error("Failed to check system health:", error);
    }
  };

  const executeQuery = async (request: IntegratedQueryRequest): Promise<IntegratedQueryResponse | null> => {
    try {
      return await systemIntegrationService.executeIntegratedQuery(request);
    } catch (error) {
      console.error("Failed to execute integrated query:", error);
      return null;
    }
  };

  return {
    isInitialized,
    systemHealth,
    isLoading,
    initializeSystem,
    checkSystemHealth,
    executeQuery
  };
};
