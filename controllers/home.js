const fs = require('fs')
const path = require('path')
const Category = require('../models/Category')
const Product = require('../models/Product')

module.exports.index = (req, res) => {
  let queryData = req.query

  Product.find({buyer: null}).populate('category').then((products) => {
    if (queryData.query) {
      products = products.filter(p => p.name.toLowerCase().includes(queryData.query))
    }
    let data = {products: products}
    if (req.query.error) {
      data.error = req.query.error
    } else if (req.query.success) {
      data.success = req.query.success
    }
    res.render('home/index', data)
  })
}



module.exports.delete = (req, res) => {
  let id = req.params.id
  // console.log(id)
  Product.findById(id).then((product) => {
    if (!product) {
      res.redirect(`/?error=${encodeURIComponent('Product was not found!')}`)
      return
    }

    
    Category.findById(product.category).then((category) => {
      let index = category.products.indexOf(id)
      if (index >= 0) {
        category.products.splice(index, 1)
      }

      category.save()

      Product.remove({_id: id}).then(() => {
        fs.unlink(path.normalize(path.join('.', product.image)), () => {
          res.redirect("/")
        })
      })
    })
  })
}
