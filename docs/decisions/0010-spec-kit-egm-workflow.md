# 0010: Use Spec Kit and EGM for development

## Context

The project needs a single development workflow with versioned requirements, technical plans and independently reviewed decisions. Its former custom manual overlapped with the installed Spec Kit and EGM tools.

## Decision

Replace the custom manual with Spec Kit and EGM. The constitution and integration guide map canonical feature artifacts, existing tracker roles and proportionate review. Workflow changes and other consequential changes use all five EGM phases; bounded corrections use the relevant phase. Use native preset overrides for reasoned recommendations, stage-specific reports, feature-scoped issue identity and one canonical technical plan. Existing host permissions remain authoritative.

## Consequences

Product invariants, architecture, historical decisions, development history and executable checks remain. Fresh reviews use existing host coordination where direct delegation is unavailable; automatic EGM delegation is not established. This decision grants no implementation, merge or deployment authority.
