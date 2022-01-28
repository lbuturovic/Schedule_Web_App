var request = new XMLHttpRequest();
var select = document.getElementById("grupe");
var btn = document.getElementById("submit");
request.open('GET', 'http://localhost:3000/v2/grupe');
request.onload = function () {
    grupe = JSON.parse(request.responseText);
    console.log(request.responseText);
    ucitajGrupe(grupe);
};

request.send();

function ucitajGrupe(grupe) {
    for (const grupa of grupe) {
        var option = document.createElement("option");
        option.value = grupa.id;
        option.text = grupa.naziv.charAt(0).toUpperCase() + grupa.naziv.slice(1);
        select.appendChild(option);
    }
}

btn.addEventListener("click", async function () {
    var csv = document.getElementById("studenti").value
    var lines = csv.split("\n");
    var result = [];
    var headers = ["ime", "index"];

    for (var i = 0; i < lines.length; i++) {

        var student = {};
        var currentline = lines[i].split(",");

        for (var j = 0; j < headers.length; j++) {
            student[headers[j]] = currentline[j].toString();
        }
        student["grupa"] = select.value;
        result.push(student);
    }
    var zaSlanje = {
        slanje: result
    }
    var request2 = new XMLHttpRequest();
    request2.open("POST", 'http://localhost:3000/v2/zadatak2');
    request2.setRequestHeader("Content-Type", "application/json");
    request2.send(JSON.stringify(zaSlanje));
    request2.onreadystatechange = function () {
        if (request2.status == 200) {
            var odgovor = JSON.parse(request2.responseText);
            document.getElementById("studenti").value = odgovor.poruke;

        }
    }


});