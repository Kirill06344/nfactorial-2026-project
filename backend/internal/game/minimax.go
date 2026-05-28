package game

func (b Board) GetBestMove(depth int, botPiece int) int {
	bestScore := -9999999
	bestCol := -1

	for _, col := range b.GetValidMoves() {
		temp := b.Copy()
		temp.DropPiece(col, botPiece)

		score := minimax(temp, depth-1, false, botPiece)

		if score > bestScore {
			bestScore = score
			bestCol = col
		}
	}

	return bestCol
}

func minimax(b Board, depth int, isMaximizing bool, botPiece int) int {
	playerPiece := 3 - botPiece

	if b.CheckWin(botPiece) {
		return 10000 - (20 - depth)
	}
	if b.CheckWin(playerPiece) {
		return -10000 + (20 - depth)
	}
	if b.IsFull() || depth == 0 {
		return scorePosition(b, botPiece)
	}

	if isMaximizing {
		maxScore := -9999999
		for _, col := range b.GetValidMoves() {
			temp := b.Copy()
			temp.DropPiece(col, botPiece)
			score := minimax(temp, depth-1, false, botPiece)
			if score > maxScore {
				maxScore = score
			}
		}
		return maxScore
	} else {
		minScore := 9999999
		for _, col := range b.GetValidMoves() {
			temp := b.Copy()
			temp.DropPiece(col, playerPiece)
			score := minimax(temp, depth-1, true, botPiece)
			if score < minScore {
				minScore = score
			}
		}
		return minScore
	}
}

// Простая, но эффективная эвристика
func scorePosition(b Board, piece int) int {
	score := 0

	// Центр очень важен
	for r := 0; r < Rows; r++ {
		if b[r][3] == piece {
			score += 5
		}
		if b[r][2] == piece || b[r][4] == piece {
			score += 3
		}
	}

	return score
}
