let five = require("johnny-five");
let Etherport = require("etherport");
let board = new five.Board();



board.on("ready", function() {

    this.pinMode(11, board.MODES.INPUT);
    this.digitalWrite(11, 1);

    let tetesA = 0;
    this.digitalRead(11, function(data) {
        let jadiRes = data;
        if (jadiRes == 0) {
            tetesA++;
            console.log(tetesA);
            // if (tetesA == 1) {
            //     setTimeout(() => {
            //         console.log("Hasil : " + tetesA);
            //         tetesA = 0;
            //     }, 60000);
            // }
        }
    });


});



// board.on("close", function() {
//     console.log('Board closed')
//     board.disconnect();
//     setTimeout(() => {
//         board.connect();
//         // Boardstart()
//     }, 10000);

// })