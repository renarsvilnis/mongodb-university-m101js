# Aggregation Framework

Example aggregation query
```javascript
db.products.aggregate([
    {
        $group: {
            _id: "$manufacturer",
            num_products: {$sum: 1}
        }
    }
])
```


## Aggregation pipeline
Document one-by-one is piped throught aggregation pipleline states.

## Aggregation pipeline states
> order can depend and appear multiple times

- `$project` - reshape document - 1:1
- `$match` - filter documents - n:1
- `$group` - aggregate (sum, avg, ..) - n:1
- `$sort` - sort documents - 1:1
- `$skip` - skips documents - n:1
- `$limit` - limit the count of the documents out of pipe - n:1
- `$unwind` - normalize data - 1:n - example `tags: ['red', 'blue', 'green']` => `tags: 'red'`, `tags: 'blue'`, `tags: 'green'`
- `$out` - output aggregation to collection - 1:1
- `$redact` - TODO
- `$geonear` - TODO

## Compound Grouping
```javascript
db.products.aggregate([
    {
        $group: {
            _id: {
                manufacturer: "$manufacturer",
                category: "$category"
            },
            num_products: {$sum: 1}
        }
    }
])
```

> `_id` for a document can be a object, example `_id: {name: 'Andrew', class: 'm101'}`
 
## Aggregation Expressions
- `$sum` - get sum of grouped key
- `$avg` - get average of grouped key
- `$min`
- `$max`
- `$addToSet` - add to a unique set, example `{$group: {_id: {maker: "$maker"}, categories:{$addToSet:1, "$categories"}}}` would return makers and list if unique categories they make
- `$push` - push to a set, similar as `$addToSet`, but has duplicates
- `$first` - finds first value for the key
- `$last` - last value for the key

### `$first`, `$last`
First or last of a grouped key, example after sort, group.

```javascript
db.zips.aggregate([
  {
    $group: {
      _id: {
        state: "$state",
        city: "$city"
      },
      population: {$sum: "$pop"}
    }
  },
  {
    $sort: {
        "_id.state": 1,
        population: -1
    }
  },
  {
    $group: {
      _id: "$_id.state",
      city: {$first: "$_id.city"},
      population: {$first: "$population"}
    }
  },
  {
    $sort: {
        state: 1
    }
  }
]);
```

## Double Grouping
You can *Double Group* - example case get a group average and then apply avg on it.

```javascript
db.zips.aggregate([
  {
    $group: {
      _id: {
        class_id: "$class_id",
        student_id: "$student_id"
      },
      average: {$avg: "$score"}
    }
  },
  {
    $group: {
      _id: "$_id.class_id",
      average: {$avg: "$average"}
    }
  }
]);
```

## Aggregation pipeline states - continued

### `$project`
- remove keys
- add new kets
- reshape keys
- use some simple functions on keys:
    - $toUpper
    - $toLower
    - $add - add something to the value 
    - $multiply

```javascript
db.products.aggregate([
    {
        $project: {
            _id: 0,
            maker: {$toLower: "$manufacturer"},
            details: {
                category: "$category",
                price: {$multiply: [$price, 10]}
            }
        }
    }
])
```

### `$match`
Filters documents n:1.

>One thing to note about $match (and $sort) is that they can use indexes, but only if done at the beginning of the aggregation pipeline. [More..](https://docs.mongodb.org/manual/core/aggregation-pipeline/?_ga=1.155103416.1670353944.1447698202)

Example matches all documents where `state` is `CA`.
```javascript
db.zips.aggregate([
    {
        $match: {
            state: "CA"
        }
    }
]);
```

### `$sort`
`$sort` allows Disk or Memory based sort. By default Memory sort limits at 100MB.

```javascript
db.zips.aggregate([
    {
        $match: {
            state: "CA"
        }
    },
    {
        $sort: {
            pop: -1
        }
    }
]);
```

### `$limit`, `$skip`
First you should sort.

> `$skip` first, then `$limit`. THe node.js rivers on queries sorts automatcly but here it should be explicitly written in correct order

### `$unwind`
Unjoin data, example exploding a document with array field `tags`, that would create n-th documents where `tags` now would be one item from the `tags`.

```javascript
db.posts.aggregate([
    {$unwind: "$tags"},
    {
        $group: {
            _id: "$tags",
            count: {$sum: 1}
        }
    },
    {$sort: {count: -1}},
    {$limit: 10},
    {
        $project: {
            _id: 0,
            tag: "$_id",
            count: 1
        }
    }
]);
```

It's sometimes necessary to double `$unwind` (*one-after-another*) to further expand something. Example, ecommerce colleciton where you would need to `$unwind` product by size and then by color, which would results in all posible combinations of the product.

> It's possible to reverse single and double `$unwind` with `$push`.


### SQL to Aggregation mapping
- WHERE - $match
- GROUP BY - $group
- HAVING - $match
- SELECT - $project
- ORDER BY - $sort
- LIMIT - $limit
- SUM() - $sum
- COUNT() - $sum
- join - no direct corresponding operator, the `$unwind` operator allows for somewhat similar functionality, but with the fields empbedded withing the document

### Limitations in Aggregation
- 100MB limit for pipeline stages - set `allowDiskUse` (**explicitly defined**) for the aggregation
- 16MB limit for one document - set `cursor = {}`
- On a sharded system when using `$group`, `$sort`, or something that looks at all the results, the documents must be returned to the first shard - resolved by hadoop connector, there are old solutions `map/reduce` (**not recommended**)
