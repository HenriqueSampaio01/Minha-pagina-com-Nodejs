document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formMensagem');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/php/salvar-mensagem.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.sucesso) {
                mostrarMensagemSucesso(data.mensagem);
                form.reset();
            } else {
                mostrarMensagemErro(data.erros.join(', '));
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarMensagemErro('Erro ao enviar mensagem. Tente novamente.');
        }
    });
});

function mostrarMensagemSucesso(mensagem) {
    const sucesso = document.getElementById('mensagemSucesso');
    const erro = document.getElementById('mensagemErro');
    
    sucesso.textContent = mensagem;
    sucesso.style.display = 'block';
    erro.style.display = 'none';
    
    setTimeout(() => {
        sucesso.style.display = 'none';
    }, 5000);
}

function mostrarMensagemErro(mensagem) {
    const sucesso = document.getElementById('mensagemSucesso');
    const erro = document.getElementById('mensagemErro');
    
    erro.textContent = mensagem;
    erro.style.display = 'block';
    sucesso.style.display = 'none';
    
    setTimeout(() => {
        erro.style.display = 'none';
    }, 5000);
}