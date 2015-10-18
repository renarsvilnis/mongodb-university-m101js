
## Installing MongoDB
```bash
$ brew install mongodb

# create data/db directory under root acc
# Related: http://stackoverflow.com/questions/7948789/mongodb-mongod-complains-that-there-is-no-data-db-folder
$ sudo bash
> Password: <YOUR_PASSWORD>
$ mkdir -p /data/db
$ chmod 777 /data
$ chmod 777 /data/db
$ exit
```

> Database === Database

> Collection === Table

> Document === Row

## `save` vs `insert`
- `save` - inserts or updates a document depending if `_id` key is passed and a record exists.
- `insert` - does only an insertion.

> You can write `mongo script.js` to pass a script file to the mongoDB shell for execution
