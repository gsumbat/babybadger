# Screen map: app route → wireframe

Every app screen copies one wireframe from the BabyBadger design canvas. No screen is built without one.
If a screen needs something no wireframe covers, it goes into the canvas first, then the code.

| App route | Wireframe | Not built yet (left out on purpose, not redesigned) |
|---|---|---|
| `sign-in` | P1 Welcome (hero) | Sign-in has no wireframe of its own; uses the P1 hero + email code |
| `onboarding` (choose) | P1 Welcome | "I have a kid code" (kid app) |
| `parent/(tabs)/index` live | P4 Live | Message, Call, Ask for photo; named places on map |
| `parent/(tabs)/index` setup | P4a HomeNew | Requirements and care plan steps |
| `parent/(tabs)/index` idle | P4b HomeIdle | "Needs you" (invoices, requests), devices |
| `parent/(tabs)/index` soon | P4c HomeSoon | "On my way", Message, Leave a note |
| `parent/(tabs)/index` ended | P4d HomeEnded | Approve hours / pay |
| `parent/shift/[id]` completed | P5 Report | Approve hours, total pay, replay route, house-rules check |
| `parent/(tabs)/calendar` | P6b CalWeek | Day / Month views |
| `parent/shift/new` | E2 ParentCalendar (book a shift) | Sitter availability check |
| `parent/(tabs)/sitters` | P27 / P54 Sitters | Pool, find a sitter, resend/expired states |
| `parent/invite` | P3 Invite → P24 Review and send | Phone number, sending by SMS from the app |
| `parent/kid/new` | P18 AddChild, P19 ChildCare | P20 routine, P21 sitter access, photo, lives at home |
| `parent/(tabs)/messages` | P10 Messages | Messaging (placeholder) |
| `parent/(tabs)/settings` | P12 Settings | Alerts toggles, homes and places, house rules, subscription |
| `sitter/(tabs)/index` | S3 Today / S3b HomeFree | Running late, credentials, invoices, pay stats, pool requests |
| `sitter/consent/[familyId]` | S2 Consent, S2a Monitoring notice | Terms and Privacy documents ([LEGAL REVIEW]) |
| `sitter/shift/[id]` | S4 ActiveShift, S9 EndShift | Trips, house rules due, fix times, report injury |
| `sitter/log/[shiftId]` | S44 AddLog, S5 LogFood, S45 LogNap, S46–S49 | "Due" badges (needs house rules) |
| `sitter/(tabs)/calendar` | S6 Calendar | Availability, time off |
| `sitter/(tabs)/families` + `sitter/family/[id]` | S10 Family | Routines, parent phone, home address |
| `sitter/(tabs)/me` | S39 Me | Profile, credentials, availability, pay, invoices |
| `sitter/(tabs)/messages` | S37 Messages | Messaging (placeholder) |

## How screens are checked

1. Sample data matches the wireframes (the Lee family, Jen, Maya, Ava, Leo).
2. Each screen is screenshotted at 390 px on the web build next to its wireframe.
3. Differences in layout, order, labels or spacing are fixed before review.
