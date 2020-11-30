var express = require('express');
var router = express.Router();
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path')
const clients = require('../bin/www')
var events = require('events');
// Create an eventEmitter object
var eventEmitter = new events.EventEmitter();
const filePath = path.join(process.cwd(),'/public', '/files', '/Sensex_CSV_2018 - CSVForDate.csv');
let fileArray = [];
// Reading csv file using csv-parser module
fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
        // Reading the file data
        fileArray.push(row);
    })
    .on('end', () => {
        // Sorting the file in decreasing order
        fileArray.sort(function(obj1,obj2){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(obj2.Date) - new Date(obj1.Date);
        });
      console.log('CSV file successfully processed');
    });

/* Post listener for pagination. */
// Pagination Api for sensex
router.post('/list', function(req, res, next) {
    const start = req.body.start;
    const count = req.body.count;

    let pageData = []

    for (let counter = start , dataCount = 1; counter < fileArray.length ; counter++, dataCount++) {
        pageData.push(fileArray[counter]);

        if (dataCount === count) {
            break;
        }
    }

    return res.send({pageData,totalItem: fileArray.length});
});

/* Post listener for pagination. */
// Add api for sensex
router.post('/add', function(req, res, next) {
    const Open = req.body.Open;
    const Close = req.body.Close;
    let currentDate = new Date();
    const options = {  year: 'numeric', month: 'long', day: 'numeric' };
    currentDate = currentDate.toLocaleDateString('hi', options);
    // Sorting the file in decreasing order
    let arrayDat = [];
    arrayDat.push({Open,Close,Date: currentDate});

    fileArray.forEach((ele) => {
       arrayDat.push(ele);
    });

    fileArray = arrayDat;
    // triggers the sensex event so that
    // all session can be updated
    eventEmitter.emit('addSensex');
    return res.send({result: 'Added Successfully'});
});

module.exports = router;
module.exports.SensexEvent = eventEmitter;
