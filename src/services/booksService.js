const db = require("../server/db");

// Listar todos os livros
async function listar() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM livros", [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Criar novo livro
async function criar({ titulo, anopublicacao, genero, autor_id }) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO livros (titulo, anopublicacao, genero, autor_id)
      VALUES (?, ?, ?, ?)
    `;

    db.run(query, [titulo, anopublicacao, genero, autor_id], function (err) {
      if (err) return reject(err);

      // Retorna o objeto com os dados inseridos, incluindo o ID gerado
      resolve({
        id: this.lastID,
        titulo,
        anopublicacao,
        genero,
        autor_id,
      });
    });
  });
}

// Buscar livro por ID
async function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM livros WHERE id = ?`;

    db.get(query, [id], (err, row) => {
      if (err) return reject(err);

      if (!row) return resolve(null);

      resolve(row);
    });
  });
}

// Atualizar livro
async function atualizar(id, { titulo, anopublicacao, genero, autor_id }) {
  return new Promise((resolve, reject) => {
    const queryUpdate = `
      UPDATE livros
      SET titulo = ?, anopublicacao = ?, genero = ?, autor_id = ?
      WHERE id = ?
    `;

    const params = [titulo, anopublicacao, genero, autor_id, id];

    db.run(queryUpdate, params, function (err) {
      if (err) return reject(err);

      if (this.changes === 0) {
        // Nenhum livro foi atualizado
        return resolve(null);
      }

      // Buscar o livro atualizado para retornar os dados reais do banco
      db.get("SELECT * FROM livros WHERE id = ?", [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  });
}

// Remover livro
async function remover(id) {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM livros WHERE id = ?`;

    db.run(query, [id], function (err) {
      if (err) return reject(err);

      if (this.changes === 0) {
        // Nenhum livro encontrado com esse ID
        return resolve(false);
      }

      // Livro deletado com sucesso
      resolve("Deletado");
    });
  });
}

module.exports = {
  listar,
  criar,
  buscarPorId,
  atualizar,
  remover,
};
