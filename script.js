const URL_API = "http://localhost:3000/api/metas";
const URL_SELOS = "http://localhost:3000/api/selos";
const usuarioLogado = localStorage.getItem("usuarioLogado");

let idMetaEmEdicao = null; 
let listaMetasLocal = []; 

// Função que roda assim que a página abre
async function inicializarPainel() {
    if (!usuarioLogado) { window.location.href = "index.html"; return; }
    
    document.getElementById('nome-usuario').textContent = usuarioLogado;
    await carregarMetas();
    await sincronizarSelosAntigos(); // Guarda os selos antigos para não repetir alertas
}

async function carregarMetas() {
    const gridMetas = document.getElementById('grid-metas');
    try {
        const reply = await fetch(`${URL_API}?usuario=${usuarioLogado}`);
        if (!reply.ok) throw new Error("Erro na resposta do servidor");
        
        listaMetasLocal = await reply.json(); 
        gridMetas.innerHTML = '';

        if (listaMetasLocal.length === 0) {
            gridMetas.innerHTML = '<p>Nenhuma meta encontrada. Clique em "+ Nova Meta" para começar!</p>';
            return;
        }

        listaMetasLocal.forEach(meta => {
            const dataInicioFormatada = meta.dia_comecou ? new Date(meta.dia_comecou).toLocaleDateString('pt-BR') : 'Sem data';
            const dataFimFormatada = meta.dia_terminou ? new Date(meta.dia_terminou).toLocaleDateString('pt-BR') : 'Sem data';
            
            let textoStatus = "Desconhecido";
            if (meta.status == 1) textoStatus = "Concluída";
            else if (meta.status == 2) textoStatus = "Em andamento";
            else if (meta.status == 3) textoStatus = "Não iniciada";

            const card = document.createElement('div');
            card.className = 'card-meta';
            card.innerHTML = `
                <h3>${meta.nome_meta || 'Sem Título'}</h3>
                <p><i class="fa-solid fa-book"></i> <strong>Obra:</strong> ${meta.nome_obras}</p>
                <p><i class="fa-solid fa-user-pen"></i> <strong>Autor:</strong> ${meta.nome_autor}</p>
                <p><i class="fa-solid fa-calendar-days"></i> <strong>Período:</strong> ${dataInicioFormatada} até ${dataFimFormatada}</p>
                <p><strong>Status:</strong> ${textoStatus}</p>
                <div class="card-acoes" style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn-card-editar" onclick="prepararEdicao(${meta.id_meta})"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                    <button class="btn-card-deletar" onclick="excluirMeta(${meta.id_meta})"><i class="fa-solid fa-trash-can"></i> Excluir</button>
                </div>
            `;
            gridMetas.appendChild(card);
        });
    } catch (erro) {
        console.error(erro);
        gridMetas.innerHTML = `<p style="color: red;">Erro ao carregar as metas!</p>`;
    }
}

// --- EQUIVALENTE AO JOptionPane.showMessageDialog DO JAVA ---
function jOptionPane(titulo, mensagem, iconeFa) {
    const modalAviso = document.createElement('div');
    modalAviso.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;";
    
    const caixaDialogo = document.createElement('div');
    caixaDialogo.style = "background: #F0F0F0; border: 2px solid #A0A0A0; box-shadow: 4px 4px 12px rgba(0,0,0,0.3); width: 420px; display: flex; flex-direction: column; border-radius: 4px;";
    
    // Barra de Título Cinza Azulada Clássica do Java Swing
    const barraTitulo = document.createElement('div');
    barraTitulo.style = "background: linear-gradient(to bottom, #76A5AF, #45818E); color: white; padding: 6px 12px; font-weight: bold; font-size: 0.85rem; border-bottom: 1px solid #315B63;";
    barraTitulo.innerHTML = `<span>${titulo}</span>`;
    
    // Corpo da mensagem
    const corpoConteudo = document.createElement('div');
    corpoConteudo.style = "padding: 20px; display: flex; gap: 15px; align-items: center; background: #FFFFFF;";
    corpoConteudo.innerHTML = `
        <div style="font-size: 2.8rem; color: #10B981;"><i class="fa-solid ${iconeFa}"></i></div>
        <div style="color: #1F2937; font-size: 0.95rem; line-height: 1.4; white-space: pre-wrap; font-weight: 500;">${mensagem}</div>
    `;
    
    // Área do Botão OK centralizado
    const areaBotao = document.createElement('div');
    areaBotao.style = "padding: 10px; display: flex; justify-content: center; background: #F0F0F0; border-top: 1px solid #E0E0E0;";
    
    const botaoOk = document.createElement('button');
    botaoOk.innerText = "OK";
    botaoOk.style = "padding: 5px 25px; min-width: 85px; font-weight: bold; cursor: pointer; background: #E1E1E1; border: 1px solid #ADADAD; border-radius: 3px; box-shadow: inset 0 1px 0 white;";
    botaoOk.onclick = () => document.body.removeChild(modalAviso);
    
    areaBotao.appendChild(botaoOk);
    caixaDialogo.appendChild(barraTitulo);
    caixaDialogo.appendChild(corpoConteudo);
    caixaDialogo.appendChild(areaBotao);
    modalAviso.appendChild(caixaDialogo);
    document.body.appendChild(modalAviso);
    
    botaoOk.focus(); // Dá foco automático no botão OK
}

// Guarda no navegador os selos que o usuário já tinha ganhado antes para não ficar repetindo o aviso
async function sincronizarSelosAntigos() {
    try {
        const resposta = await fetch(`${URL_SELOS}?usuario=${usuarioLogado}`);
        if (resposta.ok) {
            const selos = await resposta.json();
            const jaConquistados = selos.filter(s => s.conquistado).map(s => s.nome);
            localStorage.setItem("selosHistorico", JSON.stringify(jaConquistados));
        }
    } catch (e) { console.error("Erro ao sincronizar histórico de selos:", e); }
}

