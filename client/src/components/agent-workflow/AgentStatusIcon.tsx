
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Cpu, AlertCircle } from "lucide-react";
import { AgentStatus } from "@/types/ipa-types";

interface AgentStatusIconProps {
  status: AgentStatus["status"];
}

const AgentStatusIcon: React.FC<AgentStatusIconProps> = ({ status }) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-ipa-success" />;
    case "processing":
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Cpu className="h-5 w-5 text-ipa-primary" />
        </motion.div>
      );
    case "failed":
    case "error":
      return <AlertCircle className="h-5 w-5 text-ipa-error" />;
    default:
      return <Circle className="h-5 w-5 text-ipa-muted" />;
  }
};

export default AgentStatusIcon;
