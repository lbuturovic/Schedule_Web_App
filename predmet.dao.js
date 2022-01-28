const Predmet = require('./predmet.js');
var predmetDao = {
    findAll: findAll,
    create: create,
    findById: findById,
    deleteById: deleteById,
    updatePredmet: updatePredmet
}

function findAll() {
    return Predmet.findAll();
}

function findById(id) {
    return Predmet.findByPk(id);
}

function deleteById(id) {
    return Predmet.destroy({ where: { id: id } });
}

function create(predmet) {
    console.log("bbbbbb");
    var newPredmet = new Predmet(predmet);
    return newPredmet.save();
}

function updatePredmet(predmet, id) {
    var updatePredmet = {
        naziv: predmet.naziv,
        
    };
    return Predmet.update(updatePredmet, { where: { id: id } });
}
module.exports = predmetDao;