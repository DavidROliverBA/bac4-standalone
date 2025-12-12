# BAC4 JSON Format and HLD Automation Guide

**Comprehensive guide for using BAC4 Standalone JSON models with AI-generated High Level Design (HLD) documents**

---

## Table of Contents

1. [Overview](#overview)
2. [BAC4 JSON Format Specification](#bac4-json-format-specification)
3. [Mapping C4 Models to HLD Documents](#mapping-c4-models-to-hld-documents)
4. [AI Prompt Engineering for HLD Generation](#ai-prompt-engineering-for-hld-generation)
5. [Example Prompts Library](#example-prompts-library)
6. [Workflow Integration](#workflow-integration)
7. [Advanced Use Cases](#advanced-use-cases)
8. [Best Practices](#best-practices)

---

## Overview

### Purpose

This guide enables solution architects to:
- Understand the BAC4 JSON model format
- Use AI (Claude, ChatGPT, etc.) to automatically generate HLD documentation from C4 models
- Modify existing models programmatically using structured prompts
- Integrate C4 architecture diagrams with Confluence HLD templates

### Benefits

✅ **Consistency**: Standardized JSON format ensures consistent architecture documentation
✅ **Automation**: Generate comprehensive HLDs from structured data
✅ **Maintainability**: Update diagrams and regenerate documentation as architecture evolves
✅ **Version Control**: JSON files work seamlessly with Git workflows
✅ **AI-Friendly**: Structured format optimized for AI parsing and generation

---

## BAC4 JSON Format Specification

### Root Structure

```json
{
  "metadata": { ... },
  "systems": [ ... ],
  "containers": [ ... ],
  "components": [ ... ],
  "people": [ ... ],
  "externalSystems": [ ... ],
  "relationships": [ ... ]
}
```

### Metadata Object

Contains project-level information:

```json
{
  "metadata": {
    "name": "Payment Processing System",
    "version": "2.1",
    "author": "Solution Architecture Team"
  }
}
```

**Fields:**
- `name` (string, required): Project or system name
- `version` (string, required): Architecture version (semantic versioning recommended)
- `author` (string, required): Author or team responsible

**HLD Mapping**: Use for document title, version history, and author attribution.

---

### Element Structure (Systems, Containers, Components)

All element types share a common structure:

```json
{
  "id": "system-1698765432123-abc123def",
  "type": "system",
  "name": "Payment Gateway",
  "description": "Handles payment processing and fraud detection for all transactions",
  "technology": "Java Spring Boot, PostgreSQL",
  "tags": ["payment", "critical", "pci-compliant"],
  "position": {
    "x": 350,
    "y": 200
  }
}
```

**Field Specifications:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (format: `{type}-{timestamp}-{random}`) |
| `type` | string | Yes | Element type: `system`, `container`, `component`, `person`, `externalSystem` |
| `name` | string | Yes | Display name (business-focused, concise) |
| `description` | string | No | Purpose and responsibilities (1-3 sentences) |
| `technology` | string | No | Technology stack, programming languages, frameworks |
| `tags` | array[string] | No | Categorization tags (domain, status, criticality) |
| `position` | object | Yes | Canvas coordinates `{x: number, y: number}` |

**HLD Mapping:**
- `name` → Component headings, table rows
- `description` → Component descriptions, functionality sections
- `technology` → Technology stack sections, implementation details
- `tags` → Categorization, filtering (e.g., show only "critical" components)

---

### Systems Array

Software systems or applications (Context level):

```json
{
  "systems": [
    {
      "id": "system-1698765432123-abc123def",
      "type": "system",
      "name": "E-Commerce Platform",
      "description": "Primary customer-facing e-commerce application",
      "technology": "React, Node.js, MongoDB",
      "tags": ["core", "customer-facing"],
      "position": { "x": 400, "y": 300 }
    }
  ]
}
```

**When to Use**: Context diagrams showing system landscape, external integrations.

**HLD Mapping**:
- System Overview section
- External Dependencies section
- Integration Architecture

---

### Containers Array

Applications, services, databases (Container level):

```json
{
  "containers": [
    {
      "id": "container-1698765555555-xyz789ghi",
      "type": "container",
      "name": "API Gateway",
      "description": "Routes and authenticates all API requests",
      "technology": "Kong Gateway, Lua, Redis",
      "tags": ["infrastructure", "security"],
      "position": { "x": 500, "y": 400 }
    },
    {
      "id": "container-1698765666666-def456jkl",
      "type": "container",
      "name": "Order Service",
      "description": "Manages order lifecycle from creation to fulfillment",
      "technology": "Spring Boot, PostgreSQL, RabbitMQ",
      "tags": ["microservice", "core"],
      "position": { "x": 700, "y": 400 }
    },
    {
      "id": "container-1698765777777-mno123pqr",
      "type": "container",
      "name": "PostgreSQL Database",
      "description": "Primary data store for order and customer data",
      "technology": "PostgreSQL 15, pgBouncer",
      "tags": ["database", "critical"],
      "position": { "x": 700, "y": 550 }
    }
  ]
}
```

**When to Use**: Container diagrams showing system decomposition, microservices architecture.

**HLD Mapping**:
- Component Architecture section
- Service Catalog
- Data Storage Architecture
- Technology Stack details

---

### Components Array

Internal modules, classes, packages (Component level):

```json
{
  "components": [
    {
      "id": "component-1698765888888-stu456vwx",
      "type": "component",
      "name": "Order Validator",
      "description": "Validates order data and business rules before processing",
      "technology": "Java, Bean Validation",
      "tags": ["validation", "business-logic"],
      "position": { "x": 600, "y": 250 }
    }
  ]
}
```

**When to Use**: Component diagrams showing internal structure of containers.

**HLD Mapping**:
- Detailed Component Design section
- Class/Module descriptions
- Internal Architecture

---

### People Array

Users, personas, actors (all levels):

```json
{
  "people": [
    {
      "id": "person-1698765999999-yza789bcd",
      "type": "person",
      "name": "Customer",
      "description": "End user purchasing products through the platform",
      "technology": "Web Browser, Mobile App",
      "tags": ["external", "end-user"],
      "position": { "x": 200, "y": 300 }
    },
    {
      "id": "person-1698766111111-efg123hij",
      "type": "person",
      "name": "Operations Team",
      "description": "Internal team managing order fulfillment and customer support",
      "technology": "Admin Dashboard",
      "tags": ["internal", "operations"],
      "position": { "x": 200, "y": 500 }
    }
  ]
}
```

**When to Use**: All diagram types to show actors and users.

**HLD Mapping**:
- Stakeholders section
- User Personas
- Access Control (who uses what)

---

### External Systems Array

Third-party systems, external APIs (Context/Container levels):

```json
{
  "externalSystems": [
    {
      "id": "externalSystem-1698766222222-klm456nop",
      "type": "externalSystem",
      "name": "Stripe Payment Gateway",
      "description": "Third-party payment processing service",
      "technology": "REST API, Webhook",
      "tags": ["external", "payment", "third-party"],
      "position": { "x": 900, "y": 300 }
    },
    {
      "id": "externalSystem-1698766333333-qrs789tuv",
      "type": "externalSystem",
      "name": "SendGrid Email Service",
      "description": "Email delivery service for transactional emails",
      "technology": "REST API, SMTP",
      "tags": ["external", "email"],
      "position": { "x": 900, "y": 500 }
    }
  ]
}
```

**When to Use**: Context and Container diagrams showing external dependencies.

**HLD Mapping**:
- External Dependencies section
- Third-Party Integrations
- Vendor Management

---

### Relationships Array

Connections, data flows, interactions between elements:

```json
{
  "relationships": [
    {
      "id": "rel-1698766444444-wxy123zab",
      "from": "person-1698765999999-yza789bcd",
      "to": "container-1698765555555-xyz789ghi",
      "description": "Places orders via",
      "technology": "HTTPS/REST",
      "arrowDirection": "right",
      "lineStyle": "solid",
      "animated": false
    },
    {
      "id": "rel-1698766555555-cde456fgh",
      "from": "container-1698765555555-xyz789ghi",
      "to": "container-1698765666666-def456jkl",
      "description": "Routes requests to",
      "technology": "gRPC",
      "arrowDirection": "right",
      "lineStyle": "solid",
      "animated": false
    },
    {
      "id": "rel-1698766666666-ijk789lmn",
      "from": "container-1698765666666-def456jkl",
      "to": "container-1698765777777-mno123pqr",
      "description": "Reads and writes order data",
      "technology": "JDBC/PostgreSQL",
      "arrowDirection": "both",
      "lineStyle": "solid",
      "animated": false
    },
    {
      "id": "rel-1698766777777-opq123rst",
      "from": "container-1698765666666-def456jkl",
      "to": "externalSystem-1698766222222-klm456nop",
      "description": "Processes payments via",
      "technology": "REST API/HTTPS",
      "arrowDirection": "right",
      "lineStyle": "dashed",
      "animated": true
    }
  ]
}
```

**Field Specifications:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `from` | string | Yes | Source element ID |
| `to` | string | Yes | Target element ID |
| `description` | string | Yes | Relationship description (verb phrase) |
| `technology` | string | No | Protocol, API type, communication method |
| `arrowDirection` | string | Yes | `"right"`, `"left"`, `"both"`, `"none"` |
| `lineStyle` | string | Yes | `"solid"`, `"dashed"`, `"dotted"` |
| `animated` | boolean | No | Visual indicator for async communication |

**Arrow Direction Semantics:**
- `"right"`: Data flows from source → target (most common)
- `"left"`: Data flows from target ← source (reverse dependency)
- `"both"`: Bidirectional data flow ↔
- `"none"`: Association without specific direction

**Line Style Semantics:**
- `"solid"`: Synchronous communication (REST, gRPC, SQL)
- `"dashed"`: Asynchronous communication (events, queues)
- `"dotted"`: Optional or future integration

**HLD Mapping**:
- Integration Flows section
- Data Flow Diagrams
- Communication Patterns
- API Documentation
- Dependency Matrix

---

## Mapping C4 Models to HLD Documents

### Typical HLD Document Structure

Most HLD templates include these sections (adapt to your organization's template):

1. **Document Control** → `metadata`
2. **Executive Summary** → `metadata.name`, high-level systems overview
3. **Architecture Overview** → Context diagram (systems, people, externalSystems)
4. **Component Architecture** → Container diagram (containers, relationships)
5. **Detailed Design** → Component diagram (components, relationships)
6. **Technology Stack** → Aggregate all `technology` fields
7. **Integration Architecture** → All relationships with `technology` details
8. **Data Architecture** → Database containers + relationships
9. **Security Architecture** → Tag-filtered elements (`security`, `authentication`)
10. **Non-Functional Requirements** → Derived from tags and descriptions

### Mapping Strategy

#### Context Diagram → System Overview

**From JSON:**
```json
{
  "systems": [...],
  "people": [...],
  "externalSystems": [...],
  "relationships": [filter: from/to includes systems]
}
```

**To HLD Section:**
```markdown
## System Context

### Overview
[metadata.name] integrates with [count(externalSystems)] external systems
and serves [count(people)] user types.

### External Systems
- [externalSystem.name]: [externalSystem.description] ([externalSystem.technology])

### User Roles
- [person.name]: [person.description]
```

---

#### Container Diagram → Component Architecture

**From JSON:**
```json
{
  "containers": [...],
  "relationships": [filter: container-to-container]
}
```

**To HLD Section:**
```markdown
## Component Architecture

### Services
| Service | Purpose | Technology |
|---------|---------|------------|
| [container.name] | [container.description] | [container.technology] |

### Communication Patterns
- [from.name] → [to.name]: [description] ([technology])
```

---

#### Tags → Filtering and Categorization

**Example: Critical Components**

```json
{
  "containers": [
    {"tags": ["critical", "payment"]},
    {"tags": ["critical", "order"]},
    {"tags": ["non-critical", "reporting"]}
  ]
}
```

**Filter in Prompt:**
```
List all containers with tag "critical" for the Business Continuity section
```

**Result:**
```markdown
## Business Continuity - Critical Components
- Payment Gateway (critical, PCI-compliant)
- Order Service (critical, core business logic)
```

---

## AI Prompt Engineering for HLD Generation

### General Principles

**1. Provide Complete Context**
- Always include the full JSON model in the prompt
- Specify the target HLD template structure
- Define output format (Markdown, Confluence wiki markup, HTML)

**2. Be Explicit About Structure**
- Reference specific JSON paths (e.g., "metadata.name", "containers[].technology")
- Specify filtering criteria (e.g., "only containers with tag 'microservice'")
- Define sorting order (e.g., "alphabetical by name")

**3. Use Few-Shot Examples**
- Provide 1-2 examples of desired output format
- Show how to handle edge cases (missing fields, no relationships)

**4. Iterate and Refine**
- Start with one section, validate output
- Build a library of validated prompts
- Version control your prompts alongside JSON models

---

### Prompt Template Structure

```
[ROLE DEFINITION]
You are a solution architect creating a High Level Design document.

[TASK DEFINITION]
Generate the [SECTION NAME] section of an HLD document based on the C4 model below.

[INPUT DATA]
C4 Model JSON:
```json
{...}
```

[OUTPUT REQUIREMENTS]
- Format: [Markdown/Confluence/HTML]
- Structure: [Specify headers, tables, lists]
- Include: [What to include]
- Exclude: [What to omit]
- Style: [Technical, business-focused, detailed, concise]

[SPECIAL INSTRUCTIONS]
- [Any filtering, sorting, or transformation rules]
- [Handling of missing data]
- [Cross-referencing requirements]

[EXAMPLE OUTPUT] (optional)
[Show 1-2 examples of expected output]
```

---

## Example Prompts Library

### Prompt 1: Generate Complete HLD from JSON

```
You are a solution architect creating a comprehensive High Level Design (HLD) document for a software system.

TASK:
Generate a complete HLD document in Markdown format based on the C4 model JSON below. Follow standard HLD structure.

INPUT:
```json
{
  "metadata": {
    "name": "Payment Processing System",
    "version": "2.1",
    "author": "Solution Architecture Team"
  },
  "systems": [...],
  "containers": [...],
  "components": [...],
  "people": [...],
  "externalSystems": [...],
  "relationships": [...]
}
```

DOCUMENT STRUCTURE:
1. Document Control (metadata)
2. Executive Summary (high-level overview)
3. Architecture Overview (Context diagram in text)
4. Component Architecture (Container diagram in text)
5. Technology Stack (aggregated from all technology fields)
6. Integration Architecture (relationships with protocols)
7. Data Architecture (database containers)
8. Security Considerations (security-tagged elements)

OUTPUT REQUIREMENTS:
- Use Markdown with ## headings for sections
- Create tables for component lists
- Use bullet points for relationships
- Include all descriptions verbatim
- Cross-reference between sections using component names
- Professional, technical tone suitable for senior stakeholders

FORMATTING:
- Component names in **bold**
- Technology in `code format`
- Relationships as: Source → Target: Description (Protocol)

Generate the complete HLD document now.
```

---

### Prompt 2: Extract Technology Stack Summary

```
You are a technical architect extracting technology information from a C4 model.

TASK:
Create a comprehensive Technology Stack section for an HLD document by analyzing all technology fields in the JSON below.

INPUT:
```json
{...full JSON model...}
```

OUTPUT REQUIREMENTS:
Create a table with these columns:
| Category | Technology | Used In | Purpose |

CATEGORIZATION:
- Programming Languages (Java, Python, JavaScript, etc.)
- Frameworks (Spring Boot, React, etc.)
- Databases (PostgreSQL, MongoDB, etc.)
- Infrastructure (Docker, Kubernetes, etc.)
- Communication (REST, gRPC, RabbitMQ, etc.)
- External Services (Stripe, SendGrid, etc.)

RULES:
- Parse all "technology" fields from systems, containers, components
- Parse all "technology" fields from relationships (protocols)
- Group similar technologies (e.g., "React 18" and "React" → "React")
- List all components using each technology in "Used In" column
- Infer purpose from component descriptions

Generate the Technology Stack table now.
```

---

### Prompt 3: Generate Integration Flow Documentation

```
You are a solution architect documenting integration patterns.

TASK:
Create the "Integration Architecture" section of an HLD by analyzing all relationships in the C4 model.

INPUT:
```json
{
  "containers": [...],
  "externalSystems": [...],
  "relationships": [...]
}
```

OUTPUT STRUCTURE:

### Internal Integrations
(Container-to-container relationships)

### External Integrations
(Container-to-externalSystem relationships)

### Communication Patterns
- Synchronous: (solid line relationships)
- Asynchronous: (dashed line relationships)
- Bidirectional: (arrowDirection: "both")

FORMAT FOR EACH INTEGRATION:
**[Source] → [Target]**
- **Purpose**: [relationship.description]
- **Protocol**: [relationship.technology]
- **Pattern**: [Sync/Async based on lineStyle]
- **Data Flow**: [based on arrowDirection]

RULES:
- Group by integration type (internal/external)
- Sort alphabetically by source component name
- Highlight critical integrations (if "critical" tag present)
- Note any missing technology specifications

Generate the Integration Architecture section now.
```

---

### Prompt 4: Create Data Architecture Section

```
You are a data architect documenting data storage and flows.

TASK:
Generate the "Data Architecture" section by identifying all data stores and data flows.

INPUT:
```json
{
  "containers": [...],
  "relationships": [...]
}
```

IDENTIFICATION RULES:
- Data stores: containers with type containing "database", "cache", "storage" in name OR tags ["database", "cache", "data-store"]
- Data flows: relationships where target is a data store OR relationship contains "read", "write", "query", "store" in description

OUTPUT STRUCTURE:

## Data Stores

| Data Store | Type | Technology | Purpose |
|------------|------|------------|---------|
| [name] | [infer from technology] | [technology] | [description] |

## Data Access Patterns

### [Data Store Name]
**Accessed By:**
- [Consumer 1]: [access pattern from relationship description]
- [Consumer 2]: [access pattern from relationship description]

**Access Method**: [relationship.technology]

ADDITIONAL SECTIONS:
- Identify master data stores (most incoming relationships)
- Identify read-only vs read-write patterns (from relationship arrowDirection)
- Note any potential data consistency issues (multiple writers)

Generate the Data Architecture section now.
```

---

### Prompt 5: Update Existing JSON Model

```
You are a solution architect modifying a C4 architecture model.

TASK:
Update the JSON model below to implement the following change:

CHANGE REQUEST:
[Describe the architectural change, e.g.:]
- Add a new Redis cache container between the API Gateway and Order Service
- Container name: "Order Cache"
- Technology: "Redis 7, Sentinel"
- Description: "Caches order data to reduce database load"
- Tags: ["cache", "performance"]
- Position: between existing containers

CURRENT MODEL:
```json
{...full JSON model...}
```

OUTPUT REQUIREMENTS:
- Return the complete updated JSON model
- Add the new container to the "containers" array
- Add relationships:
  - API Gateway → Order Cache: "Checks cache before forwarding request" (HTTPS)
  - Order Cache → Order Service: "Fetches data on cache miss" (Redis Protocol)
  - Order Cache → PostgreSQL Database: "None" (cache doesn't directly access DB)
- Generate valid IDs using the pattern: container-[timestamp]-[random]
- Set position coordinates that make sense visually (between related components)
- Maintain all existing data unchanged

Return only the complete, valid JSON model.
```

---

### Prompt 6: Generate Confluence Wiki Markup

```
You are converting a C4 model to Confluence wiki markup for direct paste into Confluence.

TASK:
Generate Confluence Storage Format (wiki markup) for the Component Architecture section.

INPUT:
```json
{
  "containers": [...],
  "relationships": [...]
}
```

OUTPUT FORMAT:
Use Confluence macros and formatting:
- Headers: h2. Section Name
- Tables: || Header 1 || Header 2 || ... |
- Code: {{code:language=json}}...{{code}}
- Panels: {panel:title=Important}{panel}
- Colored boxes: {info}, {note}, {warning}

TEMPLATE:
h2. Component Architecture

h3. Services Overview
|| Service Name || Purpose || Technology Stack || Tags ||
| [name] | [description] | [technology] | [tags.join(', ')] |

h3. Service Dependencies
{info}
This diagram shows runtime dependencies between services.
{info}

* *[from.name]* → *[to.name]*
** Purpose: [description]
** Protocol: [technology]
** Pattern: [sync/async from lineStyle]

h3. Technology Stack
{panel:title=Technologies Used}
[Aggregate unique technologies from all containers]
{panel}

Generate the Confluence markup now.
```

---

### Prompt 7: Validate and Suggest Improvements

```
You are an experienced solution architect reviewing a C4 architecture model.

TASK:
Analyze the JSON model below and provide:
1. Validation errors (missing required fields, broken relationships)
2. Architecture anti-patterns
3. Improvement suggestions

INPUT:
```json
{...full JSON model...}
```

VALIDATION CHECKS:
1. All relationship "from" and "to" IDs exist in elements
2. All elements have descriptions
3. All relationships have descriptions and technology
4. No orphaned elements (elements with no relationships)
5. Containers with "database" in name have appropriate relationships
6. External systems are only targets, not sources (unless webhooks)

ARCHITECTURE REVIEW:
1. Check for overly complex relationships (>5 dependencies per component)
2. Identify missing patterns (e.g., no logging, no monitoring)
3. Check technology consistency (mixing paradigms without reason)
4. Identify security gaps (unencrypted communication to external systems)
5. Data flow issues (multiple services writing to same database)

OUTPUT FORMAT:
## Validation Errors
[List any broken references or missing required fields]

## Architecture Issues
### [Issue Category]
- **Component**: [name]
- **Issue**: [description]
- **Severity**: High/Medium/Low
- **Recommendation**: [specific action]

## Improvement Suggestions
[List architectural improvements with reasoning]

Perform the validation and review now.
```

---

### Prompt 8: Generate ADR (Architecture Decision Record)

```
You are documenting an architecture decision based on a C4 model change.

TASK:
Generate an Architecture Decision Record (ADR) based on comparing two versions of a C4 model.

INPUT:
Previous version:
```json
{...old JSON model...}
```

New version:
```json
{...new JSON model...}
```

DETECT CHANGES:
- New elements added
- Elements removed
- Relationships changed
- Technology changes

ADR TEMPLATE:
# ADR-[NUMBER]: [Title of Decision]

## Status
Accepted

## Context
[Describe the problem or opportunity that led to this decision]
[Reference specific components from the old model]

## Decision
[Describe what changed in the new model]
[List new components, changed relationships, technology shifts]

## Consequences

### Positive
- [Benefits of the change]

### Negative
- [Trade-offs or challenges introduced]

### Risks
- [Potential issues to monitor]

## Implementation
- [Steps needed to implement this architecture]
- [Components affected]
- [Integration changes required]

Generate the ADR now.
```

---

## Workflow Integration

### Workflow 1: Create New HLD from Scratch

**Step 1: Design in BAC4**
1. Open `bac4-standalone.html`
2. Create Context diagram (systems, people, external systems)
3. Add Container diagram (containers, databases)
4. Optionally add Component diagram
5. Add relationships with descriptions and protocols
6. Add tags for categorization

**Step 2: Export JSON**
1. Click Export → JSON
2. Save as `[project-name]-architecture.json`

**Step 3: Generate HLD with AI**
1. Open Claude/ChatGPT
2. Use **Prompt 1** (Generate Complete HLD)
3. Paste the JSON model
4. Specify your HLD template structure
5. Review and refine output

**Step 4: Import to Confluence**
1. Create new page from HLD template
2. Paste generated Markdown (or use Prompt 6 for Confluence markup)
3. Export diagrams as PNG from BAC4 (Export → PNG)
4. Embed PNG images in Confluence
5. Attach JSON file to page for future updates

**Step 5: Version Control**
1. Commit JSON to repository: `docs/architecture/[project]-v1.0.json`
2. Commit generated HLD: `docs/architecture/HLD-[project]-v1.0.md`
3. Tag release: `git tag arch-v1.0`

---

### Workflow 2: Update Existing HLD

**Step 1: Make Architecture Changes**
1. Open `bac4-standalone.html`
2. Import existing JSON (Import button)
3. Make changes (add containers, update relationships)
4. Update `metadata.version` to new version number
5. Export updated JSON

**Step 2: Generate Change Summary**
1. Use **Prompt 8** (Generate ADR)
2. Provide both old and new JSON
3. AI generates change summary

**Step 3: Regenerate Affected HLD Sections**
1. Use section-specific prompts (Prompts 2-4)
2. Generate only changed sections
3. Update Confluence page with new content

**Step 4: Update Diagrams**
1. Export new PNG from BAC4
2. Replace images in Confluence
3. Update version number in document control

**Step 5: Version Control**
1. Commit new JSON: `docs/architecture/[project]-v1.1.json`
2. Commit ADR: `docs/adr/ADR-005-add-cache-layer.md`
3. Update HLD document
4. Tag new version: `git tag arch-v1.1`

---

### Workflow 3: British Airways Confluence Integration

**Assumptions** (adapt to actual template):
- Template URL: `https://britishairways.atlassian.net/wiki/spaces/BDOC/pages/298352758/`
- Template has sections: Overview, Architecture, Components, Integration, Data, Security

**Step 1: Design Architecture in BAC4**
1. Follow standard BA naming conventions
2. Use BA-specific tags (e.g., `ba-core`, `flight-ops`, `pci-compliant`)
3. Include all BA-required metadata in element descriptions

**Step 2: Create Confluence Page**
1. Navigate to BDOC space
2. Create page from HLD template
3. Fill in standard BA metadata (project code, stakeholders, review dates)

**Step 3: Generate Content**

For each template section, use specialized prompts:

**Architecture Overview** (Context level)
```
Generate the Architecture Overview section for a British Airways HLD.

INPUT: [JSON with systems, people, externalSystems]

OUTPUT STRUCTURE per BA template:
1. System Context Diagram (describe the exported PNG)
2. External Systems table
3. User Personas table
4. Integration Points

Format in Confluence wiki markup.
```

**Component Architecture** (Container level)
```
Generate the Component Architecture section for a British Airways HLD.

INPUT: [JSON with containers, relationships]

OUTPUT STRUCTURE per BA template:
1. Component Diagram (describe the exported PNG)
2. Service Catalog table
3. Inter-Service Communication patterns
4. Technology Stack by component

Format in Confluence wiki markup with BA-specific tags highlighted.
```

**Integration Architecture**
```
Use Prompt 3 (Generate Integration Flow Documentation)
Customize for BA requirements:
- Highlight PCI-compliant integrations
- Note BA-specific protocols (e.g., NDC, Amadeus APIs)
- Include BA integration standards compliance
```

**Step 4: Embed Diagrams**
1. Export Context diagram as PNG: `ba-[project]-context.png`
2. Export Container diagram as PNG: `ba-[project]-container.png`
3. Upload to Confluence and embed in respective sections
4. Add figure captions per BA standards

**Step 5: Attach Artifacts**
1. Attach JSON file: `ba-[project]-architecture-v1.0.json`
2. Attach PlantUML export (if BA uses PlantUML)
3. Attach Mermaid export (for GitHub integration)
4. Link to source repository

**Step 6: Review and Approval**
1. Add reviewers per BA governance
2. Tag with appropriate labels (project name, domain, status)
3. Set page properties (version, owner, review date)

---

## Advanced Use Cases

### Use Case 1: Automated HLD Updates from JSON Changes

**Scenario**: JSON model is stored in Git, HLD should auto-update on changes.

**Solution**: GitHub Actions workflow

```yaml
name: Update HLD Documentation

on:
  push:
    paths:
      - 'docs/architecture/*.json'

jobs:
  update-hld:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Detect Changed JSON
        id: changes
        run: |
          echo "changed_file=$(git diff --name-only HEAD~1 | grep .json)" >> $GITHUB_OUTPUT

      - name: Generate HLD with Claude API
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # Call Claude API with Prompt 1
          # Pass the changed JSON file
          # Save output to docs/architecture/HLD-[project].md

      - name: Commit Updated HLD
        run: |
          git add docs/architecture/HLD-*.md
          git commit -m "Auto-update HLD from architecture changes"
          git push

      - name: Update Confluence
        env:
          CONFLUENCE_TOKEN: ${{ secrets.CONFLUENCE_TOKEN }}
        run: |
          # Use Confluence REST API to update page
          # Post generated content to page ID
```

---

### Use Case 2: Multi-Level HLD Generation

**Scenario**: Generate different HLD documents for different audiences from the same model.

**Executive Summary** (Context level only)
```
Generate an Executive Summary suitable for C-level stakeholders.

INPUT: [JSON - only metadata, systems, people, externalSystems]

FOCUS:
- Business capabilities
- External dependencies and risks
- High-level costs (number of systems, integrations)
- Strategic alignment

TONE: Business-focused, non-technical, 1-page maximum
```

**Technical Deep-Dive** (All levels)
```
Generate a Technical Architecture Document for engineering teams.

INPUT: [JSON - all levels]

FOCUS:
- Detailed component interactions
- Technology stack with versions
- API specifications (infer from relationships)
- Data flows and storage patterns
- Security controls
- Performance considerations (from tags)

TONE: Technical, detailed, includes code examples where relevant
```

**Integration Guide** (Relationships-focused)
```
Generate an Integration Developer Guide for partners/vendors.

INPUT: [JSON - focus on relationships with externalSystems]

FOCUS:
- External-facing APIs
- Authentication methods
- Data formats and protocols
- Rate limits and SLAs (if in descriptions)
- Error handling patterns

TONE: Developer-focused, includes examples, troubleshooting
```

---

### Use Case 3: Architecture Gap Analysis

**Scenario**: Compare current architecture (as-is) with target architecture (to-be).

```
You are performing an architecture gap analysis.

TASK:
Compare the current (as-is) and target (to-be) architectures and identify gaps.

CURRENT ARCHITECTURE:
```json
{...current-state.json...}
```

TARGET ARCHITECTURE:
```json
{...target-state.json...}
```

ANALYSIS DIMENSIONS:
1. Missing Components (in target, not in current)
2. Deprecated Components (in current, not in target)
3. New Integrations Required
4. Technology Migrations (same component, different technology)
5. Relationship Changes (protocol upgrades, pattern changes)

OUTPUT FORMAT:
## Gap Analysis Summary
- Total components to add: [count]
- Total components to deprecate: [count]
- Integrations to build: [count]
- Technology migrations: [count]

## Detailed Gaps

### Components to Add
| Component | Type | Technology | Purpose | Priority |
|-----------|------|------------|---------|----------|
| [name] | [type] | [technology] | [description] | [High/Med/Low] |

### Components to Deprecate
| Component | Replacement | Migration Strategy |
|-----------|-------------|-------------------|
| [old name] | [new name] | [describe migration] |

### New Integrations
| From | To | Protocol | Complexity |
|------|----|-----------| ---|
| [from] | [to] | [technology] | [High/Med/Low] |

## Implementation Roadmap
[Generate phased approach based on dependencies]

Phase 1 (Foundation):
- [List components with no dependencies]

Phase 2 (Core Services):
- [List components depending only on Phase 1]

Phase 3 (Integration):
- [List relationship/integration work]

Phase 4 (Migration):
- [List deprecation work]

Perform the gap analysis now.
```

---

### Use Case 4: Security Architecture Documentation

**Scenario**: Generate security-focused documentation from C4 model.

```
You are a security architect documenting security controls.

TASK:
Generate a Security Architecture Annex for the HLD by analyzing security aspects of the C4 model.

INPUT:
```json
{...full JSON model...}
```

SECURITY ANALYSIS:

1. **Trust Boundaries**
   - Identify external systems (untrusted)
   - Identify customer-facing components (internet-exposed)
   - Identify internal components (trusted zone)
   - Map relationships crossing trust boundaries

2. **Data Classification**
   - Infer from tags: "pci-compliant", "gdpr", "sensitive", "public"
   - Infer from names: "payment", "customer", "personal", "transaction"

3. **Authentication & Authorization**
   - Look for "API Gateway", "Auth Service" in component names
   - Look for "authentication" in relationship descriptions

4. **Encryption**
   - HTTPS/TLS in relationship.technology (encrypted)
   - HTTP (unencrypted - flag as risk)
   - Database connections (should be encrypted)

5. **Attack Surface**
   - All person→system relationships (entry points)
   - All externalSystem→system relationships (exposure)

OUTPUT STRUCTURE:

## Security Architecture

### Trust Zones
[Diagram description with zones marked]

### Trust Boundary Crossings
| From Zone | To Zone | Component | Protocol | Risk Level |
|-----------|---------|-----------|----------|------------|
| Internet | DMZ | [component] | [protocol] | [High/Med/Low] |

### Sensitive Data Flows
[List relationships involving components with "sensitive" tags]

### Authentication Points
[List all auth-related components and their relationships]

### Security Controls
| Component | Controls | Compliance |
|-----------|----------|------------|
| [name] | [infer from description/tags] | [PCI/GDPR/etc] |

### Security Recommendations
[List any security gaps or concerns]

Generate the Security Architecture Annex now.
```

---

## Best Practices

### JSON Model Best Practices

1. **Consistent Naming**
   - Use business-friendly names, not technical jargon
   - Example: "Order Service" not "OrderSvc" or "order-microservice-v2"

2. **Comprehensive Descriptions**
   - 1-3 sentences explaining purpose and responsibilities
   - Avoid generic descriptions ("handles orders" → "Manages order lifecycle from creation through fulfillment, including validation, payment processing, and status tracking")

3. **Explicit Technology Stacks**
   - Include versions where relevant: "PostgreSQL 15" not "PostgreSQL"
   - Include frameworks: "Spring Boot 3.2, Hibernate, JPA"
   - Include infrastructure: "Docker, Kubernetes, AWS ECS"

4. **Meaningful Tags**
   - **Status**: `legacy`, `new`, `deprecated`, `planned`
   - **Criticality**: `critical`, `important`, `standard`
   - **Domain**: `payment`, `order`, `customer`, `inventory`
   - **Compliance**: `pci-compliant`, `gdpr`, `hipaa`
   - **Architecture**: `microservice`, `monolith`, `serverless`

5. **Detailed Relationships**
   - Use action verbs: "Publishes order events to", "Queries customer data from"
   - Specify protocols precisely: "REST/HTTPS", "gRPC with mTLS", "Kafka (Avro)"
   - Use lineStyle intentionally: solid=sync, dashed=async

6. **Positioning Consistency**
   - Group related components visually
   - Place users/actors on the left
   - Place external systems on the right
   - Place data stores at the bottom

---

### Prompt Engineering Best Practices

1. **Version Your Prompts**
   - Store prompts in version control
   - Name pattern: `prompt-hld-overview-v1.md`
   - Update version when changing prompt logic

2. **Test with Edge Cases**
   - Empty arrays (no containers, no relationships)
   - Missing optional fields (no technology, no tags)
   - Complex relationships (many-to-many, circular dependencies)

3. **Validate AI Output**
   - Check for hallucinations (AI inventing components not in JSON)
   - Verify all component names match exactly
   - Confirm relationship directions are correct

4. **Iterate Incrementally**
   - Start with one section at a time
   - Build prompt library gradually
   - Refine based on actual output quality

5. **Use Structured Output Formats**
   - Request tables over prose (easier to validate)
   - Request Markdown (easily parseable)
   - Request JSON output for programmatic processing

6. **Handle Variability**
   - Provide fallback instructions for missing data
   - Example: "If technology field is empty, write 'Not specified'"
   - Example: "If no relationships exist, write 'No external integrations'"

---

### Confluence Integration Best Practices

1. **Attach Source JSON**
   - Always attach the source JSON to Confluence page
   - Use naming pattern: `[project]-architecture-v[version].json`
   - Add version to attachment comments

2. **Link Diagrams to Source**
   - Include caption: "Generated from `[filename].json` using BAC4 Standalone"
   - Link to JSON attachment
   - Note the generation date

3. **Use Page Properties**
   - Set page properties: Version, Author, Review Date, Status
   - Makes pages searchable and filterable

4. **Leverage Page Templates**
   - Create Confluence template with standardized structure
   - Use variables/placeholders for AI-generated content
   - Include sections for manual additions (risks, assumptions, etc.)

5. **Version History**
   - Use Confluence page versions for major changes
   - Create new page for major architecture versions (v1 → v2)
   - Use page hierarchy: Parent="System X Architecture", Children="v1.0", "v2.0"

6. **Automation via REST API**
   - Use Confluence REST API for programmatic updates
   - Automate diagram uploads when JSON changes
   - Auto-update specific sections (Technology Stack, Integration)

---

### Git Workflow Best Practices

1. **Directory Structure**
```
repository/
├── docs/
│   ├── architecture/
│   │   ├── models/
│   │   │   ├── project-name-v1.0.json
│   │   │   ├── project-name-v1.1.json
│   │   ├── hld/
│   │   │   ├── HLD-project-name-v1.0.md
│   │   │   ├── HLD-project-name-v1.1.md
│   │   ├── diagrams/
│   │   │   ├── context-v1.0.png
│   │   │   ├── container-v1.0.png
│   │   ├── adr/
│   │   │   ├── ADR-001-architecture-foundation.md
│   │   │   ├── ADR-002-add-caching-layer.md
│   ├── prompts/
│   │   ├── prompt-generate-hld-v1.md
│   │   ├── prompt-generate-integration-v1.md
```

2. **Commit Messages**
```
arch: Add Redis caching layer to architecture model

- Added Redis container between API Gateway and Order Service
- Updated relationships to route through cache
- Tagged as performance optimization
- Updated model version to 1.1

Related: JIRA-1234
```

3. **Tagging Strategy**
```bash
git tag -a arch-v1.0 -m "Initial architecture baseline"
git tag -a arch-v1.1 -m "Added caching layer"
git tag -a arch-v2.0 -m "Major refactor: migrated to microservices"
```

4. **Pull Request Template**
```markdown
## Architecture Change Summary
[Brief description]

## Changes to C4 Model
- Added: [List new components]
- Modified: [List changed components]
- Removed: [List removed components]

## Affected Integrations
- [List changed relationships]

## Documentation Updates
- [ ] HLD regenerated
- [ ] Confluence updated
- [ ] Diagrams exported and committed
- [ ] ADR created (if needed)

## Reviewers
- Solution Architect: @architect
- Tech Lead: @tech-lead

## Attachments
- JSON: `docs/architecture/models/[file].json`
- Diagrams: `docs/architecture/diagrams/[files].png`
```

---

## Appendix: Complete Example

### Example JSON Model

```json
{
  "metadata": {
    "name": "E-Commerce Platform",
    "version": "1.0",
    "author": "Solution Architecture Team"
  },
  "systems": [
    {
      "id": "system-001",
      "type": "system",
      "name": "E-Commerce Platform",
      "description": "Customer-facing e-commerce application for browsing and purchasing products",
      "technology": "Microservices Architecture, Cloud-Native",
      "tags": ["core", "customer-facing"],
      "position": {"x": 500, "y": 300}
    }
  ],
  "containers": [
    {
      "id": "container-001",
      "type": "container",
      "name": "Web Application",
      "description": "Single-page application providing the user interface",
      "technology": "React 18, TypeScript, Vite",
      "tags": ["frontend", "spa"],
      "position": {"x": 300, "y": 200}
    },
    {
      "id": "container-002",
      "type": "container",
      "name": "API Gateway",
      "description": "Routes and authenticates all API requests from clients",
      "technology": "Kong Gateway, Lua, Redis",
      "tags": ["infrastructure", "security"],
      "position": {"x": 500, "y": 200}
    },
    {
      "id": "container-003",
      "type": "container",
      "name": "Order Service",
      "description": "Manages order lifecycle from creation to fulfillment",
      "technology": "Spring Boot 3.2, Java 21, PostgreSQL",
      "tags": ["microservice", "core", "critical"],
      "position": {"x": 500, "y": 400}
    },
    {
      "id": "container-004",
      "type": "container",
      "name": "Product Service",
      "description": "Manages product catalog, inventory, and pricing",
      "technology": "Node.js, Express, MongoDB",
      "tags": ["microservice", "core"],
      "position": {"x": 700, "y": 400}
    },
    {
      "id": "container-005",
      "type": "container",
      "name": "PostgreSQL Database",
      "description": "Primary relational database for order and customer data",
      "technology": "PostgreSQL 15, pgBouncer",
      "tags": ["database", "critical"],
      "position": {"x": 500, "y": 550}
    },
    {
      "id": "container-006",
      "type": "container",
      "name": "MongoDB Database",
      "description": "Document database for product catalog",
      "technology": "MongoDB 7, Replica Set",
      "tags": ["database"],
      "position": {"x": 700, "y": 550}
    }
  ],
  "people": [
    {
      "id": "person-001",
      "type": "person",
      "name": "Customer",
      "description": "End user browsing and purchasing products",
      "technology": "Web Browser, Mobile App",
      "tags": ["external", "end-user"],
      "position": {"x": 100, "y": 200}
    }
  ],
  "externalSystems": [
    {
      "id": "external-001",
      "type": "externalSystem",
      "name": "Stripe Payment Gateway",
      "description": "Third-party payment processing service",
      "technology": "REST API, Webhook",
      "tags": ["external", "payment", "pci-compliant"],
      "position": {"x": 900, "y": 300}
    },
    {
      "id": "external-002",
      "type": "externalSystem",
      "name": "SendGrid Email Service",
      "description": "Email delivery service for transactional emails",
      "technology": "REST API, SMTP",
      "tags": ["external", "email"],
      "position": {"x": 900, "y": 450}
    }
  ],
  "relationships": [
    {
      "id": "rel-001",
      "from": "person-001",
      "to": "container-001",
      "description": "Browses products and places orders via",
      "technology": "HTTPS",
      "arrowDirection": "right",
      "lineStyle": "solid",
      "animated": false
    },
    {
      "id": "rel-002",
      "from": "container-001",
      "to": "container-002",
      "description": "Makes API calls to",
      "technology": "REST/HTTPS",
      "arrowDirection": "right",
      "lineStyle": "solid",
      "animated": false
    },
    {
      "id": "rel-003",
      "from": "container-002",
      "to": "container-003",
      "description": "Routes order requests to",
      "technology": "REST/JSON",
      "arrowDirection": "right",
      "lineStyle": "solid",
      "animated": false
    },
    {
      "id": "rel-004",
      "from": "container-002",
      "to": "container-004",
      "description": "Routes product requests to",
      "technology": "REST/JSON",
      "arrowDirection": "right",
      "lineStyle": "solid",
      "animated": false
    },
    {
      "id": "rel-005",
      "from": "container-003",
      "to": "container-005",
      "description": "Reads and writes order data",
      "technology": "JDBC/PostgreSQL",
      "arrowDirection": "both",
      "lineStyle": "solid",
      "animated": false
    },
    {
      "id": "rel-006",
      "from": "container-004",
      "to": "container-006",
      "description": "Reads and writes product data",
      "technology": "MongoDB Driver",
      "arrowDirection": "both",
      "lineStyle": "solid",
      "animated": false
    },
    {
      "id": "rel-007",
      "from": "container-003",
      "to": "external-001",
      "description": "Processes payments via",
      "technology": "REST API/HTTPS",
      "arrowDirection": "right",
      "lineStyle": "dashed",
      "animated": true
    },
    {
      "id": "rel-008",
      "from": "container-003",
      "to": "external-002",
      "description": "Sends order confirmation emails via",
      "technology": "REST API",
      "arrowDirection": "right",
      "lineStyle": "dashed",
      "animated": true
    }
  ]
}
```

### Example Generated HLD (Excerpt)

```markdown
# High Level Design: E-Commerce Platform

## Document Control
- **Document Name**: E-Commerce Platform - High Level Design
- **Version**: 1.0
- **Author**: Solution Architecture Team
- **Date**: 2024-01-15
- **Status**: Draft

## Executive Summary

The E-Commerce Platform is a cloud-native, microservices-based system designed to provide customers with a modern, scalable online shopping experience. The platform consists of 2 core microservices, 2 databases, and integrates with 2 external third-party services for payment processing and email delivery.

### Key Characteristics
- **Architecture Style**: Microservices, Cloud-Native
- **User Types**: 1 (Customer)
- **Core Services**: 4 containers (Web App, API Gateway, Order Service, Product Service)
- **Data Stores**: 2 (PostgreSQL, MongoDB)
- **External Integrations**: 2 (Stripe, SendGrid)
- **Critical Components**: Order Service, PostgreSQL Database

## Architecture Overview

### System Context

The **E-Commerce Platform** serves as the primary customer-facing application for browsing and purchasing products. It integrates with external systems for payment processing and email notifications.

#### Users
| User Type | Description | Access Method |
|-----------|-------------|---------------|
| **Customer** | End user browsing and purchasing products | Web Browser, Mobile App |

#### External Systems
| System | Purpose | Technology |
|--------|---------|------------|
| **Stripe Payment Gateway** | Third-party payment processing service | REST API, Webhook |
| **SendGrid Email Service** | Email delivery service for transactional emails | REST API, SMTP |

## Component Architecture

### Service Catalog

| Service | Purpose | Technology Stack | Tags |
|---------|---------|------------------|------|
| **Web Application** | Single-page application providing the user interface | React 18, TypeScript, Vite | frontend, spa |
| **API Gateway** | Routes and authenticates all API requests from clients | Kong Gateway, Lua, Redis | infrastructure, security |
| **Order Service** | Manages order lifecycle from creation to fulfillment | Spring Boot 3.2, Java 21, PostgreSQL | microservice, core, critical |
| **Product Service** | Manages product catalog, inventory, and pricing | Node.js, Express, MongoDB | microservice, core |
| **PostgreSQL Database** | Primary relational database for order and customer data | PostgreSQL 15, pgBouncer | database, critical |
| **MongoDB Database** | Document database for product catalog | MongoDB 7, Replica Set | database |

### Communication Patterns

#### Synchronous Communication
- **Web Application** → **API Gateway**: Makes API calls to (REST/HTTPS)
- **API Gateway** → **Order Service**: Routes order requests to (REST/JSON)
- **API Gateway** → **Product Service**: Routes product requests to (REST/JSON)
- **Order Service** ↔ **PostgreSQL Database**: Reads and writes order data (JDBC/PostgreSQL)
- **Product Service** ↔ **MongoDB Database**: Reads and writes product data (MongoDB Driver)

#### Asynchronous Communication
- **Order Service** → **Stripe Payment Gateway**: Processes payments via (REST API/HTTPS)
- **Order Service** → **SendGrid Email Service**: Sends order confirmation emails via (REST API)

## Technology Stack

| Category | Technology | Used In | Purpose |
|----------|------------|---------|---------|
| **Frontend** | React 18, TypeScript, Vite | Web Application | User interface |
| **API Gateway** | Kong Gateway, Lua | API Gateway | Routing, authentication |
| **Backend - Java** | Spring Boot 3.2, Java 21 | Order Service | Order processing logic |
| **Backend - Node.js** | Node.js, Express | Product Service | Product catalog management |
| **Database - Relational** | PostgreSQL 15, pgBouncer | PostgreSQL Database | Order and customer data |
| **Database - Document** | MongoDB 7, Replica Set | MongoDB Database | Product catalog |
| **Caching** | Redis | API Gateway | Session management, rate limiting |
| **External - Payment** | REST API, Webhook | Stripe Payment Gateway | Payment processing |
| **External - Email** | REST API, SMTP | SendGrid Email Service | Transactional emails |

## Integration Architecture

### Internal Integrations

**Web Application → API Gateway**
- **Purpose**: Makes API calls to
- **Protocol**: REST/HTTPS
- **Pattern**: Synchronous (REQ/RES)
- **Data Flow**: Unidirectional (→)

**API Gateway → Order Service**
- **Purpose**: Routes order requests to
- **Protocol**: REST/JSON
- **Pattern**: Synchronous (REQ/RES)
- **Data Flow**: Unidirectional (→)

**API Gateway → Product Service**
- **Purpose**: Routes product requests to
- **Protocol**: REST/JSON
- **Pattern**: Synchronous (REQ/RES)
- **Data Flow**: Unidirectional (→)

**Order Service ↔ PostgreSQL Database**
- **Purpose**: Reads and writes order data
- **Protocol**: JDBC/PostgreSQL
- **Pattern**: Synchronous (REQ/RES)
- **Data Flow**: Bidirectional (↔)

**Product Service ↔ MongoDB Database**
- **Purpose**: Reads and writes product data
- **Protocol**: MongoDB Driver
- **Pattern**: Synchronous (REQ/RES)
- **Data Flow**: Bidirectional (↔)

### External Integrations

**Order Service → Stripe Payment Gateway** ⚠️ EXTERNAL
- **Purpose**: Processes payments via
- **Protocol**: REST API/HTTPS
- **Pattern**: Asynchronous (Event-Driven)
- **Data Flow**: Unidirectional (→)
- **Tags**: external, payment, pci-compliant

**Order Service → SendGrid Email Service** ⚠️ EXTERNAL
- **Purpose**: Sends order confirmation emails via
- **Protocol**: REST API
- **Pattern**: Asynchronous (Event-Driven)
- **Data Flow**: Unidirectional (→)
- **Tags**: external, email

## Data Architecture

### Data Stores

| Data Store | Type | Technology | Purpose |
|------------|------|------------|---------|
| **PostgreSQL Database** | Relational | PostgreSQL 15, pgBouncer | Primary relational database for order and customer data |
| **MongoDB Database** | Document | MongoDB 7, Replica Set | Document database for product catalog |

### Data Access Patterns

#### PostgreSQL Database
**Accessed By:**
- **Order Service**: Reads and writes order data (JDBC/PostgreSQL)

**Access Pattern**: Read-Write (Bidirectional)
**Criticality**: CRITICAL
**Notes**: Primary data store for transactional order data. Single writer (Order Service) ensures consistency.

#### MongoDB Database
**Accessed By:**
- **Product Service**: Reads and writes product data (MongoDB Driver)

**Access Pattern**: Read-Write (Bidirectional)
**Notes**: Document store for product catalog. Replica set provides high availability.

## Critical Components

The following components are tagged as **critical** and require special attention for availability, performance, and monitoring:

1. **Order Service** (microservice, core, critical)
   - **Purpose**: Manages order lifecycle from creation to fulfillment
   - **Technology**: Spring Boot 3.2, Java 21, PostgreSQL
   - **Why Critical**: Core business logic for revenue-generating transactions

2. **PostgreSQL Database** (database, critical)
   - **Purpose**: Primary relational database for order and customer data
   - **Technology**: PostgreSQL 15, pgBouncer
   - **Why Critical**: Single source of truth for transactional data

## Security Considerations

### Trust Boundaries
- **Public Zone**: Web Application (customer-facing)
- **DMZ**: API Gateway (public API endpoint with authentication)
- **Private Zone**: Order Service, Product Service, Databases (internal only)

### Sensitive Data Flows
- **Order Service → Stripe Payment Gateway**: Payment card data (PCI-DSS compliance required)
  - Tags: `pci-compliant`
  - Encryption: HTTPS/TLS

### Authentication Points
- **API Gateway**: Authenticates all API requests before routing to backend services
  - Technology: Kong Gateway with Redis-based session management

### Recommendations
1. Implement end-to-end encryption for all external communications
2. Regular security audits of PCI-compliant components
3. Implement rate limiting at API Gateway to prevent abuse
4. Consider adding a Web Application Firewall (WAF) in front of Web Application

---

*This document was generated from C4 architecture model `e-commerce-platform-v1.0.json` using BAC4 Standalone and AI-assisted documentation generation.*
```

---

## Conclusion

This guide provides a comprehensive framework for leveraging BAC4 JSON models with AI to automate HLD documentation. By combining:

1. **Structured C4 models** in BAC4 Standalone
2. **Prompt engineering** with AI tools
3. **Workflow integration** with Confluence and Git

...solution architects can dramatically reduce documentation effort while improving consistency and maintainability.

### Key Takeaways

✅ **BAC4 JSON format is purpose-built for architecture documentation**
- Structured, versioned, AI-friendly

✅ **AI can generate comprehensive HLDs from JSON models**
- Saves hours of manual documentation work
- Maintains consistency across documents

✅ **Prompt engineering is critical**
- Build a library of validated prompts
- Test with edge cases
- Version control your prompts

✅ **Integration workflows enable automation**
- JSON in Git for version control
- AI for content generation
- Confluence for stakeholder access
- GitHub Actions for automation

### Next Steps

1. **Start with one section**: Choose Architecture Overview or Component Architecture
2. **Test the workflow**: Create JSON → Generate with AI → Review output
3. **Build your prompt library**: Customize prompts for your HLD template
4. **Automate gradually**: Start manual, add automation as confidence grows
5. **Share with your team**: Establish standards for JSON models and prompts

---

**Document Version**: 1.0
**Last Updated**: 2024-01-15
**Maintainer**: Solution Architecture Team

For questions or contributions, contact the architecture team.
