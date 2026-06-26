// src/data/restatements.js
//
// Per-provider detail for a restated filing, shown beneath the restatement note
// on a platform page. A provider appears here only when we hold both its
// original and its restated filing and have something specific to say about the
// difference. A restated provider not listed here shows the generic note alone,
// and a provider with no retrievable original (Shein) keeps its own note.
//
// Two forms:
//   form "figures": a figure moved. The page reads BOTH the original and the
//     restated value from the data, never hard-coded, using metric.basis to find
//     the own-initiative grand-total row (category_code TOTAL) in each version.
//     metric.label names the figure.
//   form "note": nothing material changed in the numbers, the restatement was a
//     re-issue. note carries the plain description.
//
// Descriptions stay descriptive rather than evaluative, like the rest of the
// site. They say what changed, not whether it is good or bad.

export const RESTATEMENTS = {
  // Amazon restated its own-initiative terms-and-conditions total sharply
  // upward. Every other figure (notices, orders, illegal-content measures) is
  // identical across the two versions, so the panel shows the one that moved.
  "amazon-store": {
    form: "figures",
    metric: {
      label: "Own-initiative actions under terms and conditions",
      basis: "tc",
    },
  },

  // Snapchat re-issued its whole report rather than correcting a figure. Reword
  // this freely; it is the only prose the panel shows for Snapchat.
  snapchat: {
    form: "note",
    note:
      "Snapchat re-filed its whole report in European number notation, with the figures themselves unchanged. The only substantive differences are that Greece is recoded from GR to EL, and the aggregate detection-accuracy figures are replaced with per-country ones.",
  },
};