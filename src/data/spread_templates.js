// Spread templates with named positions
// Coordinates chosen to be reasonably centered for typical phone widths
// and spaced so cards don't overlap. If you want to tweak spacing,
// adjust the X/Y values below.
export const SPREAD_TEMPLATES = {
  threeCard: {
    name: 'Three Card Spread',
    description: 'Past, Present, Future',
    // layout: 'row' means positions should be laid out in a centered row
    // positions include an id/label but xPct/yPct are optional when layout is used
    positions: [
      { id: 'pos1', label: 'Past', xPct: 0.2, yPct: 0.35 },
      { id: 'pos2', label: 'Present', xPct: 0.5, yPct: 0.35 },
      { id: 'pos3', label: 'Future', xPct: 0.8, yPct: 0.35 }
    ]
    , layout: 'row', yPct: 0.35
  },
  celticCross: {
    name: 'Celtic Cross',
    description: 'Core cross (center + 4 around) and vertical pillar to the right',
    // use 'cross' layout for the center cluster and then a 'pillar' on the right
    positions: [
      // central cross (center, right, left, top, bottom)
      { id: 'pos1', label: 'Situation', xPct: 0.45, yPct: 0.35 },
      { id: 'pos2', label: 'Challenge', xPct: 0.57, yPct: 0.35 },
      { id: 'pos3', label: 'Goal', xPct: 0.33, yPct: 0.35 },
      { id: 'pos4', label: 'Past', xPct: 0.45, yPct: 0.20 },
      { id: 'pos5', label: 'Self', xPct: 0.45, yPct: 0.50 },
      // right-hand pillar (stacked, spaced to avoid overlap)
      { id: 'pos6', label: 'Recent', xPct: 0.78, yPct: 0.18 },
      { id: 'pos7', label: 'Future', xPct: 0.78, yPct: 0.30 },
      { id: 'pos8', label: 'House', xPct: 0.78, yPct: 0.42 },
      { id: 'pos9', label: 'Hopes', xPct: 0.78, yPct: 0.54 },
      { id: 'pos10', label: 'Outcome', xPct: 0.78, yPct: 0.66 }
    ]
    , layout: 'cross_pillar', centerPct: { x: 0.5, y: 0.35 }
  },
  fiveCard: {
    name: 'Five Card Spread',
    description: 'Past, Present, Future, Advice, Outcome',
    positions: [
      { id: 'pos1', label: 'Past' },
      { id: 'pos2', label: 'Present' },
      { id: 'pos3', label: 'Future' },
      { id: 'pos4', label: 'Advice' },
      { id: 'pos5', label: 'Outcome' }
    ]
    , layout: 'row', yPct: 0.35
  },
  horseShoe: {
    name: 'Horseshoe Spread',
    description: 'Past, Present, Future, Obstacles, Advice, Outcome',
    // positions defined by order; layout will place them along an arc
    positions: [
      { id: 'pos1', label: 'Past' },
      { id: 'pos2', label: 'Present' },
      { id: 'pos3', label: 'Future' },
      { id: 'pos4', label: 'Obstacles' },
      { id: 'pos5', label: 'Advice' },
      { id: 'pos6', label: 'Outcome' }
    ]
    , layout: 'horseshoe', centerPct: { x: 0.5, y: 0.32 }
  }
};

// Base canvas size used when designing the templates. Positions in templates
// were created against this baseline; SpreadBuilder will scale them to the
// actual canvas size at runtime so templates adapt to different screen sizes.
export const TEMPLATE_BASE = { width: 360, height: 500 };
