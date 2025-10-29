let usuarios = [];
let modoEdicao = false;

// Carregar usuários ao iniciar a página
document.addEventListener('DOMContentLoaded', function() {
    carregarUsuarios();
    
    // Event listeners
    document.getElementById('btnNovoUsuario').addEventListener('click', mostrarFormNovo);
    document.getElementById('usuarioForm').addEventListener('submit', salvarUsuario);
});

// Carregar lista de usuários
async function carregarUsuarios() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/cadastro', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await response.json();
        
        if (Array.isArray(data)) {
            usuarios = data;
            renderizarTabela();
        } else {
            const msg = data.message || 'Erro ao carregar usuários';
            alert('Erro ao carregar usuários: ' + msg);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar usuários');
    }
}

// Renderizar tabela de usuários
function renderizarTabela() {
    const tbody = document.getElementById('usuariosBody');
    tbody.innerHTML = '';
    
    usuarios.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>${usuario.telefone}</td>
            <td class="acoes">
                <button onclick="editarUsuario(${usuario.id})" class="btn-editar">✏️</button>
                <button onclick="excluirUsuario(${usuario.id}, '${usuario.nome}')" class="btn-excluir">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Mostrar formulário para novo usuário
function mostrarFormNovo() {
    modoEdicao = false;
    document.getElementById('formTitulo').textContent = 'Adicionar Usuário';
    document.getElementById('usuarioForm').reset();
    document.getElementById('usuarioId').value = '';
    document.getElementById('senha').required = true;
    document.getElementById('senhaHelp').textContent = 'Senha obrigatória para novos usuários';
    document.getElementById('formUsuario').style.display = 'block';
}

// Editar usuário existente
function editarUsuario(id) {
    const usuario = usuarios.find(u => u.id == id);
    if (!usuario) return;
    
    modoEdicao = true;
    document.getElementById('formTitulo').textContent = 'Editar Usuário';
    document.getElementById('usuarioId').value = usuario.id;
    document.getElementById('nome').value = usuario.nome;
    document.getElementById('email').value = usuario.email;
    document.getElementById('telefone').value = usuario.telefone;
    document.getElementById('senha').value = '';
    document.getElementById('senha').required = false;
    document.getElementById('senhaHelp').textContent = 'Deixe em branco para manter a senha atual';
    document.getElementById('formUsuario').style.display = 'block';
}

// Salvar usuário (criar ou editar)
async function salvarUsuario(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const token = localStorage.getItem('token');
    const url = modoEdicao ? '/cadastro/' + document.getElementById('usuarioId').value : '/cadastro';
    const method = modoEdicao ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, { method, body: formData, headers: { 'Authorization': 'Bearer ' + token } });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message || 'Operação realizada com sucesso.');
            cancelarForm();
            carregarUsuarios();
        } else {
            const msg = data.message || (Array.isArray(data.erros) ? data.erros.join(', ') : 'Falha na operação.');
            alert('Erros: ' + msg);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar usuário');
    }
}

// Cancelar formulário
function cancelarForm() {
    document.getElementById('formUsuario').style.display = 'none';
    document.getElementById('usuarioForm').reset();
}

// Excluir usuário
function excluirUsuario(id, nome) {
    document.getElementById('modalConfirmacao').style.display = 'block';
    document.getElementById('nomeUsuarioExcluir').textContent = nome;
    
    document.getElementById('btnConfirmarExclusao').onclick = async function() {
        try {
            const formData = new FormData();
            formData.append('id', id);
            
            const token = localStorage.getItem('token');
        const response = await fetch('/cadastro/' + id, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(data.message || 'Usuário excluído com sucesso.');
                fecharModal();
                carregarUsuarios();
            } else {
                const msg = data.message || (Array.isArray(data.erros) ? data.erros.join(', ') : 'Falha ao excluir.');
                alert('Erros: ' + msg);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao excluir usuário');
        }
    };
}

// Fechar modal de confirmação
function fecharModal() {
    document.getElementById('modalConfirmacao').style.display = 'none';
}