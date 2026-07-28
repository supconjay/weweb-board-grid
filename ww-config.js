export default {
  editor: { label: { en: "Board Grid" } },
  triggerEvents: [
    { name: "actionClick", label: { en: "On any row action click" }, event: { action: "", label: "", index: 0, id: "", row: {} } },
    { name: "action1", label: { en: "On action #1 click" }, event: { index: 0, id: "", row: {} } },
    { name: "action2", label: { en: "On action #2 click" }, event: { index: 0, id: "", row: {} } },
    { name: "action3", label: { en: "On action #3 click" }, event: { index: 0, id: "", row: {} } },
    { name: "linkClick", label: { en: "On link / pill cell click" }, event: { index: 0, id: "", key: "", value: "", row: {} } },
    { name: "rowClick", label: { en: "On row click" }, event: { index: 0, id: "", row: {} } },
    { name: "sortChange", label: { en: "On sort change" }, event: { key: "", dir: "" } },
    { name: "pageChange", label: { en: "On page change" }, event: { page: 1 } },
  ],
  properties: {
    // ---- header ----
    title: { label: { en: "Grid title" }, type: "Text", defaultValue: "Payouts requiring approval", bindable: true },
    subtitle: { label: { en: "Subtitle (optional)" }, type: "Text", defaultValue: "", bindable: true },
    centerTitle: { label: { en: "Center the title" }, type: "OnOff", defaultValue: false, bindable: true },
    showCount: { label: { en: "Show count badge" }, type: "OnOff", defaultValue: true, bindable: true },
    accentColor: { label: { en: "Accent color (left stripe)" }, type: "Color", defaultValue: "", bindable: true },
    icon: {
      label: { en: "Header icon" }, type: "TextSelect",
      options: { options: [
        { value: "", label: { en: "None" } },
        { value: "list", label: { en: "List" } },
        { value: "calendar", label: { en: "Calendar" } },
        { value: "alert", label: { en: "Alert" } },
        { value: "clock", label: { en: "Clock" } },
        { value: "check", label: { en: "Check" } },
        { value: "dollar", label: { en: "Dollar" } },
        { value: "file", label: { en: "Document" } },
        { value: "user-x", label: { en: "Unassigned" } },
        { value: "trending", label: { en: "Trending" } },
      ] }, defaultValue: "", bindable: true,
    },

    // ---- data ----
    // Bind your (already filtered) collection. Accepts an array or a WeWeb
    // collection ({ data: [...] }).
    items: {
      label: { en: "Rows (bind)" }, type: "Array", bindable: true,
      defaultValue: [
        { id: "r1", "PO#": "Unapproved Expense", "Project Address": "158 Hedges St SE Unit 2, Marietta, GA 30008", "Vendor": "Ebenezer Home Repair LLC", "Created from": "Project#2086 - 158 Hedges St SE Unit 2", "Amount": 80, "Description": "" },
        { id: "r2", "PO#": "Unapproved Expense", "Project Address": "150-164 Hedges St SE, Marietta, GA 30008", "Vendor": "HDN House Renovation Inc", "Created from": "Project#2903 - 150-164 Hedges St SE", "Amount": 4613, "Description": "" },
        { id: "r3", "PO#": "Unapproved Expense", "Project Address": "1339 Briarwood Drive Northeast, Unit 1, Atlanta, GA 30306", "Vendor": "Creative MultiCare LLC", "Created from": "Project#3080 - 1339 Briarwood Drive Northeast", "Amount": 200, "Description": "" },
        { id: "r4", "PO#": "Unapproved Expense", "Project Address": "828 Bramble Way, Grayson, GA 30017", "Vendor": "Sergio Gustavo Sanchez Córdoba", "Created from": "Project#3026 - 828 Bramble Way", "Amount": 565, "Description": "" },
        { id: "r5", "PO#": "Unapproved Expense", "Project Address": "14 Kayla Drive Northwest, Rome, GA 30165", "Vendor": "Independent Contracting Service Company", "Created from": "Project#3793 - 14 Kayla Drive Northwest", "Amount": 100, "Description": "" },
      ],
    },
    idKey: { label: { en: "Field: record id" }, type: "Text", defaultValue: "id", bindable: true, section: "settings" },

    // ---- columns ----
    // Each: { key, label, type, align, scale, tagColors }
    //   key: the field name on your record (Airtable field names OK, incl. spaces)
    //   type: "text" | "link" | "linkpill" | "status" | "tag" | "currency"
    //         | "percent" | "date" | "number"
    //     link      -> plain underlined text button (emits linkClick)
    //     linkpill  -> filled blue chip button (emits linkClick) — e.g. "Created from"
    //     status/tag-> auto-colored pill
    //     percent   -> Airtable fractions (0.51) render as "51%" (scale defaults
    //                  to 100, rounded to a whole number). Set scale:1 if your
    //                  field already holds whole percents (e.g. 51).
    //   tagColors: { "value": "success|warning|danger|info|slate" } for status/tag
    columns: {
      label: { en: "Columns" }, type: "Array", bindable: true, section: "settings",
      defaultValue: [
        { key: "PO#", label: "PO#", type: "text" },
        { key: "Project Address", label: "Project Address", type: "text" },
        { key: "Vendor", label: "Vendor", type: "text" },
        { key: "Created from", label: "Created from", type: "linkpill" },
        { key: "Amount", label: "Amount", type: "currency" },
        { key: "Description", label: "Description", type: "text" },
      ],
    },
    currency: { label: { en: "Currency" }, type: "Text", defaultValue: "USD", bindable: true, section: "settings" },

    // ---- sorting ----
    // Click a header to sort (asc -> desc -> off). Numeric/currency/percent and
    // date columns sort by value; others alphabetically. Empty cells sort last.
    // Per column you can add `sortable: false` to lock one, or `sortType`
    // ("text" | "number" | "date") to override the auto-detected sort.
    sortable: { label: { en: "Enable column sorting" }, type: "OnOff", defaultValue: true, bindable: true },
    defaultSortKey: { label: { en: "Default sort column (field key)" }, type: "Text", defaultValue: "", bindable: true, section: "settings" },
    defaultSortDir: {
      label: { en: "Default sort direction" }, type: "TextSelect",
      options: { options: [
        { value: "asc", label: { en: "Ascending" } },
        { value: "desc", label: { en: "Descending" } },
      ] }, defaultValue: "asc", bindable: true, section: "settings",
    },

    // ---- row action buttons (0-3) ----
    // Each: { label, event, tone }
    //   event: which trigger fires -> "action1" | "action2" | "action3"
    //   tone : "approve" (green) | "primary" | "neutral" | "ghost" (red) | "danger"
    // Every button ALSO fires the generic "actionClick" with { action, label, ... }
    // so you can drive one workflow and branch on `action` if you prefer.
    actions: {
      label: { en: "Row action buttons" }, type: "Array", bindable: true, section: "settings",
      defaultValue: [
        { label: "Edit", event: "action1", tone: "neutral" },
        { label: "Approve", event: "action2", tone: "approve" },
      ],
    },
    actionHeader: { label: { en: "Action column header" }, type: "Text", defaultValue: "Action", bindable: true },

    // ---- shared filters (bind all grids to the SAME variables) ----
    filterStatus: { label: { en: "Filter: status (bind)" }, type: "Text", defaultValue: "", bindable: true },
    filterManager: { label: { en: "Filter: project manager (bind)" }, type: "Text", defaultValue: "", bindable: true },
    search: { label: { en: "Search query (bind)" }, type: "Text", defaultValue: "", bindable: true },
    statusFilterKey: { label: { en: "Field the status filter matches" }, type: "Text", defaultValue: "Status", bindable: true, section: "settings" },
    managerFilterKey: { label: { en: "Field the manager filter matches" }, type: "Text", defaultValue: "assigned_to_name", bindable: true, section: "settings" },
    searchKeys: { label: { en: "Fields search scans (blank = all columns)" }, type: "Array", bindable: true, section: "settings", defaultValue: [] },

    // ---- pagination ----
    paginate: { label: { en: "Paginate (built-in)" }, type: "OnOff", defaultValue: true, bindable: true },
    pageSize: { label: { en: "Rows per page" }, type: "Number", options: { min: 1, max: 100, step: 1 }, defaultValue: 10, bindable: true },
    maxHeight: { label: { en: "Max grid height (px, 0 = auto)" }, type: "Number", options: { min: 0, max: 1200, step: 10 }, defaultValue: 0, bindable: true },
    emptyText: { label: { en: "Empty text" }, type: "Text", defaultValue: "No Rows To Show", bindable: true },

    // ---- theme (standard across pp- components) ----
    primaryColor: { label: { en: "Primary color" }, type: "Color", defaultValue: "#10b981", bindable: true },
    accent: { label: { en: "Accent color" }, type: "Color", defaultValue: "#6366f1", bindable: true },
    darkMode: {
      label: { en: "Theme mode" }, type: "TextSelect",
      options: { options: [
        { value: "auto", label: { en: "Auto (system)" } },
        { value: "light", label: { en: "Light" } },
        { value: "dark", label: { en: "Dark" } },
      ] }, defaultValue: "auto", bindable: true,
    },
    radius: { label: { en: "Corner radius (px)" }, type: "Number", options: { min: 0, max: 32, step: 1 }, defaultValue: 16, bindable: true },
  },
};
