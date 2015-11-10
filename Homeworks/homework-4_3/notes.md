

# Preparation
## Import database
`mongoimport -d blog -c posts --type json --file posts.json -h 127.0.0.1:27017`

## Prepair blog
```bash
cd blog
npm install
node app.js
```

## Validate entry
```bash
cd validate
npm install
node hw4-3_validate.js
```


# TODO
1. add index for posts, so that getting last 10 posts fast
2. add index for posts tags, to make looking at posts by tag fast
3. add index for post slug, so finding post by index fast

> Reference posts.js optimizing code

```bash
> mongo
> use blog

# 1. problem
> db.posts.createIndex({date: -1});
# NOTE: also optimize posts.js in the root of blog to remove sort from the query

# 2. problem
> db.posts.createIndex({tags: 1});

# 3. problem
> db.posts.createIndex({permalink: 1}, {unique: true});
