const predmetDao = require('./predmet.dao.js');
var predmetController = {
    addPredmet: addPredmet,
    findPredmeti: findPredmeti,
    findPredmetById: findPredmetById,
    updatePredmet: updatePredmet,
    deleteById: deleteById

}

function addPredmet(req, res) {
    console.log("aaaaaaaaaa");
    let body = req.body;
    let predmet = {
        naziv: body.naziv
    }
    predmetDao.create(predmet).
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
}

function findPredmetById(req, res) {
    predmetDao.findById(req.params.id).
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
}

function deleteById(req, res) {
    predmetDao.deleteById(req.params.id).
        then((data) => {
            res.status(200).json({
                message: "Predmet deleted successfully",
                predmet: data
            })
        })
        .catch((error) => {
            console.log(error);
        });
}

function updatePredmet(req, res) {
    predmetDao.updatePredmet(req.body, req.params.id).
        then((data) => {
            res.status(200).json({
                message: "Predmet updated successfully",
                predmet: data
            })
        })
        .catch((error) => {
            console.log(error);
        });
}

function findPredmeti(req, res) {
    predmetDao.findAll().
        then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
}

module.exports = predmetController;