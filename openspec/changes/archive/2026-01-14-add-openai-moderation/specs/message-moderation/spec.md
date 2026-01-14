## ADDED Requirements

### Requirement: Message Moderation Business Logic
The system MUST moderate all messages before creation. The moderation logic MUST reside in `CreateMessageUseCase`, using configurable thresholds from environment variables.

**Technical Context:**
- Message mode is defined in `src/core/enums/MessageMode.ts` as enum with values `light` and `dark`
- Thresholds are configured via `MODERATION_THRESHOLD_LIGHT` (default: 0.01) and `MODERATION_THRESHOLD_DARK` (default: 0.4)
- Moderation MUST happen synchronously BEFORE saving message to database

#### Scenario: Light Mode Filtering (Strict - Positive-Only via Strict Safety Threshold)
- **GIVEN** a message with `mode = 'light'`
- **WHEN** the moderation provider returns category scores
- **AND** ANY category score is higher than `MODERATION_THRESHOLD_LIGHT` (0.01)
- **THEN** the message MUST be rejected with `ModerationException` (HTTP 422)
- **AND** the message MUST NOT be saved to database
- **AND** the message MUST NOT be sent to recipients

#### Scenario: Dark Mode Filtering (Permissive - Borderline Content Allowed)
- **GIVEN** a message with `mode = 'dark'`
- **WHEN** the moderation provider returns results
- **AND** ANY category score is higher than `MODERATION_THRESHOLD_DARK` (default: 0.4)
- **THEN** the message MUST be rejected with `ModerationException` (HTTP 422)
- **AND** the message MUST NOT be saved to database

#### Scenario: Dark Mode Ignores Provider Flagged When Scores Are Below Threshold
- **GIVEN** a message with `mode = 'dark'`
- **WHEN** the moderation provider returns `flagged: true`
- **AND** ALL category scores are less than or equal to `MODERATION_THRESHOLD_DARK`
- **THEN** the message MUST be allowed (moderation check passes)
- **AND** the message MUST proceed to creation and distribution flow
- **GIVEN** a message in any mode
- **WHEN** moderation check passes (scores below threshold, not flagged)
- **THEN** the message MUST be created in database
- **AND** the message MUST be sent via `taskService.sendMessage.addTask()`

### Requirement: Moderation Provider Abstraction
The system MUST use a generic moderation interface that returns standardized results, allowing future provider replacement without changing business logic.

**Technical Context:**
- Abstract class location: `src/core/abstract/moderation-service.abstract.ts`
- Initial implementation: `src/services/moderation-service/openai-moderation.service.ts`
- Interface MUST be provider-agnostic (no OpenAI-specific types in abstract)

#### Scenario: Standardized Moderation Response
- **GIVEN** any moderation provider implementation
- **WHEN** the `moderate(text: string)` method is called
- **THEN** it MUST return an object with:
  - `flagged: boolean` — whether content violates provider's policies
  - `categoryScores: Record<string, number>` — scores per category (0.0 to 1.0)
- **AND** the UseCase MUST NOT depend on provider-specific category names

### Requirement: Fail-Close on Provider Error
The system MUST block message creation when the moderation provider is unavailable or returns an error. Safety takes priority over availability.

#### Scenario: API Timeout or Network Error
- **WHEN** the moderation API call times out or fails with network error
- **THEN** the UseCase MUST throw `ModerationException`
- **AND** the message MUST NOT be created

#### Scenario: API Returns 5xx Error
- **WHEN** the moderation API returns HTTP 500, 502, 503, or similar
- **THEN** the UseCase MUST throw `ModerationException`
- **AND** the message MUST NOT be created

#### Scenario: Invalid API Response
- **WHEN** the moderation API returns malformed or unexpected response
- **THEN** the UseCase MUST throw `ModerationException`
- **AND** the message MUST NOT be created

### Requirement: ModerationException HTTP Mapping
`ModerationException` MUST be mapped to HTTP 422 Unprocessable Entity status code.

**Technical Context:**
- Exception location: `src/core/errors/ModerationException.ts`
- Must extend base error pattern used in `src/core/errors/`
- Must be handled by `CoreErrorHandler` interceptor in `src/controllers/error-handler`

#### Scenario: Client Receives 422 on Moderation Failure
- **WHEN** a message is rejected by moderation
- **THEN** the API MUST return HTTP 422 status
- **AND** the response body SHOULD contain error message explaining rejection reason
