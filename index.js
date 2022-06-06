const { randomUUID } = require("crypto")
const express=require("express")
const res = require("express/lib/response")
const app=express()
const fs=require('fs')


// middlewares
app.use(express.urlencoded({extended:true}))
app.use(express.json())


app.get("/",(req,res)=>{
  res.send("app is working")
})
// post users
app.post("/user/create",(req,res)=>{
    if((req.body.role)==="candidate"){
        if((!req.body.vote) && (!req.body.party)){
            res.status(400).send(" please check vote and party fields exists or not")
        }
        else{
            fs.readFile("./db.json",{encoding:"utf-8"},(err,data)=>{
                let mainData=JSON.parse(data)
                mainData.users=[...mainData.users,req.body]

                fs.writeFile("./db.json",JSON.stringify(mainData),{encoding:"utf-8"},()=>{
                    res.status(201).send({status: "user created"})
                })
            })
        }
    }
    else if(req.body.role==="voters"){
        if((!req.body.username ) && (!req.body.password)){
            res.status(400).send("user should logged in 1st with username and password")
        }
        // else if((!req.body.username ) || (!req.body.password)){
        //     res.status(400).send("check your password or usename field")
        // }
        else{
            fs.readFile("./db.json",{encoding:"utf-8"},(err,data)=>{
                let mainData=JSON.parse(data)
                mainData.users=[...mainData.users,req.body]

                fs.writeFile("./db.json",JSON.stringify(mainData),{encoding:"utf-8"},()=>{
                    res.status(201).send({status: "user created"})
                })
            })
        }
    }
    
})

// checking logged in details
app.post("/user/login",(req,res)=>{
    if(req.body.role==="voters"){
        if((!req.body.username) || (!req.body.password)){
            res.send(400).send({ status: "please provide username and password" }   )
        }
        else{
            fs.readFile("./db.json",{encoding:"utf-8"},(err,data)=>{
                let mainData=JSON.parse(data)
                let flag=false
                for(let i=0;i<mainData.users.length;i++){
                    if(mainData.users[i].username===req.body.username && mainData.users[i].password===req.body.password){
                        let token=randomUUID()
                        flag=true
                        mainData.users[i].token=token
                        // res.send(123)
                        console.log(mainData.users[i]);
                        fs.writeFile("./db.json",JSON.stringify(mainData),{encoding:"utf-8"},()=>{
                            res.status(201).send({ status: "Login Successful", token })
                        })
                    }
                   
                }
                if(!flag){
                    res.status(401).send({ status: "Invalid Credentials" })
                }
               
            })
        }
    }
})

// logout 
app.post("/user/logout",(req,res)=>{
    fs.readFile("./db.json",{encoding:"utf-8"},(err,data)=>{
        let mainData=JSON.parse(data)
        for(let i=0;i<mainData.users.length;i++){
            if(mainData.users[i].username===req.body.username && mainData.users[i].password===req.body.password){
                if(mainData.users[i].token){
                    delete mainData.users[i].token
                     fs.writeFile("./db.json",JSON.stringify(mainData.users),{encoding:"utf-8"},()=>{
                        res.status(201).send({ status: "user logged out successfully" })
                    })
                    // console.log(mainData.users[i].token);
                }
            }
        }
       
    })
})


// get party and voters
app.get("/votes/party/:party", (req, res) => {
    const { party } = req.params

    fs.readFile("./db.json", { encoding: "utf-8" }, (err, data) => {
      const mainData = JSON.parse(data);
      mainData.users = mainData.users.filter((item) => {
        return item.party === party
      })

      res.send(mainData);
    })
})
  
  app.get("/votes/voters", (req, res) => {
    fs.readFile("./db.json", { encoding: "utf-8" }, (err, data) => {
      const mainData = JSON.parse(data);
      mainData.users = mainData.users.filter((item) => {
        return item.role == "voter"
      });
      res.send(mainData);
    })
  });



//count votes
app.post("/votes/vote/:user", (req, res) => {
    const { user } = req.params;
  
    fs.readFile("./db.json", { encoding: "utf-8" }, (err, data) => {
      const mainData = JSON.parse(data);
      mainData.users = mainData.users.map((item) => {

        if (item.id == user) {
          return { ...item, votes: item.votes + 1 }
        } 
        else {
          return item
        }
      })
  
      fs.writeFile(
        "./db.json",
        JSON.stringify(mainData),
        { encoding: "utf-8" },
        (err) => {
          if (err) {
            console.error(err);
          }
          res.status(201).send({ status: "Vote added successfully" });
        }
      )
    })
  })


const PORT=process.env.PORT ||8080

app.listen(PORT)