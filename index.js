const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const baza = require('./baza.js');
const { student } = require('./baza.js');
const grupaStudent = baza.sequelize.model('grupa_student');
app.use(bodyParser.json());
app.use(express.static('public'))
baza.sequelize.sync({ force: false }).then(function () {
});

app.post('/v2/zadatak2', async function (req, res) {

    var tijelo = req.body;
    var objekti = tijelo.slanje;
    var odgovor = {
        poruke: ""
    }


    for (let j = 0; j < objekti.length; j++) {
        var trenutniStudent = objekti[j];

        await baza.student
            .findOrCreate({ where: { index: trenutniStudent.index }, defaults: { ime: trenutniStudent.ime } })
            .spread(async function (noviStudent, created) {
                console.log(noviStudent.get({
                    plain: true
                }))
                let grupaStudenta = await baza.grupa.findByPk(trenutniStudent.grupa).then((grupa) => {
                    if (!grupa) {
                        console.log("Grupa not found!");
                        return null;
                    }

                    return grupa;

                });

                if (!created) {
                    //Student X Y nije kreiran jer postoji student U V sa istim indexom M
                    if (odgovor.poruke != "") {
                        odgovor.poruke = odgovor.poruke + '\n';
                    }
                    if (noviStudent.ime != trenutniStudent.ime)
                        odgovor.poruke = odgovor.poruke + 'Student ' + trenutniStudent.ime + ' nije kreiran jer postoji student ' + noviStudent.ime + ' sa istim indeksom ' + trenutniStudent.index;
                    else
                        await noviStudent.getGrupe({ where: { predmetId: grupaStudenta.predmetId } }).then(async function (studentoveGrupeZaPredmet) {
                            if (studentoveGrupeZaPredmet.length == 0) noviStudent.addGrupe(grupaStudenta);
                            else if (studentoveGrupeZaPredmet[0].id == grupaStudenta.id) return;
                            else {
                                let idGrupe = studentoveGrupeZaPredmet[0].id;
                                await grupaStudent.destroy({ where: { grupaId: idGrupe, studentId: noviStudent.id } }).
                                    then((data) => {
                                        noviStudent.addGrupe(grupaStudenta);
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                            }
                        });

                }

                else {
                    noviStudent.addGrupe(grupaStudenta);
                }

            })

    }

    console.log(odgovor.poruke);

    res.status(200).json(odgovor);

});

app.post('/v2/predmet', async function (req, res) {
    var tijelo = req.body;
    let predmet = await baza.predmet.findOne({ where: { naziv: tijelo.naziv } });
    if (predmet == undefined || predmet == null) {
        await baza.predmet.create(tijelo)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Greska"
                });
            });
    }
    else {
        res.json({ message: "Naziv predmeta postoji!", id:predmet.id});
    }
});

app.post('/v2/student', async function (req, res) {
    var tijelo = req.body;
    let student = await baza.student.findOne({ where: { index: tijelo.index } });
    if (student == undefined || student == null) {
        baza.student.create(tijelo)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Greska"
                });
            });
    }
    else {
        res.json({ message: "Student sa indeksom " + req.body.index + " već postoji!" });
    }
});

app.post('/v2/tip', async function (req, res) {
    var tijelo = req.body;
    let tip = await baza.tip.findOne({ where: { naziv: tijelo.naziv } });
    if (tip == undefined || tip == null) {
        baza.tip.create(tijelo)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Greska"
                });
            });
    }
    else {
        res.json({ message: "Tip aktivnosti " + req.body.naziv + " već postoji!" });
    }
});

app.post('/v2/grupa', function (req, res) {
    var body = req.body;
    baza.grupa.create(body)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Greska"
            });
        });
});

app.post('/v2/dan', async function (req, res) {
    var tijelo = req.body;
    let dan = await baza.dan.findOne({ where: { naziv: tijelo.naziv } });
    if (dan == undefined || dan == null) {
        var body = req.body;
        baza.dan.create(body)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Greska"
                });
            });
    }
    else {
        res.json({ message: "Dan " + req.body.naziv + " već postoji!" });
    }
});

