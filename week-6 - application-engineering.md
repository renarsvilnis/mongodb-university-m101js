## Write Concern
Update writes in memory journal that writes to disk time from time. In a server loss the journal data might be lost. Update would return

**write (w)** - **joural (j)**
1 - false - *default. fast, small window of vulnability*
1 - true - *slow, but no vulnability*
0 - unacknowledged - *unrecommended***, doesn't wait to write*

Write concern (w) value can be set at client, database or collection level within PyMongo. In a example replica set of 3 nodes setting `w=3`, will wait until all nodes to acknowledge a write operation. The `w` can be in rangeof `0 >= w <= node_count`.

> `w = 'majority'` - will wait for majority of nodes. Similar as within 3 node example that `w = 2`. Majority will reduce rollbacks in case of failovers

Setting Journal `j = true` will wait **only** for the primary node until it writes to disk. The time how long you will wait is called `wtimeout`.

`wtimeout` - amount of time that the database will wait for replication before returning an error on the driver, but that even if the database returns an error due to wtimeout, the write will not be unwound at the primary and may complete at the secondaries.

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

// get usefull commands
rs.help();
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

## Failover and Rollback

> Failover is a backup operational mode in which the functions of a system component (such as a processor, server, network, or database, for example) are assumed by secondary system components when the primary component becomes unavailable through either failure or scheduled down time. **Used to increase durability of the database**

> In database technologies, a rollback is an operation which returns the database to some previous state. Rollbacks are important for database integrity, because they mean that the database can be restored to a clean copy even after erroneous operations are performed.

While it is true that a replica set will never rollback a write if it was performed with `w = majority` and that write successfully replicated to a majority of nodes, it is possible that a write performed with w=majority gets rolled back. Here is the scenario: you do write with w=majority and a failover over occurs after the write has committed to the primary but before replication completes. You will likely see an exception at the client. An election occurs and a new primary is elected. When the original primary comes back up, it will rollback the committed write. However, from your application's standpoint, that write never completed, so that's ok.

## Node.js MongoDB Driver

### Connecting to a replica set

```javascript
const repliceSet = [
    "mongodb://localhost:30001",
    "mongodb://localhost:30002",
    "mongodb://localhost:30003/course"
];
MongoClient.connect(repliceSet.join(','), function (err, db)) {};

// this way of conencting is equal as the mongodb driver 
// will detect the replice set
MongoClient.connect("mongodb://localhost:30001/couse", function (err, db)) {};
```

### Failover in the Node.js driver
In case of a fallover while new primary elections are ongoing the Node.js driver on a insert will be buffered until the election completes, then the callback will be called after the operation is sent and a response is received.

## Read Preferences
By default `reads` and `writes` go to primary node, so that you allways get the newest data. But it is possible to change this behaviour by setting it to:

- `Primary` - read only from primary
- `PrimaryPrefered` - read from primary if possible, else from secondaries
- `Secondary` - read only from secondaries
- `SecondaryPrefered` - read from secondaries if possible, else from primary
- `Nearest` - call the nearest of ping time (~15ms ping time).

> Possible to mark nearest nodes, for example multiple nodes within a data center.

## Review Implications of Replication
- `Seed lists` - node.js mdrivers containa a list of replica sets incase of failover
- `write concern (w)` and `wtimeout` - cover before
- `Read Preferences` - cover before
- Errors can happen

## Sharding
For horizontal scaling to distribute database along multiple nodes.

> A single shard can be a replica set

`MongoOS` routes traffic beetween shards.

Sharding approaches:
- `range based` - based on `shard key`
- `hash based` - offers more distribution compared to `range based` as a function of `shard key`, at the expense of worse performance for `range-based queries`.

> Sharding for now can be applied on a database or collection level

> There can be multiple MongoOS instances. Typicaly there on the same server as the application

For shard queries you need to specify the `shard key`, else the `mongos` has to send the query to all of the shards.

> The replication availability gets parsed through shards `w` and `j`.

### Choosing a Shard Key
- Make sure there is sufficient cardinality, choosing maybe a key doesn't have a big cardinality, so that wouldn't not be the primary for the `sharing key`
- avoids hotspoting in writes on anything that monotonically increasing. That is for the chard key avoid choosing a document key that would increase monotonically, example a timestamp as the new documents woudl get written on a single node till the enxt shard and so on.

> Keep in mind the data access pattern when choosing shard keys and indexes. It's sometimes usefull to create tests on a machine.

### Building a Sharded Environment
Example of creating a sharded environment includes 3 shards, where each is replica set of 3 nodes and 1 mongoOS. Also it has 3 config servers, that hold info about how the data is distributed beetween the shards.

