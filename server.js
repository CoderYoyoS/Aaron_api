/**
 * This is an API for retrieving real time bus information using
 * express and the RTPI realtime data API.
 * 
 * This takes the infomation given back and assigns it to suitable messages.
 */

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
app.get('/bus/:stop_id/:bus_num', function(req, res) {

        /**
         * Assign parameters passed in URL to 
         * a JSON object
         */
        var data = {    
            "bus": {
                "stop_id": req.params.stop_id,
                "bus_num": req.params.bus_num
            }
        };

        var message = "";

        //All routes button picked by user
        var all = false;

        /** 
         * Assign stop id and bus number to the values
         * passed by chat bot
         */
        var stopId = data.bus.stop_id;
        var busNumber = data.bus.bus_num;
        if(busNumber == "All"){
            all = true;
        }


        /******************************/

        var options = {
            url: 'https://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation?stopid=' + stopId + '&format=json',
            method : 'GET',
            strictSSL: false
        }; 

        /**
         * Make a request to for dublin bus API and repond to chatbot
         */
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
                            message +=  body.results[i].route + " to " + body.results[i].destination + " due now\n";
                            
                        }
                        //Stop 1 minute appearing as "1 minutes"
                        else if(body.results[i].duetime === "1"){
                            message +=  body.results[i].route + " to " + body.results[i].destination + " due in " + body.results[i].duetime 
                            + " minute\n";
                        }
                        else{
                            message +=  body.results[i].route + " to " + body.results[i].destination + " due in " + body.results[i].duetime 
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
                res.send( message);
            }
        }
    }); 
});