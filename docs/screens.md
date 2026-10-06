# Screen map: app route → wireframe

Every app screen copies one wireframe from the BabyBadger design canvas. No screen is built without one.
If a screen needs something no wireframe covers, it goes into the canvas first, then the code.

| App route | Wireframe | Not built yet (left out on purpose, not redesigned) |
|---|---|---|
| `sign-in` | P0 Sign in, P0b Sign-in code | |
| `welcome` (signed out) + `onboarding` (choose) | P1 Welcome | "I have a kid code" (kid app) |
| `onboarding` (sitter) + `sitter/join` | S51 Join code | |
| `parent/(tabs)/index` live | P4 Live | Message, Call, Ask for photo; named places on map. While a trip is open the "On shift" pill becomes P8's "On a trip" pill ("Trip · needs you" while it waits for an OK) and opens P8 |
| `parent/(tabs)/index` setup | P4a HomeNew | House rules step; "Optional: add a kid's phone". Steps: Add your kids → Write the care plan (optional, done at 1+ care item; doesn't keep the checklist open by itself) → Invite your sitter → Book the first shift. Booking is locked until kids are added and a sitter has signed |
| `parent/(tabs)/index` setup skipped | P4e HomeExplore | House rules, Kids & devices tiles (Care plan tile → P7 is built) |
| `parent/(tabs)/index` idle | P4b HomeIdle | "Needs you" (invoices, requests), devices |
| `parent/(tabs)/index` soon | P4c HomeSoon | "On my way", Message, Leave a note |
| `parent/(tabs)/index` ended | P4d HomeEnded | Approve hours / pay |
| `parent/shift/[id]` completed | P5 Report | Approve hours, total pay, replay route, house-rules check |
| `parent/(tabs)/calendar` | P6b CalWeek | Day / Month switch and views |
| `parent/shift/new` | E2 ParentCalendar (book a shift) | Sitter availability check. Until the parent types in it, Tasks fills with the care plan items that fall on that day inside the shift ("3:15 Pick up Ava", "1:00 Nap · Mia"); a repeating item adds one line per interval ("12:00 Bottle", "3:00 Bottle"), from its start time (or the shift start) until its Until time or the shift end; the old sample tasks are now the placeholder |
| `parent/(tabs)/sitters` | P54 Sitters, P54b none yet | When do you need someone, availability, find a new sitter, meet requests |
| `parent/invite` | P3 Invite (from Home setup) or P3b (from Sitters) → P24 Review and send | Phone number, rate, requirements; the app shares a code instead of a personal link |
| `parent/kid/new` | P18 AddChild, P19 ChildCare | P20 routine, P21 sitter access, Add a photo, Lives at home. |
| `parent/kid/new?id=&step=1\|2` (edit) | P18e EditChild (P55 Edit), P19e EditCare (P55 Care and safety) | Same left-outs as P18/P19. Each screen saves on its own |
| `parent/kid/[id]` | P55 ChildProfile (from Home's KIDS rows) | Grade and school line, kid location line, See on map / Message tiles (the plan tile keeps its third of the row and reads "Plan": no gender stored for "Her plan"; opens P7), phone / Who looks after rows. Routine row → P20, sub = first 3 items ("Nap 1–3 · Bottle every 3 hrs · Bedtime 7:30") or "Add naps, meals and bedtime". "Care and safety" sub says "them" (no gender stored) |
| `parent/care` | P7 CarePlan (from P55 Plan tile, Home setup step, P4e tile) | Requirements pill, "Weekday after school" template row and Templates link, Trip tags. Tasks = whole-family items except food; Meals = meals and bottles; Routines = one row per kid ("Mia’s day", "3 items · Nap, Bottle, Bedtime") → P20. Row sub-lines start with the days, or the repeat ("Every 3 hrs", "Every 2 hrs · Weekdays"). Row titles carry the type's extras ("Bottle · 4 oz formula", "Tylenol · 5 ml"; a diaper item reads "Diaper check" or "Potty break"). Rows open P20a; "+ Add task" on Meals opens P20a as a Meal |
| `parent/kid/routine?kidId=` | P20 ChildRoutine (from P55 Routine row and P7 Routines) | Add-a-child step header (a plain back header instead), Places row, "Set a time … to continue" footer + Continue. "Suggested for age N" shows saved items plus the age suggestions not yet added (not saved; tapping one opens P20a prefilled); "Start blank" shows saved items only. Under 1 the segment reads "Suggested for babies"; no birthday: "Suggested". No empty card when there are no rows. Repeating items show the start chip then "Every 3 hrs" (no start time: an "Every 2 hrs" chip, then the days only when not every day; the wireframe's "Log each change" needs "Sitter logs it"). Baby suggestions Bottle / Diaper check come with Every 3 / Every 2 hrs (no amounts: the parent adds those on P20a). Bottle and medicine extras follow the days in the sub-line ("Every 3 hrs · 4 oz formula", "Every day · 5 ml") |
| `parent/care/item` | P20a RoutineItem; P20d MealItem ("Which meal": Breakfast / Lunch / Snack / Dinner names the item); P20c CareTask (Activity / Other: Name field, "Ends", "Remove from care plan", off-day circles); P20f DiaperItem; P20g MedicineItem (modal; `?id=` edit, `?kidId=`, `?type=`, `?title=`, `?every=`). Each type shows only its own options. Bottle: Amount (number, oz up to 32 or ml up to 1000, "4,5" ok) beside a Unit dropdown (`SelectField`, oz / ml, oz by default), as P20e draws them, then Milk (Formula / Breast milk / Whole milk); rows read "Bottle · 4 oz formula" / "Bottle · 120 ml breast milk". Diaper (P20f): "Diapers or potty" (Diapers / Potty training) with the hint "The sitter logs #1 or #2 at each change."; no name, the item reads "Diaper check" or "Potty break". Medicine (P20g): "Which medicine" (the title) and Dose ("5 ml"), stacked. Meal: "Which meal". Activity / Other: Name. Nap / Bedtime: nothing extra. "How often" sits between Starts/Ends and Repeats only for Bottle and Diaper (Once / Every 2 h / Every 3 h / Every 4 h) and Medicine (Once / Every 4 h / Every 6 h / Every 8 h), plus a saved odd interval like "Every 90 min"; with a repeat the second time reads "Until" ("End of shift" when empty). Other types save as once, and the second time reads "Ends" ("Lights out by" for Bedtime). Extras are stored in `details` (bottle `amount` + `unit`, `milk`; older bottles saved `amount_oz`, read as ounces and rewritten as `amount` + `unit` on the next save; diaper `potty`; medicine `dose`), keeping only the chosen type's keys. Needs migration 08 (`every_minutes`, `details`); until it runs, items without a repeat or extras still save | "Remind the sitter" and "Sitter logs it" switches. Not drawn: the remove confirm ("Remove Bedtime?" Keep it / Remove) |
| every time field (`components/TimeField.tsx`) | P20b TimeWheel | Native wheel; older builds and the web preview fall back to typing |
| `parent/(tabs)/messages` | P10 Messages | Messaging (placeholder) |
| `parent/(tabs)/settings` | P12b Settings · account | Arrivals and off-plan/help alert rows (need help alerts), subscription; Kids and devices detail (P13). "Homes and places" reads "2 homes, 3 places" and opens P56 |
| `sitter/(tabs)/index` | S3 Today / S3b HomeFree / S3d nothing booked | Running late, credentials, invoices, pay stats, pool requests |
| `sitter/consent/[familyId]` | S2 Consent, S2a Monitoring notice | Terms and Privacy documents ([LEGAL REVIEW]) |
| `sitter/shift/[id]` | S4 ActiveShift, S9 EndShift | House rules due, fix times, report injury. Trip tile (first, S8) and S9's Trips count are built; the open trip shows as a strip under the tiles with End trip (not drawn) |
| `sitter/log/[shiftId]` | S44 AddLog, S5 LogFood, S45 LogNap, S46–S49 | "Due" badges (needs house rules); the old "needs the parents' attention" toggle was removed (not in the wireframes). S48 diaper choices read "#1" / "#2" / "Both" / "Dry" (still stored as wet / dirty / both / dry, so old logs read the same); the timeline, report and push alert (migration 08) show the same words |
| `sitter/(tabs)/calendar` | S6 Calendar | Availability, time off |
| `sitter/(tabs)/families` | S50 Families | Per-family colors (stored nowhere yet; colors follow join order) |
| `sitter/family/[id]` | S10 Family | Routines, parents' phone numbers, home address, S12 privacy link |
| `sitter/(tabs)/me` | S39 Me | My profile, What families see, credentials, background check, languages, availability, pay, invoices |
| `sitter/(tabs)/messages` | S37 Messages | Messaging (placeholder) |
| `parent/places` (from Settings P12b) | P56 Homes and places | Tab bar (pushed screen, like House rules); times on other places ("School · 8–3", "Thu 4:30", "Visits": none stored, the row shows the days or nothing). Homes then other places, main home first; each row: tile (blue main home, pink other homes, gray places with a book / ball / heart / pin icon picked from the name), MAIN pill, address, kid circles, days ("Mon – Thu", "Fri – Sun", "Every day"). Needs migration 16; until it runs the screen says so |
| `parent/places/new?kind=home\|place` | P58 Add a place | Typing searches the phone's map (expo-location geocoding, top 3 matches); a match or "Use where I am now" opens P57 as a new home / place. Not drawn: "Other place" picked (hint reads P56's places line, co-parent note hidden); no match and the web preview (the typed address is the one row: "Not found on the map yet. You can still save it."); "Turn on location…" warning. The co-parent note shows only when the family has another parent |
| `parent/places/[id]` (`draft?kind=` = new) | P57 Edit a home | Map: react-native-maps with the zone circle on the phone; the wireframe's drawn map on the web and before an address has a map position. Not drawn: the same screen for an other place ("Alert zone size", "WHO GOES HERE, AND WHEN", no Main switch, no arriving notes), the "couldn't find this address on the map" / web "looked up in the app on your phone" hint, the "move the upcoming shifts first" message on remove, the remove confirm. Every kid / every day saves as null; the only home is always Main; switching Main off (or removing the main home) makes the next home Main |
| `parent/shift/new` "Where" row | (not drawn in E2) | Shows only with 2+ homes: home chips, default = the home whose days include the shift day (and its kids), else Main (nP14 "changeable per shift"). place_id is sent only for a non-main home |
| `parent/rules` (+ `/add`, `/rule`) | P74 HouseRules, P75 AddRules, P76 RuleDetail | Preview; per-sitter rules; empty list state (no wireframe); "Write your own rule" title field (not drawn) |
| `sitter/rules/[familyId]`, `sitter/shift-rules/[shiftId]` | S42 HouseRules, S43 ShiftRules | Screen-time card/timer; care-plan timing on log rows; DUE badges on S44 |
| `parent/(tabs)/messages`, `sitter/(tabs)/messages` | P10 Messages, S37 Messages | Call button (no phone stored), trip pills, extend-request link; parents can't send photos; empty states not drawn |
| `parent/invite` → P23 → P24 → `parent/invite/[id]` | P3 (Step 4 of 5) / P3b, P23 InviteAccess, P24, P25 InvitePending, P26 InviteAccepted | Requirements (P28–P32), phone/SMS links (code-based), saved-places line, "See it from Maya's side", P11 profile |
| `onboarding` (sitter) / `sitter/join` → S1 → S42 → S2 | S51, S1 Invite (component), S42, S2 | Decline reason; S51 "Your name" field shows only for brand-new sitters (not drawn) |
| `parent/(tabs)/calendar` | P6a CalDay, P6b CalWeek, P6c CalMonth | Waiting/requests, trip/food tags, booking with the tapped date |
| `sitter/(tabs)/calendar`, `sitter/availability` | S6, S6a CalDay, S6c CalMonth, S11 Availability | Requests, travel time, pay cards, editing/removing time off (needs a design) |
| S3 "Running late?" → sheet (also S22's footer) | S21 RunningLate; parent sees P4h (late notice on "starting soon") | Distance card shows only when the phone knows her position and she's outside the home zone ("about N min by car" assumes 18 mph) |
| `parent/(tabs)/index` live link → sheet; `sitter/shift/[id]` card | P4g AskStayLonger (parent), S25 ExtendShift (sitter, inline on S4) | S25 dimmed-background presentation; "Location sharing keeps running…" line |
| `sitter/incident/[shiftId]` (from S4 "Report an injury") | S24 Incident | — |
| `parent/alerts` (urgent pushes open it) | P9 Alerts | "Call Maya" (no phone stored); no visible entry from Home yet. Built: off-plan card ("See on map" opens the live shift, "This is expected, dismiss"), trip rows (open P8). Not drawn: rows for a "Somewhere else" trip request and a clock-in-away request (a tap asks Not now / Yes) |
| `sitter/trip/[shiftId]` (S4 Trip tile; sheet) | S8 StartTrip | Not drawn: the name field under "Somewhere else" once it's picked, and its footer line ("Jen is asked first, then gets an alert when you leave.") |
| `sitter/clockin/[shiftId]` (S3 Clock in when outside the home zone) | S22 ClockInBlocked | Zone is in feet ("within 150 ft"), not meters. Not drawn: "Keep this screen open" while auto clock-in is on; waiting / yes / no lines on "Starting somewhere else?" (yes → tap clocks in) |
| `parent/trip/[id]` (trip pushes, P9 trip rows, P4 "On a trip" pill) | P8 Trip | Call (no phone stored). Not drawn: pill + heading for waiting / arrived / ended, Not now / Let her go on a "Somewhere else" trip |
| push alerts (migration 17) | C2 ArrivalAlert | Trip started ("Maya left home with Ava" / "Heading to … by car"), Arrival ("Maya and Ava arrived at …" / "Trip by car took 17 min. Tap to see the map."), off-plan, trip request, clock-in-away request and the answers. The "Sitter app · Arrival" header line is the phone's, not set by the app |

## HTML is the source

`tools/wf2rn/convert.py` translates a wireframe's HTML into a React Native layout (`app/src/wireframes/<ID>.tsx`):
same structure, sizes, spacing, colors, fonts, copy and the original SVG icons. `tools/wf2rn/build_all.sh` regenerates
them all. In development, `/wireframe/<ID>` shows a generated layout in the app.

A real screen starts as a copy of its generated layout; data and actions are then wired in. The generated files are
never edited by hand.

`tools/wf2rn/diff.py` measures each screenshot against its wireframe image. Generated layouts land at 0.5–8% of
pixels different (mostly text anti-aliasing); the real screens are held to the same check.

## Ported from generated layouts

All 73 built screens are rebuilt from `app/src/wireframes/<ID>.tsx` with live data:
P0, P0b, P1, P3, P3b, P4, P4a, P4b, P4c, P4d, P4e, P5, P6b, P7, P12b, P18, P18e, P19, P19e, P20, P20a, P20b, P20c, P20d, P20e, P20f, P20g, P23, P4g, P4h, P9, P24, P25, P26, P6a, P6c, P10, P74, P75, P76, P56, P57, P58, P54, P54b, P55, S2, S2a, S3, S3b, S3d, S4, S5, S9, S10, S39, S44, S45, S50, S51, S1, S6a, S6c, S11, S37, S42, S43, S21, S24, S25, S8, S22, P8.

## How screens are checked

1. Sample data matches the wireframes (the Lee family, Jen, Maya, Ava, Leo).
2. Each screen is screenshotted at 390 px on the web build next to its wireframe.
3. Differences in layout, order, labels or spacing are fixed before review.