app.post('/v2/aktivnost', function (req, res) {
    var tijelo = req.body;
    if (Number(tijelo['pocetak']) > 20 || Number(tijelo['pocetak']) < 8 || Number(tijelo['kraj']) > 20 || Number(tijelo['kraj']) < 8 || Number(tijelo['kraj']) <= Number(tijelo['pocetak']) || !Number.isInteger(parseFloat(tijelo['pocetak']) / 0.5) || !Number.isInteger(parseFloat(tijelo['kraj']) / 0.5))
        res.json({ message: "Aktivnost nije validna!" });
    else {
        baza.aktivnost.create(tijelo)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Greska"
                });
            });
    }
});
app.get('/v2/predmeti', function (req, res) {
    baza.predmet.findAll().
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/v2/dani', function (req, res) {
    baza.dan.findAll().
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/v2/studenti', function (req, res) {
    baza.student.findAll().
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/v2/grupe', function (req, res) {
    baza.grupa.findAll().
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/v2/aktivnosti', function (req, res) {
    baza.aktivnost.findAll().
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/v2/tipovi', function (req, res) {
    baza.tip.findAll().
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
});
app.get('/v2/predmet/:id', function (req, res, pom) {
    baza.predmet.findByPk(req.params.id).
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/v2/dan/:id', function (req, res) {
    baza.dan.findByPk(req.params.id).
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/v2/student/:id', function (req, res) {
    var id = req.params.id;
    baza.student.findByPk(id).
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/v2/grupa/:id', function (req, res) {
    baza.grupa.findByPk(req.params.id).
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/v2/aktivnost/:id', function (req, res) {
    baza.aktivnost.findByPk(req.params.id).
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });

});

