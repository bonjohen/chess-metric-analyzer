interface Arrow {
  from: { rank: number; file: number };
  to: { rank: number; file: number };
  rank: 1 | 2 | 3; // Sequence rank (thickness)
  ply: 1 | 2 | 3; // Ply depth (opacity)
  isBest?: boolean;
}


