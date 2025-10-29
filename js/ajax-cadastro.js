document.getElementById('formCadastro').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const mensagemDiv = document.getElementById('mensagem-usuario');
    
    // Limpar mensagens anteriores
    mensagemDiv.innerHTML = '';
    mensagemDiv.className = 'mensagem';
    
    fetch('/cadastro', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        mensagemDiv.innerHTML = (data.message || 'Cadastro realizado com sucesso!') + '<br><a href="login.html" class="btn-login">Ir para Login</a>';
        mensagemDiv.className = 'mensagem sucesso';
        
       
        document.getElementById('formCadastro').reset();
        
        
      } else {
        const errorText = data.message || (Array.isArray(data.erros) ? data.erros.join(', ') : 'Falha ao cadastrar.');
        mensagemDiv.innerHTML = errorText;
        mensagemDiv.className = 'mensagem erro';
      }
    })
    .catch(error => {
      mensagemDiv.innerHTML = 'Erro ao processar requisição. Tente novamente.';
      mensagemDiv.className = 'mensagem erro';
    });
  });