app.get('/v2/tip/:id', function (req, res) {
    baza.tip.findByPk(req.params.id).
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.delete('/v2/predmet/:id', function (req, res) {
    baza.predmet.destroy({ where: { id: req.params.id } }).
        then((data) => {
            res.status(200).json({
                message: "Predmet deleted successfully",
                gig: data
            })
        })
        .catch((error) => {
            console.log(error);
        });
});

app.delete('/v2/student/:id', function (req, res) {
    baza.student.destroy({ where: { id: req.params.id } }).
        then((data) => {
            res.status(200).json({
                message: "Student deleted successfully",
                gig: data
            })
        })
        .catch((error) => {
            console.log(error);
        });
});

app.delete('/v2/tip/:id', function (req, res) {
    baza.tip.destroy({ where: { id: req.params.id } }).
        then((data) => {
            res.status(200).json({
                message: "Tip deleted successfully",
                gig: data
            })
        })
        .catch((error) => {
            console.log(error);
        });
});

app.delete('/v2/grupa/:id', function (req, res) {
    baza.grupa.destroy({ where: { id: req.params.id } }).
        then((data) => {
            res.status(200).json({
                message: "Grupa deleted successfully",
                gig: data
            })
        })
        .catch((error) => {
            console.log(error);
        });
});

app.delete('/v2/aktivnost/:id', function (req, res) {
    baza.aktivnost.destroy({ where: { id: req.params.id } }).
        then((data) => {
            res.status(200).json({
                message: "Aktivnost deleted successfully",
                gig: data
            })
        })
        .catch((error) => {
            console.log(error);
        });
});
app.delete('/v2/dan/:id', function (req, res) {
    baza.dan.destroy({ where: { id: req.params.id } }).
        then((data) => {
            res.status(200).json({
                message: "Dan deleted successfully",
                dan: data
            })
        })
        .catch((error) => {
            console.log(error);
        });
});

app.put('/v2/student/:id', async function (req, res) {
    await baza.student.update({ ime: req.body.ime, index: req.body.index }, { where: { id: req.params.id } }).then((data) => {
        if (data == 0) res.json({ message: "Ne postoji student sa zadanim id-om." })
        else
            res.status(200).json({
                message: "Uspješno ažuriran student"
            })
    })
        .catch((error) => {
            console.log(error);
        });
})

app.put('/v2/predmet/:id', async function (req, res) {
    await baza.student.update({ naziv: req.body.naziv }, { where: { id: req.params.id } }).then((data) => {
        if (data == 0) res.json({ message: "Ne postoji predmet sa zadanim id-om." })
        else
            res.status(200).json({
                message: "Uspješno ažuriran predmet"
            })
    })
        .catch((error) => {
            console.log(error);
        });
})

app.put('/v2/tip/:id', async function (req, res) {
    await baza.student.update({ naziv: req.body.naziv }, { where: { id: req.params.id } }).then((data) => {
        if (data == 0) res.json({ message: "Ne postoji tip sa zadanim id-om." })
        else
            res.status(200).json({
                message: "Uspješno ažuriran tip"
            })
    })
        .catch((error) => {
            console.log(error);
        });
})

app.put('/v2/dan/:id', async function (req, res) {
    await baza.student.update({ naziv: req.body.naziv }, { where: { id: req.params.id } }).then((data) => {
        if (data == 0) res.json({ message: "Ne postoji dan sa zadanim id-om." })
        else
            res.status(200).json({
                message: "Uspješno ažuriran dan"
            })
    })
        .catch((error) => {
            console.log(error);
        });
})

app.put('/v2/aktivnost/:id', async function (req, res) {
    await baza.student.update({ naziv: req.body.naziv, pocetak: req.body.pocetak, kraj: req.body.pocetak }, { where: { id: req.params.id } }).then((data) => {
        if (data == 0) res.json({ message: "Ne postoji aktivnost sa zadanim id-om." })
        else
            res.status(200).json({
                message: "Uspješno ažuriran dan"
            })
    })
        .catch((error) => {
            console.log(error);
        });
})

app.put('/v2/grupa/:id', async function (req, res) {
    await baza.student.update({ naziv: req.body.naziv, pocetak: req.body.pocetak, kraj: req.body.pocetak }, { where: { id: req.params.id } }).then((data) => {
        if (data == 0) res.json({ message: "Ne postoji aktivnost sa zadanim id-om." })
        else
            res.status(200).json({
                message: "Uspješno ažurirana grupa"
            })
    })
        .catch((error) => {
            console.log(error);
        });
})
/*
app.put('/v2/predmet/:id', function (res, req) {
    var body = req.params;
    var id = req.params.id;
    var updateNew = {
        naziv: body.naziv
    };
    baza.predmet.update(updateNew, { where: { id: id } }).
        then((data) => {
            res.status(200).json({
                message: "Data updated successfully",
                data: data
            })
        })
        .catch((error) => {
            console.log(error);
        });

});

/*app.put('/v2/grupa/:id', update);
app.put('/v2/dan/:id', update);
app.put('/v2/tip/:id', update);
app.put('/v2/aktivnost/:id', update);
app.put('/v2/:tabela/:id', update); */

/*function update(req, res) {
    var body = req.params;
    var id = req.params.id;
    switch (req.params.tabela) {
        case 'predmet':
            var updateNew = {
                naziv: body.naziv
            };
            tabela = baza.predmet;
            break;
        case 'grupa':
            var updateNew = {
                naziv: body.naziv
            };
            tabela = baza.grupa;
            break;
        case 'dan':
            var updateNew = {
                naziv: body.naziv
            };
            tabela = baza.dan;
            break;
        case 'tip':
            var updateNew = {
                naziv: body.naziv
            };
            tabela = baza.tip;
            break;
        case 'aktivnost':
            var updateNew = {
                naziv: body.naziv,
                pocetak: body.pocetak,
                kraj: body.kraj
            };
            tabela = baza.aktivnost;
            break;
        case 'student':
            var updateNew = {
                ime: body.ime,
                index: body.index
            };
            tabela = baza.student;
            break;
        default:
            console.log("default");
        // code block
    }


    tabela.update(updateNew, { where: { id: id } }).
        then((data) => {
            res.status(200).json({
                message: "Data updated successfully",
                data: data
            })
        })
        .catch((error) => {
            console.log(error);
        });

}*/

app.listen(3000);
