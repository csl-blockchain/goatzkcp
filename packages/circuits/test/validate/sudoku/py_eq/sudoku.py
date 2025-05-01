import random
import json
import numpy as np

def in_range(value, lower, upper):
    return lower <= value <= upper

def contains_all_unique(values):
    return len(values) == len(set(values))

def get_subgrid(grid, start_row, start_col, size):
    subgrid = []
    for i in range(size):
        for j in range(size):
            subgrid.append(grid[start_row + i][start_col + j])
    return subgrid

def check_sudoku_flat(grid):
    if len(grid) != 256:
        return False

    SIZE = 16
    BOX_SIZE = 4
    valid_set = set(range(1, SIZE + 1))

    # Helper to extract rows, columns, and boxes
    def get_row(r):
        return grid[r * SIZE:(r + 1) * SIZE]

    def get_col(c):
        return [grid[r * SIZE + c] for r in range(SIZE)]

    def get_box(box_row, box_col):
        return [
            grid[(box_row + r) * SIZE + (box_col + c)]
            for r in range(BOX_SIZE)
            for c in range(BOX_SIZE)
        ]

    # Check all rows
    for r in range(SIZE):
        if set(get_row(r)) != valid_set:
            return False

    # Check all columns
    for c in range(SIZE):
        if set(get_col(c)) != valid_set:
            return False

    # Check all 4x4 boxes
    for box_row in range(0, SIZE, BOX_SIZE):
        for box_col in range(0, SIZE, BOX_SIZE):
            if set(get_box(box_row, box_col)) != valid_set:
                return False

    return True


def check_sudoku(grid, size=16, subsize=4):
    # Check cell values are in range 1..SIZE
    for row in range(size):
        for col in range(size):
            if not in_range(grid[row][col], 1, size):
                return False

    # Check rows for uniqueness
    for row in grid:
        if not contains_all_unique(row):
            return False

    # Check columns for uniqueness
    for col in range(size):
        column = [grid[row][col] for row in range(size)]
        if not contains_all_unique(column):
            return False

    # Check subgrids (e.g. 4x4 blocks)
    for i in range(0, size, subsize):
        for j in range(0, size, subsize):
            subgrid = get_subgrid(grid, i, j, subsize)
            if not contains_all_unique(subgrid):
                return False

    return True

# INPUT GENERATION

def generate_valid_16x16_sudoku():
    """Generate a valid 16x16 Sudoku solution using a simple pattern-based method."""
    base = 4
    side = base * base

    def pattern(r, c): return (base * (r % base) + r // base + c) % side

    def shuffle(s): return np.random.permutation(s)

    r_base = range(base)
    rows = [g * base + r for g in shuffle(r_base) for r in shuffle(r_base)]
    cols = [g * base + c for g in shuffle(r_base) for c in shuffle(r_base)]
    nums = shuffle(range(1, side + 1))

    # Produce board using randomized baseline pattern
    board = [[nums[pattern(r, c)] for c in cols] for r in rows]
    return board

def fill_zeroes_grid(solution, puzzle, size=16):
    count = 0

    for i in range(0, size):
        for j in range(0, size):
            if puzzle[i][j] == np.int64(0):
                puzzle[i][j] = solution[count]
                count += 1

    return puzzle

def fill_zeroes_flat(solution, puzzle):
    count = 0

    for i in range(0, len(puzzle)):
        if puzzle[i] == 0:
            puzzle[i] = solution[count]
            count += 1

    return puzzle

def convert(puzzle, size=16):
    arr = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
    ]

    count = 0

    for i in range(0, size):
        for j in range(0, size):
            arr[i].append(np.int64(puzzle[count]))
            count += 1

    return arr


def generate_unique_random_numbers(num_needed, lower_bound, upper_bound):
    """Generates a list of unique random numbers within a specified range.

    Args:
        num_needed: The number of unique random numbers to generate.
        lower_bound: The minimum value for the random numbers (inclusive).
        upper_bound: The maximum value for the random numbers (inclusive).

    Returns:
        A list containing the generated unique random numbers, or an error message if it's not possible.
    """
    if (upper_bound - lower_bound + 1) < num_needed:
        return "Error: Cannot generate that many unique numbers within the given range."

    numbers = random.sample(range(lower_bound, upper_bound + 1), num_needed)
    return numbers

def substitute_zero_to_puzzle(puzzle, zero_indexes, size=16):
    zero_indexes.sort()
    solution = []

    for i in zero_indexes:
        row = i // size
        col = i % size

        temp = puzzle[row][col]
        puzzle[row][col] = np.int64(0)
        solution.append(temp)

    return puzzle, solution

def generate_solution_puzzle():
    zero_indexes = generate_unique_random_numbers(140, 0, 255)
    puzzle = generate_valid_16x16_sudoku()

    final_puzzle, solution = substitute_zero_to_puzzle(puzzle, zero_indexes)

    return final_puzzle, solution

def np_to_int(puzzle, solution, puzzle_size=16, solution_size=140):
    for i in range(0, puzzle_size):
        for j in range(0, puzzle_size):
            temp = puzzle[i][j]
            puzzle[i][j] = temp.item()

    for i in range(0, solution_size):
        temp = solution[i]
        solution[i] = temp.item()

    return puzzle, solution

def output_to_file(puzzle, solution, puzzle_size=16):
    # Flatten puzzle
    puzzl = []

    for i in range(0, puzzle_size):
        for j in range(0, puzzle_size):
            puzzl.append(puzzle[i][j])

    # Data to be written
    dictionary = {
        "S": solution,
        "puzzl": puzzl,
    }
    
    # Serializing json
    json_object = json.dumps(dictionary, indent=4)
    
    # Writing to sample.json
    with open("output.json", "w") as outfile:
        outfile.write(json_object)

def from_json():
    s = [
    7, 11, 4, 3, 16, 5, 9, 8, 2, 5, 15, 8, 2, 11, 10, 1, 12, 16, 4, 12, 3, 14,
    5, 8, 10, 9, 10, 7, 12, 16, 14, 13, 6, 12, 13, 6, 9, 2, 8, 15, 10, 11, 1,
    13, 5, 8, 10, 4, 3, 12, 16, 7, 3, 16, 14, 6, 15, 8, 2, 10, 15, 2, 8, 7, 4,
    12, 3, 14, 13, 6, 8, 10, 11, 1, 3, 16, 12, 13, 9, 7, 4, 1, 16, 14, 13, 9, 5,
    6, 8, 2, 11, 15, 8, 1, 3, 13, 14, 5, 9, 2, 8, 11, 4, 1, 3, 12, 14, 13, 6,
    15, 9, 2, 11, 7, 6, 5, 15, 11, 7, 1, 4, 3, 5, 9, 2, 4, 12, 14, 6, 2, 7, 1,
    4, 3, 13, 14, 16, 6, 5, 8
  ]
    pzl = [
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

    puzzle = fill_zeroes_flat(s, pzl)
    print(puzzle)
    print(check_sudoku_flat(puzzle))

if __name__ == "__main__":
    # zero_indexes = generate_unique_random_numbers(140, 0, 255)
    # puzzle = generate_valid_16x16_sudoku()

    # final_puzzle, solution = substitute_zero_to_puzzle(puzzle, zero_indexes)
    ## final_puzzle = fill_zeroes_np(solution, puzzle)
    # puzzle, solution = np_to_int(puzzle, solution)
    ##print(check_sudoku(final_puzzle))
    # output_to_file(puzzle, solution)

    from_json()