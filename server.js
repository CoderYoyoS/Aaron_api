//Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

//Extract data from HTTP requests
var app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//Set the port
app.set('port', (process.env.PORT || 5000))

// var router = express.Router();  

app.get('/', function (req, res) {
	res.send('This is the landing page for the dublin bus API for the chatbot...')
})

//Start Server
app.listen(app.get('port'), function () {
	console.log('Bus API server is running on port ', app.get('port'))
})

/**
 * Api to make request to bus RTPI API
 */
app.get('/bus', function(req, res) {

        var options = {
            url: 'https://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation?stopid=4747&format=json',
            method : 'GET',
            strictSSL: false
        }; 

        var message = "";
        var busNumber = "39A";
        var all = false;

        request(options, function(error, response, body) {
        if(error){
            console.log(error);
        }
        else{
            body = JSON.parse(body);
            //numberofresults will return as 0 if it past half 11
            if(body.numberofresults === 0){
                message = "It's too late for busses mate";
            }
            else{
                var resultCount = 0;
                //Display all the bus routes and due times available
                for( var i in body.results){
                    if(body.results[i].route == busNumber || all == true){
                        //If the bus is due now, dont display "due in due minutes"
                        if(body.results[i].duetime === "Due"){
                            message +=" " + body.results[i].route + " to " + body.results[i].destination + " due now\n";
                            
                        }
                        //Stop 1 minute appearing as "1 minutes"
                        else if(body.results[i].duetime === "1"){
                            message += " " + body.results[i].route + " to " + body.results[i].destination + " due in " + body.results[i].duetime 
                            + " minute\n";
                        }
                        else{
                            message += " " + body.results[i].route + " to " + body.results[i].destination + " due in " + body.results[i].duetime 
                            + " minutes\n";
                        }
                        resultCount++;
                    }
                }
                //Check if there is not times available
                if(resultCount === 0){
                    message = "There is no times available for " + busNumber + " 😕";
                }

                //Send the result back to the requester
                console.log(message);
                res.send({text: message});
            }
        }
    }); 
});