**For the original sharded environment creation script reference `Materials/week-6 - application-engineering/building_a_sharded_environment/init_sharded_env.sh`.**

```bash
# clean everything up
echo "killing mongod and mongos"
killall mongod
killall mongos
echo "removing data files"
rm -rf /data/config
rm -rf /data/shard*

# start a replica set and tell it that it will be shard0
echo "starting servers for shard 0"
mkdir -p /data/shard0/rs0 /data/shard0/rs1 /data/shard0/rs2
mongod --replSet s0 --logpath "s0-r0.log" --dbpath /data/shard0/rs0 --port 37017 --fork --shardsvr --smallfiles
mongod --replSet s0 --logpath "s0-r1.log" --dbpath /data/shard0/rs1 --port 37018 --fork --shardsvr --smallfiles
mongod --replSet s0 --logpath "s0-r2.log" --dbpath /data/shard0/rs2 --port 37019 --fork --shardsvr --smallfiles

sleep 5
# connect to one server and initiate the set
echo "Configuring s0 replica set"
mongo --port 37017 << 'EOF'
config = { _id: "s0", members:[
          { _id : 0, host : "localhost:37017" },
          { _id : 1, host : "localhost:37018" },
          { _id : 2, host : "localhost:37019" }]};
rs.initiate(config)
EOF

# start a replicate set and tell it that it will be a shard1
echo "starting servers for shard 1"
mkdir -p /data/shard1/rs0 /data/shard1/rs1 /data/shard1/rs2
mongod --replSet s1 --logpath "s1-r0.log" --dbpath /data/shard1/rs0 --port 47017 --fork --shardsvr --smallfiles
mongod --replSet s1 --logpath "s1-r1.log" --dbpath /data/shard1/rs1 --port 47018 --fork --shardsvr --smallfiles
mongod --replSet s1 --logpath "s1-r2.log" --dbpath /data/shard1/rs2 --port 47019 --fork --shardsvr --smallfiles

sleep 5

echo "Configuring s1 replica set"
mongo --port 47017 << 'EOF'
config = { _id: "s1", members:[
          { _id : 0, host : "localhost:47017" },
          { _id : 1, host : "localhost:47018" },
          { _id : 2, host : "localhost:47019" }]};
rs.initiate(config)
EOF

# start a replicate set and tell it that it will be a shard2
echo "starting servers for shard 2"
mkdir -p /data/shard2/rs0 /data/shard2/rs1 /data/shard2/rs2
mongod --replSet s2 --logpath "s2-r0.log" --dbpath /data/shard2/rs0 --port 57017 --fork --shardsvr --smallfiles
mongod --replSet s2 --logpath "s2-r1.log" --dbpath /data/shard2/rs1 --port 57018 --fork --shardsvr --smallfiles
mongod --replSet s2 --logpath "s2-r2.log" --dbpath /data/shard2/rs2 --port 57019 --fork --shardsvr --smallfiles

sleep 5

echo "Configuring s2 replica set"
mongo --port 57017 << 'EOF'
config = { _id: "s2", members:[
          { _id : 0, host : "localhost:57017" },
          { _id : 1, host : "localhost:57018" },
          { _id : 2, host : "localhost:57019" }]};
rs.initiate(config)
EOF

# now start 3 config servers
echo "Starting config servers"
mkdir -p /data/config/config-a /data/config/config-b /data/config/config-c 
mongod --logpath "cfg-a.log" --dbpath /data/config/config-a --port 57040 --fork --configsvr --smallfiles
mongod --logpath "cfg-b.log" --dbpath /data/config/config-b --port 57041 --fork --configsvr --smallfiles
mongod --logpath "cfg-c.log" --dbpath /data/config/config-c --port 57042 --fork --configsvr --smallfiles

# now start the mongos on a standard port
mongos --logpath "mongos-1.log" --configdb localhost:57040,localhost:57041,localhost:57042 --fork
echo "Waiting 60 seconds for the replica sets to fully come online"
sleep 60
echo "Connnecting to mongos and enabling sharding"

# add shards and enable sharding on the test db
# Now connect to the mongOS which is on the default port
mongo << 'EOF'
db.adminCommand( { addshard : "s0/"+"localhost:37017" } );
db.adminCommand( { addshard : "s1/"+"localhost:47017" } );
db.adminCommand( { addshard : "s2/"+"localhost:57017" } );
db.adminCommand({enableSharding: "school"});
// creates an index on student_id if doesn't exist
db.adminCommand({shardCollection: "school.students", key: {student_id:1}});
EOF
```

### Implications of Sharding on development
- every document includes a `shard key`
- `shard keys` are ummutable
- need index that starts with the `shard key`
- on update `shard key` specified or multi
- no `shard key` => visits all shards
- no unique index unless starts with the `shard key`
