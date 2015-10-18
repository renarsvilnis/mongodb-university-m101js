


```bash
# Launch mongo server
$ mongod

# CD into the dump directory and import database
# Adding host to mongorestore because could not reach server
# Reference: http://stackoverflow.com/a/32452543
$ cd Materials/week-1/homework_1_3/hw1-3
$ mongorestore --host=127.0.0.1 dump

# Copy the project files into this homework folder and install dependencies
# NOTE: copy files thorugh finder
$ cd ../../../../Homeworks/homework-1_3
$ npm install

# Run app
$ node app.js
# Open URL: http://localhost:8080/ and copy the answer
```
