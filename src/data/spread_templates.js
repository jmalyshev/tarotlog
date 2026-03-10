// Spread templates with named positions
export const SPREAD_TEMPLATES = {
  threeCard: {
    name: 'Three Card Spread',
    description: 'Past, Present, Future',
    positions: [
      { id: 'pos1', label: 'Past', x: 20, y: 80 },
      { id: 'pos2', label: 'Present', x: 140, y: 80 },
      { id: 'pos3', label: 'Future', x: 260, y: 80 }
    ]
  },
  celticCross: {
    name: 'Celtic Cross',
    description: 'Situation, Challenge, Goal, Past, Recent, Future, Self, House, Hopes, Outcome',
    positions: [
      { id: 'pos1', label: 'Situation', x: 120, y: 20 },
      { id: 'pos2', label: 'Challenge', x: 120, y: 150 },
      { id: 'pos3', label: 'Goal', x: 30, y: 85 },
      { id: 'pos4', label: 'Past', x: 210, y: 85 },
      { id: 'pos5', label: 'Self', x: 30, y: 220 },
      { id: 'pos6', label: 'Recent', x: 210, y: 220 },
      { id: 'pos7', label: 'Future', x: 30, y: 310 },
      { id: 'pos8', label: 'House', x: 120, y: 310 },
      { id: 'pos9', label: 'Hopes', x: 210, y: 310 },
      { id: 'pos10', label: 'Outcome', x: 120, y: 400 }
    ]
  },
  fiveCard: {
    name: 'Five Card Spread',
    description: 'Past, Present, Future, Advice, Outcome',
    positions: [
      { id: 'pos1', label: 'Past', x: 20, y: 80 },
      { id: 'pos2', label: 'Present', x: 100, y: 50 },
      { id: 'pos3', label: 'Future', x: 180, y: 80 },
      { id: 'pos4', label: 'Advice', x: 60, y: 180 },
      { id: 'pos5', label: 'Outcome', x: 140, y: 180 }
    ]
  },
  horseShoe: {
    name: 'Horseshoe Spread',
    description: 'Past, Present, Future, Obstacles, Advice, Outcome',
    positions: [
      { id: 'pos1', label: 'Past', x: 20, y: 20 },
      { id: 'pos2', label: 'Present', x: 20, y: 120 },
      { id: 'pos3', label: 'Future', x: 20, y: 220 },
      { id: 'pos4', label: 'Obstacles', x: 120, y: 220 },
      { id: 'pos5', label: 'Advice', x: 220, y: 120 },
      { id: 'pos6', label: 'Outcome', x: 220, y: 20 }
    ]
  }
};
