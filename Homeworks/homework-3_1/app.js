'use strict';

let mongodb = require('mongodb');
let MongoClient = mongodb.MongoClient;

MongoClient.connect('mongodb://localhost:27017/school', function(err, db) {
  let students = db.collection('students');

  let query = {'scores.type': 'homework'};
  let projection = {'scores': 1};
  let options = {};

  let cursor = db.collection('students').find(query, projection, options);

  let iterationOnGoing = true;
  let activeUpdates = 0;

  cursor.each(function(err, doc) {
    if (err) throw err;

    if (!doc) {
      iterationOnGoing = false;

      if (!activeUpdates) {
        db.close();
      }

      return;
    }

    let minScore;
    doc.scores.forEach(function(score) {
      if (score.type === 'homework') {

        if(typeof minScore === 'undefined' || score.score < minScore) {
          minScore = score.score;
        }
      }
    });

    // console.log(minScore);

    let operator = {
      '$pull' : {
        'scores': {
          'type': 'homework',
          'score': minScore
        }
      }
    };

    students.update(doc, operator, function(err, updated) {
      if(err) throw err;

      console.dir("Successfully updated " + updated + " document!");

      activeUpdates--;

      if (!activeUpdates && !iterationOnGoing) {
        db.close();
      }
    });
  });
});

// myresults = db.megas.aggregate( [ { "$unwind": "$items" },  
//     {"$group": { '_id':'$_id' , 'minitem': {'$min': "$items.item" } } } ] )
// step 2) the loop through the results and $pull the element from the array

// for result in myresults['result']:
//     db.megas.update( { '_id': result['_id'] }, 
//         { '$pull': { 'items': { 'item': result['minitem'] } } } )
