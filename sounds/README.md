# Sound Effects — Pokemon Medallion Game

Place MP3 files in this folder matching the filenames below.  
All sounds are loaded lazily and missing files are handled gracefully (no errors).

## Required Sound Files

| File | When it plays | Duration hint |
|------|---------------|---------------|
| `buy.mp3` | Buying a Pokemon pack (coins deducted) | ~1s |
| `card-flip.mp3` | Pokemon reveal card flip animation | ~0.8s |
| `card-select.mp3` | Selecting a card in battle / team select | ~0.3s |
| `throw-card.mp3` | Card thrown from bench into the arena | ~0.6s |
| `arena-impact.mp3` | Card lands in the arena | ~0.4s |
| `charge-up.mp3` | Pokemon charge up before clash | ~0.8s |
| `clash.mp3` | The moment Pokemon collide in battle | ~0.5s |
| `type-advantage.mp3` | Type advantage bonus applied | ~0.5s |
| `round-win.mp3` | Player wins a round | ~1s |
| `round-lose.mp3` | Player loses a round | ~1s |
| `round-draw.mp3` | Round ends in a draw | ~0.8s |
| `victory.mp3` | Player wins the entire match | ~2s |
| `defeat.mp3` | Player loses the entire match | ~2s |
| `confetti.mp3` | Confetti celebration on victory screen | ~1.5s |
| `coins.mp3` | Coins earned / jingle | ~0.6s |
| `button-click.mp3` | UI button clicks | ~0.2s |
| `find-opponent.mp3` | Searching for opponent modal | ~1.5s |
| `battle-start.mp3` | Battle start intro horn/fanfare | ~1.2s |
| `dissolve.mp3` | Defeated Pokemon dissolves into light | ~0.8s |
| `score-orb.mp3` | Score orb flies to scoreboard | ~0.6s |
| `status-effect.mp3` | Status effect applied | ~0.5s |
| `ability-trigger.mp3` | Special ability triggered | ~0.6s |
| `error.mp3` | Validation error or invalid selection | ~0.5s |
| `lobby-music.mp3` | Background music for menus | Loop |
| `battle-music.mp3` | Music during battle card selection | Loop |
| `arena-music.mp3` | High-intensity music during the clash | Loop |

## Notes

- Formats: **MP3** or **WAV** (choose one per file — the engine auto-detects browser support and falls back to the other)
- Keep files small (under 200KB each) for fast loading
- Lower-quality 96kbps mono is fine — these are UI/game sounds
- The game uses a global `AudioEngine` that creates fresh `<audio>` elements per play
