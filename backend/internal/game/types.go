package game

const (
	Rows   = 6
	Cols   = 7
	Empty  = 0
	Red    = 1
	Yellow = 2
)

type Board [Rows][Cols]int

type Move struct {
	Column int `json:"column"`
}

type GameState struct {
	Board         Board `json:"board"`
	CurrentPlayer int   `json:"currentPlayer"`
	Winner        int   `json:"winner"`
	Finished      bool  `json:"finished"`
}
