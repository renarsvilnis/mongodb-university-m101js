


```bash
# Launch mongo server
$ mongod

# CD into the dump directory and import database
# Adding host to mongorestore because could not reach server
# Reference: http://stackoverflow.com/a/32452543
$ cd Materials/week-1/homework_1_1/hw1-1
$ mongorestore --host=127.0.0.1 dump

# Show all databases
> show dbs
demo   0.078GB
local  0.078GB
m101   0.078GB

# Use our just imported DB
> use m101
switched to db m101

# Look at all the collection a database have
> show collections
hw1_1
system.indexes

# Query the answer
> db.hw1_1.findOne()
{
    "_id" : ObjectId("51e4524ef3651c651a42331c"),
    "answer" : "Hello from MongoDB!"
}
```
