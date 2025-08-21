const db = require('./server/db');

function setup() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS autores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        nacionalidade TEXT,
        data_nascimento TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS livros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        ano_publicacao INTEGER,
        genero TEXT,
        autor_id INTEGER,
        FOREIGN KEY (autor_id) REFERENCES autores(id)
      )
    `);

    // Seed inicial
    db.get("SELECT COUNT(*) as count FROM autores", (err, row) => {
      if (row.count === 0) {
        db.run("INSERT INTO autores (nome) VALUES (?)", ["Machado de Assis"]);
        db.run("INSERT INTO livros (titulo, autor_id) VALUES (?, ?)", ["Dom Casmurro", 1]);
        db.run("INSERT INTO livros (titulo, autor_id) VALUES (?, ?)", ["Memórias Póstumas de Brás Cubas", 1]);
        console.log("✅ Banco inicializado com dados de exemplo");
      }
    });
  });
}

module.exports = setup;