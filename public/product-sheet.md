# CI Failure Triage Kit Product Sheet

## What It Does

CI Failure Triage Kit turns pasted CI logs into a Markdown report that names:

- likely failure class
- likely owner
- next action
- high-signal log excerpt
- first-response checklist

The paid app runs locally in the browser and does not upload private CI logs.

## Who It Is For

- Platform engineers who get vague "CI is broken" pings.
- Startup CTOs and tech leads without a dedicated CI owner.
- Maintainers who need repeatable handoffs for noisy build failures.
- Teams that want deterministic local triage instead of sending logs to an AI service.

## Covered Failure Classes

- Out of memory / exit 137
- Runner disk exhaustion
- Registry and network failures
- Credential and permission failures
- Dependency lockfile and resolver conflicts
- Test assertion failures
- Formatter, linter, and type checker failures
- Bazel and remote execution failures
- Container image and runtime failures
- Timeouts and hangs

## What Buyers Receive

- Static browser app
- Failure taxonomy
- CI incident report template
- Local-only workflow docs
- Encrypted delivery option through a public GitHub fulfillment issue

## Pricing

- Solo license: USD 19 equivalent in BTC
- Team license: USD 49 equivalent in BTC
- Consulting add-ons: USD 250 to USD 750 equivalent in BTC

BTC pricing guide:

`https://github.com/agentydragon/ci-failure-triage-kit/blob/main/public/pricing.md`

## Buy

Payment URI:

```text
bitcoin:17H6WFD7dtbfQCP6A8Y34Qt3Yui9ehLenD?label=CI%20Failure%20Triage%20Kit
```

Fulfillment:

`https://github.com/agentydragon/ci-failure-triage-kit/issues/new?template=paid-fulfillment.yml`
