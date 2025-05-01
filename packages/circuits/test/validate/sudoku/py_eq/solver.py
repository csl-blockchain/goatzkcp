def solve_sudoku(puzzle):
    SIZE = 16
    SUBSIZE = 4

    # Create a 2D array from the flat puzzle
    grid = [[puzzle[i * SIZE + j] for j in range(SIZE)] for i in range(SIZE)]

    # Find empty cells
    empty_cells = [(i, j) for i in range(SIZE) for j in range(SIZE) if grid[i][j] == 0]

    print(f"Found {len(empty_cells)} empty cells to fill")

    # Check if a value is valid in a cell
    def is_valid(row, col, value):
        # Check row
        if value in grid[row]:
            return False

        # Check column
        if value in [grid[i][col] for i in range(SIZE)]:
            return False

        # Check sub-grid
        sub_row = (row // SUBSIZE) * SUBSIZE
        sub_col = (col // SUBSIZE) * SUBSIZE

        for i in range(SUBSIZE):
            for j in range(SUBSIZE):
                if grid[sub_row + i][sub_col + j] == value:
                    return False

        return True

    # Backtracking solver
    def solve(index):
        if index >= len(empty_cells):
            return True  # All cells filled successfully

        row, col = empty_cells[index]

        for value in range(1, SIZE + 1):
            if is_valid(row, col, value):
                grid[row][col] = value

                if solve(index + 1):
                    return True

                grid[row][col] = 0  # Backtrack

        return False

    # Start solving
    if not solve(0):
        print("Could not solve the puzzle")
        return None

    # Convert back to flat array
    solution = [grid[i][j] for i in range(SIZE) for j in range(SIZE)]
    return solution

if __name__ == "__main__":
    puzzle = [
    10, 0, 0, 1, 0, 0, 12, 0, 6, 13, 14, 0, 0, 15, 0, 0, 14, 6, 13, 0, 9, 0, 0,
    0, 7, 0, 0, 0, 4, 3, 0, 0, 0, 0, 0, 16, 0, 13, 6, 0, 0, 15, 9, 2, 0, 11, 7,
    1, 0, 8, 15, 2, 0, 11, 0, 1, 0, 3, 4, 0, 0, 0, 0, 5, 3, 16, 0, 14, 0, 0, 5,
    0, 0, 0, 0, 0, 0, 7, 0, 4, 0, 0, 6, 9, 15, 0, 2, 0, 1, 7, 11, 0, 0, 0, 0,
    14, 11, 1, 0, 4, 0, 12, 0, 0, 5, 0, 13, 9, 0, 0, 0, 0, 0, 0, 0, 10, 11, 0,
    1, 0, 16, 0, 0, 0, 0, 0, 5, 9, 0, 0, 2, 0, 7, 0, 4, 0, 14, 0, 0, 0, 6, 5, 0,
    15, 0, 0, 0, 3, 12, 0, 0, 0, 0, 0, 0, 15, 0, 0, 10, 0, 6, 9, 5, 0, 0, 2, 10,
    11, 4, 0, 7, 0, 12, 16, 14, 0, 12, 0, 16, 13, 6, 0, 0, 15, 10, 0, 0, 0, 7,
    1, 0, 3, 0, 0, 4, 0, 16, 0, 0, 0, 0, 0, 5, 8, 0, 10, 0, 0, 16, 13, 14, 0, 0,
    9, 0, 8, 0, 10, 2, 0, 0, 0, 0, 12, 0, 15, 0, 8, 0, 10, 11, 7, 3, 0, 1, 0,
    16, 0, 13, 0, 0, 11, 10, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 9, 15, 0
  ]
    solution = solve_sudoku(puzzle)
    print(solution)