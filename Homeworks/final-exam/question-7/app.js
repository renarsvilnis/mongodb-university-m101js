'use strict';

let MongoClient = require('mongodb').MongoClient;
 
const url = 'mongodb://localhost:27017/photosharing';

MongoClient.connect(url, function(err, db) {
  if (err) {
    db.close();
    throw err;
    return;
  }

  console.log('Connected correctly to server');

  const images = db.collection('images');
  const albums = db.collection('albums');

  let iterationOnGoing = true;
  let activeUpdates = 0;

  let cursor = images.find({}, {_id: 1});

  let closeDBIfDone = () => {
    if (!activeUpdates && !iterationOnGoing) {
      db.close();
      console.log('Done');
    }
  };

  cursor.each((err, image) => {
    if (err) throw err;

    if (!image) {
      iterationOnGoing = false;

      if (!activeUpdates) {
        db.close();  
      }
      
      return;
    }

    albums.findOne({images: image._id}, {_id: 1})
      .then((album) => {
        activeUpdates++;
        // remove image if isn't in album
        if (!album) {
          images.remove(image)
            .then(() => {
              activeUpdates--;
              closeDBIfDone();
              console.log('Image removed:', image._id);
            });
        } else {
          activeUpdates--;
          closeDBIfDone();
        }
      });
  });
});
