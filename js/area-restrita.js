document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o usuário está logado
    verificarSessao();
    
    // Configura o botão de logout
    document.getElementById('btn-logout').addEventListener('click', fazerLogout);
});

function verificarSessao() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    // Valida token chamando uma rota protegida
    fetch('/cadastro', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(resp => {
        if (resp.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return null;
        }
        return resp.json();
    })
    .then(() => {
        const nome = localStorage.getItem('nomeUsuario') || 'Usuário';
        mostrarBemVindo(nome);
    })
    .catch(() => {
        window.location.href = 'login.html';
    });
}

function mostrarBemVindo(nome) {
    const bemVindoDiv = document.getElementById('bem-vindo');
    bemVindoDiv.innerHTML = `
        <h3>Bem-vindo, ${nome}!</h3>`;
}

function fazerLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('nomeUsuario');
    window.location.href = 'login.html';
}