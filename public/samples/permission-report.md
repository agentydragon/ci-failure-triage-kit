# Sample Report: Credential Failure

## Scenario

A deploy job fails after a token or secret loses required permissions.

## CI Failure Triage Report

- Findings: 1
- Signal lines: 3
- Non-empty log lines: 10
- Confidence: 42%

## Likely Causes

1. Credential or permission problem
   - Severity: high
   - Line: 5
   - Likely owner: Repository or secret owner
   - Next action: Confirm the job has the expected token scope, secret name, and filesystem permissions. Rotate leaked or over-broad credentials.
   - Excerpt:

```text
4: pushing image manifest
5: denied: requested access to the resource is denied
6: error: unauthorized: authentication required
```

## First Response Checklist

- Confirm whether this is reproducible on a fresh rerun.
- Capture the exact target, package, shard, seed, and runner image.
- Compare the failing line with the most recent change touching that area.
- File the report with the owner named above and attach the excerpt.
