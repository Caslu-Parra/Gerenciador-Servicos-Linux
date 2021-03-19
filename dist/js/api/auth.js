/*
 ### Código mantido por: Lucas Parra / e-mail: lucasparra2@outlook.com

 ### Modificações ###
 - 27/01/2021 - 13:53h - Brasilia Time Zone
 - 11/03/2021 - 15:56 - Brasilia Time Zone
 - 19/03/2021 - 15:36 - Brasilia Time Zone 

 ### Última modificação : - 19/03/2021 - 15:36 - Brasilia Time Zone 

*/

/* Atribuição de valores aos atributos do objeto http_server */
var http_server = {
    porta: 9080,
    ip: "192.168.15.24"
}
/* Atribuição de valores aos atributos do objeto gsl_server */

var gsl_server = {
    porta: 3000,
    ip: "192.168.15.5"
}

/* 
    Se já houver um cookie com o nome de "user_id" no navegador do usuário, o mesmo será direcionado
    para a página principal em '/index.html' 
*/
if (Cookies.get('user_id')) {
    setInterval(() => { window.location.replace('http://' + http_server.ip +':'+ http_server.porta +'/index.html'); }, 500);
}

/*  ### Função Login()
    ### Ação:
    - Recebe as credênciais de um usuário via um formulário.
      |__ Recebe usarname.
      |__ Recebe senha (hasheada com 256).

    - Faz uma requisição de autenticação de credênciais, via POST, com os valores recebidos para API.
      |__ Se a autenticação for válida, usuário é redirecionado e recebe um cookie que permite acesso ao conteúdo do site.
      |__ Se a autenticação for não válida, usuário recebe uma mensagem de credênciais inválidas.
    
    ### Uso:
    - É chamada quando o usuário desejar iniciar uma sessão.  
*/
function login() {
    $.post('http://'+ gsl_server.ip +':'+ gsl_server.porta +'/login/', {
        user: username.value,
        senha: sha256(`${userpasswd.value}`),
    }).done(function (resultado) {

        if (resultado['message']) {
            alert(resultado['message']);
        }

        if (resultado['user_id']) {
            Cookies.set('user_id', resultado['user_id'])
            setInterval(() => { window.location.replace('http://' + http_server.ip +':'+ http_server.porta +'/index.html'); }, 1000);
        }
        // Em caso de falha na requisição via POST, informamos uma falha na conexão com o servidor ao usuário.
    }).fail(() => { alert("Não houve resposta, certifique-se que o servidor está ligado.") })

}

/*  ### Função Registrar()
    ### Ação:
    - Recebe as credênciais de um usuário via um formulário.
      |__ Recebe usarname.
      |__ Recebe senha (hasheada com 256).

    - Faz uma requisição para criar novas credênciais válidas, via POST, com os valores recebidos para API.
      |__ Se a requisição for aceita, um novo é usuário, redirecionado e recebe um cookie que permite acesso ao conteúdo do site.
      |__ Se a requisição não for aceita, usuário recebe uma mensagem dizendo que já há uma conta existente.  
    
    ### Uso:
    - É chamada quando o usuário desejar criar uma nova conta. 
*/
function registrar() {
    if (userpasswd.value != userpasswd2.value) {
        alert("Senhas não estão de acordo!");
    } else {
        $.post('http://'+ gsl_server.ip +':'+ gsl_server.porta +'/registrar/', {
            user: username.value,
            senha: userpasswd.value,
        }).done(function (resultado) {
            if (resultado['message'] == 1) {
                alert(username.value + " foi registrado!");
                window.location.replace('http://' + http_server.ip +':'+ http_server.porta +'/index.html');
            } else {
                alert(resultado['message']);
                window.location.replace('http://' + http_server.ip +':'+ http_server.porta +'/index.html');
            }
            // Em caso de falha na requisição via POST, informamos uma falha na conexão com o servidor ao usuário.
        }).fail(() => { alert("Não houve resposta, certifique-se que o servidor está ligado.") })
    }
}