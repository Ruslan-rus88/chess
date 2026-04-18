# Chess Engine Rules and Execution System

## 1. Core Game Rules

### Board State

* 8x8 board
* Track piece type and color
* Track side to move
* Track castling rights
* Track en passant square
* Track half-move clock
* Track full-move number
* Track repetition history

### Legal Move Rules

* Moves must follow piece movement rules
* Cannot capture own pieces
* Cannot leave king in check
* Special moves:

  * Castling (conditions required)
  * En passant (immediate only)
  * Promotion (mandatory on last rank)

### Game End Conditions

* Checkmate
* Stalemate
* Threefold repetition
* Fifty-move rule
* Insufficient material

---

## 2. Execution Sequence

### Turn Execution Order

1. Read board state
2. Validate state
3. Generate pseudo-legal moves
4. Filter illegal moves
5. Check terminal conditions
6. Order moves
7. Search moves
8. Evaluate positions
9. Select best move
10. Execute move
11. Update game state
12. Check end conditions

---

## 3. Evaluation System

### Material Values

* Pawn = 100
* Knight = 320
* Bishop = 330
* Rook = 500
* Queen = 900

### Evaluation Factors

* Material
* King safety
* Piece activity
* Pawn structure
* Mobility
* Center control
* Passed pawns
* Space

---

## 4. Tactical Rules

* Detect checks, captures, threats
* Detect forks, pins, skewers
* Detect hanging pieces
* Detect mate threats
* Detect promotion races

---

## 5. Strategic Rules

### Opening

* Develop pieces
* Control center
* Castle early

### Middlegame

* Improve worst piece
* Attack weaknesses
* Coordinate pieces

### Endgame

* Activate king
* Push passed pawns
* Simplify when ahead

---

## 6. Search System

### Core Methods

* Iterative deepening
* Alpha-beta pruning
* Move ordering
* Quiescence search

### Move Ordering Priority

1. Checkmate
2. Checks
3. Promotions
4. Captures
5. Threats
6. Quiet moves

---

## 7. Difficulty Levels

## Easy Level

### Behavior Rules

* Randomize among reasonable moves
* Limit search depth (1–2 plies)
* Ignore deep tactics
* Allow blunders occasionally
* Prefer simple captures
* Weak king safety awareness

### Restrictions

* No advanced pruning
* Minimal evaluation factors
* No long-term strategy

### Goal

* Simulate beginner player

---

## Medium Level

### Behavior Rules

* Moderate search depth (3–5 plies)
* Basic tactical awareness
* Avoid obvious blunders
* Use simple strategy
* Balance attack and defense

### Features

* Basic alpha-beta pruning
* Limited quiescence search
* Simple positional evaluation

### Goal

* Simulate intermediate player

---

## Hard Level

### Behavior Rules

* Deep search (6+ plies or time-based)
* Strong tactical calculation
* Advanced positional play
* Strong king safety awareness
* Long-term planning

### Features

* Full alpha-beta pruning
* Quiescence search
* Transposition tables
* Move ordering heuristics
* Endgame knowledge

### Advanced Rules

* Avoid zugzwang errors
* Detect forced mates
* Use positional sacrifices
* Optimize time usage

### Goal

* Simulate strong/advanced player

---

## 8. Move Execution Rules

### Before Move

* Validate legality
* Ensure king safety

### After Move

* Update board
* Handle captures
* Update castling rights
* Update en passant
* Update clocks
* Update repetition

---

## 9. Priority Hierarchy

1. Legal move
2. King safety
3. Checkmate
4. Avoid mate
5. Material
6. Tactics
7. Strategy
8. Position

---