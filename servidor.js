const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json()); // Necessário para ler os dados do formulário (usuario e senha)

// Conexão com o banco (db_mostra original)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_mostra'
});

db.connect((erro) => {
    if (erro) console.error('Erro ao conectar:', erro);
    else console.log('Node.js conectado à base de dados db_mostra!');
});

// --- ROTA DE CADASTRO (Igual ao Cadastro.java) ---
app.post('/api/cadastro', (req, res) => {
    const { usuario, senha } = req.body;
    
    const sql = "INSERT INTO tb_login(usuario, senha) VALUES (?, ?)";
    db.query(sql, [usuario, senha], (erro, resultados) => {
        if (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro ao cadastrar. Usuário já existe?' });
        }
        res.json({ mensagem: 'Cadastro realizado com sucesso!' });
    });
});

// --- ROTA DE LOGIN (Igual ao Login.java) ---
app.post('/api/login', (req, res) => {
    const { usuario, senha } = req.body;
    
    const sql = "SELECT * FROM tb_login WHERE usuario = ? AND senha = ?";
    db.query(sql, [usuario, senha], (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: 'Erro no banco de dados' });
        
        if (resultados.length > 0) {
            // Login deu certo!
            res.json({ sucesso: true, usuario: usuario });
        } else {
            // Usuário ou senha errados
            res.status(401).json({ erro: 'Usuário ou senha incorretos!' });
        }
    });
});

// --- ROTA DE METAS (A que já tínhamos) ---
app.get('/api/metas', (req, res) => {
    const utilizador = req.query.usuario; 
    const sql = "SELECT * FROM tb_metas WHERE usu = ?";
    db.query(sql, [utilizador], (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: 'Erro na base de dados' });
        res.json(resultados);
    });
});

