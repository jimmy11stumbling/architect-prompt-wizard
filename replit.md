# Replit.md

## Overview

This repository contains a full-stack web application built with React and Express, featuring an advanced Intelligent Prompt Architect (IPA) system. The application integrates multiple AI technologies including RAG 2.0, Agent-to-Agent (A2A) communication protocols, and Model Context Protocol (MCP) for creating sophisticated AI-powered prompts.

## System Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **UI Framework**: Tailwind CSS with Shadcn UI components
- **Build System**: Vite with hot module replacement
- **State Management**: TanStack React Query for server state
- **Routing**: React Router for client-side navigation
- **Component Library**: Radix UI primitives with custom styling

### Backend Architecture

- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Session-based with connect-pg-simple
- **API Design**: RESTful endpoints with /api prefix
- **Development**: TSX for TypeScript execution

### Database Layer

- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type safety
- **Migrations**: Stored in `./migrations` directory
- **Connection**: Neon serverless with WebSocket support

## Key Components

### Intelligent Prompt Architect (IPA)

The core system orchestrates multiple AI agents to generate sophisticated prompts:

1. **Agent System**: 12 specialized agents including reasoning, context analysis, and documentation
2. **Generation Orchestrator**: Manages multi-step agent processing pipeline
3. **Conversation Management**: Maintains context across agent interactions
4. **Real-time Updates**: Provides live status updates during generation

### RAG 2.0 Implementation

Advanced retrieval-augmented generation with:

- **Hybrid Search Engine**: Combines semantic and keyword search
- **Document Processing**: Semantic chunking with structure preservation
- **Context Compression**: Intelligent context window management
- **Vector Embeddings**: Custom embedding generation and similarity matching

### Agent-to-Agent (A2A) Communication

Multi-agent coordination system featuring:

- **Protocol Definition**: Standardized message formats and discovery
- **Coordination Patterns**: Agent workflow orchestration
- **Communication Channels**: Real-time agent-to-agent messaging

### Model Context Protocol (MCP)

Standardized tool and resource integration:

- **Server Management**: Multiple MCP server connections
- **Tool Registry**: Filesystem, web search, and database tools
- **Resource Access**: Configuration, documentation, and API specs

### Workflow Engine

Advanced workflow orchestration system:

- **Visual Workflow Builder**: Drag-and-drop workflow creation
- **Step Execution**: Parallel and sequential step processing
- **Monitoring**: Real-time execution tracking and metrics
- **Templates**: Pre-built workflow templates for common tasks

## Data Flow

1. **User Input**: Project specifications through React forms
2. **Validation**: Client and server-side specification validation
3. **Agent Processing**: Sequential processing through 12 specialized agents
4. **Real-time Updates**: WebSocket-like updates via polling
5. **Result Generation**: Final prompt compilation from agent outputs
6. **Database Storage**: Persistence of prompts and generation history

## External Dependencies

### Core Dependencies

- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **tailwindcss**: Utility-first CSS framework

### AI/ML Integration

- **DeepSeek API**: Primary AI model for agent processing
- **Vector Database**: Support for Pinecone, Weaviate, Qdrant
- **Embedding Models**: Text embedding generation

### Development Tools

- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast development build system
- **ESBuild**: Production bundling
- **Drizzle Kit**: Database migration management

## Deployment Strategy

### Development Environment

- **Runtime**: Node.js 20 with Replit modules
- **Database**: PostgreSQL 16 module
- **Port Configuration**: 5000 (local) → 80 (external)
- **Hot Reload**: Vite development server with HMR

### Production Build

- **Frontend**: Vite build to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Database**: Drizzle migrations with push command
- **Deployment**: Autoscale deployment target

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)
- Additional AI API keys as needed

## Changelog

- June 27, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.