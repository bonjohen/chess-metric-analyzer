Chess Move Tree & Metric-Driven Visual Analysis Tool
Project: Chess Move Tree & Metric-Driven Visual Analysis Tool
 Status: Complete Revised Specification (Updated Board Metrics)

1. Purpose and Scope
This tool performs bounded, deterministic chess analysis from a given FEN by building a move tree, computing transparent board metrics, and visualizing long-horizon consequences in a human-interpretable way.
Key goals:
Deep evaluation (7 plies) with shallow visual clarity (3 plies)


Clear indication of:
most valuable move
opponent's best replies
confidence based on depth


Separation of:
move suggestion (arrows)
evaluation (square coloring)
confidence (color intensity)
This is an explanatory analysis tool, not a traditional engine.

2. Input and Configuration
2.1 Inputs
FEN (board state + side to move)
Fixed evaluation depth: 7 plies
Fixed display depth: 3 plies
Branching factor: top 2 moves per side per ply


2.2 User-Configurable Settings
Piece value table
Player profile (Aggressive, Defensive, Positional, Balanced, Custom)
Metric weights
Perspective toggle (White / Black)
Visualization scaling (arrow thickness, color intensity)



3. Revised Board Metrics (Absolute, Stored per Node)
Each node stores eight scalar values, four per side.
Overview
Metric
Description
PV
Material value
MS
Mobility (empty squares)
AT
Attacked piece value
DF
Defended piece value


4. Metric Definitions (Authoritative)
4.1 Piece Value (PV)
Definition:
 Sum of piece point values currently on the board.
Standard default (configurable):
Pawn = 1
Knight = 3
Bishop = 3
Rook = 5
Queen = 9
King = excluded or constant
Outputs:
PV_white
PV_black

4.2 Mobility Score (MS)
Definition:
 Sum of all legal non-capturing destination squares for all pieces.
Rules:
Only empty squares are counted. Capturing moves contribute 0
Each reachable square counts as one point.
Multiple pieces may contribute to the same square.
This measures positional freedom and space control.
Outputs:
MS_white
MS_black

4.3 Attacked Piece Value (AT)
Definition:
 Sum of the point values of opponent pieces that are attacked, counted per attacker.
Rules:
If a piece is attacked by multiple pieces, its value is counted once per attacker
Example:
A rook and two knights attack a queen; this contributes 9 + 9 + 9 = 27
Only legal attacks are counted (pins still count as attacks)
This measures tactical pressure.
Outputs:
AT_white (value of black pieces attacked by white)
AT_black (value of white pieces attacked by black)

4.4 Defended Piece Value (DF)
Definition:
 Sum of the point values of own pieces that are defended, counted per defender.
Rules:
If multiple pieces defend a piece, its value is counted once per defender
Example:
A queen and king defend a rook; this contributes 5 + 5 = 10
Pins still count as defense
This measures structural resilience and redundancy.
Outputs:
DF_white
DF_black

5. Stored Metrics per Node
Each node stores absolute values only:
PV_white, PV_black – Point Value
MS_white, MS_black – Movement
AT_white, AT_black – Offense
DF_white, DF_black – Defense 
No deltas are stored.

6. Evaluation Model (Root → Ply-7 Based)
6.1 Evaluation Horizon
Calculated depth: 7 plies
Displayed depth: 3 plies
All move rankings are based on root → ply-7 outcomes

6.2 Advantage Normalization
For any node:
White advantage:
PV_adv = PV_white − PV_black
MS_adv = MS_white − MS_black
AT_adv = AT_white − AT_black
DF_adv = DF_white − DF_black
Black advantage is the inverse.

6.3 Weighted Scoring Function
Using active player profile weights:
Score =
  wPV * ΔPV_adv +
  wMS * ΔMS_adv +
  wAT * ΔAT_adv +
  wDF * ΔDF_adv
Where:
Δ is computed as (leaf7 − root)
Computed dynamically, not stored

6.4 Best Leaf Selection
For each candidate move shown at ply ≤ 3:
Identify the best reachable ply-7 leaf under top-2 branching
Use that leaf’s score to rank the move.

7. Move Tree Construction
7.1 Structure
Branching: top 2 moves per side
Depth: 7 plies
Maximum leaf nodes: 128
7.2 Node Structure
Node {
  fen
  move
  metrics (8 values)
  children[]
}
7.3 Expansion Process
Generate legal moves
Apply move
Compute absolute metrics
Select provisional top-2 moves
Continue until ply 7
Selection refines as deeper plies complete.

8. Visualization Model
8.1 Separation of Concerns
Element
Meaning
Arrows
Candidate moves
Arrow thickness
Long-term importance
Square color
Evaluation direction
Color intensity
Depth confidence


9. Arrow System (Moves Only)
9.1 Displayed Arrows
Fixed structure:
Ply
Side
Arrows
1
Current
2
2
Opponent
4
3
Current
8
Total


14

9.2 Arrow Properties
Direction: from → to
Thickness: ranked by root → ply-7 score
Opacity: ply depth
Color: neutral (not evaluative)



10. Square Coloring System (Evaluation)
10.1 Color Meaning
Green: favorable to the selected perspective
Red: unfavorable
Uncolored = neutral/unknown


10.2 Intensity Meaning
Intensity reflects the deepest confirmed ply influencing that square:
faint → shallow (ply 1–2)
strong → deep (up to ply 7)
Colors evolve continuously as deeper computation completes.

