package game

// NewBoard создаёт пустую доску
func NewBoard() Board {
	return Board{}
}

// DropPiece возвращает ряд, в который упала фишка, и успех
func (b *Board) DropPiece(col, piece int) (int, bool) {
	if col < 0 || col >= Cols {
		return -1, false
	}

	for row := Rows - 1; row >= 0; row-- {
		if b[row][col] == Empty {
			b[row][col] = piece
			return row, true
		}
	}
	return -1, false
}

// CheckWin проверяет победу для конкретного игрока
func (b Board) CheckWin(piece int) bool {
	// Horizontal
	for r := 0; r < Rows; r++ {
		for c := 0; c <= Cols-4; c++ {
			if b[r][c] == piece && b[r][c+1] == piece && b[r][c+2] == piece && b[r][c+3] == piece {
				return true
			}
		}
	}

	// Vertical
	for c := 0; c < Cols; c++ {
		for r := 0; r <= Rows-4; r++ {
			if b[r][c] == piece && b[r+1][c] == piece && b[r+2][c] == piece && b[r+3][c] == piece {
				return true
			}
		}
	}

	// Diagonal /
	for r := 0; r <= Rows-4; r++ {
		for c := 0; c <= Cols-4; c++ {
			if b[r][c] == piece && b[r+1][c+1] == piece && b[r+2][c+2] == piece && b[r+3][c+3] == piece {
				return true
			}
		}
	}

	// Diagonal \
	for r := 0; r <= Rows-4; r++ {
		for c := 3; c < Cols; c++ {
			if b[r][c] == piece && b[r+1][c-1] == piece && b[r+2][c-2] == piece && b[r+3][c-3] == piece {
				return true
			}
		}
	}

	return false
}

// IsFull проверяет ничью
func (b Board) IsFull() bool {
	for c := 0; c < Cols; c++ {
		if b[0][c] == Empty {
			return false
		}
	}
	return true
}

// GetValidMoves возвращает список доступных колонок
func (b Board) GetValidMoves() []int {
	var moves []int
	for c := 0; c < Cols; c++ {
		if b[0][c] == Empty {
			moves = append(moves, c)
		}
	}
	return moves
}

// Copy создаёт глубокую копию доски
func (b Board) Copy() Board {
	var copy Board
	for i := range b {
		copy[i] = b[i]
	}
	return copy
}
