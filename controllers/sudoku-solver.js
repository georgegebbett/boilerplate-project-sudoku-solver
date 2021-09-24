const CHECK_IF_VALID_PUZZLE = new RegExp('^[1-9\.]{81}$');
const INVALID_LENGTH_ERROR = 'Expected puzzle to be 81 characters long';
const INVALID_CHARS_ERROR = 'Invalid characters in puzzle';

const log = require('simple-node-logger').createSimpleLogger();
log.setLevel('info');



class SudokuSolver {


  createError(msg) {
    Error.stackTraceLimit = 0;
    let err = new Error(msg);

    return err;
  }

  validate(puzzleString) {
    if (puzzleString.length !== 81) {
      throw this.createError(INVALID_LENGTH_ERROR);
    } else if (!CHECK_IF_VALID_PUZZLE.test(puzzleString)) {
      throw this.createError(INVALID_CHARS_ERROR);
    } else {
      return true;
    }

  }

  checkRowPlacement(puzzleString, row, column, value) {
    let rows = puzzleString.match(/.{1,9}/g);
    log.debug('Rows: ', rows);

    let alreadyPresent = rows[row].includes(value);
    log.debug(value, ' already in row ', row.toString(), '? ', alreadyPresent.toString())

    if (alreadyPresent) {
      let cellNo = (row*9) + column;
      log.debug('Cell no: ', cellNo.toString());
      if (puzzleString[cellNo] === value) {
        log.debug('Desired value already in checked square');
        let puzzleStringWithoutCheckedChar = puzzleString.substr(0, cellNo).concat('.', puzzleString.substr(cellNo+1));
        log.debug('Here follows new puzzle:')
        log.debug(puzzleStringWithoutCheckedChar);
        return this.checkRowPlacement(puzzleStringWithoutCheckedChar, row, column, value);
      } else {
        return false;
      }
    } else {
      return true;
    }

  }

  checkColPlacement(puzzleString, row, column, value) {
    let cols = ['', '', '', '', '', '', '', '', '']

    let index = 0;

    for (let char of puzzleString) {
      cols[index] = cols[index].concat(char)
      if (index === 8) {
        index = 0;
      } else {
        index ++;
      }
    }

    log.debug('Cols: ', cols);

    let alreadyPresent = cols[column].includes(value);
    log.debug(value, ' already in col ', column.toString(), '? ', alreadyPresent.toString())

    if (alreadyPresent) {
      let cellNo = (row*9) + column;
      log.debug('Cell no: ', cellNo.toString());
      if (puzzleString[cellNo] === value) {
        log.debug('Desired value already in checked square');
        let puzzleStringWithoutCheckedChar = puzzleString.substr(0, cellNo).concat('.', puzzleString.substr(cellNo+1));
        log.debug('Here follows new puzzle:')
        log.debug(puzzleStringWithoutCheckedChar);
        return this.checkColPlacement(puzzleStringWithoutCheckedChar, row, column, value);
      } else {
        return false;
      }
    } else {
      return true;
    }

  }

  checkRegionPlacement(puzzleString, row, column, value) {
    let regions = ['', '', '', '', '', '', '', '', ''];

    let regionGroups = puzzleString.match(/.{1,3}/g);

    log.debug('Region groups: ', regionGroups);

    let adder = 0;
    let region = 0;
    let goRound = 0;

    for (let regionGroup of regionGroups) {
      log.debug('Region: ', region.toString(), ' Adder: ', adder.toString(), ' Sum: ', (region+adder).toString(), ' Go round: ', goRound.toString());
      regions[region + adder] = regions[region + adder].concat(regionGroup);
      if (goRound === 2 && region === 2) {
        region = 0;
        adder += 3;
        goRound = 0;
      } else {
        if (region === 2) {
          region = 0;
          goRound++;
        } else {
          region++;
        }
      }
    }

    log.debug('Regions: ', regions);

    const getRegion = (row, col) => {
      log.debug(`Getting region for row ${row} and col ${col}`);
      if (0 <= row && row <= 2) {
        if (0 <= col && col <= 2) {
          return 0;
        } else if (3 <= col && col <= 5) {
          return 1;
        } else if (6 <= col && col <= 8) {
          return 2;
        }
      } else if (3 <= row && row <= 5) {
        if (0 <= col && col <= 2) {
          return 3;
        } else if (3 <= col && col <= 5) {
          return 4;
        } else if (6 <= col && col <= 8) {
          return 5;
        }
      } else if (6 <= row && row <= 8) {
        if (0 <= col && col <= 2) {
          return 6;
        } else if (3 <= col && col <= 5) {
          return 7;
        } else if (6 <= col && col <= 8) {
          return 8;
        }
    }
  }

    let regionGuess = getRegion(row, column);

    log.debug('Region guess: ', regionGuess.toString());

    let alreadyPresent = regions[regionGuess].includes(value);
    log.debug(value, ' already in region ', regionGuess.toString(), '? ', alreadyPresent.toString())

    if (alreadyPresent) {
      let cellNo = (row*9) + column;
      log.debug('Cell no: ', cellNo.toString());
      if (puzzleString[cellNo] === value) {
        log.debug('Desired value already in checked square');
        let puzzleStringWithoutCheckedChar = puzzleString.substr(0, cellNo).concat('.', puzzleString.substr(cellNo+1));
        log.debug('Here follows new puzzle:')
        log.debug(puzzleStringWithoutCheckedChar);
        return this.checkRegionPlacement(puzzleStringWithoutCheckedChar, row, column, value);
      } else {
        return false;
      }
    } else {
      return true;
    }

  }

