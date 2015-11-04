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
- Compound index - `db.students.createIndex({student_id: 1, class_id: -1});` where the `student_id` would be sorted ascending, but the `class_id` descending.
- Multikey indexs - `db.students.createIndex({scores.score: 1});`

- Explain whats going under the query - `db.students.explain().find({});`, if you pass in `true` into the explain method call, it will return addition info about number of queries found or iterated, etc.
- Find existing indexes - `db.students.getIndexes();`
- Drop a index - `db.students.dropIndex({student_id: 1});`

> An array can be an index key, but a compound index can't contain multiple array index keys


