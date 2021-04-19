const Clarifai =require('clarifai');

const app = new Clarifai.App({
 apiKey: '7d9fc4b5071b4a47acf184423f676672'
});

const handleApiCall=(req,res)=> {
	app.models
 	.predict(Clarifai.FACE_DETECT_MODEL,req.body.input )
 	.then(data=> {
 		res.json(data)
 	})
 	.catch(err=>res.status(400).json('Unable to Work with API'))
}

const handleImage=(req,res,db)=> {
	const {id} = req.body;
	db('users').where('id','=',id)
	.increment('entries',1)
	.returning('entries')
	.then(entries=> {
		if (entries.length) {
			res.json(entries[0])
		} else {
			res.status(400).json('Entries Not Available')
		}
	})
}

module.exports={
	handleImage,
	handleApiCall
}