# Aggregation Framework

Example aggregation query
```javascript
db.products.aggregate([
    {
        $group: {
            _id: "$manufacturer",
            num_products: {$sum: 1}
        }
    }
])
```
