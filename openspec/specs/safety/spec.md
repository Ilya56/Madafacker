## Purpose

This specification defines the safety checking system for user-generated content. It ensures all content is validated through safety providers before being exposed to other users, following a fail-close strategy for maximum safety.

## Requirements

### Requirement: Safety Checks for User-Generated Content

The system MUST perform safety checks for user-generated content before allowing
any operation that can expose such content to other users.

Safety checks are mandatory and MUST be executed synchronously.

#### Scenario: Safety check passes
- **WHEN** user submits content
- **AND** all safety checks succeed
- **THEN** the system MAY proceed with the requested operation

#### Scenario: Safety check fails
- **WHEN** user submits content
- **AND** at least one safety check fails
- **THEN** the operation MUST be rejected
- **AND** the content MUST NOT be persisted
- **AND** the content MUST NOT be distributed

---

### Requirement: Fail-Close Strategy for Safety Providers

The system MUST follow a fail-close strategy for all safety-related checks.

#### Scenario: Safety provider returns an error
- **WHEN** a safety provider fails, times out, or returns an invalid response
- **THEN** the system MUST reject the operation
- **AND** MUST return a domain-level safety error

#### Scenario: Safety provider is unavailable due to misconfiguration
- **WHEN** a required safety provider configuration is missing
- **THEN** the system MUST fail with a server error
- **AND** MUST NOT allow the operation to proceed

---

### Requirement: Safety Provider Abstraction

The system MUST interact with safety providers via provider-agnostic abstractions.

#### Scenario: Provider abstraction
- **GIVEN** a safety provider implementation
- **WHEN** it is used by the system
- **THEN** business logic MUST NOT depend on provider-specific details
- **AND** interpretation of safety results MUST occur in Use Cases

---

### Requirement: Deterministic Safety Decisions

Safety decisions MUST be deterministic and based on explicit rules.

#### Scenario: Deterministic rejection
- **WHEN** the same input is evaluated under the same conditions
- **THEN** the safety decision MUST always be the same
