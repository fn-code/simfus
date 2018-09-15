/* var five = require("johnny-five");
var board = new five.Board();

var pin = 13;
board.on("ready", ()=> {
    console.log("Ready");

    board.pinMode(pin, board.MODES.OUTPUT);

    board.digitalWrite(pin, 1);
    board.digitalRead(pin, (data)=>{
        console.log(data)
    })
});
 */



//digital
/*  this.pinMode(1, this.MODES.INPUT);

 this.digitalRead(1, (val) => {
     if (val > 0) {
         console.log(val);
         led.on();
     } else {
         console.log(val);
         led.off();
     }
 }); */

//anaog
/* this.analogRead(sensorPin, (val) => {

    console.log(val);

    if (val >= 200) {
        console.log(val);
        led.on();
    } else {
        console.log(val);
        led.off();
    }

}); */

// sensor laser

/*this.pinMode(6, five.Pin.OUTPUT)
this.pinMode(7, five.Pin.INPUT)


this.digitalWrite(6, 1)
this.digitalRead(7, (val)=>{
    if (val === 0 ) {
        tetesan = tetesan + 1
    }

    console.log(tetesan)
})*/




///////////////////////////////////// Terbaru

// btnAktif.on("down", () => {
//     if (countAktif == 0) {
//         countAktif = 1;
//         ledAktif.on();
//         let countTetesanAktif = 0;
//         console.log("tombol mulai");
//         let tetesan = 8;
//         //getTetesanAwalPasien("VA1", (key, tetesan) => {
//         console.log("mulai");
//         deteksiTetesanInfus(function(res) {
//             if (res == 0) {
//                 countTetesanAktif++;
//                 console.log("Tetesan Aktif Ke : " + countTetesanAktif);
//                 if (countTetesanAktif == 1) {
//                     temporal.delay(20000, function() {
//                         if (tetesan != countTetesanAktif) {
//                             //sendPemberitahuanInfus("VA1", 2);
//                             countTetesanAktif = 0;
//                             console.log("tidak sesuai");
//                             board.io.reportDigitalPin(11, 0);
//                             //database.ref("infus" + key + "/TetesanAlat").set(countTetesanAktif);
//                         } else {
//                             //database.ref("infus" + key + "/TetesanAlat").set(countTetesanAktif);
//                             board.io.reportDigitalPin(11, 1);
//                             countTetesanAktif = 0;
//                         }

//                     });
//                 }
//             }
//         });
//         //});
//     } else if (countAktif == 1) {
//         countAktif = 0;
//         ledAktif.off();
//         board.io.reportDigitalPin(11, 0);
//     }
// });

// btnTes.on("down", () => {
//     let countTesTetesan = 0;
//     console.log("tombol tes on");

//     this.pinMode(11, board.io.MODES.INPUT);
//     deteksiTetesanInfus(function(s) {
//         if (s == 0) {
//             countTesTetesan++;
//             console.log("Tetesan Ke : " + countTesTetesan);
//             if (countTesTetesan == 1) {
//                 lcd.clear().cursor(0, 0).print(":pointerright:Hitung Tetesan");
//                 lcd.cursor(1, 0).print(" Menghitung...");
//                 temporal.delay(20000, function() {
//                     lcd.clear().cursor(0, 0).print(":pointerright:Hitung Tetesan");
//                     lcd.cursor(1, 0).print(" Total : " + countTesTetesan);
//                     this.stop();
//                     countTesTetesan = 0;
//                     s = 0;
//                     board.io.reportDigitalPin(11, 0);
//                 });
//             }
//         }
//     });
// });