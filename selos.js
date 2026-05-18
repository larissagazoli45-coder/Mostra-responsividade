const URL_SELOS = "http://localhost:3000/api/selos";
const usuarioLogado = localStorage.getItem("usuarioLogado");

async function carregarGaleriaSelos() {
    const gridSelos = document.getElementById('grid-selos');
    if (!usuarioLogado) { window.location.href = "index.html"; return; }

    try {
        const resposta = await fetch(`${URL_SELOS}?usuario=${usuarioLogado}`);
        if (!resposta.ok) throw new Error("Erro de comunicação com o servidor.");

        const dadosSelos = await resposta.json();
        gridSelos.innerHTML = '';

        dadosSelos.forEach(selo => {
            const card = document.createElement('div');
            
            // Se o usuário conquistou, usa a classe padrão, se não, aplica o visual bloqueado (cinza)
            if (selo.conquistado) {
                card.className = 'card-meta';
                card.innerHTML = `
                    <div class="icon-container" style="color: #10B981;"><i class="fa-solid ${selo.icon}"></i></div>
                    <h3 style="color: #10B981; font-size: 1.1rem; text-align:center;">${selo.nome}</h3>
                    <p class="status-concluido" style="text-align:center; margin-top:10px;"><i class="fa-solid fa-circle-check"></i> Conquistado</p>
                `;
            } else {
                card.className = 'card-meta card-selo-bloqueado';
                card.innerHTML = `
                    <div class="icon-container" style="color: #9CA3AF;"><i class="fa-solid ${selo.icon}"></i></div>
                    <h3 style="color: #4B5563; font-size: 1.1rem; text-align:center;">${selo.nome}</h3>
                    <p class="status-bloqueado" style="text-align:center; margin-top:10px;"><i class="fa-solid fa-lock"></i> Bloqueado</p>
                `;
            }
            
            gridSelos.appendChild(card);
        });

        document.getElementById('nome-usuario').textContent = usuarioLogado;

    } catch (erro) {
        console.error(erro);
        gridSelos.innerHTML = `<p style="color: red; font-weight: bold;">Falha ao computar os selos.</p>`;
    }
}

window.onload = carregarGaleriaSelos;