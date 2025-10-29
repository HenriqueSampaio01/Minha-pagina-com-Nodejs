document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o usuário está logado
    verificarSessao();
    
    // Configura o botão de logout
    document.getElementById('btn-logout').addEventListener('click', fazerLogout);
});

function verificarSessao() {
    fetch('/php/verifica-sessao.php')
        .then(response => response.json())
        .then(data => {
            if (data.logado) {
                // Usuário está logado, mostrar nome
                mostrarBemVindo(data.usuario.nome);
            } else {
                // Usuário não está logado, redirecionar
                window.location.href = data.redirect;
            }
        })
        .catch(error => {
            console.error('Erro ao verificar sessão:', error);
            window.location.href = 'login.html';
        });
}

function mostrarBemVindo(nome) {
    const bemVindoDiv = document.getElementById('bem-vindo');
    bemVindoDiv.innerHTML = `
        <h3>Bem-vindo, ${nome}!</h3>`;
}

function fazerLogout() {
    fetch('/php/logout.php', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            alert(data.mensagem);
            window.location.href = data.redirect;
        }
    })
    .catch(error => {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
    });
}