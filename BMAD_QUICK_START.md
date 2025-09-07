# BMAD System Quick Start Guide

## What is BMAD?
BMAD (Breakthrough Method for Agile AI-Driven Development) is now installed in your Nano Banana project. It provides specialized AI agents that work together in an agile workflow.

## Available Agents

### Planning Phase Agents

#### 1. **Analyst** (*analyst)
- **Role**: Business Analyst - Mary
- **Use for**: Brainstorming, market research, competitive analysis, project briefs
- **Activate**: Type `*analyst` in Claude
- **Key tasks**: 
  - Create project brief
  - Research competitors
  - Brainstorm features

#### 2. **Product Manager** (*pm)
- **Role**: Product Manager - Oliver
- **Use for**: Creating PRDs, user stories, feature prioritization
- **Activate**: Type `*pm` in Claude
- **Key outputs**: 
  - Product Requirements Document (PRD)
  - User stories
  - Feature specifications

#### 3. **Architect** (*architect)
- **Role**: Solution Architect - Nina
- **Use for**: Technical design, system architecture, technology decisions
- **Activate**: Type `*architect` in Claude
- **Key outputs**:
  - Architecture document
  - Tech stack decisions
  - API design

### Development Phase Agents

#### 4. **Scrum Master** (*sm)
- **Role**: Scrum Master - Victor
- **Use for**: Sprint planning, story creation, task management
- **Activate**: Type `*sm` in Claude
- **Key tasks**:
  - Create development stories
  - Manage sprint backlog
  - Track progress

#### 5. **Developer** (*dev)
- **Role**: Senior Developer - Devin
- **Use for**: Implementation, coding, debugging
- **Activate**: Type `*dev` in Claude
- **Key tasks**:
  - Implement features
  - Write code
  - Fix bugs

#### 6. **QA Engineer** (*qa)
- **Role**: QA Engineer - Quinn
- **Use for**: Testing, validation, quality assurance
- **Activate**: Type `*qa` in Claude
- **Key tasks**:
  - Create test plans
  - Execute tests
  - Report issues

## Workflow for Hackathon

### Phase 1: Planning (Do this first!)
1. **Start with Analyst**: `*analyst`
   - Brainstorm project ideas
   - Research Gemini capabilities
   - Create project brief

2. **Move to PM**: `*pm`
   - Create PRD from brief
   - Define user stories
   - Prioritize features for hackathon

3. **Then Architect**: `*architect`
   - Design technical architecture
   - Plan API integrations
   - Define tech stack

### Phase 2: Development
1. **Scrum Master**: `*sm`
   - Break PRD into sprint stories
   - Create detailed tasks
   - Assign priorities

2. **Developer**: `*dev`
   - Implement stories
   - Integrate APIs
   - Build demo

3. **QA**: `*qa`
   - Test features
   - Validate demo
   - Ensure stability

## Key Commands

Each agent responds to these commands:
- `*help` - Show available commands for current agent
- `*exit` - Exit current agent mode
- `*status` - Show project status
- `*create` - Create relevant documents (PRD, stories, etc.)

## File Locations

BMAD creates and uses these files:
- **PRD**: `docs/prd.md`
- **Architecture**: `docs/architecture.md`
- **Stories**: `docs/stories/`
- **Test Plans**: `docs/qa/`
- **Agents**: `bmad-core/agents/`
- **Templates**: `bmad-core/templates/`

## Quick Start for Hackathon

1. **Activate Analyst**: Type `*analyst`
2. Say: "Let's brainstorm innovative consumer apps using Gemini 2.5 Flash Image"
3. Follow the structured workflow through each agent
4. Each agent will guide you to the next step

## Tips

- Each agent has a specific personality and expertise
- They maintain context about your hackathon project
- Use agents in sequence for best results
- The system knows about your Gemini, ElevenLabs, and Fal AI integrations

## Example Session

```
You: *analyst
Claude (as Mary): Hello! I'm Mary, your Business Analyst...

You: Let's create a project brief for an app that uses Gemini's character consistency

Claude (as Mary): Excellent! Let me help you explore that idea...
[Creates structured brief]

You: *pm
Claude (as Oliver): Hi! I'm Oliver, your Product Manager...

You: Create a PRD from the brief Mary created

Claude (as Oliver): I'll review Mary's brief and create a comprehensive PRD...
[Creates PRD document]
```

## For Your Hackathon

The BMAD system is configured to know about:
- Nano Banana Hackathon specifics
- Gemini 2.5 Flash Image capabilities
- ElevenLabs and Fal AI partnerships
- Consumer application focus
- Google DeepMind judges

Each agent will consider these factors in their recommendations!