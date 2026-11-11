// Configurations par défaut pour chaque type de graphe vierge.

export const GRAPH_TYPES = [
  { id: "cartesian", labelKey: "graph.type.cartesian" },
  { id: "semilogX",  labelKey: "graph.type.semilogX"  },
  { id: "semilogY",  labelKey: "graph.type.semilogY"  },
  { id: "loglog",    labelKey: "graph.type.loglog"    },
  { id: "milli",     labelKey: "graph.type.milli"     },
  { id: "ternary",   labelKey: "graph.type.ternary"   },
]

const CARTESIAN_DEFAULTS = {
  title: "",
  subtitle: "",
  axes: {
    x: { label: "x", min: 0,    max: 10,  majorTicks: 10, minorTicks: 5 },
    y: { label: "y", min: 0,    max: 10,  majorTicks: 10, minorTicks: 5 },
  },
}

const SEMILOGX_DEFAULTS = {
  ...CARTESIAN_DEFAULTS,
  axes: {
    x: { label: "x", min: 1,    max: 1000, majorTicks: 0, minorTicks: 0 },
    y: { label: "y", min: 0,    max: 10,   majorTicks: 10, minorTicks: 5 },
  },
}

const SEMILOGY_DEFAULTS = {
  ...CARTESIAN_DEFAULTS,
  axes: {
    x: { label: "x", min: 0,    max: 10,   majorTicks: 10, minorTicks: 5 },
    y: { label: "y", min: 1,    max: 1000, majorTicks: 0, minorTicks: 0 },
  },
}

const LOGLOG_DEFAULTS = {
  ...CARTESIAN_DEFAULTS,
  axes: {
    x: { label: "x", min: 1, max: 1000, majorTicks: 0, minorTicks: 0 },
    y: { label: "y", min: 1, max: 1000, majorTicks: 0, minorTicks: 0 },
  },
}

const MILLI_DEFAULTS = {
  title: "",
  subtitle: "",
  axes: {
    x: { label: "", min: 0, max: 20, majorTicks: 20, minorTicks: 10 },
    y: { label: "", min: 0, max: 20, majorTicks: 20, minorTicks: 10 },
  },
}

const TERNARY_DEFAULTS = {
  title: "",
  subtitle: "",
  ternary: { labelA: "A", labelB: "B", labelC: "C", step: 10 },
}

export const TYPE_DEFAULTS = {
  cartesian: CARTESIAN_DEFAULTS,
  semilogX:  SEMILOGX_DEFAULTS,
  semilogY:  SEMILOGY_DEFAULTS,
  loglog:    LOGLOG_DEFAULTS,
  milli:     MILLI_DEFAULTS,
  ternary:   TERNARY_DEFAULTS,
}

export function defaultConfig(type = "cartesian") {
  const base = TYPE_DEFAULTS[type] || CARTESIAN_DEFAULTS
  return {
    type,
    orientation: "landscape",
    ...JSON.parse(JSON.stringify(base)), // deep clone
    annotations: [],
  }
}

// ID unique pour les annotations.
let _counter = 0
export function newId(prefix = "ann") {
  _counter += 1
  return `${prefix}-${Date.now().toString(36)}-${_counter}`
}
