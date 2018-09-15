let request = require('request');
let moment = require('moment');
let temporal = require("temporal");

class Socket {
    sensorStart(io, database) {

        let dateNow = moment().format("YYYY-MM-DD HH:mm:ss");

        function getToken(callback) {
            let token;
            request({
                    method: "GET",
                    uri: "https://aloesaboe.annora.id/api/v1/token",
                },
                (error, response, body) => {
                    var res = JSON.parse(body);
                    token = res.result[0].token;
                    callback(token);
                });
        }

        io.on('connection', (socket) => {
            console.log("Socket Connected");

            socket.on('gedung', () => {
                getToken((token) => {
                    request.get(
                        "https://aloesaboe.annora.id/api/v1/gedung/", {
                            auth: {
                                bearer: token
                            }
                        },
                        (error, response, body) => {
                            if (!error && response.statusCode === 200) {
                                socket.emit('received-gedung', {
                                    data: JSON.parse(body)
                                });
                            } else if (error) {
                                console.log("bad connection");
                            }
                        }
                    );
                });
            });

            socket.on('ruangan', (data) => {
                let gedID = data.data;

                getToken((token) => {
                    request.get(
                        "https://aloesaboe.annora.id/api/v1/gedung/" + gedID, {
                            auth: {
                                bearer: token
                            }
                        },
                        (error, response, body) => {
                            if (!error && response.statusCode === 200) {
                                socket.emit('received-ruangan', {
                                    data: JSON.parse(body)
                                });
                            } else if (error) {
                                console.log("bad connection");
                            }
                        }
                    );
                });
            });

            socket.on('bed', (data) => {
                let rgID = data.data;
                console.log(rgID);

                getToken((token) => {
                    request.get(
                        "https://aloesaboe.annora.id/api/v1/bed/" + rgID, {
                            auth: {
                                bearer: token
                            }
                        },
                        (error, response, body) => {
                            if (!error && response.statusCode === 200) {
                                socket.emit('received-bed', {
                                    data: JSON.parse(body)
                                });
                            } else if (error) {
                                console.log("bad connection");
                            }
                        }
                    );
                });
            });

            socket.on('pasien', (data) => {
                console.log(data);
                getToken((token) => {
                    request.get(
                        "https://aloesaboe.annora.id/api/v1/pasien/" + data.idbed, {
                            auth: {
                                bearer: token
                            }
                        },
                        (error, response, body) => {

                            if (!error && response.statusCode === 200) {
                                let jsonData = JSON.parse(body);
                                let idcm = jsonData.result[0].nocm;
                                let nama = jsonData.result[0].nama;
                                let penyakit = jsonData.result[0].penyakit;
                                let date = moment().format("YYYY-MM-DD HH:mm:ss");

                                let infusID = database.ref("infus/").push();
                                infusID.set({
                                    IDInfus: infusID.key,
                                    IDAlat: data.IDAlat,
                                    Alat: data.idalat,
                                    IDCm: idcm,
                                    IDGedung: data.idgedung,
                                    Gedung: data.NamaGedung,
                                    Ruangan: data.ruangan,
                                    Tetesan: data.tetesan,
                                    TetesanAlat: 0,
                                    IDBed: data.idbed,
                                    Bed: data.nm_bed,
                                    Jenis: data.jenis,
                                    NamaPasien: nama,
                                    Waktu: date,
                                    Penyakit: penyakit,
                                    Status: 2
                                });

                            } else if (error) {
                                console.log("bad connection");
                            }
                        }
                    );
                });

            });

            let simulasiVA1, simulasiVB1;
            let simCountA = 0;
            let simCountB = 0;

            // socket.on("simulasi-infus", function(data) {
            //     if (data.idalat == "VA1" && data.status == '2') {
            //         simulasiVA1 = setInterval(() => {
            //             simCountA++;
            //             var dataBack = { Alat: "VA1", Status: 1, JmlTetesan: data.tetesan };
            //             //io.emit("VA1", { data: dataBack });
            //             console.log("A =" + simCountA);
            //             if (data.menitKe == simCountA) {
            //                 clearInterval(simulasiVA1);
            //                 simCountA = 0;
            //                 database.ref("infus").orderByChild("Status").equalTo(2).once("value", (snapshot) => {
            //                     snapshot.forEach((childSnapshot) => {
            //                         if (childSnapshot.val().Alat == "VA1") {
            //                             //console.log(childSnapshot.val().IDAlat);
            //                             let Pemberi = database.ref("pemberitahuan/").push();
            //                             Pemberi.set({
            //                                 IDPemberitahuan: Pemberi.key,
            //                                 IDAlat: childSnapshot.val().IDAlat,
            //                                 Alat: childSnapshot.val().Alat,
            //                                 IDGedung: childSnapshot.val().IDGedung,
            //                                 Gedung: childSnapshot.val().Gedung,
            //                                 Ruangan: childSnapshot.val().Ruangan,
            //                                 NamaPasien: childSnapshot.val().NamaPasien,
            //                                 Jenis: data.tipe,
            //                                 Waktu: dateNow,
            //                                 Status: 1
            //                             });
            //                         }
            //                     });
            //                 });
            //             }

            //         }, 10000);

            //     } else if (data.idalat == 'VA1' && data.status == '1') {
            //         simCountA = 0;
            //         clearInterval(simulasiVA1);
            //     }

            //     if (data.idalat == 'VB1' && data.status == '2') {
            //         simulasiVB1 = setInterval(() => {
            //             simCountB++;
            //             var dataBack = { Alat: "VB1", Status: 1, JmlTetesan: data.tetesan };
            //             //io.emit("VB1", { data: dataBack });
            //             console.log("B =" + simCountB);
            //             if (data.menitKe == simCountB) {
            //                 database.ref("infus").orderByChild("Status").equalTo(2).once("value", (snapshot) => {
            //                     snapshot.forEach((childSnapshot) => {
            //                         if (childSnapshot.val().Alat == "VB1") {
            //                             //console.log(childSnapshot.val().IDAlat);
            //                             let Pemberi = database.ref("pemberitahuan/").push();
            //                             Pemberi.set({
            //                                 IDPemberitahuan: Pemberi.key,
            //                                 IDAlat: childSnapshot.val().IDAlat,
            //                                 Alat: childSnapshot.val().Alat,
            //                                 IDGedung: childSnapshot.val().IDGedung,
            //                                 Gedung: childSnapshot.val().Gedung,
            //                                 Ruangan: childSnapshot.val().Ruangan,
            //                                 NamaPasien: childSnapshot.val().NamaPasien,
            //                                 Jenis: data.tipe,
            //                                 Waktu: dateNow,
            //                                 Status: 1
            //                             });
            //                         }
            //                     });
            //                 });
            //                 simCountB = 0;
            //                 clearInterval(simulasiVB1);
            //             }

            //         }, 10000);
            //     } else if (data.idalat == 'VB1' && data.status == '1') {
            //         simCountB = 0;
            //         clearInterval(simulasiVB1);
            //     }
            // });


        });


    }
}

module.exports = new Socket();