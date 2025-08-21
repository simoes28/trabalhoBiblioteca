const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ✅ Caminho absoluto para o banco
const dbPath = path.join(__dirname, 'biblioteca.db');

// 💾 Conectar ao banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite:', dbPath);
  }
});

db.serialize(() => {
  console.log('📚 Criando tabelas se não existirem...');

  // Tabela de autores
  db.run(`
    CREATE TABLE IF NOT EXISTS autores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      nacionalidade TEXT,
      data_nascimento TEXT
    )
  `);

  // Tabela de livros
  db.run(`
    CREATE TABLE IF NOT EXISTS livros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      anopublicacao INTEGER,
      genero TEXT,
      autor_id INTEGER,
      FOREIGN KEY (autor_id) REFERENCES autores(id)
    )
  `);

  console.log('✅ Tabelas criadas. Inserindo dados...');

  const nomesAutores = [
    'Machado de Assis', 'Clarice Lispector', 'J.K. Rowling', 'George Orwell',
    'Fiódor Dostoiévski', 'Gabriel García Márquez', 'Ernest Hemingway', 'Jane Austen',
    'Leo Tolstói', 'Charles Dickens', 'Paulo Coelho', 'Cecília Meireles'
  ];

  const nacionalidades = ['Brasileiro', 'Britânico', 'Russo', 'Colombiano', 'Americano'];

  const livrosFamosos = [
    'Dom Casmurro', 'Harry Potter e a Pedra Filosofal', '1984', 'A Hora da Estrela',
    'Crime e Castigo', 'Cem Anos de Solidão', 'O Velho e o Mar', 'Orgulho e Preconceito',
    'Guerra e Paz', 'Oliver Twist', 'O Alquimista', 'Ou Isto ou Aquilo'
  ];

  const generos = [
    'Romance', 'Fantasia', 'Distopia', 'Suspense',
    'Aventura', 'Terror', 'Ficção Científica', 'Biografia'
  ];

  const autores = [];
  const livros = [];

  for (let i = 1; i <= 100; i++) {
    // Autor
    const nome = `${nomesAutores[Math.floor(Math.random() * nomesAutores.length)]} ${i}`;
    const nacionalidade = nacionalidades[Math.floor(Math.random() * nacionalidades.length)];
    const nascimento = `19${Math.floor(Math.random() * 90 + 10)}-${String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')}-${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}`;
    
    autores.push({ nome, nacionalidade, data_nascimento: nascimento });

    // Livro
    const titulo = `${livrosFamosos[Math.floor(Math.random() * livrosFamosos.length)]} ${i}`;
    const ano = 1900 + Math.floor(Math.random() * 124);
    const genero = generos[Math.floor(Math.random() * generos.length)];

    livros.push({ titulo, anopublicacao: ano, genero, autor_id: i });
  }

  autores.forEach((autor) => {
    db.run(
      `INSERT INTO autores (nome, nacionalidade, data_nascimento) VALUES (?, ?, ?)`,
      [autor.nome, autor.nacionalidade, autor.data_nascimento],
      (err) => {
        if (err) console.error("Erro ao inserir autor:", err.message);
      }
    );
  });

  livros.forEach((livro) => {
    db.run(
      `INSERT INTO livros (titulo, anopublicacao, genero, autor_id) VALUES (?, ?, ?, ?)`,
      [livro.titulo, livro.anopublicacao, livro.genero, livro.autor_id],
      (err) => {
        if (err) console.error("Erro ao inserir livro:", err.message);
      }
    );
  });
});

db.close((err) => {
  if (err) {
    console.error("❌ Erro ao fechar o banco:", err.message);
  } else {
    console.log('✅ Banco populado com sucesso!');
  }
});
