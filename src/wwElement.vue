<template>
  <div class="pp-root" :class="themeClass" :style="rootStyle">
    <div class="pp-card" :class="{ 'pp-card--accent': !!content.accentColor }">
      <div class="pp-card__header" :class="{ 'pp-card__header--center': content.centerTitle === true }">
        <div class="pp-card__titles">
          <h2 class="pp-card__heading">
            <svg v-if="content.icon" class="pp-svg pp-card__icon" v-bind="svgAttrs"><path :d="ic(content.icon)"></path></svg>
            <span>{{ content.title }}</span>
            <span v-if="content.showCount !== false" class="pp-count">{{ totalCount }}</span>
          </h2>
          <p v-if="content.subtitle" class="pp-card__sub">{{ content.subtitle }}</p>
        </div>
      </div>

      <div class="pp-grid__wrap" :style="wrapStyle">
        <table class="pp-grid">
          <thead>
            <tr>
              <th
                v-for="col in columns" :key="col.key"
                :class="[alignClass(col), { 'pp-th--sortable': isSortable(col), 'pp-th--active': sortKey === col.key }]"
                @click="isSortable(col) && toggleSort(col)"
              >
                <span class="pp-th__inner">
                  <span>{{ col.label }}</span>
                  <svg v-if="isSortable(col)" class="pp-svg pp-th__sort" v-bind="svgAttrs"><path :d="ic(sortKey === col.key ? (sortDir === 'asc' ? 'arrow-up' : 'arrow-down') : 'sort')"></path></svg>
                </span>
              </th>
              <th v-if="actions.length" class="pp-grid__actionhead pp-al-right">{{ content.actionHeader || '' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in pagedRows" :key="r._i" @click="emitRow(r)">
              <td v-for="col in columns" :key="col.key" :data-label="col.label" :class="alignClass(col)">
                <template v-if="col.type === 'link' || col.type === 'linkpill'">
                  <button v-if="rawVal(col, r.data)" type="button" :class="col.type === 'linkpill' ? 'pp-pillbtn' : 'pp-linkbtn'" @click.stop="emitLink(r, col)">{{ display(col, r.data) }}</button>
                  <span v-else class="pp-muted">—</span>
                </template>
                <template v-else-if="col.type === 'status' || col.type === 'tag'">
                  <span v-if="rawVal(col, r.data)" class="pp-pill" :class="`pp-pill--${toneFor(col, r.data)}`"><span class="pp-pill__dot"></span>{{ display(col, r.data) }}</span>
                  <span v-else class="pp-muted">—</span>
                </template>
                <template v-else>
                  <span :class="{ 'pp-muted': isEmpty(rawVal(col, r.data)) }">{{ isEmpty(rawVal(col, r.data)) ? '—' : display(col, r.data) }}</span>
                </template>
              </td>
              <td v-if="actions.length" class="pp-grid__action pp-al-right" :data-label="content.actionHeader || ''">
                <div class="pp-actions">
                  <button v-for="(a, ai) in actions" :key="ai" type="button" class="pp-btn" :class="`pp-btn--${a.tone || 'ghost'}`" @click.stop="emitAction(r, a)">{{ a.label }}</button>
                </div>
              </td>
            </tr>
            <tr v-if="!pagedRows.length"><td :colspan="colspan" class="pp-empty">{{ content.emptyText || 'No Rows To Show' }}</td></tr>
          </tbody>
        </table>
      </div>

      <div v-if="paginationActive" class="pp-pager">
        <span class="pp-pager__range">{{ rangeStart }} to {{ rangeEnd }} of {{ totalCount }}</span>
        <div class="pp-pager__nav">
          <button class="pp-iconbtn" type="button" :disabled="page <= 1" @click="goPage(1)" aria-label="First"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('chevrons-left')"></path></svg></button>
          <button class="pp-iconbtn" type="button" :disabled="page <= 1" @click="goPage(page - 1)" aria-label="Previous"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('chevron-left')"></path></svg></button>
          <span class="pp-pager__pageno">Page {{ page }} of {{ pageCount }}</span>
          <button class="pp-iconbtn" type="button" :disabled="page >= pageCount" @click="goPage(page + 1)" aria-label="Next"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('chevron-right')"></path></svg></button>
          <button class="pp-iconbtn" type="button" :disabled="page >= pageCount" @click="goPage(pageCount)" aria-label="Last"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('chevrons-right')"></path></svg></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const ICONS = {
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  alert: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  check: "M20 6L9 17l-5-5",
  dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  "user-x": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 8l5 5M22 8l-5 5",
  trending: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  "chevron-left": "M15 18l-6-6 6-6",
  "chevron-right": "M9 18l6-6-6-6",
  "chevrons-left": "M11 17l-5-5 5-5M18 17l-5-5 5-5",
  "chevrons-right": "M13 17l5-5-5-5M6 17l5-5-5-5",
  sort: "M8 9l4-4 4 4M16 15l-4 4-4-4",
  "arrow-up": "M12 19V5M5 12l7-7 7 7",
  "arrow-down": "M12 5v14M19 12l-7 7-7-7",
};

export default {
  props: { content: { type: Object, required: true }, uid: { type: String, required: false } },
  emits: ["trigger-event"],
  data() {
    return {
      page: 1,
      sortKey: (this.content && this.content.defaultSortKey) || "",
      sortDir: (this.content && this.content.defaultSortDir) === "desc" ? "desc" : "asc",
    };
  },
  watch: {
    rowsLength(n) { const pc = Math.max(1, Math.ceil(n / this.pageSizeN)); if (this.page > pc) this.page = pc; },
    filterSig() { this.page = 1; },
  },
  computed: {
    rows() {
      let raw = this.content.items;
      if (raw && !Array.isArray(raw) && Array.isArray(raw.data)) raw = raw.data;
      if (!Array.isArray(raw)) return [];
      return raw.map((data, _i) => ({ data: data && typeof data === "object" ? data : { value: data }, _i }));
    },
    // Rows after the SHARED filters (status / manager / search) are applied.
    // Bind these three inputs to the same page variables across every grid and
    // one filter bar drives them all.
    filteredRows() {
      const rows = this.rows;
      const st = String(this.content.filterStatus || "").trim().toLowerCase();
      const mg = String(this.content.filterManager || "").trim().toLowerCase();
      const q = String(this.content.search || "").trim().toLowerCase();
      if (!st && !mg && !q) return rows;
      const stKey = this.content.statusFilterKey || "Status";
      const mgKey = this.content.managerFilterKey || "assigned_to_name";
      const sKeys = Array.isArray(this.content.searchKeys) && this.content.searchKeys.length
        ? this.content.searchKeys : this.columns.map((c) => c.key);
      return rows.filter((r) => {
        const d = r.data;
        if (st && String(this.unwrap(d[stKey]) || "").trim().toLowerCase() !== st) return false;
        if (mg) {
          const tokens = this.managerTokens(d[mgKey]);
          if (!tokens.some((t) => t.toLowerCase().indexOf(mg) !== -1)) return false;
        }
        if (q && !sKeys.some((k) => String(this.unwrap(d[k]) || "").toLowerCase().indexOf(q) !== -1)) return false;
        return true;
      });
    },
    filterSig() { return [this.content.filterStatus, this.content.filterManager, this.content.search].join("|"); },
    rowsLength() { return this.filteredRows.length; },
    // Client-side sort on top of the filtered rows. No sortKey = natural order.
    sortedRows() {
      if (!this.sortKey) return this.filteredRows;
      const col = this.columns.find((c) => c.key === this.sortKey);
      if (!col) return this.filteredRows;
      const dir = this.sortDir === "desc" ? -1 : 1;
      return this.filteredRows.slice().sort((a, b) => {
        const va = this.sortVal(col, a.data), vb = this.sortVal(col, b.data);
        const ea = va === null, eb = vb === null;
        if (ea && eb) return 0;
        if (ea) return 1;            // empties always sort last
        if (eb) return -1;
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
        return String(va).localeCompare(String(vb), undefined, { numeric: true }) * dir;
      });
    },
    columns() {
      const c = Array.isArray(this.content.columns) ? this.content.columns : [];
      return c.filter((x) => x && (x.key || x.label));
    },
    actions() {
      const a = Array.isArray(this.content.actions) ? this.content.actions : [];
      return a.filter((x) => x && x.label).slice(0, 3);
    },
    totalCount() { return this.filteredRows.length; },
    pageSizeN() { const n = Number(this.content.pageSize); return n > 0 ? Math.floor(n) : 10; },
    pageCount() { return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSizeN)); },
    paginationActive() { return this.content.paginate !== false && this.pageCount > 1; },
    pageClamped() { return Math.min(Math.max(1, this.page), this.pageCount); },
    pagedRows() {
      if (this.content.paginate === false) return this.sortedRows;
      const start = (this.pageClamped - 1) * this.pageSizeN;
      return this.sortedRows.slice(start, start + this.pageSizeN);
    },
    rangeStart() { return this.filteredRows.length ? (this.pageClamped - 1) * this.pageSizeN + 1 : 0; },
    rangeEnd() { return Math.min(this.pageClamped * this.pageSizeN, this.filteredRows.length); },
    colspan() { return this.columns.length + (this.actions.length ? 1 : 0); },
    wrapStyle() {
      const h = Number(this.content.maxHeight);
      return h > 0 ? { maxHeight: h + "px", overflowY: "auto" } : {};
    },
    svgAttrs() {
      return { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" };
    },
    themeClass() {
      const m = this.content.darkMode || "auto";
      return { "pp-auto": m === "auto", "pp-dark": m === "dark", "pp-light": m === "light" };
    },
    rootStyle() {
      return {
        "--pp-primary": this.content.primaryColor || "#10b981",
        "--pp-accent": this.content.accent || "#6366f1",
        "--pp-stripe": this.content.accentColor || "transparent",
        "--pp-radius": (this.content.radius != null ? this.content.radius : 16) + "px",
      };
    },
  },
  methods: {
    ic(name) { return ICONS[name] || ""; },
    unwrap(v) {
      if (Array.isArray(v)) {
        const list = v.filter((x) => x != null && x !== "");
        return list.length ? (list.length === 1 ? list[0] : list.join(", ")) : "";
      }
      return v == null ? "" : v;
    },
    rawVal(col, data) { return this.unwrap(data[col.key]); },
    // Splits a manager field (array OR "A, B" string) into individual names.
    managerTokens(v) {
      if (Array.isArray(v)) return v.filter((x) => x != null && x !== "").map((x) => String(x).trim());
      return String(v == null ? "" : v).split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    },
    isEmpty(v) { return v == null || v === "" || (typeof v === "number" && isNaN(v)); },
    display(col, data) {
      const v = this.rawVal(col, data);
      const t = col.type;
      if (this.isEmpty(v)) return "";
      if (t === "currency") return this.money(v);
      // Percent: Airtable stores fractions (0.3 == 30%), so default scale is 100
      // and the result is rounded to the nearest whole number. Set scale:1 on the
      // column if your field already holds whole percents (e.g. 30).
      if (t === "percent") { const s = col.scale != null ? Number(col.scale) : 100; const n = Number(v) * s; return isFinite(n) ? `${Math.round(n)}%` : String(v); }
      if (t === "number") { const s = col.scale != null ? Number(col.scale) : 1; const n = Number(v) * s; return isFinite(n) ? this.trimNum(n) : String(v); }
      if (t === "date") return this.formatDate(v);
      return String(v);
    },
    trimNum(n) { return (Math.round(n * 100) / 100).toString(); },
    money(n) {
      const num = Number(n);
      if (!isFinite(num)) return String(n);
      try { return new Intl.NumberFormat("en-US", { style: "currency", currency: this.content.currency || "USD" }).format(num); }
      catch (e) { return "$" + num.toFixed(2); }
    },
    formatDate(v) {
      const d = new Date(v);
      if (isNaN(d.getTime())) return String(v);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${mm}/${dd}/${d.getFullYear()}`;
    },
    alignFor(col) {
      if (col.align && col.align !== "auto") return col.align;
      return "left";
    },
    alignClass(col) { return "pp-al-" + this.alignFor(col); },
    toneFor(col, data) {
      const v = String(this.rawVal(col, data) || "");
      if (col.tagColors && typeof col.tagColors === "object") {
        const hit = col.tagColors[v] || col.tagColors[v.toLowerCase()];
        if (hit) return hit;
      }
      const s = v.toLowerCase();
      if (/unschedul|unassign|unapprov|missing|past due|overdue|declin|reject|cancel|void|fail|blocked/.test(s)) return "warning";
      if (/danger|urgent|critical/.test(s)) return "danger";
      if (/schedul|approv|complete|finish|done|sold|success|active|paid|won/.test(s)) return "success";
      if (/progress|pending|review|hold|await|open|new/.test(s)) return "info";
      return "slate";
    },
    rowId(r) { const k = this.content.idKey || "id"; const v = r.data[k]; return v != null ? v : ""; },
    // ---- sorting ----
    isSortable(col) { return this.content.sortable !== false && !!col && col.sortable !== false && !!col.key; },
    toggleSort(col) {
      if (this.sortKey === col.key) {
        // active column cycles asc -> desc -> off (restore natural order)
        if (this.sortDir === "asc") this.sortDir = "desc";
        else { this.sortKey = ""; this.sortDir = "asc"; }
      } else {
        this.sortKey = col.key; this.sortDir = "asc";
      }
      this.$emit("trigger-event", { name: "sortChange", event: { key: this.sortKey, dir: this.sortKey ? this.sortDir : "" } });
    },
    // Returns a comparable value: number for numeric/date columns, lowercased
    // string otherwise, or null for empty (so blanks sort last).
    sortVal(col, data) {
      const v = this.rawVal(col, data);
      if (this.isEmpty(v)) return null;
      const t = col.sortType || col.type;
      if (t === "currency" || t === "number" || t === "percent") {
        const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
        return isFinite(n) ? n : null;
      }
      if (t === "date" || t === "datetime") { const d = new Date(v).getTime(); return isNaN(d) ? null : d; }
      return String(v).toLowerCase();
    },
    goPage(p) {
      const next = Math.max(1, Math.min(this.pageCount, p));
      if (next === this.page) return;
      this.page = next;
      this.$emit("trigger-event", { name: "pageChange", event: { page: next } });
    },
    emitRow(r) { this.$emit("trigger-event", { name: "rowClick", event: { index: r._i, id: this.rowId(r), row: r.data } }); },
    emitLink(r, col) { this.$emit("trigger-event", { name: "linkClick", event: { index: r._i, id: this.rowId(r), key: col.key, value: this.rawVal(col, r.data), row: r.data } }); },
    emitAction(r, a) {
      const payload = { index: r._i, id: this.rowId(r), row: r.data };
      const name = a.event === "action2" || a.event === "action3" ? a.event : "action1";
      this.$emit("trigger-event", { name, event: payload });
      this.$emit("trigger-event", { name: "actionClick", event: { action: a.event || name, label: a.label || "", index: r._i, id: this.rowId(r), row: r.data } });
    },
  },
};
</script>

<style lang="scss" scoped>
.pp-root {
  --surface: #ffffff; --surface-2: #f7f9fc; --surface-3: #eef2f7; --border: #e4e9f0; --border-strong: #d4dbe6;
  --text: #1f2a37; --text-muted: #64748b; --text-subtle: #94a3b8;
  --shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.06);
  --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.06);
  --success: #10b981; --warning: #f59e0b; --danger: #ef4444; --info: #3b82f6;
  --primary: var(--pp-primary, #10b981); --accent: var(--pp-accent, #6366f1); --radius: var(--pp-radius, 16px);
  box-sizing: border-box; width: 100%; max-width: 100%; container-type: inline-size; color: var(--text);
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.45;
}
.pp-root *, .pp-root *::before, .pp-root *::after { box-sizing: border-box; }
@mixin dark {
  --surface: #161f30; --surface-2: #1b2638; --surface-3: #202c40; --border: #28344a; --border-strong: #34425c;
  --text: #e8eef7; --text-muted: #94a3b8; --text-subtle: #64748b;
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 12px 28px rgba(0, 0, 0, 0.35);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
}
.pp-root.pp-dark { @include dark; }
@media (prefers-color-scheme: dark) { .pp-root.pp-auto { @include dark; } }

.pp-card { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); padding: clamp(16px, 2.2vw, 22px); overflow: hidden; }
.pp-card--accent::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--pp-stripe); }
.pp-card__header { margin-bottom: 16px; }
.pp-card__header--center { text-align: center; }
.pp-card__header--center .pp-card__heading { justify-content: center; }
.pp-card__titles { min-width: 0; }
.pp-card__heading { margin: 0; font-size: 17px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 9px; }
.pp-card__icon { width: 18px; height: 18px; color: var(--primary); }
.pp-count { display: inline-grid; place-items: center; min-width: 24px; height: 22px; padding: 0 8px; border-radius: 999px; background: color-mix(in srgb, var(--primary) 14%, transparent); color: var(--primary); font-size: 12px; font-weight: 700; }
.pp-card__sub { margin: 4px 0 0; font-size: 13px; color: var(--text-muted); }

.pp-grid__wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); }
.pp-grid { width: 100%; border-collapse: collapse; font-size: 13px; }
.pp-grid thead th { position: sticky; top: 0; z-index: 1; padding: 11px 14px; font-size: 11.5px; font-weight: 700; color: var(--text-muted); background: var(--surface-2); border-bottom: 1px solid var(--border); white-space: nowrap; text-align: left; }
.pp-th__inner { display: inline-flex; align-items: center; gap: 5px; }
.pp-al-right .pp-th__inner { flex-direction: row-reverse; }
.pp-al-center .pp-th__inner { justify-content: center; }
.pp-th--sortable { cursor: pointer; user-select: none; transition: color .15s; }
.pp-th--sortable:hover { color: var(--text); }
.pp-th__sort { width: 13px; height: 13px; flex: none; opacity: .35; transition: opacity .15s, color .15s; }
.pp-th--sortable:hover .pp-th__sort { opacity: .7; }
.pp-th--active { color: var(--text); }
.pp-th--active .pp-th__sort { opacity: 1; color: var(--primary); }
.pp-grid tbody td { padding: 12px 14px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
.pp-grid tbody tr:last-child td { border-bottom: none; }
.pp-grid tbody tr { cursor: default; transition: background .12s; }
.pp-grid tbody tr:hover { background: var(--surface-2); }

.pp-al-left { text-align: left; }
.pp-al-right { text-align: right; }
.pp-al-center { text-align: center; }
.pp-muted { color: var(--text-subtle); }

.pp-linkbtn { border: none; background: none; padding: 0; font: inherit; font-weight: 600; color: var(--info); cursor: pointer; text-align: left; }
.pp-linkbtn:hover { text-decoration: underline; }

.pp-pillbtn { display: inline-flex; align-items: center; max-width: 220px; padding: 6px 11px; border: none; border-radius: 8px; font: inherit; font-size: 12px; font-weight: 600; line-height: 1.3; text-align: left; color: #fff; background: var(--info); cursor: pointer; white-space: normal; transition: filter .15s; }
.pp-pillbtn:hover { filter: brightness(1.07); }

.pp-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 11px; border-radius: 999px; font-size: 12px; font-weight: 600; background: var(--surface-3); color: var(--text-muted); white-space: nowrap; }
.pp-pill__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.pp-pill--warning { background: color-mix(in srgb, var(--warning) 15%, transparent); color: var(--warning); }
.pp-pill--success { background: color-mix(in srgb, var(--success) 15%, transparent); color: var(--success); }
.pp-pill--danger  { background: color-mix(in srgb, var(--danger) 15%, transparent);  color: var(--danger); }
.pp-pill--info    { background: color-mix(in srgb, var(--info) 15%, transparent);    color: var(--info); }
.pp-pill--slate   { background: var(--surface-3); color: var(--text-muted); }

/* pinned action column */
.pp-grid__actionhead, .pp-grid__action { position: sticky; right: 0; background: var(--surface-2); z-index: 2; box-shadow: -10px 0 12px -10px rgba(16, 24, 40, .18); }
.pp-grid thead th.pp-grid__actionhead { z-index: 3; }
.pp-grid tbody td.pp-grid__action { background: var(--surface); }
.pp-grid tbody tr:hover td.pp-grid__action { background: var(--surface-2); }
.pp-actions { display: inline-flex; align-items: center; gap: 8px; justify-content: flex-end; }

.pp-btn { display: inline-flex; align-items: center; gap: 7px; padding: 7px 13px; border-radius: 9px; border: 1px solid transparent; font-size: 12.5px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: inherit; transition: background .15s, color .15s, filter .15s; }
.pp-btn--ghost { background: color-mix(in srgb, var(--danger) 9%, transparent); color: var(--danger); }
.pp-btn--ghost:hover { background: color-mix(in srgb, var(--danger) 16%, transparent); }
.pp-btn--approve { background: color-mix(in srgb, var(--success) 12%, transparent); color: var(--success); }
.pp-btn--approve:hover { background: color-mix(in srgb, var(--success) 20%, transparent); }
.pp-btn--danger { background: color-mix(in srgb, var(--danger) 12%, transparent); color: var(--danger); }
.pp-btn--danger:hover { background: color-mix(in srgb, var(--danger) 20%, transparent); }
.pp-btn--primary { background: var(--primary); color: #fff; }
.pp-btn--primary:hover { filter: brightness(1.06); }
.pp-btn--neutral { background: var(--surface-3); color: var(--text); border-color: var(--border-strong); }
.pp-btn--neutral:hover { background: var(--border); }

.pp-empty { text-align: center; padding: 34px 16px; color: var(--text-subtle); }

.pp-pager { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
.pp-pager__range { font-size: 12.5px; color: var(--text-muted); font-weight: 600; }
.pp-pager__nav { display: inline-flex; align-items: center; gap: 4px; }
.pp-pager__pageno { font-size: 12.5px; color: var(--text); font-weight: 600; padding: 0 8px; white-space: nowrap; }
.pp-iconbtn { display: inline-grid; place-items: center; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text-muted); cursor: pointer; transition: background .15s, color .15s; }
.pp-iconbtn:hover:not(:disabled) { background: var(--surface-2); color: var(--text); }
.pp-iconbtn:disabled { opacity: .4; cursor: not-allowed; }
.pp-iconbtn .pp-svg { width: 16px; height: 16px; }
.pp-svg { display: block; }

/* mobile card layout */
@container (max-width: 620px) {
  .pp-grid__wrap { border: none; overflow: visible; }
  .pp-grid thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .pp-grid tbody tr { display: block; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 10px; padding: 4px 8px; background: var(--surface); }
  .pp-grid tbody tr:hover { background: var(--surface); }
  .pp-grid tbody td { display: flex; align-items: center; justify-content: space-between; gap: 14px; border-bottom: 1px solid var(--border); padding: 10px 4px; text-align: right; }
  .pp-grid tbody tr td:last-child { border-bottom: none; }
  .pp-grid tbody td::before { content: attr(data-label); font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .03em; text-align: left; flex: none; }
  .pp-grid__actionhead, .pp-grid__action { position: static; box-shadow: none; }
  .pp-linkbtn, .pp-pillbtn { text-align: right; }
}
@supports not (container-type: inline-size) {
  @media (max-width: 620px) {
    .pp-grid thead { display: none; }
    .pp-grid tbody tr { display: block; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 10px; }
    .pp-grid tbody td { display: flex; justify-content: space-between; }
    .pp-grid tbody td::before { content: attr(data-label); font-weight: 700; color: var(--text-muted); }
  }
}
</style>
