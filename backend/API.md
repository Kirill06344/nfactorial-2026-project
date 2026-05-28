# Connect4 Backend — API Documentation

Base URL: `http://localhost:8080`

---

## REST API

### GET `/health`

Проверка что сервер живой.

**Response:**
```json
{ "status": "ok" }
```

---

### GET `/api/game/new`

Получить пустую доску для начала новой игры.

**Response:**
```json
{
  "board": [
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0]
  ],
  "currentPlayer": 1,
  "winner": 0,
  "finished": false
}
```

**Формат доски:** массив 6×7, значения:
- `0` — пусто
- `1` — Red (первый игрок)
- `2` — Yellow (второй игрок / бот)

---

### POST `/api/game/bot-move`

Игрок делает ход, бот автоматически отвечает. Возвращает состояние доски после обоих ходов.

**Request body:**
```json
{
  "board":       [[0,0,0,...], ...],
  "column":      3,
  "playerPiece": 1,
  "depth":       5
}
```

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `board` | `number[6][7]` | ✅ | Текущее состояние доски |
| `column` | `number` | ✅ | Колонка хода игрока (0–6) |
| `playerPiece` | `number` | ✅ | Фишка игрока: `1` = Red, `2` = Yellow |
| `depth` | `number` | ❌ | Глубина minimax (1–10, по умолчанию `5`) |

**Response:**
```json
{
  "board":         [[...обновлённая доска...]],
  "currentPlayer": 1,
  "winner":        0,
  "finished":      false,
  "botColumn":     4
}
```

| Поле | Описание |
|------|----------|
| `board` | Доска после хода игрока И хода бота |
| `currentPlayer` | Фишка игрока (не меняется, всегда = `playerPiece`) |
| `winner` | `0` — нет победителя, `1` — Red, `2` — Yellow |
| `finished` | `true` если игра закончена (победа или ничья) |
| `botColumn` | Колонка, в которую сходил бот. `-1` если бот не ходил (игра закончилась после хода игрока) |

**Ошибки:**
```json
{ "error": "invalid move: column is full or out of range" }
{ "error": "playerPiece must be 1 (Red) or 2 (Yellow)" }
{ "error": "invalid request body" }
```

---

### POST `/api/rooms`

Создать комнату для игры с другом. Возвращает код комнаты, который нужно передать другу.

**Request body:** пустой (не нужен)

**Response:**
```json
{ "roomId": "AB12CD" }
```

Код комнаты — 6 символов (буквы A–Z и цифры 0–9).

---

## WebSocket — Мультиплеер

### Подключение

```
ws://localhost:8080/ws/room/:roomId
```

Первый подключившийся получает **Red (piece=1)**, второй — **Yellow (piece=2)**.

---

### Сообщения: Сервер → Клиент

#### `joined` — успешное подключение к комнате
```json
{
  "type":      "joined",
  "yourPiece": 1,
  "roomId":    "AB12CD"
}
```
Приходит сразу после установки соединения.

---

#### `waiting` — ожидание второго игрока
```json
{ "type": "waiting" }
```
Приходит если ты первый в комнате. Нужно ждать. Когда придёт второй игрок — сразу придёт `state`.

---

#### `state` — состояние игры (после каждого хода)
```json
{
  "type":          "state",
  "board":         [[0,0,0,...], ...],
  "currentPlayer": 1,
  "winner":        0,
  "finished":      false
}
```

| Поле | Описание |
|------|----------|
| `board` | Текущая доска |
| `currentPlayer` | Чья очередь ходить (`1` или `2`) |
| `winner` | `0` — игра идёт, `1` — победил Red, `2` — победил Yellow |
| `finished` | `true` — игра закончена (победа или ничья) |

Также приходит сразу когда оба игрока подключились (вместо `waiting` у второго и как update у первого).

---

#### `opponent_left` — соперник отключился
```json
{ "type": "opponent_left" }
```
После этого игра сбрасывается. Ты остаёшься в комнате и ждёшь нового соперника.

---

#### `error` — ошибка
```json
{
  "type":    "error",
  "message": "not your turn"
}
```

Возможные сообщения:
- `"room not found"` — неверный roomId (при подключении)
- `"room is full"` — в комнате уже 2 игрока
- `"waiting for opponent"` — попытка хода без соперника
- `"not your turn"` — ходишь не в свой ход
- `"column is full"` — колонка заполнена
- `"column out of range"` — колонка < 0 или > 6
- `"game is already finished"` — игра уже закончена
- `"unknown message type"` — неизвестный тип сообщения

