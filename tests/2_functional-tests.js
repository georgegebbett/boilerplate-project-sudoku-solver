const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

const puzzles = require('../controllers/puzzle-strings.js');
const invalidPuzzle = '9.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';

chai.use(chaiHttp);

suite('Functional Tests', () => {

    test('Solve a puzzle with valid puzzle string', function (done) {
        chai.request(server)
            .post('/api/solve')
            .send({puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'})
            .end((err, res) => {
                assert.equal(res.status, 200);
                done();
            })
    });

    test('Solve a puzzle with missing puzzle string', function (done) {
        chai.request(server)
            .post('/api/solve')
            .send({puzzle: ''})
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res, 'body');
                assert.equal(res.body.error, 'Required field missing');
                done();
            })
    });

    test('Solve a puzzle with invalid characters', function (done) {
        chai.request(server)
            .post('/api/solve')
            .send({puzzle: '0.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'})
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res, 'body');
                assert.equal(res.body.error, 'Invalid characters in puzzle');
                done();
            })
    });

    test('Solve a puzzle with incorrect length', function (done) {
        chai.request(server)
            .post('/api/solve')
            .send({puzzle: '1234'})
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res, 'body');
                assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
                done();
            })
    });

    test('Solve a puzzle that cannot be solved', function (done) {
        chai.request(server)
            .post('/api/solve')
            .send({puzzle: invalidPuzzle})
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res, 'body');
                assert.equal(res.body.error, 'Puzzle cannot be solved');
                done();
            })
    });

    test('Check a puzzle placement with all fields', function (done) {
        chai.request(server)
            .post('/api/check')
            .send({
                puzzle: '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..',
                coordinate: 'A4',
                value: '2'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res, 'body');
                assert.equal(res.body.valid, true);
                done();
            })
    });

    test('Check a puzzle placement with single placement conflict', function (done) {
        chai.request(server)
            .post('/api/check')
            .send({
                puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
                coordinate: 'A2',
                value: '8'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res, 'body');
                assert.equal(res.body.valid, false);
                assert.isArray(res.body.conflict);
                assert.sameMembers(res.body.conflict, ["row"]);
                done();
            })
    });

    test('Check a puzzle placement with multiple placement conflicts', function (done) {
        chai.request(server)
            .post('/api/check')
            .send({
                puzzle: '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..',
                coordinate: 'A4',
                value: '5'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res, 'body');
                assert.equal(res.body.valid, false);
                assert.isArray(res.body.conflict);
                assert.sameMembers(res.body.conflict, ["row", "region"]);
                done();
            })
    });

    test('Check a puzzle placement with all placement conflicts', function (done) {
        chai.request(server)
            .post('/api/check')
            .send({
                puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
                coordinate: 'A2',
                value: '2'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res, 'body');
                assert.equal(res.body.valid, false);
                assert.isArray(res.body.conflict);
                assert.sameMembers(res.body.conflict, ["row", "column", "region"]);
                done();
            })
    });

    test('Check a puzzle placement with missing required fields', function (done) {
        chai.request(server)
            .post('/api/check')
            .send({
                puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
                coordinate: 'A2'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res, 'body');
                assert.equal(res.body.error, "Required field(s) missing");
                done();
            })
    });

    test('Check a puzzle placement with invalid characters', function (done) {
        chai.request(server)
            .post('/api/check')
            .send({
                puzzle: '0.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
                coordinate: 'A2',
                value: '2'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res, 'body');
                assert.equal(res.body.error, 'Invalid characters in puzzle');
                done();
            })
    });

    test('Check a puzzle placement with incorrect length', function (done) {
        chai.request(server)
            .post('/api/check')
            .send({
                puzzle: '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6.',
                coordinate: 'A4',
                value: '2'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res, 'body');
                assert.equal(res.body.error, "Expected puzzle to be 81 characters long");
                done();
            })
    });

    test('Check a puzzle placement with invalid placement coordinate', function (done) {
        chai.request(server)
            .post('/api/check')
            .send({
                puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
                coordinate: 'Z9',
                value: '2'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res, 'body');
                assert.equal(res.body.error, "Invalid coordinate");
                done();
            })
    });

    test('Check a puzzle placement with invalid placement value', function (done) {
        chai.request(server)
            .post('/api/check')
            .send({
                puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
                coordinate: 'A9',
                value: '25'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res, 'body');
                assert.equal(res.body.error, "Invalid value");
                done();
            })
    });





});

