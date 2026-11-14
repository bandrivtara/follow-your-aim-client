# Health nutrition package integration

Last verified: 2026-11-14.

## Responsibility boundary

The separate Health project owns personal and medical context, preferences,
nutrition calculations, recipes, shopping planning, and weekly analysis.
Follow Your Aim only validates, imports, stores, and renders an approved weekly
package. It does not call FatSecret or another external nutrition API.

Medical analyses, diagnoses, medications, and the complete Health profile must
never be included in the import.

## Firebase storage

- Collection: nutritionWeek.
- Document ID: the Monday weekStart in YYYY-MM-DD.
- One document stores one complete weekly package.
- Import uses setDoc; reimport preserves local meal execution and shopping
  checkboxes by stable IDs before replacing the document.
- The collection is included in the full Firebase backup.

## Supported package versions

The client accepts fya-nutrition-v1 and fya-nutrition-v2.

Required:

- schemaVersion;
- settings.calorieTarget and settings.proteinTarget;
- plan.weekStart, plan.weekEnd, and exactly seven ordered plan.days;
- every meal has a stable id, title, time, calories, and protein.

Optional:

- fat, carbs, fiber, and saturated-fat targets;
- notes and recipe links;
- recipes with ingredients, steps, prep, storage, time, and equipment;
- shoppingTrips with stable trip/item IDs, quantities, categories, stores,
  planned dates, and estimated prices.

The v2 package adds shoppingTrips and richer recipe metadata. Existing v1
Health files remain importable.

## User-maintained state

Follow Your Aim adds:

- meal status: pending, eaten, or skipped;
- optional skip reason;
- shopping-item checked state.

These values belong to Follow Your Aim and survive a repeat import of the same
week when stable IDs remain unchanged.
