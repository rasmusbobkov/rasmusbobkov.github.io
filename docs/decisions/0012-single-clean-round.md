# 0012: Converge on one complete clean planning round

## Context

The installed EGM loop asks for two consecutive clean rounds in design critique and implementation readiness. A second clean round takes another independent sample even when the first complete aggregate has no blocking finding. [Decision 0011](0011-minimal-review-routing.md) and the [routing plan](../../specs/002-review-routing/plan.md) retain that threshold for the reviews they governed. This decision addresses the threshold, not which changes need design review or how implementation is validated.

## Decision

[Constitution 1.3.0](../../.specify/memory/constitution.md#planning-convergence-override) and the [process guide](../process/spec-kit-egm.md#findings-limits-and-continuation) replace only automatic two-clean convergence for eligible new critique and readiness invocations. Judge one complete, current, three-role aggregate before repairs. It meets the threshold with no unresolved Blocker or Major. Keep attributed Nits, and keep any separate stop even when the aggregate is clean. Readiness still includes exactly one assigned analysis of the matching spec, plan and tasks.

A repair cannot change the failed verdict. Repin and verify affected scope independently; original reviewers confirm each retained portion against current inputs and replacements cover their full role. Extra review answers a named consequential question or conflict, within finite authority. The five inner rounds, one outer re-audit, separate comprehension allowance, bounded failed-reviewer retry, churn and cap stops remain. An authorized same-pin check in slot five needs its own complete current aggregate; a positive answer alone cannot release a clean-but-held fourth round.

Zero/five routing, applicable visual-intent acceptance and the separate native delivery track remain. Keep independent committed-change/scenario review, actual author checks, separate proof and current hosted checks. Do not edit installed instructions or preset 0.2.0, add a runner, change product behavior or gates, or rewrite earlier decisions, tasks or verdicts. The [successor specification](../../specs/003-single-clean-round/spec.md) owns the requirements and [issue #41](https://github.com/rasmusbobkov/rasmusbobkov.github.io/issues/41) tracks them.

## Consequences

The all-clean path no longer orders an automatic confirmation round. It also loses a fresh sample of unchanged text that might have exposed an unknown blind spot. Targeted extra review can answer a known question; it is not a substitute for sampling unknown gaps, including blind spots shared by reviewers using the same model family. Independent contexts and documentary checks establish neither equal detection reliability nor measured time or cost savings.

Use the new threshold only after separately authorized integration and verified instruction alignment, and only for invocations started then. Underway invocations keep the rule and accounting pinned at their start; this decision's own design review followed the preceding two-clean rule. First mate reconciles the existing direction in place and records a genuine fresh-session operating observation when an eligible case exists. Until then, keep the gap explicit. That observation is separate from the earlier routing policy's missing real small-route case. Neither documentation nor build approval grants activation, merge or deployment authority.
