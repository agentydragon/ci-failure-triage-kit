# BTC Pricing Guide

BTC/USD quote used for this guide: USD 59,350 per BTC at `2026-06-25T18:40:42Z`.

| Offer | USD reference | Approx BTC | Approx sats |
| --- | ---: | ---: | ---: |
| Solo license | USD 19 | 0.00032013 BTC | 32,013 sats |
| Team license | USD 49 | 0.00082561 BTC | 82,561 sats |
| Single failure review | USD 250 | 0.00421230 BTC | 421,230 sats |
| Custom failure pattern pack | USD 500 | 0.00842460 BTC | 842,460 sats |
| Recurring failure cleanup | USD 750 | 0.01263690 BTC | 1,263,690 sats |

BTC moves quickly. Use these as approximate reference amounts, then include the actual transaction ID in the fulfillment request.

Payment URI:

```text
bitcoin:17H6WFD7dtbfQCP6A8Y34Qt3Yui9ehLenD?label=CI%20Failure%20Triage%20Kit
```
