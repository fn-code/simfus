let five = require("johnny-five");
let Etherport = require("etherport");
let temporal = require("temporal");
let moment = require("moment");
let board = new five.Board();

class SimfusBoard {

    BoardStart(database) {
        board.on("ready", function() {
            let lcd = new five.LCD({
                pins: [2, 3, 4, 5, 6, 7],
                backlight: 13,
                rows: 2,
                cols: 20
            });

            var no = 0;
            lcd.useChar("pointerright");
            lcd.useChar("pointerleft");

            lcd.cursor(0, 0).print(":pointerright:Selamat Datang");
            lcd.cursor(1, 0).print(" Di SIMFUS APP");

            //lcd.off();
            //-----------------------------------------SEMUA-------------------------------------
            //this.pinMode(11, this.MODES.INPUT);

            this.pinMode(11, board.MODES.INPUT);
            this.digitalWrite(11, 1);

            let ledDarurat = new five.Led(13);
            let ledAktif = new five.Led(12);

            ledAktif.off();
            ledDarurat.off();

            let btnAktif = new five.Button("A5");
            let btnTes = new five.Button("A3");
            let btnDarurat = new five.Button("A4");

            let countAktif = 0;
            let countTes = 0;
            let countDarurat = 0;
            let daruratStatus = 0;
            let timeInterval;
            let date = moment().format("YYYY-MM-DD HH:mm:ss");

            btnDarurat.on("hold", function() {
                countDarurat++;
                console.log("Darurat : " + countDarurat);

                if (daruratStatus == 1) {
                    countDarurat = 0;
                } else {
                    temporal.delay(5000, () => {
                        countDarurat = 0;
                        //console.log("Selesai");
                    });
                }

                if (countDarurat == 5) {
                    daruratStatus = 1;
                    lcd.clear().cursor(0, 0).print(":pointerright:SIMFUS APP");
                    lcd.cursor(1, 0).print(":pointerright:Darurat Pasien");
                    ledDarurat.blink(500);
                    database.ref("infus").orderByChild("Status").equalTo(2).once("value").then(function(snapshot) {
                        let countData = snapshot.numChildren();
                        if (countData >= 1) {
                            snapshot.forEach(childSnapshot => {
                                let Pemberi = database.ref("pemberitahuan/").push();
                                if (childSnapshot.val().Alat == "VA1") {
                                    Pemberi.set({
                                        IDPemberitahuan: Pemberi.key,
                                        IDAlat: childSnapshot.val().IDAlat,
                                        Alat: childSnapshot.val().Alat,
                                        IDGedung: childSnapshot.val().IDGedung,
                                        Gedung: childSnapshot.val().Gedung,
                                        Ruangan: childSnapshot.val().Ruangan,
                                        NamaPasien: childSnapshot.val().NamaPasien,
                                        Waktu: date,
                                        Jenis: 3,
                                        Status: 1
                                    });
                                } else {
                                    lcd.clear().cursor(0, 0).print(":pointerright:Darurat Pasien");
                                    lcd.cursor(1, 0).print(" Data Kosong");
                                }
                            });
                        } else {
                            lcd.clear().cursor(0, 0).print(":pointerright:Darurat Pasien");
                            lcd.cursor(1, 0).print(" Data Kosong");
                        }
                    });
                    temporal.delay(60000, () => {
                        lcd.clear().cursor(0, 0).print(":pointerright:Selamat Datang");
                        lcd.cursor(1, 0).print(" Di SIMFUS APP");
                        ledDarurat.stop();
                        ledDarurat.off();
                        countDarurat = 0;
                        daruratStatus = 0;
                    });
                }
            });

            btnAktif.on("down", () => {
                if (countAktif == 0) {
                    countAktif = 1;
                    ledAktif.on();
                    getTetesanAwalPasien("VA1", (key, tetesan) => {
                        let tts = tetesan - 3;
                        lcd.clear().cursor(0, 0).print(":pointerright:Hitung Tetesan");
                        lcd.cursor(1, 0).print(" Menghitung...");
                        deteksiTetesan((res) => {
                            console.log(key);
                            if (res < tts || res > tetesan) {
                                board.io.reportDigitalPin(11, 0);
                                database.ref("infus/" + key + "/TetesanAlat").set(res);
                                sendPemberitahuanInfus("VA1", 2);
                                console.log("tidak sesuai");
                                clearTimeout(timeInterval);
                            } else {
                                database.ref("infus/" + key + "/TetesanAlat").set(res);
                                console.log("Aktif : " + res);
                            }
                            lcd.clear().cursor(0, 0).print(":pointerright:Hitung Tetesan");
                            lcd.cursor(1, 0).print(" Total : " + res);
                        });
                    });
                } else if (countAktif == 1) {
                    countAktif = 0;
                    ledAktif.off();
                    lcd.clear().cursor(0, 0).print(":pointerright:Selamat Datang");
                    lcd.cursor(1, 0).print(" Di SIMFUS APP");
                    clearTimeout(timeInterval);
                    board.io.reportDigitalPin(11, 0);
                }
            });
            let u = 0;
            btnTes.on("down", () => {
                if (countTes == 0) {
                    countTes = 1;
                    ledDarurat.on();
                    lcd.clear().cursor(0, 0).print(":pointerright:Hitung Tetesan");
                    lcd.cursor(1, 0).print(" Menghitung...");
                    deteksiTetesan(res => {
                        u++;
                        console.log("Tes : " + res);
                        lcd.clear().cursor(0, 0).print(":pointerright:Tes Tetesan:" + u);
                        lcd.cursor(1, 0).print(" Total : " + res);
                    });
                } else if (countTes == 1) {
                    countTes = 0;
                    u = 0;
                    ledDarurat.off();
                    lcd.clear().cursor(0, 0).print(":pointerright:Selamat Datang");
                    lcd.cursor(1, 0).print(" Di SIMFUS APP");
                    clearTimeout(timeInterval);
                    board.io.reportDigitalPin(11, 0);
                }
            });


            function deteksiTetesan(callback) {
                let cnt = 0;
                board.digitalRead(11, function(res) {
                    if (res == 0) {
                        cnt++;
                        console.log(cnt);
                        if (cnt == 1) {
                            timeInterval = setTimeout(() => {
                                callback(cnt);
                                console.log("Jumlah : " + cnt);
                                cnt = 0;
                            }, 30000);
                        }
                    }
                });
            }

            // function deteksiTetesanInfus(callback) {
            //     board.digitalRead(11, function(res) {
            //         callback(res);
            //     });
            // }

            function getTetesanAwalPasien(kdAlat, callback) {
                database.ref("infus").orderByChild("Status").equalTo(2).once("value").then(function(snapshot) {
                    snapshot.forEach(chidSnapshot => {
                        if (chidSnapshot.val().Alat == "VA1") {
                            callback(chidSnapshot.key, chidSnapshot.val().Tetesan);
                        }
                    });
                });
            }

            function sendPemberitahuanInfus(kdAlat, jenis) {
                database.ref("infus").orderByChild("Status").equalTo(2).once("value").then(function(snapshot) {
                    snapshot.forEach(childSnapshot => {
                        let Pemberi = database.ref("pemberitahuan/").push();
                        if (childSnapshot.val().Alat == kdAlat) {
                            Pemberi.set({
                                IDPemberitahuan: Pemberi.key,
                                IDAlat: childSnapshot.val().IDAlat,
                                Alat: childSnapshot.val().Alat,
                                IDGedung: childSnapshot.val().IDGedung,
                                Gedung: childSnapshot.val().Gedung,
                                Ruangan: childSnapshot.val().Ruangan,
                                NamaPasien: childSnapshot.val().NamaPasien,
                                Waktu: date,
                                Jenis: jenis,
                                Status: 1
                            });
                        }
                    });
                });

            }


            // let tetesA = 0;
            // let dt = this.digitalRead(11, function(data) {
            //     let jadiRes = data;
            //     if (jadiRes == 0) {
            //         tetesA++;
            //         console.log(tetesA);
            //         // if (tetesA == 1) {
            //         //     setTimeout(() => {
            //         //         console.log("Hasil : " + tetesA);
            //         //         tetesA = 0;
            //         //     }, 60000);
            //         // }
            //     }
            // });
        });

        board.on("close", function() {
            console.log('Board closed');
            let date = moment().format("YYYY-MM-DD HH:mm:ss");

            database.ref("alat").orderByChild("Status").equalTo(2).once("value").then(function(snapshot) {
                snapshot.forEach(childSnapshot => {
                    let Pemberi = database.ref("pemberitahuan/").push();
                    if (childSnapshot.val().Alat == "VA1") {
                        Pemberi.set({
                            IDPemberitahuan: Pemberi.key,
                            IDAlat: childSnapshot.val().IDAlat,
                            Alat: childSnapshot.val().Alat,
                            IDGedung: childSnapshot.val().IDGedung,
                            Gedung: childSnapshot.val().Gedung,
                            Ruangan: childSnapshot.val().Ruangan,
                            NamaPasien: childSnapshot.val().Alat,
                            Waktu: date,
                            Jenis: 1,
                            Status: 1
                        });
                    }
                });
            });
        });
    }

}

module.exports = new SimfusBoard();