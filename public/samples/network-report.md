# Sample Report: Registry 503

## Scenario

A dependency install step fails against an external package registry.

## CI Failure Triage Report

- Findings: 2
- Signal lines: 5
- Non-empty log lines: 16
- Confidence: 70%

## Likely Causes

1. Network or registry access failed
   - Severity: medium
   - Line: 9
   - Likely owner: CI platform or dependency owner
   - Next action: Retry once, then check registry status, rate limits, and whether the job should use an internal mirror or pinned cache.
   - Excerpt:

```text
8: Resolving package metadata
9: 503 service unavailable from registry.example.com
10: install failed after 1 attempt
```

2. Test assertion failure
   - Severity: medium
   - Line: 13
   - Likely owner: Code owner for failing test
   - Next action: Extract the first failing test name, rerun it locally with the same seed or flags, and check recent commits touching that path.
   - Excerpt:

```text
12: FAIL: test_retries_after_registry_503
13: assertion failed: expected 3 attempts, received 1
14: FAILED: Build did NOT complete successfully
```

## First Response Checklist

- Confirm whether this is reproducible on a fresh rerun.
- Capture the exact target, package, shard, seed, and runner image.
- Compare the failing line with the most recent change touching that area.
- File the report with the owner named above and attach the excerpt.
