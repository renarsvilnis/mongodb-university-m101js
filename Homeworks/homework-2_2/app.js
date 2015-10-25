'use strict';

let mongodb = require('mongodb');
let MongoClient = mongodb.MongoClient;

MongoClient.connect('mongodb://localhost:27017/weather', function(err, db) {

  // let query = {'Wind Direction': {'$gt': 180, '$lt': 360}};
  let query = {};
  let projection = {'State': 1, '_id': 0, 'Temperature': 1};
  let options = {
    sort: [['State', 1], ['Temperature', -1]]
  };

  let cursor = db.collection('data').find(query, projection, options);

  let lastState = null;

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

    let operator = {'$set' : {'month_high': true}};

    if (doc.State && lastState !== doc.State) {
      activeUpdates++;
      db.collection('data').update(doc, operator, function(err, updated) {
        if(err) throw err;

        console.dir("Successfully updated " + updated + " document!");

        activeUpdates--;

        if (!activeUpdates && !iterationOnGoing) {
          db.close();
        }
      });

      lastState = doc.State;
    }
  });

});
