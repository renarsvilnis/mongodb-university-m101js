

## Import data 
`mongoimport -d test -c grades -h 127.0.0.1:27017 --drop grades.json`

```javascript
db.grades.aggregate([
  // unwind for later fileterin
  {$unwind: "$scores"},
  // filter quiz scores
  {
    $match: {
      'scores.type': {$ne: "quiz"}
    }
  },
  // group and average each students grade per class
  {
    $group: {
      _id: {
        student_id: "$student_id",
        class_id: "$class_id"
      },
      score: {$avg: "$scores.score"}
    }
  },
  // calculate avg grade per class
  {
    $group: {
      _id: "$_id.class_id",
      score: {$avg: "$score"}
    }
  },
  {$sort: {score: -1}},
  {$limit: 1}
]);

// { "_id" : 1, "score" : 64.50642324269175 }
```
