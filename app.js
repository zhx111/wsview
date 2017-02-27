var express = require('express');
var fs = require('fs');
var busboy = require('connect-busboy');
var bodyParser = require('body-parser');
var xmlparser = require('xml2json');

var app = express();

app.use('/static', express.static(__dirname + '/public'));
app.use(busboy({immediate : true})); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine','jade');
app.set('views','./views');


app.get('/',function(req,res) {
	res.redirect('/static/index2.html');
});

app.post('/upload',function(req,res){
	var fileStream,data;
	//console.log(req.busboy);
	if(req.busboy){
		//req.pipe(req.busboy);
		req.busboy.on('file',function(fieldname,file,filename,encoding,mimetype){
			console.log("uploading:"+filename);
			console.log("encoding:"+encoding);
			console.log("mimetype:"+mimetype);
			//console.log(file);
			//创建文件
			fs.open(__dirname+'/public/files/' + filename,"w",function(err,fd){
				if (err) {
       				return console.error(err);
   				}
  				//console.log("文件打开成功！");
  				fs.close(fd,function(err){
  					if (err) {
       					return console.error(err);

   					}
   					console.log("文件关闭成功！");
  				});
			});
			//导入文件流
			fileStream = fs.createWriteStream(__dirname+'/public/files/' + filename);
			file.pipe(fileStream);
			fileStream.on('close',function(){

			});
			file.on('data',function(chunk){
				data+=chunk;
			});
			file.on('end',function(){
				//console.log(data);
				res.send(data);
			});
			file.on('error',function(err){
				console.log(err.stack);
			});

		});
	}
	

});

app.use('/wsjx',function(req,res,next){
	var filename = req.body.filename;
	if (filename!==undefined) {
		fs.readFile(__dirname+'/public/files/'+filename,function(err,data){
		if(err) throw err;
		var xmlcontent = data.toString('utf-8');
		//console.log(xmlparser.toJson(xmlcontent));
		var options = {
		    object: true,
		    reversible: false,
		    coerce: false,
		    sanitize: true,
		    trim: true,
		    arrayNotation: false
		};
		var xmlobject=xmlparser.toJson(xmlcontent,options);
		//console.log(xmlobject.writ.QW.value);
		if(!xmlobject.writ&&xmlobject.QW){
			xmlobject["writ"]={"QW":xmlobject.QW};
		}
		var xmlQWvalue;
		if (xmlobject.writ.QW.value.indexOf('\n')!=-1) {
			xmlQWvalue=xmlobject.writ.QW.value.split("\n");
		}else if (xmlobject.writ.QW.value.indexOf(' ')!=-1) {
			xmlQWvalue=xmlobject.writ.QW.value.split(" ");
		}else {
			xmlQWvalue=xmlobject.writ.QW.value;
		}
		xmlobject['xmlQWvalue']=xmlQWvalue;
		//console.log(xmlQWvalue);
		xmlobject['wsfilename']=filename;
		//console.log(xmlQWvalue);
		res.render('main',xmlobject);
		});
	}else {

		res.send(error);
	}
	

});

app.use('/ws',function(req,res,next){
	//console.log(req.query.name);
	//console.log(req.query.filename);
	var filename=req.query.filename;
	var name = req.query.name;
	fs.readFile(__dirname+'/public/files/'+filename,function(err,data){
		if (err) {throw err}
		var xmlcontent = data.toString('utf-8');
		var xmlobject = xmlparser.toJson(xmlcontent,{object:true});
		if(!xmlobject.writ&&xmlobject.QW){
			xmlobject["writ"]={"QW":xmlobject.QW};
		}
		var catalogs=Object.getOwnPropertyNames(xmlobject.writ.QW);
		for (var i = 0; i < catalogs.length; i++) {
			if (catalogs[i]===name) {
				res.send(xmlobject.writ.QW[catalogs[i]]);
			}
		}
		
	});
});

app.listen(3000,function(){
	console.log("port 3000 is listened!");
});