// Checa em tempo real se a ação atual liberou alguma conquista nova!
async function checarNovosSelosGanhos() {
    try {
        const resposta = await fetch(`${URL_SELOS}?usuario=${usuarioLogado}`);
        if (!resposta.ok) return;

        const selosAtuais = await resposta.json();
        
        // Puxa o histórico de selos que ele já tinha antes do clique
        let historico = JSON.parse(localStorage.getItem("selosHistorico")) || [];
        let novasConquistas = [];

        selosAtuais.forEach(selo => {
            // Se o selo está conquistado agora, mas NÃO estava no histórico antigo... DESBLOQUEOU AGORA!
            if (selo.conquistado && !historico.includes(selo.nome)) {
                novasConquistas.push(selo);
                historico.push(selo.nome); // Adiciona ao histórico para não repetir
            }
        });

        // Atualiza o histórico no navegador
        localStorage.setItem("selosHistorico", JSON.stringify(historico));

        // Dispara o JOptionPane para cada nova conquista igualzinho ao seu selos.java!
        novasConquistas.forEach(selo => {
            jOptionPane(
                "Novo Selo Desbloqueado!", 
                `PARABÉNS! Você acabou de desbloquear um novo selo:\n\n⭐ ${selo.nome}`, 
                selo.icon
            );
        });

    } catch (erro) { console.error("Erro ao verificar novas medalhas:", erro); }
}

// --- FUNÇÕES DE CONTROLE DA JANELA POP-UP (MODAL) ---
function abrirModalNovaMeta() {
    idMetaEmEdicao = null;
    document.getElementById('modal-meta').querySelector('h2').innerText = "Cadastrar Nova Meta";
    document.getElementById('nova-nome').value = '';
    document.getElementById('nova-obra').value = '';
    document.getElementById('novo-autor').value = '';
    document.getElementById('nova-data-inicio').value = '';
    document.getElementById('nova-data-fim').value = '';
    document.getElementById('modal-meta').style.display = 'flex';
}

function fecharModal() { document.getElementById('modal-meta').style.display = 'none'; }

function prepararEdicao(idMeta) {
    idMetaEmEdicao = idMeta;
    const metaSelecionada = listaMetasLocal.find(m => m.id_meta === idMeta);
    if (metaSelecionada) {
        document.getElementById('modal-meta').querySelector('h2').innerText = "Alterar Informações da Meta";
        document.getElementById('nova-nome').value = metaSelecionada.nome_meta;
        document.getElementById('nova-obra').value = metaSelecionada.nome_obras;
        document.getElementById('novo-autor').value = metaSelecionada.nome_autor;
        document.getElementById('nova-data-inicio').value = metaSelecionada.dia_comecou.split('T')[0];
        document.getElementById('nova-data-fim').value = metaSelecionada.dia_terminou.split('T')[0];
        document.getElementById('nova-medida').value = metaSelecionada.medida;
        document.getElementById('nova-quant').value = metaSelecionada.quantidade;
        document.getElementById('novo-genero').value = metaSelecionada.genero;
        document.getElementById('novo-periodo').value = metaSelecionada.periodo_d_tempo;
        document.getElementById('novo-status').value = metaSelecionada.status;
        document.getElementById('modal-meta').style.display = 'flex';
    }
}

async function salvarMeta() {
    const novaMeta = {
        usu: usuarioLogado,
        nome_meta: document.getElementById('nova-nome').value,
        nome_obras: document.getElementById('nova-obra').value,
        nome_autor: document.getElementById('novo-autor').value,
        dia_comecou: document.getElementById('nova-data-inicio').value,
        dia_terminou: document.getElementById('nova-data-fim').value,
        medida: document.getElementById('nova-medida').value,
        quantidade: document.getElementById('nova-quant').value,
        genero: document.getElementById('novo-genero').value,
        periodo_d_tempo: document.getElementById('novo-periodo').value,
        status: document.getElementById('novo-status').value
    };

    if (!novaMeta.nome_meta || !novaMeta.nome_obras || !novaMeta.dia_comecou) {
        alert("Preencha os campos obrigatórios!");
        return;
    }

    try {
        let url = URL_API;
        let metodoHTTP = 'POST';

        if (idMetaEmEdicao !== null) {
            url = `${URL_API}/${idMetaEmEdicao}`;
            metodoHTTP = 'PUT';
        }

        const resposta = await fetch(url, {
            method: metodoHTTP,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaMeta)
        });

        if (resposta.ok) {
            fecharModal();
            await carregarMetas();
            
            // A MÁGICA ACONTECE AQUI: Assim que salva a meta, checa se ganhou selo novo!
            await checarNovosSelosGanhos(); 
        } else {
            alert("Erro ao processar requisição no banco de dados.");
        }
    } catch (erro) { alert("O servidor Node.js está offline."); }
}

async function excluirMeta(idMeta) {
    if (confirm("Você tem certeza absoluta que deseja excluir esta meta de leitura?")) {
        try {
            const resposta = await fetch(`${URL_API}/${idMeta}`, { method: 'DELETE' });
            if (resposta.ok) {
                carregarMetas();
                await checarNovosSelosGanhos(); // Recalcula se perder uma meta concluída
            } else { alert("Erro ao tentar deletar a meta."); }
        } catch (erro) { alert("Falha de comunicação com o servidor."); }
    }
}

window.onload = inicializarPainel;