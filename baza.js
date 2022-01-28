const Sequelize = require('sequelize');
const sequelize = new Sequelize('WT18433', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const baza = {};

baza.Sequelize = Sequelize;
baza.sequelize = sequelize;

baza.predmet = sequelize.import(__dirname + '/predmet.js');
baza.student = sequelize.import(__dirname + '/student.js');
baza.grupa = sequelize.import(__dirname + '/grupa.js');
baza.dan = sequelize.import(__dirname + '/dan.js');
baza.tip = sequelize.import(__dirname + '/tip.js');
baza.aktivnost = sequelize.import(__dirname + '/aktivnost.js');
//relacije

//Predmet 1-N Grupa
baza.predmet.hasMany(baza.grupa, { as: 'grupePredmet', onDelete: 'cascade', hooks: true, foreignKey: { allowNull: false } });

//Aktivnost N-1 Predmet

baza.predmet.hasMany(baza.aktivnost, { as: 'aktivnostiPredmet', onDelete: 'cascade', foreignKey: { allowNull: false } });

//Aktivnost N-0 Grupa

baza.grupa.hasMany(baza.aktivnost, { as: 'aktivnostiGrupa' });

//Aktivnost N-1 Dan

baza.dan.hasMany(baza.aktivnost, { as: 'aktivnostiDan', onDelete: 'cascade' , foreignKey: { allowNull: false } });

//Aktivnost N-1 Tip

baza.tip.hasMany(baza.aktivnost, { as: 'aktivnostiDan', onDelete: 'cascade' , foreignKey: { allowNull: false } });

//Student N-M Grupa
baza.grupaStudent = baza.student.belongsToMany(baza.grupa, { as: 'grupe', through: 'grupa_student', foreignKey: 'studentId', onDelete: 'cascade' });
baza.grupa.belongsToMany(baza.student, { as: 'studenti', through: 'grupa_student', foreignKey: 'grupaId', onDelete: 'cascade' });

module.exports = baza;