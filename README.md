# TechStore AI Support

An AI-powered customer support application combining **RAG, LangChain, LangGraph, PostgreSQL, and pgvector**.

## 1. Architecture

The application combines two types of information:

* **Unstructured knowledge** → handled using RAG
* **Structured application data** → handled using LangChain tools and PostgreSQL

### High-Level Flow

```text
                              User
                                │
                                ▼
                         Parent LangGraph
                                │
                         Domain Detection
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
           Product            Order             Ticket
            Graph              Graph              Graph
              │                 │                 │
              ▼                 ▼                 ▼
           Tools              Tools             Tools
              │                 │                 │
              ▼                 ▼                 ▼
          PostgreSQL        PostgreSQL        PostgreSQL


                  Knowledge-Based Questions
                              │
                              ▼
                         RAG Pipeline
                              │
                   Query Embedding
                              │
                              ▼
                          pgvector
                              │
                              ▼
                       Relevant Chunks
                              │
                              ▼
                      Context Injection
                              │
                              ▼
                             LLM
```

## 2. RAG Pipeline

The RAG pipeline processes company knowledge before it is used by the AI agent.

```text
Document
   ↓
Parsing
   ↓
Text Cleaning
   ↓
Chunking
   ↓
Embeddings
   ↓
PostgreSQL + pgvector
```

For a user query:

```text
User Query
   ↓
Query Embedding
   ↓
Vector Similarity Search
   ↓
Top-K Relevant Chunks
   ↓
Distance / Relevance Filtering
   ↓
Context Formatting
   ↓
LLM
   ↓
Grounded Response
```

The system also handles cases where no relevant context is retrieved instead of blindly generating an answer.

## 3. Retrieval Evaluation

Retrieval was evaluated using representative queries with expected relevant chunks.

The evaluation measures:

* Top-1 accuracy
* Recall@5
* No-context accuracy

Example evaluation:

```text
Query: Can I return a product within 30 days?
Expected chunk: 0
Actual top chunk: 0
Top-1: PASS
Recall@5: PASS
```

The evaluation also includes queries with no relevant knowledge-base context.

## 4. LangChain

LangChain is used for the LLM and AI application building blocks.

The project uses LangChain for:

* Chat model interaction
* Message handling
* Embeddings
* Tool definitions
* Tool calling
* Tool execution

Current application tools include:

```text
search_products
get_order
create_ticket
```

These tools provide the agent with access to structured application data and actions.

## 5. LangGraph

LangGraph is responsible for workflow orchestration and state management.

### Parent Graph

```text
User Message
     ↓
Parent Graph
     ↓
Domain Router
     ↓
┌──────────┬──────────┬──────────┐
Product    Order      Ticket
Graph      Graph      Graph
```

Each domain graph contains its own agent/tool workflow.

The Product graph also contains the RAG retrieval flow:

```text
Product Query
     ↓
Retrieval Node
     ↓
Relevant Context
     ↓
Agent
     ↓
Tool if required
     ↓
Response
```

## 6. Structured Data vs RAG

The application intentionally uses different mechanisms for different types of information.

| Requirement                  | Mechanism                   |
| ---------------------------- | --------------------------- |
| Return policy                | RAG                         |
| Refund policy                | RAG                         |
| Other knowledge-base content | RAG                         |
| Available products           | LangChain tool → PostgreSQL |
| Order status                 | LangChain tool → PostgreSQL |
| Order information            | LangChain tool → PostgreSQL |
| Ticket creation              | LangChain tool → PostgreSQL |

This separation prevents the system from treating dynamic transactional data as static knowledge-base content.

## 7. Database Architecture

PostgreSQL is used for both application data and the RAG vector store.

### RAG Tables

```text
documents
document_chunks
```

`document_chunks` contains the generated embeddings used for similarity search through pgvector.

### Application Tables

```text
products
orders
order_items
tickets
```

The application follows a repository/service architecture:

```text
LangChain Tool
      ↓
Service
      ↓
Repository
      ↓
Kysely
      ↓
PostgreSQL
```

This keeps database access separate from AI workflow logic.

## 8. Project Setup

Install dependencies:

```bash
npm install
```

Configure the required environment variables in the appropriate `.env` files.

Run database migrations:

```bash
npm run db:migrate
```

Seed product and order data (from `src/data/products.ts` and `src/data/orders.ts`). This is
separate from migrations and safe to re-run any time you edit those files — it upserts by
primary key, so existing rows are updated and new entries are inserted:

```bash
npm run db:seed
```

For the test database, run both against it as well:

```bash
NODE_ENV=test npm run db:migrate
NODE_ENV=test npm run db:seed
```

## 9. RAG Document Ingestion

Example:

```bash
npm run dev -- ingest src/data/documents/return-policy.md
```

This processes the document and stores its chunks and embeddings in PostgreSQL.

## 10. Run Tests

Run the complete test suite:

```bash
NODE_ENV=test npm run test:run
```

The test suite covers areas including:

* Text cleaning
* Chunking
* Document ingestion
* Embeddings
* Repository operations
* Retrieval
* Services
* LangGraph nodes

## 11. Run the Application

```bash
npm run dev
```

The CLI starts the TechStore AI Support application.

## 12. Demo Queries

### RAG

```text
Can I return a product within 30 days?
```

Expected behavior: retrieves the relevant Return Policy context and generates a grounded answer.

### No Relevant Context

```text
What is the warranty period?
```

Expected behavior: the system should not invent a warranty policy when relevant context is unavailable.

### Product Tool

```text
What laptops are available?
```

Expected behavior:

```text
Product Agent
    ↓
search_products
    ↓
ProductService
    ↓
ProductRepository
    ↓
PostgreSQL
```

### Order Tool

```text
Where is my order ORD-1001?
```

Expected behavior: retrieves the order information from PostgreSQL.

### Ticket Workflow

```text
My order ORD-1001 arrived damaged. I want to raise a ticket.
```

Expected behavior:

```text
Ticket Workflow
      ↓
Verify Order
      ↓
PostgreSQL
      ↓
Create Ticket
      ↓
PostgreSQL
      ↓
Confirmation
```

## 13. Key Concepts Demonstrated

This project demonstrates:

* Document ingestion
* Text cleaning
* Hierarchical chunking
* Chunk overlap
* Embeddings
* Vector similarity search
* pgvector
* Top-K retrieval
* Retrieval evaluation
* Context filtering
* Context injection
* RAG grounding
* No-context handling
* LangChain models
* LangChain tools
* LangGraph state
* LangGraph routing
* Conditional workflows
* Tool execution
* PostgreSQL
* Kysely
* Repository/service architecture
* End-to-end AI application integration
