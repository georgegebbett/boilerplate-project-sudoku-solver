const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver = new Solver();


const puzzles = require('../controllers/puzzle-strings.js');
const invalidPuzzle = '9.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';


suite('UnitTests', () => {

    test('Logic handles a valid puzzle string', () => {
        assert.isTrue(solver.validate('1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'))
    });

    test('Logic handles a puzzle string with invalid characters', () => {
        assert.throws(() => {
            solver.validate('0.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.')
        }, 'Invalid characters in puzzle');
        assert.isTrue(true) //This has had to be added due to FCC's auto-validation not picking up assert.throws as a valid assertion
    });

    test('Logic handles a puzzle string that is not 81 characters in length', () => {
        assert.throws(() => {
            solver.validate('1234')
        }, 'Expected puzzle to be 81 characters long');
        assert.isTrue(true) //This has had to be added due to FCC's auto-validation not picking up assert.throws as a valid assertion
    });

    test('Logic handles a valid row placement', () => {
        assert.isTrue(solver.checkRowPlacement('1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.', 0, 1, 3));
    });

    test('Logic handles an invalid row placement', () => {
        assert.isFalse(solver.checkRowPlacement('1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.', 0, 1, 1));
    });

    test('Logic handles a valid column placement', () => {
        assert.isTrue(solver.checkColPlacement('1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.', 0, 1, 3));
    });

    test('Logic handles an invalid column placement', () => {
        assert.isFalse(solver.checkColPlacement('1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.', 1, 0, 1));
    });

    test('Logic handles a valid region placement', () => {
        assert.isTrue(solver.checkRegionPlacement('1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.', 0, 1, 3));
    });

    test('Logic handles an invalid region placement', () => {
        assert.isFalse(solver.checkRegionPlacement('1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.', 0, 1, 1));
    });

    test('Valid puzzle strings pass the solver', () => {
        assert.doesNotThrow(() => {solver.solve(puzzles[0][0])}, 'Puzzle cannot be solved');
    })

    test('Invalid puzzle strings fail the solver', () => {
        assert.throws(() => {solver.solve(invalidPuzzle)}, 'Puzzle cannot be solved');
        assert.isTrue(true) //This has had to be added due to FCC's auto-validation not picking up assert.throws as a valid assertion
    })

    test('Solver returns the expected solution for an incomplete puzzle', () => {
        for (let puzzle of puzzles) {
            assert.equal(solver.solve(puzzle[0]), puzzle[1]);
        }
    })


});
