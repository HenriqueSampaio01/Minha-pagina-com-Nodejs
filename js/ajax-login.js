 // Função para obter parâmetros da URL
 function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  // Exibir mensagens de erro se existirem
  window.onload = function() {
    const erro = getUrlParameter('erro');
    const sucesso = getUrlParameter('sucesso');
    const mensagemDiv = document.getElementById('mensagem-usuario');
    
    if (erro) {
      let mensagem = '';
      switch(erro) {
        case 'credenciais_invalidas':
          mensagem = 'E-mail ou senha incorretos';
          break;
        case 'erro_banco':
          mensagem = 'Erro no banco de dados. Tente novamente.';
          break;
        default:
          mensagem = erro;
      }
      
      mensagemDiv.innerHTML = mensagem;
      mensagemDiv.className = 'mensagem erro';
    }
    
    if (sucesso) {
      mensagemDiv.innerHTML = 'Cadastro realizado com sucesso! Faça seu login.';
      mensagemDiv.className = 'mensagem sucesso';
    }
  };

// Adicionar evento de submit ao formulário de login
document.addEventListener('DOMContentLoaded', function() {
  const formLogin = document.querySelector('form[action="login.php"]');
  if (formLogin) {
    formLogin.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const mensagemDiv = document.getElementById('mensagem-usuario');
      
      // Limpar mensagens anteriores
      mensagemDiv.innerHTML = '';
      mensagemDiv.className = 'mensagem';
      
      fetch('/php/login.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.sucesso) {
          mensagemDiv.innerHTML = data.mensagem + '<br><a href="' + data.redirect + '" class="btn-redirect">Acessar Área Restrita</a>';
          mensagemDiv.className = 'mensagem sucesso';
          
          // Limpar formulário após sucesso
          formLogin.reset();
          
          // NÃO redirecionar automaticamente - deixar o usuário escolher
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
  }
});