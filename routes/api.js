'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');
const log = require("simple-node-logger").createSimpleLogger();
const bodyParser = require("body-parser");
const rows = {A : 0, B : 1, C : 2, D : 3, E : 4, F: 5, G : 6, H : 7, I : 8}

log.setLevel('debug')

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.use(bodyParser.urlencoded({extended: true}));

  app.route('/api/check')
    .post((req, res) => {
        log.info('Check request received');
        bodyParser.json();
        log.debug(req.body);



        if (
            !req.body.hasOwnProperty('puzzle') ||
            !req.body.hasOwnProperty('coordinate') ||
            !req.body.hasOwnProperty('value') ||
            req.body.puzzle === '' ||
            req.body.coordinate === '' ||
            req.body.value === ''
        ) {
            log.error('Field(s) missing from puzzle')
            res.json({error: 'Required field(s) missing'});
        } else {

            try {
                solver.validate(req.body.puzzle)

                if (
                   !(parseInt(req.body.value) < 9) ||
                   !(parseInt(req.body.value) > 0)
                ) {
                    res.json({ error: 'Invalid value' });
                } else if (
                    rows[req.body.coordinate.substr(0, 1)] === undefined ||
                    (parseInt(req.body.coordinate.substr(1, 1)) - 1) > 8
                ) {
                    res.json({ error: 'Invalid coordinate' });
                } else {


                    let row = rows[req.body.coordinate.substr(0, 1)];
                    let col = parseInt(req.body.coordinate.substr(1, 1)) - 1;


                    let rowValid = solver.checkRowPlacement(req.body.puzzle, row, col, req.body.value);
                    let colValid = solver.checkColPlacement(req.body.puzzle, row, col, req.body.value);
                    let regionValid = solver.checkRegionPlacement(req.body.puzzle, row, col, req.body.value);

                    let errors = [];

                    if (!rowValid) {
                        errors.push('row')
                    }
                    if (!colValid) {
                        errors.push('column')
                    }
                    if (!regionValid) {
                        errors.push('region')
                    }

                    if (rowValid && colValid && regionValid) {
                        res.json({valid: true});
                    } else {
                        res.json({valid: false, conflict: errors});
                    }
                }
            } catch (e) {
                log.error(e);
                res.json({error: e.message});
            }


        }

    });
    
  app.route('/api/solve')
    .post((req, res) => {
      log.info('Solve request received');
      bodyParser.json();
      log.debug(req.body);
      if (!req.body.hasOwnProperty('puzzle') || req.body.puzzle === '') {
          res.json({error: 'Required field missing'})
      } else {
          let puzzleString = req.body.puzzle;
          try{
              let solution = solver.solve(puzzleString);
              res.json({solution});
          } catch (e) {
              log.error(e);
              res.json({error: e.message});
          }
      }

    });
};
