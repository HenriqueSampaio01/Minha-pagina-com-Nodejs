let mensagens = [];
let filtroAtivo = 'todas';
let mensagemAtual = null;

document.addEventListener('DOMContentLoaded', function() {
    carregarMensagens();
    
    // Event listeners para filtros
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.dataset.filtro;
            ativarFiltro(filtro);
        });
    });
    
    // Event listeners para modal
    document.getElementById('btnMarcarLida').addEventListener('click', marcarComoLida);
    document.getElementById('btnExcluirMensagem').addEventListener('click', excluirMensagem);
});

async function carregarMensagens() {
    try {
        const response = await fetch('/php/listar-mensagens.php');
        const data = await response.json();
        
        if (data.sucesso) {
            mensagens = data.mensagens;
            atualizarEstatisticas();
            renderizarMensagens();
        } else {
            alert('Erro ao carregar mensagens: ' + data.erros.join(', '));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar mensagens');
    }
}

function atualizarEstatisticas() {
    const total = mensagens.length;
    const naoLidas = mensagens.filter(m => !m.lida).length;
    const respondidas = mensagens.filter(m => m.respondida).length;
    
    document.getElementById('totalMensagens').textContent = total;
    document.getElementById('mensagensNaoLidas').textContent = naoLidas;
    document.getElementById('mensagensRespondidas').textContent = respondidas;
}

function ativarFiltro(filtro) {
    filtroAtivo = filtro;
    
    // Atualizar botões
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.classList.remove('ativo');
        if (btn.dataset.filtro === filtro) {
            btn.classList.add('ativo');
        }
    });
    
    renderizarMensagens();
}

function renderizarMensagens() {
    const container = document.getElementById('mensagensLista');
    container.innerHTML = '';
    
    let mensagensFiltradas = mensagens;
    
    switch(filtroAtivo) {
        case 'nao-lidas':
            mensagensFiltradas = mensagens.filter(m => !m.lida);
            break;
        case 'respondidas':
            mensagensFiltradas = mensagens.filter(m => m.respondida);
            break;
    }
    
    if (mensagensFiltradas.length === 0) {
        container.innerHTML = '<p class="sem-mensagens">Nenhuma mensagem encontrada.</p>';
        return;
    }
    
    mensagensFiltradas.forEach(mensagem => {
        const card = criarCardMensagem(mensagem);
        container.appendChild(card);
    });
}

function criarCardMensagem(mensagem) {
    const card = document.createElement('div');
    card.className = `mensagem-card ${mensagem.lida ? 'lida' : 'nao-lida'}`;
    
    const data = new Date(mensagem.data_envio).toLocaleDateString('pt-BR');
    const hora = new Date(mensagem.data_envio).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    
    card.innerHTML = `
        <div class="mensagem-header">
            <h3>${mensagem.nome}</h3>
            <span class="data">${data} às ${hora}</span>
        </div>
        <div class="mensagem-preview">
            ${mensagem.mensagem.substring(0, 100)}${mensagem.mensagem.length > 100 ? '...' : ''}
        </div>
        <div class="mensagem-footer">
            ${mensagem.email ? `<span class="email">${mensagem.email}</span>` : ''}
            <div class="acoes">
                <button onclick="visualizarMensagem(${mensagem.id})" class="btn-ver">👁️ Ver</button>
                ${!mensagem.lida ? '<span class="badge-nova">NOVA</span>' : ''}
            </div>
        </div>
    `;
    
    return card;
}

function visualizarMensagem(id) {
    const mensagem = mensagens.find(m => m.id == id);
    if (!mensagem) return;
    
    mensagemAtual = mensagem;
    
    document.getElementById('modalTitulo').textContent = `Mensagem de ${mensagem.nome}`;
    document.getElementById('modalNome').textContent = mensagem.nome;
    document.getElementById('modalEmail').textContent = mensagem.email || 'Não informado';
    document.getElementById('modalData').textContent = new Date(mensagem.data_envio).toLocaleString('pt-BR');
    document.getElementById('modalConteudo').textContent = mensagem.mensagem;
    
    // Mostrar/esconder botão de marcar como lida
    const btnLida = document.getElementById('btnMarcarLida');
    if (mensagem.lida) {
        btnLida.style.display = 'none';
    } else {
        btnLida.style.display = 'inline-block';
    }
    
    document.getElementById('modalMensagem').style.display = 'block';
}

async function marcarComoLida() {
    if (!mensagemAtual) return;
    
    try {
        const formData = new FormData();
        formData.append('id', mensagemAtual.id);
        
        const response = await fetch('/php/marcar-mensagem-lida.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
            mensagemAtual.lida = true;
            atualizarEstatisticas();
            renderizarMensagens();
            document.getElementById('btnMarcarLida').style.display = 'none';
            alert('Mensagem marcada como lida!');
        } else {
            alert('Erro: ' + data.erros.join(', '));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao marcar mensagem como lida');
    }
}

async function excluirMensagem() {
    if (!mensagemAtual) return;
    
    if (!confirm(`Tem certeza que deseja excluir a mensagem de ${mensagemAtual.nome}?`)) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('id', mensagemAtual.id);
        
        const response = await fetch('/php/excluir-mensagem.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
            mensagens = mensagens.filter(m => m.id != mensagemAtual.id);
            atualizarEstatisticas();
            renderizarMensagens();
            fecharModal();
            alert('Mensagem excluída com sucesso!');
        } else {
            alert('Erro: ' + data.erros.join(', '));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir mensagem');
    }
}

function fecharModal() {
    document.getElementById('modalMensagem').style.display = 'none';
    mensagemAtual = null;
}