// --- ROTA PARA CADASTRAR NOVA META (Equivalente ao cadastrar_metas.java) ---
app.post('/api/metas', (req, res) => {
    // Recebe todos os dados enviados pelo formulário HTML
    const { 
        nome_meta, periodo_d_tempo, medida, quantidade, genero, 
        nome_obras, nome_autor, dia_comecou, dia_terminou, status, usu 
    } = req.body;

    // Comando SQL exato que você usava no Java
    const sql = `INSERT INTO tb_metas
        (periodo_d_tempo, medida, quantidade, genero, nome_obras, nome_autor, dia_comecou, dia_terminou, status, usu, nome_meta) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [periodo_d_tempo, medida, quantidade, genero, nome_obras, nome_autor, dia_comecou, dia_terminou, status, usu, nome_meta], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao inserir meta no MySQL:", erro);
            return res.status(500).json({ erro: 'Erro ao salvar meta no banco de dados.' });
        }
        res.json({ sucesso: true, mensagem: 'Meta cadastrada com sucesso!' });
    });
});

// --- ROTA PARA EXCLUIR META (Equivalente ao deletar_metas.java) ---
app.delete('/api/metas/:id', (req, res) => {
    const idMeta = req.params.id;
    
    const sql = "DELETE FROM tb_metas WHERE id_meta = ?";
    db.query(sql, [idMeta], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao deletar no banco:", erro);
            return res.status(500).json({ erro: 'Não foi possível excluir a meta.' });
        }
        res.json({ sucesso: true, mensagem: 'Meta excluída com sucesso!' });
    });
});

// --- ROTA PARA ALTERAR META (Equivalente ao alterar_metas.java) ---
app.put('/api/metas/:id', (req, res) => {
    const idMeta = req.params.id;
    const { 
        nome_meta, periodo_d_tempo, medida, quantidade, genero, 
        nome_obras, nome_autor, dia_comecou, dia_terminou, status 
    } = req.body;

    const sql = `UPDATE tb_metas SET 
        periodo_d_tempo = ?, medida = ?, quantidade = ?, genero = ?, 
        nome_obras = ?, nome_autor = ?, dia_comecou = ?, dia_terminou = ?, 
        status = ?, nome_meta = ? 
        WHERE id_meta = ?`;

    db.query(sql, [periodo_d_tempo, medida, quantidade, genero, nome_obras, nome_autor, dia_comecou, dia_terminou, status, nome_meta, idMeta], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao atualizar no banco:", erro);
            return res.status(500).json({ erro: 'Não foi possível alterar a meta.' });
        }
        res.json({ sucesso: true, mensagem: 'Meta atualizada com sucesso!' });
    });
});

// --- ROTAS DE RESUMOS (Equivalente ao cadastrar_resumos.java e deletar_resumos.java) ---

// 1. Rota para Buscar Resumos (ver_resumos.java)
app.get('/api/resumos', (req, res) => {
    const utilizador = req.query.usuario;
    if (!utilizador) return res.status(400).json({ erro: "Usuário não informado." });

    const sql = "SELECT * FROM tb_resumos WHERE usu = ?";
    db.query(sql, [utilizador], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar resumos:", erro);
            return res.status(500).json({ erro: 'Erro ao buscar resumos.' });
        }
        res.json(resultados);
    });
});

// 2. Rota para Cadastrar Resumo (cadastrar_resumos.java)
app.post('/api/resumos', (req, res) => {
    const { titulo, resumo, usu } = req.body;

    const sql = "INSERT INTO tb_resumos(titulo, resumo, usu) VALUES (?, ?, ?)";
    db.query(sql, [titulo, resumo, usu], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao inserir resumo:", erro);
            return res.status(500).json({ erro: 'Erro ao salvar resumo.' });
        }
        res.json({ sucesso: true, mensagem: 'Resumo salvo com sucesso!' });
    });
});

// 3. Rota para Deletar Resumo (deletar_resumos.java)
app.delete('/api/resumos/:id', (req, res) => {
    const idResumo = req.params.id;

    const sql = "DELETE FROM tb_resumos WHERE id_resumo = ?";
    db.query(sql, [idResumo], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao deletar resumo:", erro);
            return res.status(500).json({ erro: 'Erro ao excluir resumo.' });
        }
        res.json({ sucesso: true, mensagem: 'Resumo excluído com sucesso!' });
    });
});

// --- ROTA DE SISTEMA DE RECOMPENSAS (Equivalente ao selos.java e ver_selos.java) ---
app.get('/api/selos', (req, res) => {
    const utilizador = req.query.usuario;
    if (!utilizador) return res.status(400).json({ erro: "Usuário não informado." });

    // Busca apenas as metas concluídas (status = 1) do usuário logado
    const sql = "SELECT periodo_d_tempo, medida, quantidade, genero FROM tb_metas WHERE usu = ? AND status = 1";
    
    db.query(sql, [utilizador], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao processar selos:", erro);
            return res.status(500).json({ erro: 'Erro interno do servidor.' });
        }

        let totalLivros = 0;
        let totalPaginas = 0;
        let livrosPorGenero = Array(13).fill(0); // Índices de 1 a 12 para bater com o Java
        
        let leu100PaginasPorDia = false;
        let leuLivro500Paginas = false;
        let leuLivro1000Paginas = false;

        // Executa exatamente a lógica do seu arquivo selos.java
        resultados.forEach(meta => {
            const medida = String(meta.medida).toLowerCase();
            const quantidade = parseInt(meta.quantidade) || 0;
            const periodo = String(meta.periodo_d_tempo);
            const genero = meta.genero ? String(meta.genero) : "";

            // Se a medida for Livros (Índice 1 no cadastrar_metas ou palavra 'livros')
            if (medida.includes("livros") || medida === "1") {
                totalLivros += quantidade;
                
                if (genero.includes("Fantasia") || genero === "1") livrosPorGenero[1] += quantidade;
                else if (genero.includes("Ficção científica") || genero === "2") livrosPorGenero[2] += quantidade;
                else if (genero.includes("Romance") || genero === "3") livrosPorGenero[3] += quantidade;
                else if (genero.includes("Mistério") || genero === "4") livrosPorGenero[4] += quantidade;
                else if (genero.includes("Terror") || genero === "5") livrosPorGenero[5] += quantidade;
                else if (genero.includes("Desenvolvimento pessoal") || genero === "6") livrosPorGenero[6] += quantidade;
                else if (genero.includes("Hq") || genero === "7") livrosPorGenero[7] += quantidade;
                else if (genero.includes("Clássico") || genero === "8") livrosPorGenero[8] += quantidade;
                else if (genero.includes("Tecnologia") || genero === "9") livrosPorGenero[9] += quantidade;
                else if (genero.includes("Aventura") || genero === "10") livrosPorGenero[10] += quantidade;
                else if (genero.includes("Poesia") || genero === "11") livrosPorGenero[11] += quantidade;
                else if (genero.includes("Infanto-juvenil") || genero === "12") livrosPorGenero[12] += quantidade;
            } 
            // Se a medida for Páginas (Índice 3 no cadastrar_metas ou palavra 'páginas')
            else if (medida.includes("páginas") || medida === "3") {
                totalPaginas += quantidade;
                
                if (quantidade >= 500) leuLivro500Paginas = true;
                if (quantidade >= 1000) leuLivro1000Paginas = true;
                
                // Se o período for dia (1) e leu >= 100 páginas
                if ((periodo.includes("dia") || periodo === "1") && quantidade >= 100) {
                    leu100PaginasPorDia = true;
                }
            }
        });

        // Monta a lista completa de selos com base nos critérios atingidos
        const listaSelos = [
            { nome: "O Início da Jornada: 1º Livro Concluído!", icon: "fa-baby", conquistado: totalLivros >= 1 },
            { nome: "Leitor Frequente: 5 Livros Lidos!", icon: "fa-book-reader", conquistado: totalLivros >= 5 },
            { nome: "Devorador de Páginas: 10 Livros!", icon: "fa-graduation-cap", conquistado: totalLivros >= 10 },
            { nome: "Rato de Biblioteca: 25 Livros!", icon: "fa-book-atlas", conquistado: totalLivros >= 25 },
            { nome: "Sábio: 50 Livros!", icon: "fa-scroll", conquistado: totalLivros >= 50 },
            { nome: "Lenda da Leitura: 100 Livros!", icon: "fa-dragon", conquistado: totalLivros >= 100 },
            
            { nome: "Maratonista: 1000 Páginas no total!", icon: "fa-stopwatch", conquistado: totalPaginas >= 1000 },
            { nome: "Peso Pesado: Calhamaço de 500 páginas!", icon: "fa-dumbbell", conquistado: leuLivro500Paginas },
            { nome: "O Everest Literário: Livro de 1000 páginas!", icon: "fa-mountain", conquistado: leuLivro1000Paginas },
            { nome: "The Flash: 100 páginas em um único dia!", icon: "fa-bolt", conquistado: leu100PaginasPorDia },

            { nome: "Mestre da Magia: 3 de Fantasia", icon: "fa-wand-magic-sparkles", conquistado: livrosPorGenero[1] >= 3 },
            { nome: "Viajante do Espaço: 3 de Ficção Científica", icon: "fa-rocket", conquistado: livrosPorGenero[2] >= 3 },
            { nome: "Coração Apaixonado: 3 de Romance", icon: "fa-heart", conquistado: livrosPorGenero[3] >= 3 },
            { icon: "fa-magnifying-glass", nome: "Detetive Particular: 3 de Mistério", conquistado: livrosPorGenero[4] >= 3 },
            { icon: "fa-ghost", nome: "Coragem de Aço: 3 de Terror", conquistado: livrosPorGenero[5] >= 3 },
            { icon: "fa-brain", nome: "Mente Evoluída: 3 de Desenv. Pessoal", conquistado: livrosPorGenero[6] >= 3 },
            { icon: "fa-mask", nome: "Mundo de Quadrinhos: 3 HQs", conquistado: livrosPorGenero[7] >= 3 },
            { icon: "fa-landmark", nome: "Clássico Imortal: 1 Clássico da Literatura!", conquistado: livrosPorGenero[8] >= 1 },
            { icon: "fa-microchip", nome: "O Cientista: 3 de Tecnologia", conquistado: livrosPorGenero[9] >= 3 },
            { icon: "fa-compass", nome: "O Mochileiro: 3 de Aventura", conquistado: livrosPorGenero[10] >= 3 },
            { icon: "fa-feather", nome: "Alma de Poeta: 3 de Poesia", conquistado: livrosPorGenero[11] >= 3 },
            { icon: "fa-child", nome: "Espírito Jovem: 3 Infanto-Juvenis", conquistado: livrosPorGenero[12] >= 3 }
        ];

        res.json(listaSelos);
    });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));