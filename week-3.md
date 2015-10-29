# Schema design

> Most import factor in designing application scheme within Mongodb is matching the data access patterns of your application.

[Vladislav Zorov comment](https://www.quora.com/Why-would-developers-pair-MongoDB-with-Node-js-when-a-traditional-relational-database-will-perform-optimized-joins-on-the-database-server-not-in-your-Node-js-application
) on Quora about MongoDB lack of joins.

Choosing when to embed data into document:
- frequency of access
- size of items
- atomicity of data

- One-to-One - 1-2 collections, but 1 collection is fine enough
- One-to-Many - 1-2 collections, but in case of 1 in the direction from many to one
- One-to-Few - 1-2 collections
- Few-to-Few - 1-2 collections (but 2 collections prefered)
- Many-to-Many - 2 collections

