
> MongoDB doesn't have a query language, it just depends on the language your using the MongoDB driver

## Crud semantics in MongoDB
- `Create === Insert
- `Read === Find
- `Update === Update
- `Remove === Delete

## BSON
Mongo stores data in [BSON format](http://bsonspec.org/)

> **query** - example {age: 16, name: 'John'} will return a document which age is equal to 16 and name equal to John

> **return_field** - example {name: false, age: true} will return a document with age field, but without the name field

# Creating
## Query methods
- `.insert({Object})`, which create a new document from given `Object`.

# Reading
## Query methods
- `.find({query})` - find all documents that matches query
- `.findOne({query}, {return_fields})` - find one document that matches query
- `.count({query})` - returns the count of documents that matches the query

## Query operators
- `$gt`, `$lt`, `$gte`, `$lte`, example query `{score: {$gt: 95, $lte: 98}}, returns documents where the score is more then 95 or less or equal 98. Logical and.
- `$exists: <boolean>`, example query `{profession: {$exists: true}}` will return all documents where a profession field exists
- `$type: TYPE_VALUE_FROM_BSON_SPEC`, example query `{name: {$type: 2}}` returns all documents where the name is a string. Type values can be looked up [here](http://bsonspec.org/spec.html).
- regexes, example query `{name: {$regex: "a"}}`, will return all documents where name contains "a" letter. 
- `$or: [query, ..]`, example query `{$or: [{$name: {$regex: "e$"}}, {age: {$exists: true}]}` will return all documents that either has a name field that ends with "e" or documents that have a age field.
- `$and: [query, ..]`, example query `{$and: [{name: {$gt: "C"}}, {name: {$regex: "a"}}]})` will return all documents where the name sorts after "C" and has a "a" in the name field. Most cases don't need to be using `$and` as it can be written more simple. Example query `{name: {$gt: "C", $regex: "a"}}` is the same as query using `$and`.
- `$all: [list]`, example query `{favorites: {$all: ["pretzels", "bear"]}}` will return all documents that have in their favorites "pretzels" and "bear".
- `$in: [list]`, example query `{name: {$in: ["Howard", "John"]}}` will return all documents that have name either Howard or John. Can use `$in` to check if any document array field is in the given list for `$in`.
- *Dot notation* - it is possible to query subdocuments with dot notation. Example - `db.users.find({"email.work": "name.surname@domain.com"})` will return all documents whos work email mathches `name.surname@domain.com`.

> When working with cursors in mongo shell end command with `null;` such as `cur = db.people.find(); null;` so that the query doesn't get executed un you can `.limit(<NUMBER>)` or `.sort({Query})`, `.skip(<NUMBER>)` to the cursor. Note that the methods must also end with `null;` because they are executed server side and can be added at any point before the first document is called and before you've checked to see if it is empty.

# Updating
## Query methods
- `update({Query}, {NEW_DOCUMENT})` - *replacing update*, which would find all rows that match the Query and and **override** the current document with the new document.

## Query operators
- `$set`, example query `({name : "Alice"}, {$set: {age: 30}})` will update or add an age property to the documents whos name is "Alice". `$set` can also update array nth array element by adding an index to the key by the dot notation, example for a document `{_id: 0, a: [1,2,3,4]}` the query `({_id: 0}, {$set: {a.2: 5}})` woudl result in the 3rd array element changing from 3 to 5.
- `$inc`, example query `({name : "Alice"}, {$inc: {age: 1}})`, will either add the increment age if the document doesn't have already or increment the current age by the value given for all documents which name is "Alice".
- `$unset`, example query `({name: "Jones"}, {$unset: {profession: 1}})` will remove the "profession" key from all the documents that the query.
- `$push`, example query `({_id: 0}, {$push: {a: 6}})` for the document with id equal to 0 would add a 6 into the document array by key `a`.
- `$pop`, example query `({_id: 0}, {$pop: {a: 1}})` would pop the right side value for the document with the id equal to 0. Alternativly you can put a negative one, example `{$pop: {a: -1}}`, to pop the left side value of the array.
- `$pushAll` (**deprecated**) - instead os `$push`operator with `$each`. Example `{$push: {<field>: {$each: [<value1>, <value2>,..]}}}`.
- `$pull`, example query `({_id: 0}, {$pull: {a: 5}})` will remove all instances of 5 in the `a` array of the document which id is equal to 0.
- `$pullAll`, example query `({_id: 0}, {$pullAll: {a: [1, 2, 3]}})` will remove all instances of `1, 2, 3` from the document which id is equal to 0.
- `$addToSet`, example query `({_id: 0}, {$addToSet: {a: 5}})` will add a value 5 to the array `a` if the value doesn't exist for a document which id is equal to 0.

## Update options
Passing a third argument to an update functions are options.

- `upsert`, example query `({name : "Alice"}, {$set: {age: 30}}), {upsert: true}`, will create a new document if document doesn't exist with the name `Alice`. If the selector query doesn't specify one exact document but does similar as age `$gt` (*greater*) then 50, then MongoDB will create a new document but leave out any fields that don't have a concrete value, in this case age.
- `multi`, example query `({}, {$set: {title: "Dr"}}, {multi: true})` will update all documents and set title `Dr` without adding `multi` it would only update one document, probably the first one.

> yielding - if a new read/write command comes in during a multi update, the multi update would pause, then execute the read/write and continue the multiupdate. It is not no possible in MongoDB to guarantee an isolated multi write operation (transaction), but it each individual document is guaranteed to be atomic, that is any other read/write operation would not have a half writen document.

# Deleting
## Query methods
- `remove({Query})` - would remove all documents that match the Query. If you want to remove all documents you need to pass an empty document, example `db.users.remove({})` would remove all users from the users collection.
- `drop()` - would drop all documents form a collection more efficiently then using `remove` as it doesn't need to execute the remove for each document.

> **Using drop will remove all the indexes!** But it is still a good option to drop the collection and create the indexes afterwards rather then using remove.

> Drop and remove operations are affected by yielding.
