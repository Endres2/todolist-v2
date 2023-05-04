//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config()
console.log(process.env)

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://"+process.env.USER+":"+process.env.PASSWORD+"@noteapp.0fqvt9x.mongodb.net/?retryWrites=true&w=majority/todoListDB").then(() => console.log('Connected!'));

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

const listSchema = mongoose.Schema({
  name:{
    type:String,
    required: true
  },
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


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
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  const day = date.getDate();
  if (listName === day){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listName})
  .then(function(docs,err){
    if(!err){
      docs.items.push(item)
      docs.save()
      res.redirect("/"+listName)
    }else{
      console.log(err)
    }
  })
  }



  //item.save()
  //res.redirect("/");
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
  const listName = req.body.listName

  const day = date.getDate();
  if (listName === day){
    Item.deleteOne({ _id: checkedItemId })
    .then(function () {
      console.log("Data deleted"); // Success
    }).catch(function (error) {
      console.log(error); // Failure
    });
  res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
  .then(function(docs,err){
    if(!err){
      res.redirect("/"+listName)
    }else{
      console.log(err)
    }
  })
  }

 
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   itemList.push(item);
  //   res.redirect("/");
  // }
});

app.get("/:costomListName", function (req, res) {
  const parameter = _.capitalize(req.params.costomListName);
  console.log(parameter)

  List.findOne({name:parameter})
  .then(function(docs,err){
    if(!err){
      if(!docs){
        //create a new list
        const list = new List({
          name: parameter,
          items: defaultItems
        })
      
        list.save();
        res.redirect("/"+parameter)
        console.log("Doesn't Exist")
      }else{
        //Show an existing list
        res.render("list", {listTitle:docs.name, newListItems:docs.items})
        console.log("Exist")
      }
    }else{
      console.log(err)
    }
  })



  //res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000 , function () {
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





