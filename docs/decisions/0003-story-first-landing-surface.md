# 0003 — Lead with a daily story, keep the wheel as the depth layer

## Context

The first slice was a competent chart viewer: enter a birth time, see a wheel. That serves people who already know astrology. The product is meant as a daily coach for the general public, and a chart alone gives such a reader nothing to do today.

## Decision

Make the daily story the landing surface. For the current moment (device clock, `Europe/Tallinn` as the operating timezone) the app computes a real transit against the stored natal chart and renders one day's unit in two tiers: a plain tier with no astrology vocabulary, and a four-paragraph story tier. A "Miks see?" reveal is the only place that names the transiting body, aspect, orb and natal placement. The wheel and the chart lists remain available as the depth layer underneath.

## Consequence

The transit engine and the meaning layer became core rather than extras, and both have their own gates: transit fixtures at 0.01°, and structural/content tests over the meaning units. The story is necessarily one unit per day, so selection rules (focus areas, tightest orb, three honest day states including a genuinely quiet sky) matter and are tested. A day with no unit in orb says so instead of inventing content.
