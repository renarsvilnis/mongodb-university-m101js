```bash
# Launch mongo server
$ mongod

# Import the weather file
$ mongoimport -d weather -c data --type csv --file weather_data.csv --headerline

# Enter mongo shell
$ mongo
```

```bash
> use weather
switched to db weather

# Get the answer
> db.data.find({"Wind Direction": {$gt: 180, $lt: 360}}, {"State": 1, "_id": 0}).sort([{"Temperature": 1}]).limit(1);
{ "State" : "New Mexico" }
```
