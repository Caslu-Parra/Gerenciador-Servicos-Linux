/*
 ### Código mantido por: Lucas Parra / e-mail: lucasparra2@outlook.com

 ### Modificações ###
 - 27/01/2021 - 13:14h - Brasilia Time Zone
 - 11/03/2021 - 16:56 - Brasilia Time Zone
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

window.onload = () => {
    /* 
    Se não houver um cookie com o nome de "user_id" no navegador do usuário, o mesmo será direcionado 
    para a página de autenticação em '/pages/examples/login-v2.html'.  
    */
    if (!Cookies.get('user_id')) {
        alert("Você não está autenticado, informe suas credênciais!");
        window.location.replace('http://' + http_server.ip +':'+ http_server.porta +'/pages/examples/login-v2.html');
    } else {
        /*Caso haja um cookie com o nome "user_id", enviamos uma requisição POST para a rota '/auth/:id'
         rota criada para fins de autenticação de credênciais. */
        $.post('http://'+ gsl_server.ip +':'+ gsl_server.porta +'/auth/' + Cookies.get('user_id'), {

        }).done(function (resultado) {
            /* Caso a resposta, (resultado['message']), da requisição seja true significa que o as 
            credênciais do cookie 'user_id' usada pelo usuário são inválidas.  
            */
            if (resultado['message']) {
                // Removemos o cookie atual usado e o redirecionamos para a página de login.
                Cookies.remove('user_id');
                window.location.replace('http://' + http_server.ip +':'+ http_server.porta +'/pages/examples/login-v2.html');
            }
        }).fail(() => {
            /* Em caso de falha na comunicação nos alertamos o usuário sobre a falha na comunicação 
            e apagamos as credenciais atuais e o redirecionamos a página de login.*/
            Cookies.remove('user_id');
            alert("Não houve resposta, certifique-se que o servidor está ligado.");
            window.location.replace('http://' + http_server.ip +':'+ http_server.porta +'/pages/examples/login-v2.html');
        })
    }
}

/*  ### Função logout()
   
    ### Ação:
    - Encerra a sessão do usuário, com o consentimento do usuário, apagando o cookie 'user_id' 
    e o redirecionando para página de autenticação '/pages/examples/login-v2.html'.
    ### Uso:
    - É chamada quando o usuário clica no elemento <a id='logout'>Encerrrar Sessão</a>.
    */
function logout() {
    if (confirm('Você realmente deseja encerrar a sessão?')) {
        Cookies.remove('user_id');
        window.location.replace('http://' + http_server.ip +':'+ http_server.porta +'/pages/examples/login-v2.html');
    }
}