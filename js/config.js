// Game configuration: upgrades, grounds, coaches and gear.
// All balancing numbers live here so they can be tuned without touching logic.

// Repeatable upgrades. Cost = base * growth^level.
export const UPGRADES = {
  tempo:   { name: 'Pass Speed',   desc: 'More passes per second for every ball.', base: 10,  growth: 1.32 },
  tech:    { name: 'Technique',    desc: 'More Training Points per pass.',        base: 25,  growth: 1.38 },
  control: { name: 'Ball Control', desc: 'Fewer misplaced passes.',               base: 60,  growth: 1.55 },
  stamina: { name: 'Stamina',      desc: 'Longer streaks, bigger streak bonus.',  base: 200, growth: 1.60 },
  balls:   { name: 'Extra Ball',   desc: 'One more ball flying at the wall.',     base: 100, growth: 7.00 },
};
export const UPGRADE_ORDER = ['tempo', 'tech', 'control', 'stamina', 'balls'];

// Every 25 levels of Pass Speed / Technique the effect doubles.
export const MILESTONE_EVERY = 25;

// Streak bonus per successful pass in a row.
export const STREAK_STEP = 0.02;

// Bonus per rating point (applied to all TP).
export const RATING_BONUS = 1.05;

// One-off purchases cost a share of the XP needed for their unlock rating.
export const COST_FACTOR = { ground: 0.6, coach: 0.35, gear: 0.2 };
export const MIN_ONEOFF_COST = 25;

// Training grounds = chapters. Each owned ground multiplies all TP.
export const GROUNDS = [
  { id: 'g0', name: 'Backyard Wall',        rating: 1,   mult: 3, desc: 'A cracked brick wall behind the house.' },
  { id: 'g1', name: 'Cage Court',           rating: 15,  mult: 3, desc: 'Street court with a graffiti wall.' },
  { id: 'g2', name: 'Club Ground',          rating: 35,  mult: 3, desc: 'Your first real club, with a wooden rebounder.' },
  { id: 'g3', name: 'Pro Training Center',  rating: 55,  mult: 3, desc: 'Perfect grass and a target board.' },
  { id: 'g4', name: 'National Academy',     rating: 72,  mult: 3, desc: 'Where national team players train.' },
  { id: 'g5', name: 'Big Stadium',          rating: 85,  mult: 3, desc: 'Thousands of fans watch you warm up.' },
  { id: 'g6', name: 'Night Stadium',        rating: 94,  mult: 3, desc: 'Floodlights, phone flashes, pure magic.' },
  { id: 'g7', name: 'Golden Stadium',       rating: 99,  mult: 3, desc: 'Built for the greatest of all time.' },
  { id: 'g8', name: 'Star Stadium',         rating: 102, mult: 3, desc: 'Beyond football. Beyond Earth.' },
];

// Coaches: one-off x2 multipliers (fictional people).
export const COACHES = [
  { id: 'c0', name: 'Uncle Raj',          rating: 4,  mult: 2, desc: 'Taught you to stop the ball with your sole.' },
  { id: 'c1', name: 'Coach Okafor',       rating: 12, mult: 2, desc: 'Street legend. Never misses a pass.' },
  { id: 'c2', name: 'Coach Lindqvist',    rating: 24, mult: 2, desc: 'Obsessed with first touch.' },
  { id: 'c3', name: 'Coach Moreau',       rating: 38, mult: 2, desc: 'Makes you pass with both feet.' },
  { id: 'c4', name: 'Coach Tanaka',       rating: 50, mult: 2, desc: 'Precision over power.' },
  { id: 'c5', name: 'Coach Bianchi',      rating: 62, mult: 2, desc: 'Tactics, tactics, tactics.' },
  { id: 'c6', name: 'Coach Weber',        rating: 76, mult: 2, desc: 'Sports science and ice baths.' },
  { id: 'c7', name: 'Coach Santos',       rating: 88, mult: 2, desc: 'Joy, rhythm and samba.' },
  { id: 'c8', name: 'The Professor',      rating: 96, mult: 2, desc: 'Nobody knows his real name.' },
];

// Gear: one-off x1.5 multipliers that also change how the player / ball looks.
export const GEAR = [
  { id: 'b0', type: 'boots', name: 'Cheap Sneakers',  rating: 3,  mult: 1.5, color: '#e8e8e8', desc: 'Better than barefoot.' },
  { id: 'r0', type: 'ball',  name: 'Real Football',   rating: 8,  mult: 1.5, colors: ['#f4f4f4', '#222'], desc: 'Finally a proper ball.' },
  { id: 'b1', type: 'boots', name: 'Football Boots',  rating: 18, mult: 1.5, color: '#202020', desc: 'Real studs.' },
  { id: 'r1', type: 'ball',  name: 'Match Ball',      rating: 30, mult: 1.5, colors: ['#ffffff', '#d23b3b'], desc: 'Used in real league games.' },
  { id: 'b2', type: 'boots', name: 'Pro Boots',       rating: 44, mult: 1.5, color: '#2a7de1', desc: 'Light as a feather.' },
  { id: 'r2', type: 'ball',  name: 'Pro Ball',        rating: 58, mult: 1.5, colors: ['#fffbe6', '#2a62c9'], desc: 'Perfect flight.' },
  { id: 'b3', type: 'boots', name: 'Elite Boots',     rating: 68, mult: 1.5, color: '#ff3d8b', desc: 'Neon. Loud. Fast.' },
  { id: 'b4', type: 'boots', name: 'Golden Boots',    rating: 92, mult: 1.5, color: '#f4c430', desc: 'Only for the very best.' },
  { id: 'r3', type: 'ball',  name: 'Golden Ball',     rating: 98, mult: 1.5, colors: ['#f4c430', '#a07400'], desc: 'It shines.' },
];

export const DEFAULT_BALL_COLORS = ['#c9c2ad', '#7b7461']; // worn street ball
