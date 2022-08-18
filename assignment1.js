const mysql = require('mysql2');
const express = require('express');
const fastcsv = require ("fast-csv");
const fs = require("fs");
const ws = fs.createWriteStream("assignment1.csv")
var app = express();
const bodyparser = require('body-parser');

app.use(bodyparser.json());

var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1505',
    database: 'Library',
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if (!err)
        console.log('DB connection succeded.');
    else
        console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
});

//Get all details of books
app.get('/books', (req, res) => {
    mysqlConnection.query('SELECT * FROM books', (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Get an book
app.get('/books/:isbn', (req, res) => {
    mysqlConnection.query('SELECT * FROM books WHERE isbn = ?', [req.params.isbn], (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});


//Get an book by email
app.get('/books/"authoremail"', (req, res) => {
    mysqlConnection.query('SELECT * FROM books WHERE authoremail  = "?"', [req.params.authoremail], (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Insert an detail
app.post('/books', (req, res) => {
    let books = req.body;
    var sql = "SET @isbn = ?;SET @BookName = ?;SET @authorname = ?;SET @authoremail = ?; \
    CALL booksAddOrEdit(@isbn,@BookName,@authorname,@authoremail);";
    mysqlConnection.query(sql, [books.isbn, books.BookName, books.authorname, books.authoremail], (err, rows, fields) => {
        if (!err)
            rows.forEach(element => {
                if(element.constructor == Array)
                res.send('Inserted book id : '+element[0].isbn);
            });
        else
            console.log(err);
    })
});

// export to csv 
app.get("/exportcsv", (req,res) => {
    mysqlConnection.query("SELECT * FROM books", function (err,data){
        if (err) throw err ;
        //JSON
        const jsonData = JSON.parse(JSON.stringify(data));
        console.log("jsondata",jsonData);

        //CSV
        fastcsv.write(jsonData, {headers:true}).on("finish",function(){
            console.log("write succeeded");
        })
        .pipe(ws)
    })
})
//port
app.listen(3000,function(){
    console.log("Node app is running");
})