var express = require('express')
var router = express.Router()
var request = require('request');


router.get('/ruangan', (req,res)=>{
    let dt
    request({
        method: 'GET',
        uri: 'http://localhost/lat/get_data.php',
        headers: { 'content-type': 'application/json'}

    },
        (error, response, body)=>{
        if(!error && response.statusCode === 200){
          dt = JSON.parse(body)
            console.log(dt)
        }
    })
});




module.exports = router;
