

## Import data 

```bash
# will show that has 3 duplicate id, but its ok
mongoimport -d test -c zips -h 127.0.0.1:27017 --drop zips.json
```

```javascript
db.zips.aggregate([
  {
    $project: {
      first_char: {
        $substr : ["$city",0,1]
      },
      pop: 1
    } 
  },
  {
    $match: {
      first_char: {$in: ["0","1","2","3","4","5","6","7","8","9"]}
    }
  },
  {
    $group: {
      _id: null,
      population: {$sum: "$pop"}
    }
  }
]);

// { "_id" : null, "population" : 298015 }
```
