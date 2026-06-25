# Sample Report: Runner OOM

## Scenario

A test shard exits with code 137 after memory pressure on a shared CI runner.

## CI Failure Triage Report

- Findings: 1
- Signal lines: 4
- Non-empty log lines: 12
- Confidence: 46%

## Likely Causes

1. Process likely ran out of memory
   - Severity: high
   - Line: 7
   - Likely owner: Infrastructure or test owner
   - Next action: Rerun the failing job with memory metrics enabled, then split the largest test shard or increase the job memory limit.
   - Excerpt:

```text
6: running shard 18/24
7: signal: killed
8: process exited with code 137
```

## First Response Checklist

- Confirm whether this is reproducible on a fresh rerun.
- Capture the exact target, package, shard, seed, and runner image.
- Compare the failing line with the most recent change touching that area.
- File the report with the owner named above and attach the excerpt.
