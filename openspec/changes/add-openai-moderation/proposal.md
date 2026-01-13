// Change: Add OpenAI Moderation for Messages

## Why
To ensure a safe environment for users, we need to moderate messages before they are created and broadcasted. 
The moderation should distinguish between `light` and `dark` modes to support different levels of strictness in content filtering.

## What Changes
- New generic `ModerationService` to interact with moderation providers (initially OpenAI).
- Configuration-driven thresholds: `MODERATION_THRESHOLD_LIGHT` and `MODERATION_THRESHOLD_DARK` added to `.env`.
- **Business Logic in UseCase**: `CreateMessageUseCase` will contain the logic to interpret moderation results based on the message mode (`light`/`dark`) and configured thresholds.
- Synchronous moderation check before message creation.
- Fallback strategy: If Moderation API is unavailable, the system will FAIL-CLOSE.
- HTTP Mapping: `ModerationException` (422 Unprocessable Entity).
- Add a provider-agnostic `ModerationServiceAbstract` with standardized output (`flagged`, `categoryScores`).
- Add OpenAI-backed implementation (`OpenAIModerationService`) using OpenAI Moderation API.
- Add configuration:
  - `OPENAI_API_KEY`
  - `MODERATION_THRESHOLD_LIGHT` (default: 0.01)
  - `MODERATION_THRESHOLD_DARK` (default: 0.4)
- **Business Logic in UseCase**: `CreateMessageUseCase` will interpret moderation results depending on message mode:
  - `light`: reject if **any** category score exceeds `MODERATION_THRESHOLD_LIGHT`
  - `dark`: reject if **any** category score exceeds `MODERATION_THRESHOLD_DARK`
  - `flagged` from the provider is treated as informational for `dark` mode (decision is threshold-based)
- Synchronous flow: moderation check happens BEFORE saving the message and BEFORE enqueueing/broadcasting (`taskService.sendMessage.addTask()`).
- Fail-close strategy: if Moderation API is unavailable, times out, or responds unexpectedly, message creation is rejected.
- HTTP Mapping: `ModerationException` is mapped to HTTP 422 (Unprocessable Entity).

## Impact
- Affected specs: `message-moderation`
- Affected code:
    - `src/core/abstract/moderation-service.abstract.ts`
    - `src/services/moderation-service/openai-moderation.service.ts`
    - `src/use-cases/message/create-message.use-case.ts`
    - `src/core/errors/ModerationException.ts`
    - Config wiring (environment variables and config service)
