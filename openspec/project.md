# Project Context

## Purpose
A backend for a social network with anonymous users, providing a safe environment for various forms of self-expression. It serves as a universal API for both mobile and web clients.

## Tech Stack
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Sequelize (with `sequelize-typescript`)
- **Validation:** `class-validator`, `class-transformer`
- **Background Jobs:** Bull (Redis)
- **External Services:** Firebase (Auth/Admin), Sentry (Monitoring)
- **Testing:** Jest, Supertest
- **Infrastructure:** Vercel (Deployment)

## Project Conventions

### Code Style
- Standard ESLint + Prettier (NestJS configuration).
- Husky for Git hooks.
- Rules for explicit return types and `no-explicit-any` are disabled.

---

## Architecture Patterns

### Clean Architecture / DDD
- `src/core`
    - Domain entities
    - Repository interfaces (`abstract`)
    - Core service abstractions
    - Domain-level error types
- `src/use-cases`
    - Business logic
    - Decision making
    - Orchestration of domain services
- `src/controllers`
    - API layer
    - No business logic
- `src/frameworks`
    - Implementation details (Sequelize, Firebase, OpenAI, Sentry)
    - Must not leak into core logic
- `src/services`
    - Service composition and DI wiring

---

### Use Case Contract (Command / Query)

All Use Cases MUST follow these rules.

#### Command Use Cases
- Extend `CommandAbstract`
- Modify system state
- Contain **all business decisions**
- Controllers MUST NOT contain business logic

**Responsibilities of Command Use Cases:**
- Validation of domain rules
- Permission checks
- Safety & moderation checks
- Threshold-based decisions
- Ordering side effects

**Strict execution order for Commands:**
1. Validate input & permissions
2. Call external/domain services (e.g. moderation, scoring)
3. Mutate database state
4. Trigger asynchronous side effects (tasks, notifications)

Breaking this order is considered a bug.

#### Query Use Cases
- Extend `QueryAbstract`
- MUST NOT mutate system state
- MUST NOT trigger side effects
- Used only for data retrieval

---

## Technical Principles

### 1. Data Flow
Standard flow: `Request → Controller → UseCase.execute() → Domain Services / Repositories → Database / External APIs`

Use Cases are the **single source of truth** for business behavior.

---

### 2. Repository Pattern
- All data access goes through `DataServiceAbstract`
- Use Cases MUST NOT depend on concrete repository implementations
- Repositories encapsulate persistence logic only

---

### 3. Entity Mapping
- **Entities (`src/core/entities`)**
  - Pure TypeScript
  - No framework dependencies
- **Models (`src/frameworks/data-services/sequelize/models`)**
  - Sequelize-specific
- Mapping is repository responsibility

---

### 4. Transaction Management
- `CommandAbstract` executes inside a transaction by default
- Backed by `sequelize-transactional-decorator` + CLS
- Transactions MUST NOT include:
  - Network calls
  - External side effects
- Asynchronous effects (tasks, notifications) must happen **after commit**

---

### 5. Error Handling

#### Core Errors
- Live in `src/core/errors`
- Represent business-level failures
- Never contain HTTP semantics

#### HTTP Mapping
- Performed centrally by `CoreErrorHandler`
- Mapping rules are explicit and testable

---

### Fail-Close vs Fail-Open Policy

The project follows a strict failure strategy:

#### Fail-Close (default for safety & business rules)
Used when:
- Content moderation fails
- External safety providers return errors
- Business rules cannot be reliably evaluated

Result:
- Operation is rejected
- Domain error is thrown (e.g. `ModerationException`)
- Mapped to HTTP **422**

#### Fail-Open (NOT allowed)
The system MUST NOT allow operations to proceed
when safety checks fail or are inconclusive.

#### Misconfiguration Errors
Examples:
- Missing API keys
- Invalid environment setup

Result:
- Runtime error
- HTTP **500** (server fault)

Use Cases MUST explicitly decide which strategy applies.

---

