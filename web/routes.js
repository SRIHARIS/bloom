module.exports = function(app){

	app.get('/',function(req,res){
		res.render('index');
	});

	app.get('/chat', function (req, res) {
    	//compute data here
   	 	res.render('chat', {layout: false});
	});

	app.get('/files', function (req, res) {
    	//compute data here
   	 	res.render('files', {layout: false});
	});

	app.get('/notes', function (req, res) {
    	//compute data here
   	 	res.render('notes', {layout: false});
	});
}