export type PlayerColor = 'green' | 'red' | 'blue' | 'yellow';

export const MAIN_PATH = [
  // Green start
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  // Up towards red
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  // Right
  [0, 7], [0, 8],
  // Down red start
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  // Right towards blue
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  // Down
  [7, 14], [8, 14],
  // Left blue start
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  // Down towards yellow
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  // Left
  [14, 7], [14, 6],
  // Up yellow start
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  // Left towards green
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  // Up
  [7, 0], [6, 0]
];

export const SAFE_SQUARES = [
  [6, 1], [2, 6], [1, 8], [6, 12], [8, 13], [12, 8], [13, 6], [8, 2]
];

export const HOME_STRETCHES: Record<PlayerColor, number[][]> = {
  green: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  red: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  blue: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  yellow: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]]
};

export const START_INDICES: Record<PlayerColor, number> = {
  green: 0,
  red: 13,
  blue: 26,
  yellow: 39
};

export const ENTRANCES: Record<PlayerColor, number> = {
  green: 50,
  red: 11,
  blue: 24,
  yellow: 37
};

export const BASE_POSITIONS: Record<PlayerColor, number[][]> = {
  green: [[2, 2], [2, 4], [4, 2], [4, 4]],
  red: [[2, 11], [2, 13], [4, 11], [4, 13]],
  blue: [[11, 11], [11, 13], [13, 11], [13, 13]],
  yellow: [[11, 2], [11, 4], [13, 2], [13, 4]],
};

export const PLAYER_COLORS = ['green', 'red', 'blue', 'yellow'] as const;
