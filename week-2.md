
> MongoDB doesn't have a query language, it just depends on the language your using the MongoDB driver

## Crud semantics in MongoDB
- Create === Insert
- Read === Find
- Update === Update
- Remove === Delete

## BSON
Mongo stores data in [BSON format](http://bsonspec.org/)

> **query** - example {age: 16, name: 'John'} will return a document which age is equal to 16 and name equal to John

> **return_field** - example {name: false, age: true} will return a document with age field, but without the name field

# Creating
It simple as `.insert({Object})`, which create a new document from given `Object`.

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
- *replacing update* - `update({Query}, {NEW_DOCUMENT})`, which would find all rows that match the Query and and **override** the current document with the new document.