  solve(puzzleString) {
    let checkIndex = 0;
    let checkValue = 1;

    let testMode = false;
    let puzzleSol = '';

    if (puzzleString === '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.378') {
      testMode = true;
      puzzleSol = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';
    }

    try {
      this.validate(puzzleString);

      log.info(`Solving puzzle: ${puzzleString}`)

      let mutableVals = {};
      let firstMutable = undefined;

      for (let i = 0; i < puzzleString.length; i++) {
        if (firstMutable === undefined && puzzleString[i] === '.') {
          firstMutable = i;
        }
        mutableVals[i] = (puzzleString[i]==='.');
      }
      let checkRow = Math.trunc(checkIndex/9);
      let checkCol = checkIndex % 9;

      while (checkIndex < 81) {
        checkRow = Math.trunc(checkIndex/9);
        checkCol = checkIndex % 9;
        log.debug('Puzzle not yet solved');
        log.debug(`Checking index ${checkIndex}`);
        while (checkValue < 10) {
          if (mutableVals[checkIndex]) {
            checkRow = Math.trunc(checkIndex/9);
            checkCol = checkIndex % 9;
            log.debug(`Checking index ${checkIndex} with value ${checkValue}`);
            if (
                this.checkRegionPlacement(puzzleString, checkRow, checkCol, checkValue) &&
                this.checkColPlacement(puzzleString, checkRow, checkCol, checkValue) &&
                this.checkRowPlacement(puzzleString, checkRow, checkCol, checkValue)
            ) {
              log.debug(`Index ${checkIndex} can be ${checkValue}`);
              puzzleString = puzzleString.substr(0, checkIndex).concat(checkValue.toString(), puzzleString.substr(checkIndex + 1));
              if (testMode) {
                if (puzzleString[checkIndex] === puzzleSol[checkIndex]) {
                  log.debug('This is the correct final value');
                  if (puzzleString === puzzleSol) {
                    log.debug('Puzzle complete');
                  }
                } else {
                  log.debug('This is not the correct final value');
                }
              }
              checkIndex++;
              if (checkIndex === 81) {
                log.info(`Puzzle solved: ${puzzleString}`);
                return puzzleString;
              }
              checkValue = 1;
            } else {
              checkValue++;
            }
          } else {
            log.debug(`Cannot change immutable val at index ${checkIndex}, incrementing again`);
            checkIndex++;
            if (checkIndex > 81) {
              log.info(`Puzzle solved: ${puzzleString}`);
              return puzzleString;
            }
          }
        }
        log.debug(`No solution for cell ${checkIndex}, changing it back to . and decrementing index`);
        puzzleString = puzzleString.substr(0, checkIndex).concat('.', puzzleString.substr(checkIndex + 1));



        if (checkIndex === firstMutable) {
          log.warn('There is no solution for the first mutable value');
          throw this.createError('Puzzle cannot be solved');
          // if (puzzleString[checkIndex] === '9' && mutableVals[checkIndex]) {
          //   log.warn(`The value at index ${checkIndex} is 9 and the cell is the first mutable`);
          //   log.warn('Every possible iteration has been tried, the puzzle cannot be solved');
          //   throw this.createError('Puzzle cannot be solved');
          // } else {
          //   while (true) {
          //     if (!mutableVals[checkIndex]) {
          //       log.debug(`Cannot change immutable val at index ${checkIndex}, incrementing`);
          //       checkIndex++;
          //     } else if (mutableVals[checkIndex] && puzzleString[checkIndex] !== '9') {
          //       log.debug('First mutable is not yet 9, and it is mutable');
          //       log.debug('Start checking bigger values for first mutable');
          //       break;
          //     }
          //   }
          // }

        } else{
          checkIndex--;

          while (puzzleString[checkIndex] === '9' || !mutableVals[checkIndex]) {
            log.debug(`Checking out index ${checkIndex}, value ${puzzleString[checkIndex]}`);
            log.debug(`Mutable? ${mutableVals[checkIndex].toString()}`);
            log.debug(`9? ${(puzzleString[checkIndex] === '9').toString()}`);
            if (puzzleString[checkIndex] === '9' && mutableVals[checkIndex]) {
              log.debug('The value here is 9, which is too high, we will change it back to . and go back again');
              puzzleString = puzzleString.substr(0, checkIndex).concat('.', puzzleString.substr(checkIndex + 1));
              checkIndex--;
            } else if (!mutableVals[checkIndex]) {
              log.debug(`Cannot change immutable val at index ${checkIndex}, decrementing again`);
              checkIndex--;
            }
            if (checkIndex < 0) {
              log.warn('Checkindex is less than 0')
              throw this.createError('Puzzle cannot be solved');
            }
          }
        }
        log.debug(`Checking out index ${checkIndex}, value ${puzzleString[checkIndex]}`);
        log.debug(`Mutable? ${mutableVals[checkIndex].toString()}`);
        log.debug(`9? ${(puzzleString[checkIndex] === '9').toString()}`);
        log.debug(`Settled on index ${checkIndex}`);
        log.debug(`This index currently contains ${puzzleString[checkIndex]}`);
        log.debug(`Puzzle so far to follow:`);
        log.debug(puzzleString);

        if (puzzleString[checkIndex] === '.') {
          checkValue = 1;
        } else {
          checkValue = parseInt(puzzleString[checkIndex]) + 1;
        }
        log.debug(`We will try ${checkValue}`);
        // puzzleString = puzzleString.substr(0, checkIndex).concat(checkValue.toString(), puzzleString.substr(checkIndex + 1));
        log.debug(`Puzzle now looks like this:`);
        log.debug(puzzleString);

        this.validate(puzzleString);
        log.debug(`Check index: ${checkIndex}, check val: ${checkValue}`);
      }







    } catch (e) {
      throw e;
    }
    
  }
}

module.exports = SudokuSolver;

