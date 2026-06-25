# CI Failure Triage Kit

Public demo for a paid local CI log triage kit.

The tool turns noisy CI logs into a concise Markdown report with likely cause, owner, next action, and high-signal excerpts.

## Buy

Solo license: USD 19 equivalent in BTC.

Approximate quote at USD 59,350/BTC on `2026-06-25T18:40:42Z`: `0.00032013 BTC` / `32,013 sats`.

Payment URI:

```text
bitcoin:17H6WFD7dtbfQCP6A8Y34Qt3Yui9ehLenD?label=CI%20Failure%20Triage%20Kit
```

Scan:

![BTC payment QR](https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=bitcoin%3A17H6WFD7dtbfQCP6A8Y34Qt3Yui9ehLenD%3Flabel%3DCI%2520Failure%2520Triage%2520Kit)

After payment, open a fulfillment request:

https://github.com/agentydragon/ci-failure-triage-kit/issues/new?template=paid-fulfillment.yml

Include the transaction ID and a PGP public key. Do not post private contact details or private logs in a public issue. The paid zip can be returned as a PGP-encrypted attachment.

## Demo

This repo contains a public demo build. The full paid package unlocks local paste-and-analyze behavior for private CI logs.

Sample reports:

- [Runner OOM](public/samples/oom-report.md)
- [Registry 503](public/samples/network-report.md)
- [Credential failure](public/samples/permission-report.md)

Consulting add-ons:

- [CI Failure Triage Consulting](public/consulting.md)
- [BTC Pricing Guide](public/pricing.md)

GitHub Pages is configured for this repo, but the account-level Pages domain currently redirects to `agentydragon.com`, which is not responding. Until that domain is fixed, use this repository page as the public payment surface.

## Privacy

The paid app runs locally in the browser and does not upload logs.
