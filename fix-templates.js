import fs from 'fs';

// Read the template file
const filePath = 'client/src/components/templates/TemplateDialog.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add the missing platform configuration to all spec objects that don't have it
const specPattern = /spec: \{\s*([^}]*projectDescription:[^}]*)\}/gs;

const defaultPlatformConfig = `      targetPlatform: "cursor",
      platformSpecificConfig: {
        supportedFeatures: ["AI Integration", "Modern UI"],
        preferredTechStack: ["React", "TypeScript"],
        deploymentOptions: ["Vercel", "Netlify"],
        limitations: [],
        bestPractices: ["Performance optimization", "User experience"],
        promptStyle: "conversational",
        contextPreferences: ["modern", "scalable"],
        outputFormat: "detailed"
      },`;

// Replace all spec blocks that don't already have targetPlatform
content = content.replace(/spec: \{\s*(?!.*targetPlatform)([^}]*projectDescription:[^}]*)\}/gs, 
  `spec: {
${defaultPlatformConfig}
      $1}`);

// Write the fixed content back
fs.writeFileSync(filePath, content);
console.log('Fixed all template TypeScript errors');