var request = new XMLHttpRequest();
var request2 = new XMLHttpRequest();
var requestDani = new XMLHttpRequest();
var requestTipovi = new XMLHttpRequest();
var predmeti;
var aktivnosti;
var porukaDiv = document.getElementById("poruka");
var selectDani = document.getElementById("dani");
var selectTip = document.getElementById("tip-aktivnosti");
var btn = document.getElementById("submit");
request.open('GET', 'http://localhost:3000/v2/predmeti');
request.onload = function () {
    predmeti = JSON.parse(request.responseText);
    console.log(request.responseText);
};

requestDani.open('GET', 'http://localhost:3000/v2/dani');
requestDani.onload = function () {
    dani = JSON.parse(requestDani.responseText);
    console.log(request.responseText);
    ucitajDane(dani);
};

requestTipovi.open('GET', 'http://localhost:3000/v2/tipovi');
requestTipovi.onload = function () {
    tipovi = JSON.parse(requestTipovi.responseText);
    console.log(request.responseText);
    ucitajTipove(tipovi);
};

requestDani.send();
requestTipovi.send();
function ucitajTipove(tipovi) {
    for (const tip of tipovi) {
        var option = document.createElement("option");
        option.value = tip.id;
        option.text = tip.naziv.charAt(0).toUpperCase() + tip.naziv.slice(1);
        selectTip.appendChild(option);
    }
}
function ucitajDane(dani) {
    for (const dan of dani) {
        var option = document.createElement("option");
        option.value = dan.id;
        option.text = dan.naziv.charAt(0).toUpperCase() + dan.naziv.slice(1);
        selectDani.appendChild(option);
    }
}
request2.open('GET', 'http://localhost:3000/v2/aktivnosti');
request2.onload = function () {
    aktivnosti = JSON.parse(request2.responseText);
    console.log(request2.responseText);
};
request.send();
request2.send();

btn.addEventListener("click", function () {
    var forma = document.forms[0];
    var predmet = forma.elements["predmet"].value.trim();
    var nadjen = false;
    for (var i = 0; i < predmeti.length; i++) {
        if (predmeti[i].naziv == predmet) {
            nadjen = true;
            break;
        }
    }
    if (!nadjen) {
        var request3 = new XMLHttpRequest();
        var object = {
            naziv: predmet
        }
        var idPredmeta;
        var predmetNapravljen = false;
        request3.onreadystatechange = function () {
            if (request3.readyState == 4 && request3.status == 404) {
                porukaDiv.insertAdjacentHTML('beforeend', 'Greška - predmet nije moguće dodati!');
                
            }
            else {
                predmetNapravljen = true;
                idPredmeta = JSON.parse(request3.responseText).id;
                console.log(idPredmeta);
                var tip = document.getElementById("tip-aktivnosti").value; //id tipa
                var pocetak = document.getElementById("vrijeme-pocetka").value.split(":");
                var kraj = document.getElementById("vrijeme-kraja").value.split(":");
                var pocetakBroj = (Number(pocetak[0]) * 60 + Number(pocetak[1])) / 60.00;
                var krajBroj = (Number(kraj[0]) * 60 + Number(kraj[1])) / 60.00;
                var dan = document.getElementById("dani").value; //id dana

                var object2 = {
                    naziv: predmet,
                    pocetak: pocetakBroj,
                    kraj: krajBroj,
                    danId: dan,
                    tipId: tip,
                    predmetId: idPredmeta

                };
                var request4 = new XMLHttpRequest();
                request4.open("POST", 'http://localhost:3000/v2/aktivnost');
                request4.setRequestHeader("Content-Type", "application/json");
                request4.onreadystatechange = function () {
                    if (request4.readyState == 4 && request4.status == 404) {
                        porukaDiv.insertAdjacentHTML('beforeend', 'Greška - aktivnost nije moguće dodati!');
                        return;
                    }
                    if (JSON.parse(request4.responseText).message == "Aktivnost nije validna!") {
                        if (predmetNapravljen) {
                            console.log("ajisjioajsio");
                            var request5 = new XMLHttpRequest();
                            request5.open("DELETE", 'http://localhost:3000/v2/predmet/' + idPredmeta.toString());
                            request5.send();
                        }
                        porukaDiv.innerHTML = 'Greška - aktivnost nije moguće dodati!';
                    }
                    else porukaDiv.innerHTML = 'Aktivnost uspješno dodana!';
                }
                request4.send(JSON.stringify(object2));
                request.open('GET', 'http://localhost:3000/v2/predmeti');
                request.onload = function () {
                    predmeti = JSON.parse(request.responseText);
                };
                request2.onload = function () {
                    aktivnosti = JSON.parse(request2.responseText);
                };

            }

        }

        request3.open("POST", 'http://localhost:3000/v2/predmet');
        request3.setRequestHeader("Content-Type", "application/json");
        request3.send(JSON.stringify(object));
    }

});
