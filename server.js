const express=require ('express');
const cors = require('cors');
const knex = require('knex');
const bcrypt=require('bcrypt-nodejs');
const image=require("./controllers/image.js");



 


const db=knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'test',
    database : 'smart-brain'
  }
});

console.log(db.select('*').from('users'));

const app=express();

app.use(express.json());
app.use(cors());

// const database={
// 	users: [
// 		{
// 			id:'123',
// 			name: 'John',
// 			email:'john@gmail.com',
// 			password:'apples',
// 			entries:0,
// 			joining_date:new Date()
			
// 		},
// 		{
// 			id:'456',
// 			name: 'Ann',
// 			email:'ann@gmail.com',
// 			password:'mangoes',
// 			entries:0,
// 			joining_date:new Date()
			
// 		}
// 	]
// }

app.get('/',(req,res)=> {
	res.send("It is Working");
})


//Signin Endpoint

app.post('/signin',(req,res)=> {
	const {email,password}=req.body;
	if (!email || !password ) {
		return (res.status(400).json('Please provide the Email and Password'));
	}
	db.select('email','hash').from('login')
	.where('email','=',email)
	.then(data=> {
		const isValid= bcrypt.compareSync(password, data[0].hash);
		//console.log(isValid);
		if (isValid) {
			return db.select('*').from('users')
			.where('email','=',email)
			.then(user=> {
				//console.log(user[0])
				res.json(user[0])
			})
			.catch(err=>res.status(400).json('Unable to get user'))
		} else {
			res.status(400).json('Wrong Credentials')
		}
	})
	.catch(err=>res.status(400).json('Wrong Credentials'))
})

//Register Endpoint

app.post('/register',(req,res) => {
	const {name,email,password}=req.body;
	if ( !name || !email || !password ) {
		return (res.status(400).json('Incorrect form submission'));
	}
	const hash = bcrypt.hashSync(password);
	db.transaction(trx=> {
		trx.insert({
			hash:hash,
			email:email
		})
		.into('login')
		.returning('email')
		.then(loginEmail=>{
			return trx('users')
			.returning('*')
			.insert( 
				{
					name: name,
					email:loginEmail[0],
					joined:new Date()

				})
				.then(user=>{
					res.json(user[0])
				})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err=>res.status(400).json('unable to register'))
})
	// bcrypt.compareSync("bacon", hash); // true
	// bcrypt.compareSync("veggies", hash); // false
	//res.json(database.users[database.users.length -1])



app.get('/profile/:id' ,(req,res) => {
	const {id} = req.params;
	//let found = false;
	db.select('*').from('users').where({
		id:id
	})
	.then(user=> {
		if (user.length) {
			res.json(user[0])
		} else {
			res.status(400).json('User not Found')
		}
	})
})

app.put('/image',(req,res) => {image.handleImage(req,res,db)})
app.post('/imageurl',(req,res) => {image.handleApiCall(req,res)})

app.post('/imageurl',(req,res) => {}) 

app.listen(process.env.PORT||3000,()=> {
	console.log(`App is Running on port ${process.env.PORT}`);
})

// /-->res='This is working'
// /signin--> POST=success/fail
// /register-->POST=user
// /profile/:userId-->GET=user
// /image-->PUT-->USER