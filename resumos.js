const URL_RESUMOS = "http://localhost:3000/api/resumos";
const usuarioLogado = localStorage.getItem("usuarioLogado");

async function carregarResumos() {
    const gridResumos = document.getElementById('grid-resumos');
    if (!usuarioLogado) { window.location.href = "index.html"; return; }

    try {
        const resposta = await fetch(`${URL_RESUMOS}?usuario=${usuarioLogado}`);
        if (!resposta.ok) throw new Error("Erro na resposta do servidor");
        
        const resumos = await resposta.json();
        gridResumos.innerHTML = '';

        if (resumos.length === 0) {
            gridResumos.innerHTML = '<p>Nenhum resumo cadastrado. Clique em "+ Novo Resumo" para registrar o primeiro!</p>';
            return;
        }

        resumos.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card-meta'; // Reutiliza as caixas visuais padronizadas do style.css
            card.innerHTML = `
                <h3>${item.titulo || 'Sem Título'}</h3>
                <p style="white-space: pre-wrap; margin-top: 10px; color: #374151; line-height: 1.5;">${item.resumo}</p>
                
                <div class="card-acoes" style="margin-top: 20px; display: flex; justify-content: flex-end;">
                    <button class="btn-card-deletar" onclick="excluirResumo(${item.id_resumo})" style="max-width: 125px;"><i class="fa-solid fa-trash-can"></i> Excluir</button>
                </div>
            `;
            gridResumos.appendChild(card);
        });

        document.getElementById('nome-usuario').textContent = usuarioLogado;

    } catch (erro) {
        console.error(erro);
        gridResumos.innerHTML = `<p style="color: red;">Erro ao carregar os resumos salvos.</p>`;
    }
}

function abrirModalResumo() {
    document.getElementById('resumo-titulo').value = '';
    document.getElementById('resumo-conteudo').value = '';
    document.getElementById('modal-resumo').style.display = 'flex';
}

function fecharModalResumo() {
    document.getElementById('modal-resumo').style.display = 'none';
}

async function salvarResumo() {
    const novoResumo = {
        usu: usuarioLogado,
        titulo: document.getElementById('resumo-titulo').value.trim(),
        resumo: document.getElementById('resumo-conteudo').value.trim()
    };

    if (!novoResumo.titulo || !novoResumo.resumo) {
        alert("Por favor, preencha o título e o corpo do resumo antes de salvar!");
        return;
    }

    try {
        const resposta = await fetch(URL_RESUMOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoResumo)
        });

        if (resposta.ok) {
            alert("Resumo salvo com sucesso!");
            fecharModalResumo();
            carregarResumos(); // Atualiza a tela instantaneamente
        } else {
            alert("Falha ao salvar o registro no MySQL.");
        }
    } catch (erro) {
        alert("O servidor Node.js está offline.");
    }
}

async function excluirResumo(idResumo) {
    if (confirm("Você tem certeza que deseja excluir permanentemente este resumo literário?")) {
        try {
            const resposta = await fetch(`${URL_RESUMOS}/${idResumo}`, {
                method: 'DELETE'
            });

            if (resposta.ok) {
                alert("Resumo deletado do sistema!");
                carregarResumos();
            } else {
                alert("Erro ao tentar remover do banco de dados.");
            }
        } catch (erro) {
            alert("Erro na conexão da rede.");
        }
    }
}

window.onload = carregarResumos;