---

### Сообщения: Клиент → Сервер

#### `move` — сделать ход
```json
{
  "type":   "move",
  "column": 3
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| `type` | `string` | Всегда `"move"` |
| `column` | `number` | Номер колонки (0–6) |

---

## Сценарии для фронтенда

### Сценарий 1: Игра с ботом

```
1. GET /api/game/new
   → получить начальную доску

2. Игрок выбирает колонку
   POST /api/game/bot-move { board, column, playerPiece: 1, depth: 5 }
   → получить новую доску (уже с ходом бота)

3. Проверить response.finished:
   - false → показать доску, ждать следующего хода игрока → перейти к п.2
   - true  → показать результат (response.winner: 0=ничья, 1=игрок, 2=бот)

4. Новая игра → GET /api/game/new
```

---

### Сценарий 2: Игра с другом — создатель комнаты

```
1. POST /api/rooms
   → получить { roomId: "AB12CD" }

2. Показать roomId другу (скопировать ссылку, QR-код и т.д.)

3. ws = new WebSocket("ws://localhost:8080/ws/room/AB12CD")

4. ws.onmessage:
   - type="joined"       → запомнить yourPiece (=1, ты Red)
   - type="waiting"      → показать "Ждём соперника..."
   - type="state"        → обновить доску, проверить finished/winner
   - type="opponent_left"→ показать "Соперник отключился"
   - type="error"        → показать ошибку

5. Когда currentPlayer === yourPiece → разрешить ход
   ws.send(JSON.stringify({ type: "move", column: 3 }))

6. Ждать type="state" с обновлённой доской
```

---

### Сценарий 3: Игра с другом — присоединяющийся

```
1. Получить roomId от друга

2. ws = new WebSocket("ws://localhost:8080/ws/room/" + roomId)

3. ws.onmessage:
   - type="joined"       → запомнить yourPiece (=2, ты Yellow)
   - type="state"        → сразу приходит (оба в комнате), обновить доску
   - (waiting не придёт, т.к. ты второй)

4. Дальше то же самое что в сценарии 2, п.5–6
```

---

### Пример WebSocket кода (JavaScript)

```javascript
const roomId = "AB12CD";
const ws = new WebSocket(`ws://localhost:8080/ws/room/${roomId}`);

let myPiece = null;
let board = null;
let currentPlayer = null;

ws.onopen = () => {
  console.log("Connected to room", roomId);
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  switch (msg.type) {
    case "joined":
      myPiece = msg.yourPiece;
      console.log("You are", myPiece === 1 ? "Red" : "Yellow");
      break;

    case "waiting":
      console.log("Waiting for opponent...");
      break;

    case "state":
      board = msg.board;
      currentPlayer = msg.currentPlayer;
      console.log("Board updated, current turn:", currentPlayer);

      if (msg.finished) {
        if (msg.winner === 0)       console.log("Draw!");
        else if (msg.winner === myPiece) console.log("You win!");
        else                        console.log("You lose!");
      }
      break;

    case "opponent_left":
      console.log("Opponent disconnected. Waiting for new opponent...");
      break;

    case "error":
      console.error("Error:", msg.message);
      break;
  }
};

ws.onclose = () => {
  console.log("Disconnected");
};

// Сделать ход
function makeMove(column) {
  if (currentPlayer !== myPiece) return; // не твой ход
  ws.send(JSON.stringify({ type: "move", column }));
}
```

---

### Пример REST кода (JavaScript) — игра с ботом

```javascript
// Начать игру
const { board } = await fetch("/api/game/new").then(r => r.json());

// Сделать ход
async function playerMove(board, column) {
  const res = await fetch("/api/game/bot-move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      board,
      column,
      playerPiece: 1,
      depth: 5,
    }),
  }).then(r => r.json());

  if (res.error) {
    console.error(res.error);
    return;
  }

  console.log("Bot played column:", res.botColumn);

  if (res.finished) {
    if (res.winner === 0)  console.log("Draw!");
    if (res.winner === 1)  console.log("You win!");
    if (res.winner === 2)  console.log("Bot wins!");
  }

  return res.board; // обновлённая доска для следующего хода
}
```
