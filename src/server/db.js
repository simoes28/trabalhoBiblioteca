const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ✅ Corrigido: __dirname (com dois underlines)
const dbPath = path.resolve(__dirname, '..', 'biblioteca.db');

// 💾 Criação da conexão
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite:', dbPath);
  }
});

module.exports = db;