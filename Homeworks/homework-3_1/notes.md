


```bash
# Launch mongo server
$ mongod

# CD into the dump directory and import database
# Adding host to mongorestore because could not reach server
# Reference: http://stackoverflow.com/a/32452543
$ cd Materials/week-3\ -\ schemas/homework_3_1/
$ mongoimport --host=127.0.0.1 -d school -c students < students.json

# Execute update query
$ node app

# Query and paste the result
$ mongo
$ use school
$ db.students.aggregate( { '$unwind' : '$scores' } , { '$group' : { '_id' : '$_id' , 'average' : { $avg : '$scores.score' } } } , { '$sort' : { 'average' : -1 } } , { '$limit' : 1 } )

```
