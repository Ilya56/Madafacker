## 1. Environment & Infrastructure
- [x] 1.1 Add `OPENAI_API_KEY`, `MODERATION_THRESHOLD_LIGHT` (default: 0.01), and `MODERATION_THRESHOLD_DARK` (default: 0.4) to `.env` (use placeholders, do not commit real keys)
- [x] 1.2 Update `ConfigService` to expose moderation variables with defaults and validation (number parsing for thresholds)
- [x] 1.3 Install `openai` package (npm)

## 2. Core Abstractions
- [x] 2.1 Create `ModerationServiceAbstract` in `src/core/abstract/moderation-service.abstract.ts` returning provider-agnostic result:
  - `flagged: boolean`
  - `categoryScores: Record<string, number>`
- [x] 2.2 Create `ModerationException` mapped to HTTP 422 (follow existing `src/core/errors/` patterns)
- [x] 2.3 Export new core elements from the core barrel exports (where the project exports abstracts/errors)

## 3. Provider Implementation (OpenAI)
- [x] 3.1 Implement `OpenAIModerationService` in `src/services/moderation-service/openai-moderation.service.ts`
- [x] 3.2 Map OpenAI response into standardized `{ flagged, categoryScores }`
- [x] 3.3 Add DI wiring so `ModerationServiceAbstract` resolves to `OpenAIModerationService` in the Nest module setup

## 4. Message Creation Flow (Synchronous Moderation)
- [x] 4.1 Inject `ModerationServiceAbstract` and `ConfigService` into `CreateMessageUseCase`
- [x] 4.2 Implement mode-based threshold logic in `CreateMessageUseCase`:
  - `light`: reject if ANY score > `MODERATION_THRESHOLD_LIGHT`
  - `dark`: reject if ANY score > `MODERATION_THRESHOLD_DARK`
  - ignore provider `flagged` for `dark` decisions (still keep it available for logging/telemetry if needed)
- [x] 4.3 Ensure ordering is strict: moderate → create message in DB → enqueue/broadcast via `taskService.sendMessage.addTask()`
- [x] 4.4 Implement fail-close: any provider error/timeout/invalid response throws `ModerationException` and blocks creation

## 5. Verification
- [ ] 5.1 Unit tests for `CreateMessageUseCase` moderation decisions (mock `ModerationServiceAbstract`, verify thresholds and ordering)
- [ ] 5.2 Unit tests for fail-close behavior (provider throws → 422 via `ModerationException`)
- [ ] 5.3 E2E tests for message creation:
  - `light` rejects on small score above light threshold
  - `dark` allows content when scores <= dark threshold even if provider says `flagged: true`
  - `dark` rejects when any score > dark threshold
- [ ] 5.4 Ensure tests do not call the real OpenAI API (use mocks/stubs)
