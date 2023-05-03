//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB").then(() => console.log('Connected!'));

const itemsSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
const Item = mongoose.model("Item", itemsSchema);

const firstItem = new Item({
  name: "Welcome to your todo list!"
})
const secondItem = new Item({
  name: "Hit the + button to add new item."
})

const thirdItem = new Item({
  name: "<--- hit this to delete an item."
})
const defaultItems = [firstItem, secondItem, thirdItem]

//Item.insertMany(defaultItems);

// const itemList = [];
// const workItems = [];

app.get("/", function (req, res) {
  const day = date.getDate();
  Item.find({})
    .then(function (foundItems) {
      if (foundItems.length === 0) {
        /** Insert Items 1,2 & 3 to todolistDB */
        Item.insertMany(defaultItems)
          .then(function (result) {
            console.log("Sucessfully Added Default Items to DB.");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      } else res.render("list", { listTitle: day, newListItems: foundItems });
    })
    .catch(function (err) {
      console.log(err);
    });
});



app.post("/", function (req, res) {

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  })

  item.save()
  res.redirect("/");
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   itemList.push(item);
  //   res.redirect("/");
  // }
});
app.post("/delete", function (req, res) {

  const checkedItemId = req.body.checkbox;

  Item.deleteOne({ _id: checkedItemId })
    .then(function () {
      console.log("Data deleted"); // Success
    }).catch(function (error) {
      console.log(error); // Failure
    });
  res.redirect("/");
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   itemList.push(item);
  //   res.redirect("/");
  // }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
// const findItems = async()=> {
//   const items = await Item.find({})
//   items.forEach((e)=>{
//     console.log(e) 
//     itemList.push(e)
//   })
//   console.log(itemList)
// };
// findItems();




//console.log(itemList)




