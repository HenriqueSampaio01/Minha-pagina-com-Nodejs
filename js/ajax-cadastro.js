document.getElementById('formCadastro').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const mensagemDiv = document.getElementById('mensagem-usuario');
    
    // Limpar mensagens anteriores
    mensagemDiv.innerHTML = '';
    mensagemDiv.className = 'mensagem';
    
    fetch('/php/cadastro.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.sucesso) {
        mensagemDiv.innerHTML = data.mensagem + '<br><a href="login.html" class="btn-login">Ir para Login</a>';
        mensagemDiv.className = 'mensagem sucesso';
        
       
        document.getElementById('formCadastro').reset();
        
        
      } else {
        let errosHtml = '<ul>';
        data.erros.forEach(erro => {
          errosHtml += `<li>${erro}</li>`;
        });
        errosHtml += '</ul>';
        
        mensagemDiv.innerHTML = errosHtml;
        mensagemDiv.className = 'mensagem erro';
      }
    })
    .catch(error => {
      mensagemDiv.innerHTML = 'Erro ao processar requisição. Tente novamente.';
      mensagemDiv.className = 'mensagem erro';
    });
  });