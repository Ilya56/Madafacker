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

### Architecture Patterns
- **Clean Architecture / DDD:**
  - `src/core`: Domain entities, repository interfaces (`abstract`), core error types, and service abstracts.
  - `src/use-cases`: Domain-specific business logic. Uses `CommandAbstract` and `QueryAbstract` patterns.
  - `src/controllers`: API layer. Controllers use Use Cases to perform operations.
  - `src/frameworks`: Implementation details (Sequelize, Firebase, Sentry). Decoupled from a domain via dependency injection.
  - `src/services`: Shared domain services (e.g., `UserService`).

### Technical Principles

#### 1. Data Flow
Standard flow: `Request` -> `Controller` -> `Use Case (execute)` -> `Repository/Service` -> `Database/External API`.
Use cases should contain the bulk of business logic, keeping controllers thin.

#### 2. Repository Pattern
- All data access is abstracted through `DataServiceAbstract`.
- Repositories are injected via `DataServiceAbstract`, ensuring implementations (like Sequelize) can be swapped.
- Generic operations are handled by `GenericRepositoryAbstract<T>`.

#### 3. Entity Mapping
- **Entities (`src/core/entities`):** Pure TypeScript classes representing domain objects. Business logic depends only on these.
- **Models (`src/frameworks/data-services/sequelize/models`):** Sequelize-specific classes for persistence.
- Repositories handle the mapping between Models and Entities (though Sequelize models are often used directly as entities if they satisfy the interface, they should ideally be mapped).

#### 4. Transaction Management
- Uses `sequelize-transactional-decorator` and `CLS (Continuation Local Storage)`.
- Use Cases extending `CommandAbstract` have transaction management enabled by default.
- Manual transaction control is available via `dataService.transactional(async () => { ... })`.

#### 5. Error Handling
- **Core Errors:** Custom error classes in `src/core` (e.g., `NotFoundError`, `DuplicateNotAllowedError`).
- **Global Interceptor:** `CoreErrorHandler` interceptor in `src/controllers/error-handler` maps Core Errors to appropriate HTTP exceptions (NestJS `HttpException`).
- **Unexpected Errors:** Logged via `Logger` and sent to `Sentry` (AlertService) before being returned as `InternalServerErrorException`.

#### 6. Background Jobs
- Bull (Redis-based) is used for asynchronous tasks.
- Logic for jobs should reside in Use Cases or dedicated Service implementations.

### Testing Strategy
- **Unit Tests:** Located next to the code (`.spec.ts`). Focus on business logic and core services.
- **E2E Tests:** Located in the `test/` directory. Focus on API endpoints and full flow integration.
- **Coverage:** High coverage thresholds (~85-100%) enforced via Jest configuration.

### Git Workflow
- **Conventional Commits:** Used for all commit messages (e.g., `feat:`, `fix:`, `chore:`).
- **Hooks:** Husky triggers linting and formatting on commit.

## Domain Context
- **Core Concept:** Anonymous social networking with a focus on safety and freedom of expression.
- **Main Entities:** User, Message, Reply.

## Important Constraints
- Strict TypeScript typing (where applicable, excluding `any`).
- Transaction management using `sequelize-transactional-decorator`.

## External Dependencies
- **Firebase:** Authentication and administrative functions.
- **Sentry:** Error monitoring and reporting.
- **Redis:** Required for Bull background queues.
- **PostgreSQL:** Primary data storage.
