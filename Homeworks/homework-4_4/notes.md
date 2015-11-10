## Import database
`mongoimport -d m101 -c profile < sysprofile.json -h 127.0.0.1:27017`

```bash
use m101
db.profile.find({}, {millis: 1}).sort({millis: -1}).limit(1);
```
