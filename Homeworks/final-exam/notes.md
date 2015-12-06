### Question 1
Download [`enron.zip`](https://s3.amazonaws.com/edu-downloads.10gen.com/enron/enron.zip).

```bash
$ cd path/to/enron.zip
# unzip the file
$ mongorestore --host=127.0.0.1 dump
```

```javascript
db.messages.find({
    'headers.From': 'andrew.fastow@enron.com',
    'headers.To': 'jeff.skilling@enron.com'
}).count();
// 3
```

### Question 2
```javascript
db.messages.aggregate([
    {$project: {
        _id: 1,
        from: '$headers.From',
        to: '$headers.To'
    }},
    {$unwind: '$to'},
    // match doesn't seem to do anythin
    {$match: {
        to: {$not: {$eq: '$from'}}
    }},
    {$group: {
        _id: {
            _id: '$_id',
            from: '$from'
        },
        to: {$addToSet: '$to'}
    }},
    {$unwind: '$to'},
    {$group: {
        _id: {
            from: '$_id.from',
            to: '$to'
        },
        count: {$sum: 1}
    }},
    {$sort: {count: -1}},
    {$limit: 50}
], {"allowDiskUse" : true});
// { "_id" : { "from" : "susan.mara@enron.com", "to" : "jeff.dasovich@enron.com" }, "count" : 750 }
```

### Question 3

```javascript
db.messages.update({
    'headers.Message-ID': '<8147308.1075851042335.JavaMail.evans@thyme>'
}, {
    $push: {
        'headers.To': 'mrpotatohead@mongodb.com'
    }
});
```

```
cd Materials/final-exam/question_3/final3/
npm install
node final3-validate.js
> Your validation code is: vOnRg05kwcqyEFSve96R
```

### Question 4

```bash
# import database data
cd Homeworks/final-exam/question-4/
# Note: need to add -j option
# Reference: http://stackoverflow.com/questions/33475505/mongodb-mongoimport-loses-connection-when-importing-big-files
mongoimport -d blog -c posts -h 127.0.0.1:27017 -j 4 < posts.json

# launch server
cd blog
npm install
nodemon app.js

# validate result
cd ../validate
npm install
node final4-validate.js
```

### Question 5
Which of the indexes could be used by MongoDB to assist in answering the query? Check all that apply.

```javascript
use test;
db.indexTest.createIndex({a: 1, b: 1});
db.indexTest.createIndex({a: 1, c: 1});
db.indexTest.createIndex({c: 1});
db.indexTest.createIndex({a: 1, b: 1, c: -1});
db.indexTest.getIndexes();

var j = 10000;
for (var i = 0; i < 10000; i++) {
    db.indexTest.insert({a: i, b: j--, c: i});
});

db.indexTest.explain().find({'a':{'$lt':10000}, 'b':{'$gt': 5000}}, {'a':1, 'c':1}).sort({'c':-1});
// answer: a_1_b_1
```

### Question 7
```bash
cd Materials/final-exam/question_7/final7
mongoimport -d photosharing -c albums -h 127.0.0.1:27017 --drop -j 4 < albums.json
mongoimport -d photosharing -c images -h 127.0.0.1:27017 --drop -j 4 < images.json
```

```javascript
use photosharing;
db.albums.findOne();

db.albums.createIndex({images: 1});

db.images.aggregate([
    {$project: {tags: 1}},
    {$unwind: '$tags'},
    {$match: {tags: 'kittens'}},
    {$group: {
        _id: {
            tags: '$tags',
        },
        count: {$sum: 1}
    }}
], {"allowDiskUse" : true});
// { "_id" : { "tags" : "kittens" }, "count" : 44822 }
```
