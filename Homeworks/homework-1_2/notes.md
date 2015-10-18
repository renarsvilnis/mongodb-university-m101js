


```bash
# Launch mongo server
$ mongod

# CD into the dump directory and import database
# Adding host to mongorestore because could not reach server
# Reference: http://stackoverflow.com/a/32452543
$ cd Materials/week-1/homework_1_2/hw1-2
$ mongorestore --host=127.0.0.1 dump

# Copy the project files into this homework folder and install dependencies
# NOTE: copy files thorugh finder
$ cd ../../../../Homeworks/homework-1_2
$ npm install

# Run app
$ node app.js
> Answer: I like kittens

```
