const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const User = mongoose.model("User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const{JWT_SECRET} = require("../keys")
const requireLogin = require("../middleware/requireLogin")
var nodemailer = require('nodemailer')
var http = require("http-server")


router.post("/signup", (req,res)=>{
    const {name,email,password} = req.body
    if(!email || !password || !name){
        res.status(422).json({error:"please add all the fields"})
    }
    User.findOne({email : email})
    .then((savedUser)=>{
        if(savedUser){
            res.status(422).json({error:"User Already Exists"})
        }
        bcrypt.hash(password,12)
        .then(hashedpassword=>{
            const user = new User({
                email,
                password:hashedpassword,
                name
            })
            user.save()
            .then(user=>{
                res.json({message:"saved successfully"})

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'dhirgandhi257@gmail.com',
                      pass: 'Dhir@9907'
                    }
                  });
                  
                  var mailOptions = {
                    from: 'dhirgandhi257@gmail.com',
                    to: 'dhir.gandhi@teksun.com',
                    subject: 'Created Account Successfully',
                    html: "Hello,<br> Please Click on the link to verify your email.<br><a href="//www.rescuetime.com/dashboard?src=client">Click here to verify</a>" 
                    
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
            })
            .catch(err=>{
                console.log(err)
            })

        })
       
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post("/signin",(req,res)=>{
    const {email, password} = req.body
    if(!email || !password){
       return res.status(422).json({error:"Please add email or password"})
    }
    User.findOne({email : email})
    .then(savedUser=>{
        if(!savedUser){
           return res.status(422).json({error:"Invalid Email or Password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                // res.json({message:"successfully signed in"})
                const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
                const {_id,name,email} = savedUser
                res.json({token,user:{_id,name,email}})
            }
            else{
                res.status(422).json({error:"Invalid Email or password"})
            }
        })
        .catch(err=>{
            console.log(err)
        })
    })
})

module.exports = router