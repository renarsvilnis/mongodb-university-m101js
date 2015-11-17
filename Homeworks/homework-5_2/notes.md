

## Import data 
`mongoimport -d test -c zips -h 127.0.0.1:27017 --drop small_zips.json`

```javascript
db.zips.aggregate([
  {
    $match: {
      state: {$in: ['CA', 'NY']},
    }
  },
  {
    $group: {
      _id: "$city",
      population: {$sum: "$pop"}
    }
  },
  {
    $match: {
      population: {$gt: 25000}
    }
  },
  {
    $group: {
      _id: null,
      population: {$avg: "$population"}
    }
  }
]);

// 44804.782608695656 = ~44805
```