11. Progressive Computation
11.1 Always-On Feedback
Ply 1 complete → arrows + faint coloring
Ply 3 complete → stable 14 arrows
Ply 5–7 → refined arrow ordering + color convergence
11.2 Stability Rules
Arrow count fixed
Arrow ordering may refine
Square intensity generally increases unless the evaluation reverses

12. Most Valuable Move & Depth Indicators
12.1 Best Move Indicator
Thickest arrow
Optional outline/glow
Persists across updates
12.2 Depth Indicator
Global: “computed to ply X / 7.”
Local: square color intensity

13. Perspective Toggle
Switching perspective:
Reinterprets advantages
Recolors squares
Reorders arrow thickness
No recomputation of raw metrics required



14. Player Profiles & Properties
14.1 Profiles
Profile
Emphasis
Aggressive
AT, MS
Defensive
PV, DF
Positional
MS, DF
Balanced
Equal

Profiles control weights only.
14.2 Properties Page
Edit weights (PV, MS, AT, DF)
Edit piece values
Save/load custom profiles
Visualization tuning

15. Multi-Board Drill-Down
Clicking an arrow promotes that node to root
New 7-ply evaluation begins
Parent boards remain visible
Branch navigation supported

16. Architecture (Browser-First)
16.1 Compute Location
Primary:
Browser
Web Workers for computation
Optional WASM for speed
Why feasible:
Bounded tree (128 leaves)
Simple metric arithmetic
No heavy search algorithms
16.2 Persistence
Client-side
IndexedDB
Cached trees keyed by:
FEN
depth
profile hash
piece value hash
Optional backend
Store profiles
Share analyses
Deferred until needed
16.3 Compute Abstraction
ComputeEngine
 ├─ BrowserComputeEngine
 └─ ServerComputeEngine (future)


17. Performance Considerations
Metric caching per FEN
Attack/defense reuse across metrics
Incremental UI updates per ply
Worker isolation for responsiveness

18. Non-Goals
Opening books
Endgame tablebases
Alpha-beta / MCTS
Unlimited depth search

19. Future Extensions
Metric trend charts along the best line
Side-by-side branch comparison
PGN playback with evolving metrics
Optional advanced metrics (king safety, pawn structure)

20. Glossary of Terms
FEN (Forsyth–Edwards Notation)
A compact text string that fully describes a chess position, including piece placement, side to move, castling rights, en-passant square, half-move clock, and full-move number.
Ply
A single move by one side. One complete move in chess equals two plies (White move + Black move).
Root Position
The starting board position from which analysis begins (the initial FEN).
Node
A position in the move tree, represented by a FEN and its computed metrics.
Move Tree
A directed tree structure where each node is a chess position, and each edge is a legal move.
Depth
The number of plies explored from the root.
Example: depth 7 = 7 alternating moves by either side.
Branching Factor
The number of moves expanded at each ply. In this design, it is fixed at the top 2 moves per side.
Leaf Node
A terminal node in the move tree at the maximum calculation depth (ply 7).
Evaluation Horizon
The deepest ply to which positions are calculated for scoring purposes (7 plies).
Display Horizon
The maximum ply depth is shown visually to the user (3 plies).
Metric
A numeric measurement describing some aspect of a board position (material, mobility, attack, defense).
PV (Piece Value)
The sum of the point values of all pieces currently on the board for one side.
MS (Mobility Score)
The total count of legal non-capturing destination squares available to all pieces of one side.
AT (Attacked Piece Value)
The sum of opponent piece point values that are attacked, counted once per attacking piece.
DF (Defended Piece Value)
The sum of one's own piece point values that are defended is counted once per defending piece.
Absolute Metrics
Raw metric values are computed directly from a position, not relative to another position.
Delta (Δ)
The difference between metrics at two positions (e.g., root vs ply-7). Deltas are computed dynamically, not stored.
Advantage
A metric expressed as one side’s value minus the opponent’s value (e.g., PV_white − PV_black).
Weighted Score
A composite evaluation computed by applying user-defined weights to metric deltas.
Player Profile
A predefined or custom set of metric weights representing a style of play (Aggressive, Defensive, Positional, Balanced).
Perspective
The side (White or Black) from which evaluations are interpreted and colored.
Arrow (Move Arrow)
A visual indicator showing a candidate move from one square to another. Arrows represent moves only, not evaluation color.
Arrow Thickness
A visual encoding of long-term importance, based on the root → ply-7 score.
Square Coloring
A visual overlay on board squares indicating evaluation direction (favorable or unfavorable).
Color Intensity
A measure of confidence, reflecting how deep (how many plies) contributed to the evaluation affecting that square.
Most Valuable Move
The highest-ranked immediate move (ply-1) based on root → ply-7 evaluation.
Progressive Computation
The process of updating visuals incrementally as deeper plies are calculated, without waiting for full depth.
Web Worker
A browser feature that allows computation to run in a background thread without blocking the UI.
IndexedDB
A browser-side database used to persist cached analyses, profiles, and computed trees.
Compute Engine
The component responsible for move generation, metric calculation, and scoring (browser-based in this design).
SAN (Standard Algebraic Notation)
A human-readable notation for chess moves (e.g., Nf3, Qxe7+).
UCI Move Notation
A coordinate-based move format used by engines (e.g., g1f3).
Drill-Down
User interaction that selects a move and promotes the resulting position to a new root for further analysis.
Bounded Search
A deliberately limited exploration of the move tree with fixed depth and branching to ensure determinism and performance.

