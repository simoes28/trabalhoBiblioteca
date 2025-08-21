const db = require("../server/db")

async function listar() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM autores", [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

async function criar({ nome, nacionalidade, data_nascimento }) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO autores (nome, nacionalidade, data_nascimento)
      VALUES (?, ?, ?)
    `;

    db.run(query, [nome, nacionalidade, data_nascimento], function (err) {
      if (err) {
        return reject(err);
      }

      // this.lastID retorna o ID do autor inserido
      resolve({ id: this.lastID, nome, nacionalidade, data_nascimento });
    });
  });
}

async function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM autores WHERE id = ?`;

    db.get(query, [id], (err, row) => {
      if (err) {
        return reject(err);
      }

      if (!row) {
        // Nenhum autor encontrado com esse ID
        return resolve(null);
      }

      resolve(row);
    });
  });
}

async function atualizar(id, { nome, nacionalidade, data_nascimento }) {
  return new Promise((resolve, reject) => {
    const queryUpdate = `
      UPDATE autores
      SET nome = ?, nacionalidade = ?, data_nascimento = ?
      WHERE id = ?
    `;
    const paramsUpdate = [nome, nacionalidade, data_nascimento, id];

    db.run(queryUpdate, paramsUpdate, function (err) {
      if (err) return reject(err);

      if (this.changes === 0) {
        // Nenhum registro atualizado (autor não encontrado)
        return resolve(null);
      }

      // Após atualizar, buscar o autor atualizado para garantir que retorna conforme o banco
      db.get('SELECT * FROM autores WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  });
}


async function remover(id) {
  return new Promise((resolve, reject) => {
    // Primeiro, verifica se há livros para o autor
    const verificarLivros = `SELECT COUNT(*) as total FROM livros WHERE autor_id = ?`;

    db.get(verificarLivros, [id], (err, row) => {
      if (err) return reject(err);

      if (row.total > 0) {
        // Autor tem livros associados, não pode ser deletado
        return resolve("possui_livros");
      }

      // Se não tem livros, pode deletar
      const deletarAutor = `DELETE FROM autores WHERE id = ?`;
      db.run(deletarAutor, [id], function (err) {
        if (err) return reject(err);

        if (this.changes === 0) {
          // Nenhum autor encontrado com esse ID
          return resolve("nao_encontrado");
        }

        // Autor deletado com sucesso
        resolve("Deletado");
      });
    });
  });
}


async function livrosDoAutor(id) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT livros.*
      FROM livros
      WHERE autor_id = ?
    `;

    db.all(query, [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}


module.exports = {
  listar,
  criar,
  buscarPorId,
  atualizar,
  remover,
  livrosDoAutor,
};