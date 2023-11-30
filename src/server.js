// Load the modules
var express = require('express'); //Express - a web application framework that provides useful utility functions like 'http'
var app = express();
var bodyParser = require('body-parser'); // Body-parser -- a library that provides functions for parsing incoming requests
app.use(bodyParser.json());              // Support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // Support encoded bodies
const axios = require('axios');
//const qs = require('query-string');

var pgp = require('pg-promise')();

const dev_dbConfig = {
	host: 'db',
	port: 5432,
	database: 'reviews_db',
	user: 'postgres',
	password: 'pwd'
};

const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

if (isProduction) {
	pgp.pg.defaults.ssl = {rejectUnauthorized: false};
  }

var db = pgp(dbConfig);

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views',__dirname+ '/views');
app.use(express.static(__dirname + '/'));// Set the relative path; makes accessing the resource directory easier

app.get('/', function(req, res) {
    res.render('pages/main', {
      my_title: "TV show search",
      items: '',
      error: false,
      message: 'Tv_Show'
    });
  });
app.get('/reviews', function(req,res){
	res.render('pages/reviews',{
        query_result: ''
    });
});
app.post('/get_feed', function(req, res) {
    var title = req.body.title; 
    console.log(title);
    if(title) {
      axios({
        url: `https://api.tvmaze.com/singlesearch/shows?q=${title}`,
          method: 'GET',
          dataType:'json',
        })
          .then(items => {
            console.log(items.data);
            res.render('pages/main',{
              my_title: "TV shows",
              items: items.data,
              error: false,
              message:''
            })
          })
          .catch(error => {
            console.log(error);
            res.render('pages/main',{
              my_title: "TV shows",
              items: '',
              error: true,
              message: error
            })
          });
  
  
    }
    else {
      res.render('pages/main', {
        my_title: "Tv Shows",
        items: '',
        error: true,
        message: 'No such TV show name found'
      });
    }
  });

app.post('/insert_review',function(req,res){
    var title = req.body.title;
    var review = req.body.txt_review ;
    
    var date_ob = new Date();
    var day = ("0" + date_ob.getDate()).slice(-2);
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var year = date_ob.getFullYear();
        
    var hours = date_ob.getHours();
    var minutes = date_ob.getMinutes();
    var seconds = date_ob.getSeconds();
  
    var review_date = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    console.log(date_ob);
    console.log(review_date);

    var query = `INSERT INTO Reviews (tv_show, review, review_date) values('` + title + `','` + review + `', '` + review_date+ `');`;
    //var query = `INSERT INTO Reviews (tv_show, review, review_date) values('` + title + `','` + review + `', convert(DATETIME,'` + review_date+ `',5));`;
    var all_review = `SELECT * from Reviews;`;
    console.log(query);
	db.task('load-review', task =>
		task.batch([
        task.any(query),
        task.any(all_review)

	])

	).then( query_result =>
		res.render('pages/reviews',
			{
                my_title: 'reviews',
                query_result: query_result[1],
                error: false,
                items: ''
			}
		)
	).catch(err => {
		console.log('error', err);
		response.render('pages/main', {
            title: 'fail',
            error: true,
			items: ''
		})
	});
});

app.post('/get_review',function(req,res){
    var title = req.body.title;
    
    var query = `SELECT * from reviews where reviews.tv_show = '` +title+ `';`;
    var alt_query = `SELECT * from reviews;`;
    db.task('load-review', task =>
        task.batch([
        task.any(query),
        task.any(alt_query)
        ])
        ).then( function(query_result){
            if(query_result[0].length !=0){
                res.render('pages/reviews',
                {
                    query_result: query_result[0]
                }
                );
            }else{
                res.render('pages/reviews',
                {
                    query_result: query_result[1]
                }
                )
            }
        }).catch(err => {
            console.log('error', err);
            response.render('pages/reviews', {
                title: 'fail',
                query_result: false
            })
        });
});

// app.post('/confirm_title', function(request, response){
//     const op = {
//         title: request.body.title,
//     };
//     ops.push(op);
//     response.status(201).send(op);
// });

const server = app.listen(process.env.PORT || 3000, () => {
	console.log(`Express running → PORT ${server.address().port}`);
  });

// var port = 3000;
// if(process.env.NODE_TEST == "test"){
//     port = 3001;
// }
// module.exports = app.listen(port);
console.log('3000 is the magic port');