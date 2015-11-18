## Write Concern
Update writes in memory journal that writes to disk time from time. In a server loss the journal data might be lost. Update would return

**write (w)** - **joural (j)**
1 - false - *default. fast, small window of vulnability*
1 - true - *slow, but no vulnability*
0 - unacknowledged - *unrecommended***, doesn't wait to write*

## Network Errors
You might not recieve response from insert

## Replication
- availability
- fault tolerance

Replica set contains:
- 1 x Primary nodes
- n>1 x Secondary nodes

> If primary is unavailable then the Secondary nodes elect a new Primary for the rollover

> Replica set has to have a minimum of 3 nodes

### Replica set nodes
- Regular (Primary or Secondary, can vote)
- Arbiter (Voting - just to make the voting node set an odd number, no data, can vote)
- Delayed (1-2h hour behind regular, can't vote)
- Hidden (never primary, used for analytics, can vote)

> You can set priority of a node to `0` to exclude from getting voted as a primary node

### Write Consistency
- Writes goes to the primary
- Reads can go to different nodes, but may contain stale data

> Can't make writes while voting new primary

### Creating Replica Set

> You can mix storage engines

`Create replica set nodes`

```bash
# Create folders for database
mkdir -p /data/rs1 /data/rs2 /data/rs3

# --replSet <String> name of the replica set
# --logpath <String> log file path
# --oplogSize <Number> size of a capped collection that stores an ordered history of logical writes to a MongoDB database
# --smallFiles <Boolean> use smaller data file size
# --fork <Boolean> Enable a daemon mode that runs the mongos or mongod process in the background
mongod --replSet m101 --logpath "1.log" --dbpath /data/rs1 --port 27017 --oplogSize 64 --fork --smallfiles
mongod --replSet m101 --logpath "2.log" --dbpath /data/rs2 --port 27018 --oplogSize 64 --smallfiles --fork
mongod --replSet m101 --logpath "3.log" --dbpath /data/rs3 --port 27019 --oplogSize 64 --smallfiles --fork
```

`Kill forked mongod process`

```bash
ps -ef | grep mongod
# Read the pid of the process (second value form the left) you want to kill
kill <pid>
```

`Initialize replice set`

> Can't initialize replica set from the primary node

```javascript
config = {
    _id: "m101",
    members:[
        // Here you add prioritie or delay options for each node
        { _id : 0, host : "localhost:27017"},
        { _id : 1, host : "localhost:27018"},
        { _id : 2, host : "localhost:27019"}
    ]
};

rs.initiate(config);

// get replica set status
rs.status();
```

`Set allow to query/read data from current shelled/connected node`

```javascript
rs.slaveOk();
```

### Internals of Replica Set
Each Replica Set has a `oplog`, that is getting synced from a primary `oplog` to secondary nodes. oplog entries originally come from the primary, but secondaries can sync from another secondary, as long as at least there is a chain of oplog syncs that lead back to the primary.

`Read oplog`

```javascript
use local
db.oplog.rs.find().pretty()
```

### Failover and Rollback

While it is true that a replica set will never rollback a write if it was performed with w=majority and that write successfully replicated to a majority of nodes, it is possible that a write performed with w=majority gets rolled back. Here is the scenario: you do write with w=majority and a failover over occurs after the write has committed to the primary but before replication completes. You will likely see an exception at the client. An election occurs and a new primary is elected. When the original primary comes back up, it will rollback the committed write. However, from your application's standpoint, that write never completed, so that's ok.
