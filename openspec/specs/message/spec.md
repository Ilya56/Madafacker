## Purpose

This specification defines how messages are created and moderated in the system. It ensures all messages undergo safety moderation before being saved or distributed, with configurable moderation modes and thresholds.

## Requirements

### Requirement: Message Creation with Safety Moderation

The system MUST moderate all messages before they are created or distributed.

Moderation MUST occur synchronously during message creation.

#### Scenario: Message passes moderation
- **WHEN** user creates a message
- **AND** moderation check passes
- **THEN** the message MUST be saved
- **AND** the message MUST be scheduled for distribution

#### Scenario: Message fails moderation
- **WHEN** user creates a message
- **AND** moderation check fails
- **THEN** the message MUST be rejected
- **AND** MUST NOT be saved
- **AND** MUST NOT be distributed

---

### Requirement: Message Moderation Modes

Messages MUST be moderated according to their selected mode.

The system supports two modes:
- `light` — strict, positive-only content
- `dark` — permissive, borderline content allowed

#### Scenario: Light mode strict filtering
- **GIVEN** message mode is `light`
- **WHEN** ANY moderation category score exceeds the light threshold
- **THEN** the message MUST be rejected

#### Scenario: Dark mode permissive filtering
- **GIVEN** message mode is `dark`
- **WHEN** ALL moderation category scores are less than or equal to the dark threshold
- **THEN** the message MUST be allowed
- **AND** provider-level flags MUST be ignored

#### Scenario: Dark mode rejection
- **GIVEN** message mode is `dark`
- **WHEN** ANY moderation category score exceeds the dark threshold
- **THEN** the message MUST be rejected

---

### Requirement: Message Moderation Thresholds

Moderation thresholds MUST be configurable.

#### Scenario: Threshold configuration
- **WHEN** the system evaluates a moderation score
- **THEN** it MUST use thresholds provided via configuration
- **AND** MUST apply different thresholds for different modes

---

### Requirement: Moderation Failure Handling

The system MUST apply fail-close behavior for moderation failures.

#### Scenario: Moderation provider failure
- **WHEN** moderation provider throws an error or returns invalid data
- **THEN** message creation MUST be rejected
- **AND** the client MUST receive a moderation error

---

### Requirement: User-Facing Moderation Errors

Moderation rejection errors MUST be transparent to the client.

#### Scenario: Transparent rejection
- **WHEN** a message is rejected by moderation
- **THEN** the response MUST explain the reason for rejection
- **AND** MUST NOT expose provider-specific internals
