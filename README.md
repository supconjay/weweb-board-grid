# pp-board-grid

A configurable table element for the **Coordination Board** — a sibling of
`pp-project-bucket`. Same engine (shared filters, pagination, count badge,
mobile card layout, standard `pp-` theme) plus two additions the Coordination
Board needs:

- **Up to 3 configurable action buttons per row** (Edit / Approve / View …),
  each firing its own trigger.
- A filled blue **`linkpill`** column type for chips like "Created from".

One element drives all three tables — *Payouts requiring approval*,
*Invoiced Jobs without a payout*, and *Estimates Ready For Review* — by
changing the **Columns** and **Row action buttons** config per instance.

---

## Configuring the columns

> **Why some cells show "—"**: a cell renders "—" when the column's `key`
> does not match a field name on your bound rows. Fix the `key`, and the
> cell fills in.

### You configure columns by binding the whole array to a formula

WeWeb's inspector **cannot edit the `key` / `label` / `type` of each column
inline** (the `Item 1 … Item N` list in the panel only exposes a bind
toggle, not the object fields). So to configure columns you bind the **entire
Columns array** to a formula.

1. In the right panel, click the **bind icon (⊘)** directly to the left of the
   **`+ Add`** button on the **Columns** row — the *array-level* bind toggle,
   **not** the ones inside `Item 1 … Item N`.
2. Choose **Formula / JavaScript**.
3. Paste an array of column objects (template below) and replace each `key`
   with the exact field name from your collection.

```js
[
  { key: "po_field",           label: "PO#",             type: "text" },
  { key: "address_field",      label: "Project Address", type: "text" },
  { key: "vendor_field",       label: "Vendor",          type: "text" },
  { key: "created_from_field", label: "Created from",    type: "linkpill" },
  { key: "Amount",             label: "Amount",          type: "currency" },
  { key: "description_field",  label: "Description",     type: "text" }
]
```

- **Order** in the array = column order, left-to-right.
- **Add / remove** columns by adding / deleting objects.
- `key` must match the field name **exactly**, including spaces and symbols
  (e.g. `"Created from"`, `"PO#"`). Airtable names with spaces are fine — they
  are quoted strings.

### Finding your real field names

- Open the **collection** bound to `Rows` and read its field list — those names
  (spaces, `#`, capitalization and all) are what go in `key`.
- A field that already renders (e.g. `Amount`) confirms its `key` is correct;
  leave it and fix the ones showing "—".

---

## Column `type` reference

`type` controls how each cell renders:

| `type`       | Renders as                                                        |
| ------------ | ----------------------------------------------------------------- |
| `text`       | Plain text (default)                                              |
| `link`       | Underlined blue text button → fires **`linkClick`**               |
| `linkpill`   | Filled blue chip button (the "Created from" style) → fires **`linkClick`** |
| `status`     | Auto-colored pill (color inferred from the value)                 |
| `tag`        | Same as `status`                                                  |
| `currency`   | Money, e.g. `$4,613.00` (uses the **Currency** property)          |
| `percent`    | Value × `scale`, then `%`. Airtable returns fractions (`0.51`), so add `scale: 100` → `51%` |
| `number`     | Numeric; optional `scale` multiplier                              |
| `date`       | `MM/DD/YYYY`                                                      |

### Optional per-column keys

| Key         | Applies to        | Purpose                                                                 |
| ----------- | ----------------- | ---------------------------------------------------------------------- |
| `scale`     | `percent`, `number` | Multiply the raw value before display (fractions → `scale: 100`)     |
| `align`     | any               | `"left"` \| `"center"` \| `"right"` (default `left`)                   |
| `tagColors` | `status`, `tag`   | Force pill colors, e.g. `{ "Review": "info", "Approved": "success" }`. Tones: `success` \| `warning` \| `danger` \| `info` \| `slate` |

Example status column with forced colors:

```js
{ key: "Status", label: "Status", type: "status",
  tagColors: { "Review": "info", "Approved": "success", "Rejected": "danger" } }
```

---

## Row action buttons

Configure **Row action buttons** the same way — bind the array to a formula.
Each entry is `{ label, event, tone }` (max 3):

```js
[
  { label: "Edit",    event: "action1", tone: "neutral" },
  { label: "Approve", event: "action2", tone: "approve" }
]
```

- `event`: which trigger fires — `"action1"`, `"action2"`, or `"action3"`.
  Use different events so each button drives a separate workflow
  (Edit → `action1`, Approve → `action2`).
- `tone`: button color — `"approve"` (green), `"primary"`, `"neutral"`,
  `"ghost"` (red), or `"danger"`.
- Every button **also** fires a generic **`actionClick`** carrying
  `{ action, label, index, id, row }`, so you can instead drive one workflow
  and branch on `action`.

---

## Configuring the three Coordination Board tables

All three are the *same element* — only `Columns` and `Row action buttons`
differ per instance.

| Table                        | Columns                                                                                          | Actions                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------ |
| Payouts requiring approval   | PO#, Project Address, Vendor, Created from *(linkpill)*, Amount *(currency)*, Description         | Edit → `action1`, Approve → `action2` |
| Invoiced Jobs without a payout | Project *(link)*, Total Invoiced *(currency)*, Expected Payouts *(currency)*, Total Tech Payouts *(currency)* | as needed                            |
| Estimates Ready For Review   | Name, Created From *(linkpill)*, Notes, Customer, Status *(status)*, Estimate $ *(currency)*      | View → `action1`                     |

The shared `filterStatus` / `filterManager` / `search` inputs work exactly like
`pp-project-bucket`, so one filter bar can drive every table on the board.

---

## Triggers (events)

| Event         | Payload                                              | Fires when                          |
| ------------- | --------------------------------------------------- | ----------------------------------- |
| `action1`     | `{ index, id, row }`                                 | Button whose `event` is `action1`   |
| `action2`     | `{ index, id, row }`                                 | Button whose `event` is `action2`   |
| `action3`     | `{ index, id, row }`                                 | Button whose `event` is `action3`   |
| `actionClick` | `{ action, label, index, id, row }`                  | Any action button (generic)         |
| `linkClick`   | `{ index, id, key, value, row }`                     | A `link` / `linkpill` cell is clicked |
| `rowClick`    | `{ index, id, row }`                                 | A row is clicked                    |
| `pageChange`  | `{ page }`                                           | Pagination page changes             |

## Building

```bash
npm run build   # weweb build --name=pp-board-grid --type=wwobject
```
