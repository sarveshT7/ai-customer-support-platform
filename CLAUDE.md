# Customer Support AI Agent

## Project Goal

This is a TypeScript AI customer-support application built to learn and implement production-grade AI engineering concepts.

The application uses:

* TypeScript
* Node.js
* LangChain
* LangGraph
* PostgreSQL
* Kysely
* pgvector
* Vitest

## Architecture

The application has three major types of information:

### RAG / Knowledge Base

Use RAG for unstructured knowledge such as:

* Return policies
* Warranty information
* FAQs
* Support documentation
* Product documentation

RAG flow:

User query
→ embedding
→ pgvector similarity search
→ retrieved chunks
→ context
→ LLM
→ grounded response

Retrieved context should preserve document metadata for source attribution.

### Structured Application Data

Use database-backed tools for structured data:

* Products
* Orders
* Tickets

Do NOT use RAG when a structured database/tool is the appropriate source.

Expected architecture:

LangGraph
→ Agent
→ Tool
→ Service (when useful)
→ Repository
→ PostgreSQL

## Existing Architecture

Preserve the existing LangGraph/LangChain architecture.

Do not introduce a new framework or ORM.

Use the existing:

* Kysely database layer
* Repository patterns
* Service patterns
* Tool schemas
* LangGraph state definitions
* Testing conventions

Before making architectural changes, inspect the existing implementation.

## Tools

### search_products

Used for actual product/catalog information.

The model must only recommend products returned by this tool.

Never fabricate product information.

### get_order

Used for actual order information.

Always verify an order through this tool when an order-related request requires it.

Never fabricate order information.

### create_ticket

Used for support issues.

If an order ID is required by the application flow, verify the order before creating the ticket.

Never claim a ticket was created unless the tool/database operation succeeds.

## RAG Rules

RAG responses must be grounded in retrieved context.

If no relevant context is retrieved:

* Do not fabricate an answer.
* Clearly state that the information is unavailable in the knowledge base.

When source metadata is available, preserve it through retrieval and context formatting so the response can identify the source.

## Database Rules

Use PostgreSQL through Kysely.

Prefer:

Repository
→ database

Keep database access out of LangGraph nodes and LLM/tool orchestration when a repository abstraction is appropriate.

Use:

* Foreign keys
* Appropriate constraints
* Appropriate indexes
* Parameterized Kysely queries
* Transactions when multiple related writes must succeed or fail together

Do not introduce transactions for simple reads unnecessarily.

## TypeScript Rules

Use strict TypeScript.

Avoid:

* `any`
* unnecessary type assertions
* duplicated types
* unnecessary abstractions

Prefer existing project types and patterns.

## Testing

Use Vitest.

Every significant database/repository/service change should include or update tests.

After making changes:

1. Run the relevant tests.
2. Fix failures.
3. Run the broader test suite when appropriate.
4. Report the test results.

Do not weaken or remove tests simply to make them pass.

## Development Workflow

Do not make large unrelated changes.

For a new feature:

1. Inspect the existing implementation.
2. Explain the proposed change briefly.
3. Implement one logical component at a time.
4. Run tests.
5. Report what changed.
6. Wait before moving to unrelated components when explicitly asked to work incrementally.

Do not rewrite working architecture unnecessarily.

## Learning Requirement

This project is also being used to learn AI engineering.

When implementing an important concept, briefly explain:

* What was changed
* Why it was changed
* How it fits into the architecture
* Important trade-offs
* Production considerations

Do not hide important architectural decisions behind generated code.

## Current Development Priority

The core RAG pipeline has already been implemented and evaluated.

Current priority is to connect the existing:

* Product workflow
* Order workflow
* Ticket workflow

to real PostgreSQL data while preserving the existing RAG implementation.

The intended progression is:

1. Product database integration
2. Order database integration
3. Ticket database integration
4. LangGraph integration
5. Production-readiness review

Do not modify the RAG implementation unless required for integration.