### 6. Background Jobs
- Implemented via Bull (Redis)
- Jobs MUST be triggered by Use Cases
- Job logic lives in:
  - Use Cases
  - or dedicated service implementations
- Controllers MUST NOT enqueue jobs directly

---

## Safety & Moderation Rules

Safety-related features (moderation, abuse detection, spam scoring) follow a common pattern:

- Implemented synchronously inside Command Use Cases
- Executed **before** any database mutation
- Based on numeric thresholds from `ConfigService`
- Mode-aware (e.g. `light`, `dark`)

**General moderation flow:**
1. Call moderation service
2. Extract numeric scores
3. Compare against mode-specific thresholds
4. Reject if ANY score exceeds threshold
5. Ignore provider-level flags unless explicitly required

**User-facing rejection messages SHOULD:**
- Clearly explain why the action was rejected
- Avoid leaking provider internals
- Be deterministic and testable

---

## External Provider Abstractions

All external integrations MUST follow this pattern:

- **Abstract interface** → `src/core/abstract`
- **Implementation** → `src/frameworks/**`
- **Use Cases depend ONLY on abstracts**

Provider implementations MUST:
- Return provider-agnostic data
- Throw only technical errors
- Never throw HTTP-specific exceptions

Business interpretation of provider results ALWAYS belongs to the Use Case.

---

## CommandAbstract Dependency Injection

`CommandAbstract` automatically injects:

- `ConfigService`
- `DataServiceAbstract`
- `UserServiceAbstract`
- `AlgoServiceAbstract`
- `TaskServiceAbstract`
- `NotifyServiceAbstract`
- `ModerationServiceAbstract`

Concrete Use Cases SHOULD NOT redeclare these dependencies
unless custom constructor logic is required.

All injected services MUST be mocked in unit tests.

---

## Testing Strategy

The project follows a **layered testing strategy**.

### Unit Tests
- Located next to the code (`.spec.ts`)
- Focus on:
  - Business decisions
  - Edge cases
  - Failure paths
- MUST:
  - Mock all abstract services
  - Never call real external APIs
  - Verify side-effect ordering where relevant
  - Assert that rejected operations do NOT mutate state

### Use Case Unit Testing Guidelines
- Extend existing test files — do not replace them
- Use `SERVICES_PROVIDER` for DI stubbing
- Explicitly test:
  - Allow / reject branches
  - Threshold edge cases
  - Fail-close behavior
  - Correct ordering of operations

### E2E Tests
- Located in `test/`
- Validate:
  - HTTP contracts
  - Error mapping via global interceptors
  - Dependency Injection wiring
  - Real runtime behavior of the system
- E2E tests MUST NOT call real external providers (OpenAI, Firebase, etc.)
- External services MUST be mocked at the abstraction level

#### Responsibility of E2E Tests
E2E tests are responsible for validating **how the system interprets and reacts to data**,
not for validating the correctness of external providers themselves.

This includes:
- Boundary values (`0`, exact threshold values)
- Invalid or unexpected shapes (`null`, empty objects)
- Extreme numeric values (`Infinity`, `NaN`)
- Ordering-dependent behavior (e.g. first vs later category exceeding a threshold)

E2E tests intentionally cover such edge cases to ensure that
the system behaves safely and deterministically under real-world conditions.

#### Coverage Philosophy
High E2E coverage is encouraged **when it represents meaningful runtime behavior**.
Coverage MUST NOT be increased via artificial or unreachable test scenarios.

When coverage thresholds are adjusted, they MUST reflect:
- Realistic runtime reachability
- Separation of concerns between Unit and E2E tests
- The safety-critical nature of the system

---

## Domain Context
- **Core Concept:** Anonymous social networking with safety-first design
- **Main Entities:** User, Message, Reply

---

## Important Constraints
- Strict TypeScript typing (excluding `any` where necessary)
- No business logic outside Use Cases
- No direct framework dependencies in core domain

---

## External Dependencies
- **Firebase:** Authentication and notifications
- **Sentry:** Error monitoring
- **Redis:** Background job queues
- **PostgreSQL:** Primary data storage
