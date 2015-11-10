# Performance

## Storage engines
Is beetween disk and Mongo server, but storage engines can choose to either save in memory or disk.

### MMAPv1 
Default MongoDB storage driver.
- Collection Level Locking
- Build on top of mmap
- Power of two document padding

### WiredTiger
- Document level concurrency
- Compression on disk
- No inplace Update (rewrite update on disk)

> WiredTiger can't use MMAP database and the otherway around

```
# launch WiredTiger
$ mkdir WT
$ mongod -dbpath WT -storageEngine wiredTiger
```

## Indexes
If creating a multi-key index they should be ordered in such a way when querying you specifying from the left side of the index. Example  index `[name, hair, age]` would sort the documents first by name then hair and then age. So when querying you can't just specify age or hair to query the data, you need either just `name` or `name, hair`.

> Reads faster, write slower

### Create
- Simple index - `db.students.createIndex({student_id: 1});`
- Compound index - `db.students.createIndex({student_id: 1, class_id: -1});` where the `student_id` would be sorted ascending, but the `class_id` descending. A single index structure holds references to multiple fields.

> The returning date by default will be sorted in such order its specified in the index ascending or descending

- Multikey indexs - `db.students.createIndex({scores.score: 1});`

- Explain whats going under the query - `db.students.explain().find({});`, if you pass in `true` into the explain method call, it will return addition info about number of queries found or iterated, etc.
- Find existing indexes - `db.students.getIndexes();`
- Drop a index - `db.students.dropIndex({student_id: 1});`

> An array can be an index key, but a compound index can't contain multiple array index keys

- unique index - `db.students.createIndex({user_id: 1}, {unique: true});`
- sparse index - `db.students.createIndex({user_id: 1}, {unique: true, sparse: true});` - won't use indexes in find as there might be documents with missing properties and uses less space

#### Types of index creations
Reference - https://docs.mongodb.org/manual/core/index-creation/?_ga=1.93089181.1066051745.1444943199#index-creation-background

##### foreground (*default*) creation
- relativly fast 
- blocks reads/writes in the database
- not in production system

##### background creation
- slow
- doesn't block reads/writes in the database

## Explain
Explain supports two ways of calling explain on a query either before or after the find, remove, update.

Using the explain afterwards will **only** explain what happened for the current data on the cursor and **not** the entire query.

> Explain does not work on inserts
> Remove must as such `db.students.explain().remove(..)`, as remove doesn't return a cursor.

### Explain modes
- queryPlanner *default* - shows all plans and how what each plan would do
- executionStats - `db.students.explain('executionStats').find(..)` - tells the execution stats for the winning plan.   
- allPlansExecution - `db.students.explain('allPlansExecution').find(..)` - tries and returns execution stats for all possible query plans

### Covered Queries
Covered queries are queries that need to inspect 0 document thus making the fast.

> by default query will return the `_id` which will inspect the documents. In field select just avoid `_id_` and other fields that aren't covered in the index.

> The order of indexes are important for creating an covered query.

### Choosing and index under the hood
1. Finds candidates for the query
2. Creates a query plan for each
3. Executes each plan and returns faster
4. MongoDB caches the query plans, even slower caching plans, as they might return sorted results, which might be usefull in someother then this query.

#### When does mongoDB clear the cache
- after threshold (*~1000*) writes
- created/removed/rebuild index
- mongoD restart 

> For writing queries use a left-subset (or "prefix") of the index. For sorting, it must either match the index orientation, or match its reverse orientation, which you can get when the btree is walked backwards.

## Index sizes
`db.students.stats()` - get the stats for a collection.

The index size can be considerably smaller ~3x (at the cost of some CPU space) in WiredTiger with --wiredTigerIndexPrefixCompression enabled.

> Also, the db.collection.stats() is more verbose for WiredTiger, but will still give you all of this information.

### Index Cardinality
- regular - 1:1
- sparse - <= documents 
- multikey - > documents

> That cost only exists in the MMAPv1 storage engine. In the WiredTiger storage engine, index entries don't contain pointers to actual disk locations. Instead, in WiredTiger, the indexes contain _id values. As _id is immutable, the indexes don't change for document moves, although document moves do require updating the index that translates between _id values an disk locations.


## Geospatial Indexes
### 2D Geospatial Indexes
#### Creation
1. Documents must have an array of 2 values `{_id: 21, location: [24, 42]}`
2. `db.collection.createIndex({'location': '2d'})`

#### Querying
`db.collection.find({location: {$near: [x,y]}}).limit(10);` - will return 10 documents with increasing distance

### 3D Geospatial Indexes
MongoDB implements some parts of [geoJSON](http://geojson.org/).

#### Creation
1. ensure document for spherical (3d) geospacial index
```json
{
    "location": {
        "type": "Point",
        "coordinates": [x,y]
    }
}
```
2. `db.places.createIndex({'location: '2dsphere'})`

#### Querying
```javascript
db.collection.find({
    location: {
        $near: {
            $geometry: {
                type: "Point",
                coordinates: [lng, lat]
            },
            $maxDistance: 2000 // meters
        }
    }
});
```

## Full Text Indexes
```json
{
    "_id": 241,
    "words": "dog tre granite"
}
```

### Creation
`db.collection.createIndex({words: 'text'});`

### Querying
`db.collections.find({$text: {$search: 'dog graniate'}});`

> Commas or upercase letters doesnt effect the query

#### Getting the closest matching result
```javascript
db.collections.find({
    $text: {
        $search: 'dog tree graniate'
    }
}, {
    score: {
        $meta: 'textScore'
    }
}).sort({
    score: {
        $meta: 'textScore'
    }
});
```


## Designing/Using Indexes
- selectivity - the primary factor that determines how efficiently an index can be used. Ideally, the index enables us to select only those records required to complete the result set, without the need to scan a substantially larger number of index keys (or documents) in order to complete the query. Selectivity determines how many records any subsequent operations must work with. Fewer records means less execution time.
- other ops - are results sorted?

Help mongoDB choose what index to take by hinting it, but shouldn't be uses in production that much:
`db.students.find({student_id:{$gt:500000}, class_id:54}).sort({student_id:1}).hint({class_id:1}).explain('executionstats')`

If we want to sort using something like `db.collection.find({a: 75}).sort({a: 1, b: -1})`, we must specify the index using the same directions, e.g., `db.collection.createIndex({a: 1, b: -1})`.

## Logging Slow Queries
By default logs slows queries in the mongoD console.

### Profiler
Levels:
- 0 *default* - off
- 1 - log slow queries
- 2 - log all queries

Launch DB as: `mongod -dbpath /usr/local/var/mongodb --profile 1 --slowms 2`

Query logs: `db.system.profile.find().pretty();`

Example Query specific logs: `db.system.profile.find({ns: /school.students/}).sort({ts: 1}).pretty();`

Usefull commands: 
- `db.getProfilingLevel()`
- `db.getPorfilingStatus()`
- `db.setProfilingLevel(1, 4)` - sets profile=1 and slowms=4

## Mongotop
`mongotop 3` - return stats on how much time spent is reading on different collections during the `3` interval. Can be used to help find slow queries.

Reads IO from inserts, queries, updates, deletes.

Can be used for stress testing.

[Check the docs](https://docs.mongodb.org/manual/reference/program/mongostat/) for a detail description of the stats.

## Sharding
application -> mongos -> databases and replica sets

Update, remove, find - use shard_key for better performance


