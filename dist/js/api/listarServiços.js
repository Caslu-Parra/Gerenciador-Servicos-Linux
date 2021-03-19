/* INFO
### Código mantido por: Lucas Parra / e-mail: lucasparra2@outlook.com

### Modificações ###
- 27/01/2021 - 15:41h - Brasilia Time Zone
- 11/03/2021 - 18:10 - Brasilia Time Zone
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

/*  ### Função stt_servico()
    ### Ação:
     - Atualiza o estado de um serviço em específico ou todos da tabela de serviços.
      |
      |__ Limpa os campos e informa o novo estado do(s) os serviço(s).
    
    - Faz uma requisição, via POST, passando um paramêtro no final do endereço URL.
      |__ O paramêtro passado é o valor do cookie "user_id".
      |
      |__ O paramêtro é usado para realizar uma autenticação, que será aceita ou não pelo servidor.
        |
        |__ Se não for aceito, o usuário será direcionado para a 
        |   página de autenticação e seu cookie atual('user_id') será apagado.
        |
        |__ Se for aceito, a tabela de serviços, ou somente um unico serviço selecionado 
        |   será atualizado.

    ### Uso:
    - Sua função é atualizar o estado atual de todos ou de um determinado serviço..  
*/
function stt_servico(servico) {
  $.get('http://' + gsl_server.ip + ':' + gsl_server.porta + '/listar/geral/' + servico + '/' + Cookies.get('user_id'), {

  }).done(function (resultado) {

    $('#root' + servico.toUpperCase()).empty();
    $('#root' + servico.toUpperCase()).append("<td> <a class='btn btn-tool'> <i class='fas fa-bars' style='font-size:16px' data-toggle='modal' data-target='#modalInfo'></i> </a>");
    // Nome do serviço
    if (servico == 'ssh') {
      $('#root' + servico.toUpperCase()).append("<td> <a> openssh-server </a> <br> <small> SSH </small> </td>");
    } else if (servico == 'dhcp') {
      $('#root' + servico.toUpperCase()).append("<td> <a> isc-dhcp-server </a> <br> <small> DHCP </small> </td>");
    } else if (servico == 'dns') {
      $('#root' + servico.toUpperCase()).append("<td> <a> bind9 </a> <br> <small> DNS </small> </td>");
    } else if (servico == 'smb') {
      $('#root' + servico.toUpperCase()).append("<td> <a> samba </a> <br> <small> Servidor de arquivos </small> </td>");
    }
    // Arquivo de config
    if (resultado['status'] == 1) {
      if (servico == 'ssh') {
        $('#root' + servico.toUpperCase()).append("<td> <ul class='list-inline'> <li class='list-inline-item'> /etc/ssh/sshd_config </li> </ul> </td>");
      } else if (servico == 'dhcp') {
        $('#root' + servico.toUpperCase()).append("<td> <ul class='list-inline'> <li class='list-inline-item'> /etc/dhcp/dhcpd.conf  </li> </ul> </td>");
      } else if (servico == 'dns') {
        $('#root' + servico.toUpperCase()).append("<td> <ul class='list-inline'> <li class='list-inline-item'> /etc/bind/named.conf.options </li> </ul> </td>");
      } else if (servico == 'smb') {
        $('#root' + servico.toUpperCase()).append("<td> <ul class='list-inline'> <li class='list-inline-item'> /etc/samba/smb.conf </li> </ul> </td>");
      }
    } else {
      $('#root' + servico.toUpperCase()).append("<td> <ul class='list-inline'> <li class='list-inline-item'> <ion-icon name='ban' size='large'></ion-icon> </li> </ul> </td>");
    }
    // Versão do serviço
    if (resultado['versao'] != 0) {
      $('#root' + servico.toUpperCase()).append("<td> <span>" + resultado['versao'] + "</span> </td>");
    } else {
      $('#root' + servico.toUpperCase()).append("<td> <span> <ion-icon name='ban' size='large'></ion-icon> </span> </td>");
    }
    // Estado atual, instalado/nao instalado.
    if (resultado['status'] == 1) {
      $('#root' + servico.toUpperCase()).append("<td id='sshpurge'> <span class='badge badge-success btn' style='font-size: 14px;'> Instalado </span> </td>");
    } else {
      $('#root' + servico.toUpperCase()).append("<td id='sshinstall'> <span class='badge badge-danger btn' style='font-size: 14px;'> Não instalado </span> </td>");
    }
    // Btn Ações, Instalar/Desinstalar
    if (resultado['status'] == 1) {
      $('#root' + servico.toUpperCase()).append("<td class='project-actions text-left'> <a class='btn btn-danger btn-sm' onclick=purge('"+ servico +"')> <ion-icon name='cloud-download'></ion-icon> Desinstalar </a> </td>");
    } else {
      $('#root' + servico.toUpperCase()).append("<td class='project-actions text-left'> <a class='btn btn-info btn-sm' onclick=install('"+ servico +"')> <ion-icon name='cloud-upload'></ion-icon> Instalar </a> </td>");
    }

  }).fail(() => {
    // Em caso de falha na requisição via POST, informamos uma falha na conexão com o servidor ao usuário.
    alert("Não houve resposta, certifique-se que o servidor está ligado.");
  })
}
stt_servico('ssh');
stt_servico('dhcp');
stt_servico('dns');
stt_servico('smb');

/*  ### Função purge(servico)
    ### Ação:
    - Desinstala o serviço desejado.
      |__ Espera como paramêtro o serviço.
      |
      |__ Após ser desinstalado invoca a função stt_$SERVICO(), Linha 43.

    ### Uso:
    - É chamada quando o usuário desejar desinstalar algum serviço específico.  
*/
function purge(servico) {
  var confirma = confirm("Você deseja realmente desinstalar o serviço " + servico + "?")
  if (confirma) {
    $.get('http://192.168.15.5:3000/purge/' + servico + '/' + Cookies.get('user_id'), {

    }).done(function (resultado) {
      if (resultado['message']) {
        alert(resultado['message']);
        if (resultado['message'] == "Acesso negado") {
          Cookies.remove('user_id', resultado['user_id'])
          window.location.replace("http://" + http_server + ":9080/pages/examples/login-v2.html");
        }
      }
      if (servico == "ssh") {
        for (var i = 0; i <= 100; i++) {

          (function (i) {
            setTimeout(function () {
              var porcentagem = 0;
              porcentagem = i;

              if (porcentagem < 12) {
                $("#sshpurge").empty();
                $("#sshpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF0D0D;'> </div> </div> ");
                $("#sshpurge").append("<small id='sshpurgetxt'></small>");
              }
              else if (porcentagem > 12 && porcentagem < 31) {
                $("#sshpurge").empty();
                $("#sshpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF4E11;'> </div> </div>");
                $("#sshpurge").append("<small id='sshpurgetxt'></small>");
              }
              else if (porcentagem > 31 && porcentagem < 40) {
                $("#sshpurge").empty();
                $("#sshpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF8E15;'> </div> </div>");
                $("#sshpurge").append("<small id='sshpurgetxt'></small>");
              }
              else if (porcentagem > 40 && porcentagem < 54) {
                $("#sshpurge").empty();
                $("#sshpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FAB733 ;'> </div> </div>");
                $("#sshpurge").append("<small id='sshpurgetxt'></small>");
              }
              else if (porcentagem > 54 && porcentagem < 68) {
                $("#sshpurge").empty();
                $("#sshpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #ACB334 ;'> </div> </div>");
                $("#sshpurge").append("<small id='sshpurgetxt'></small>");
              }
              else if (porcentagem > 68 && porcentagem < 84) {
                $("#sshpurge").empty();
                $("#sshpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #69B34C ;'> </div> </div>");
                $("#sshpurge").append("<small id='sshpurgetxt'></small>");
              }
              else if (porcentagem > 84) {
                $("#sshpurge").empty();
                $("#sshpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #28A745 ;'> </div> </div> ");
                $("#sshpurge").append("<small id='sshpurgetxt'></small>");
              }
              document.getElementById("sshpurgetxt").innerHTML = porcentagem + "% Desinstalado";

            }, 65 * i);
          })(i);
        }

        setTimeout(function () {
          stt_servico('ssh');
        }, 6550);

      }
      else if (servico == "dhcp") {

        for (var i = 0; i <= 100; i++) {

          (function (i) {
            setTimeout(function () {
              var porcentagem = 0;
              porcentagem = i;

              if (porcentagem < 12) {
                $("#dhcppurge").empty();
                $("#dhcppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF0D0D;'> </div> </div> ");
                $("#dhcppurge").append("<small id='dhcppurgetxt'></small>");
              }
              else if (porcentagem > 12 && porcentagem < 31) {
                $("#dhcppurge").empty();
                $("#dhcppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF4E11;'> </div> </div>");
                $("#dhcppurge").append("<small id='dhcppurgetxt'></small>");
              }
              else if (porcentagem > 31 && porcentagem < 40) {
                $("#dhcppurge").empty();
                $("#dhcppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF8E15;'> </div> </div>");
                $("#dhcppurge").append("<small id='dhcppurgetxt'></small>");
              }
              else if (porcentagem > 40 && porcentagem < 54) {
                $("#dhcppurge").empty();
                $("#dhcppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FAB733 ;'> </div> </div>");
                $("#dhcppurge").append("<small id='dhcppurgetxt'></small>");
              }
              else if (porcentagem > 54 && porcentagem < 68) {
                $("#dhcppurge").empty();
                $("#dhcppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #ACB334 ;'> </div> </div>");
                $("#dhcppurge").append("<small id='dhcppurgetxt'></small>");
              }
              else if (porcentagem > 68 && porcentagem < 84) {
                $("#dhcppurge").empty();
                $("#dhcppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #69B34C ;'> </div> </div>");
                $("#dhcppurge").append("<small id='dhcppurgetxt'></small>");
              }
              else if (porcentagem > 84) {
                $("#dhcppurge").empty();
                $("#dhcppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #28A745 ;'> </div> </div> ");
                $("#dhcppurge").append("<small id='dhcppurgetxt'></small>");
              }
              document.getElementById("dhcppurgetxt").innerHTML = porcentagem + "% Desinstalado";

            }, 41 * i);
          })(i);
        }

        setTimeout(function () {
          stt_servico('dhcp');
        }, 4150);

      }
      else if (servico == "dns") {

        for (var i = 0; i <= 100; i++) {

          (function (i) {
            setTimeout(function () {
              var porcentagem = 0;
              porcentagem = i;

              if (porcentagem < 12) {
                $("#dnspurge").empty();
                $("#dnspurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF0D0D;'> </div> </div> ");
                $("#dnspurge").append("<small id='dnspurgetxt'></small>");
              }
              else if (porcentagem > 12 && porcentagem < 31) {
                $("#dnspurge").empty();
                $("#dnspurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF4E11;'> </div> </div>");
                $("#dnspurge").append("<small id='dnspurgetxt'></small>");
              }
              else if (porcentagem > 31 && porcentagem < 40) {
                $("#dnspurge").empty();
                $("#dnspurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF8E15;'> </div> </div>");
                $("#dnspurge").append("<small id='dnspurgetxt'></small>");
              }
              else if (porcentagem > 40 && porcentagem < 54) {
                $("#dnspurge").empty();
                $("#dnspurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FAB733 ;'> </div> </div>");
                $("#dnspurge").append("<small id='dnspurgetxt'></small>");
              }
              else if (porcentagem > 54 && porcentagem < 68) {
                $("#dnspurge").empty();
                $("#dnspurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #ACB334 ;'> </div> </div>");
                $("#dnspurge").append("<small id='dnspurgetxt'></small>");
              }
              else if (porcentagem > 68 && porcentagem < 84) {
                $("#dnspurge").empty();
                $("#dnspurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #69B34C ;'> </div> </div>");
                $("#dnspurge").append("<small id='dnspurgetxt'></small>");
              }
              else if (porcentagem > 84) {
                $("#dnspurge").empty();
                $("#dnspurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #28A745 ;'> </div> </div> ");
                $("#dnspurge").append("<small id='dnspurgetxt'></small>");
              }
              document.getElementById("dnspurgetxt").innerHTML = porcentagem + "% Desinstalado";

            }, 56 * i);
          })(i);
        }

        setTimeout(function () {
          stt_servico('dns');
        }, 5700);

      }
      else if (servico == "samba") {

        for (var i = 0; i <= 100; i++) {

          (function (i) {
            setTimeout(function () {
              var porcentagem = 0;
              porcentagem = i;

              if (porcentagem < 12) {
                $("#smbpurge").empty();
                $("#smbpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF0D0D;'> </div> </div> ");
                $("#smbpurge").append("<small id='smbpurgetxt'></small>");
              }
              else if (porcentagem > 12 && porcentagem < 31) {
                $("#smbpurge").empty();
                $("#smbpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF4E11;'> </div> </div>");
                $("#smbpurge").append("<small id='smbpurgetxt'></small>");
              }
              else if (porcentagem > 31 && porcentagem < 40) {
                $("#smbpurge").empty();
                $("#smbpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF8E15;'> </div> </div>");
                $("#smbpurge").append("<small id='smbpurgetxt'></small>");
              }
              else if (porcentagem > 40 && porcentagem < 54) {
                $("#smbpurge").empty();
                $("#smbpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FAB733 ;'> </div> </div>");
                $("#smbpurge").append("<small id='smbpurgetxt'></small>");
              }
              else if (porcentagem > 54 && porcentagem < 68) {
                $("#smbpurge").empty();
                $("#smbpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #ACB334 ;'> </div> </div>");
                $("#smbpurge").append("<small id='smbpurgetxt'></small>");
              }
              else if (porcentagem > 68 && porcentagem < 84) {
                $("#smbpurge").empty();
                $("#smbpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #69B34C ;'> </div> </div>");
                $("#smbpurge").append("<small id='smbpurgetxt'></small>");
              }
              else if (porcentagem > 84) {
                $("#smbpurge").empty();
                $("#smbpurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #28A745 ;'> </div> </div> ");
                $("#smbpurge").append("<small id='smbpurgetxt'></small>");
              }
              document.getElementById("smbpurgetxt").innerHTML = porcentagem + "% Desinstalado";

            }, 56 * i);
          })(i);
        }

        setTimeout(function () {
          stt_servico('smb');
        }, 5650);

      }
      else if (servico == "snoopy") {
        for (var i = 0; i <= 100; i++) {

          (function (i) {
            setTimeout(function () {
              var porcentagem = 0;
              porcentagem = i;

              if (porcentagem < 12) {
                $("#snppurge").empty();
                $("#snppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF0D0D;'> </div> </div> ");
                $("#snppurge").append("<small id='snppurgetxt'></small>");
              }
              else if (porcentagem > 12 && porcentagem < 31) {
                $("#snppurge").empty();
                $("#snppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF4E11;'> </div> </div>");
                $("#snppurge").append("<small id='snppurgetxt'></small>");
              }
              else if (porcentagem > 31 && porcentagem < 40) {
                $("#snppurge").empty();
                $("#snppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF8E15;'> </div> </div>");
                $("#snppurge").append("<small id='snppurgetxt'></small>");
              }
              else if (porcentagem > 40 && porcentagem < 54) {
                $("#snppurge").empty();
                $("#snppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FAB733 ;'> </div> </div>");
                $("#snppurge").append("<small id='snppurgetxt'></small>");
              }
              else if (porcentagem > 54 && porcentagem < 68) {
                $("#snppurge").empty();
                $("#snppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #ACB334 ;'> </div> </div>");
                $("#snppurge").append("<small id='snppurgetxt'></small>");
              }
              else if (porcentagem > 68 && porcentagem < 84) {
                $("#snppurge").empty();
                $("#snppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #69B34C ;'> </div> </div>");
                $("#snppurge").append("<small id='snppurgetxt'></small>");
              }
              else if (porcentagem > 84) {
                $("#snppurge").empty();
                $("#snppurge").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #28A745 ;'> </div> </div> ");
                $("#snppurge").append("<small id='snppurgetxt'></small>");
              }
              document.getElementById("snppurgetxt").innerHTML = porcentagem + "% Desinstalado";

            }, 35 * i);
          })(i);
        }

        setTimeout(function () {
          stt_servico('snp');
        }, 3600);
      }
    }).fail(() => {
      alert("Não houve resposta, certifique-se que o servidor está ligado.");
    })
  } else {
    alert("Ok, o serviço " + servico + " não foi desinstalado!")
  }
}

function install(servico) {
  var confirma = confirm("Você deseja realmente instalar o serviço " + servico + "?")
  if (confirma) {
    $.get('http://192.168.15.5:3000/install/' + servico + '/' + Cookies.get('user_id'), {

    }).done(function (resultado) {
      console.log();
      if (resultado['message']) {
        alert(resultado['message']);
        if (resultado['message'] == "Acesso negado") {
          Cookies.remove('user_id', resultado['user_id'])
          window.location.replace("http://" + http_server + ":9080/pages/examples/login-v2.html");
        }
      }
      if (servico == "ssh") {
        for (var i = 0; i <= 100; i++) {

          (function (i) {
            setTimeout(function () {
              var porcentagem = 0;
              porcentagem = i;

              if (porcentagem < 12) {
                $("#sshinstall").empty();
                $("#sshinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF0D0D;'> </div> </div> ");
                $("#sshinstall").append("<small id='sshinstalltxt'></small>");
              }
              else if (porcentagem > 12 && porcentagem < 31) {
                $("#sshinstall").empty();
                $("#sshinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF4E11;'> </div> </div>");
                $("#sshinstall").append("<small id='sshinstalltxt'></small>");
              }
              else if (porcentagem > 31 && porcentagem < 40) {
                $("#sshinstall").empty();
                $("#sshinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF8E15;'> </div> </div>");
                $("#sshinstall").append("<small id='sshinstalltxt'></small>");
              }
              else if (porcentagem > 40 && porcentagem < 54) {
                $("#sshinstall").empty();
                $("#sshinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FAB733 ;'> </div> </div>");
                $("#sshinstall").append("<small id='sshinstalltxt'></small>");
              }
              else if (porcentagem > 54 && porcentagem < 68) {
                $("#sshinstall").empty();
                $("#sshinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #ACB334 ;'> </div> </div>");
                $("#sshinstall").append("<small id='sshinstalltxt'></small>");
              }
              else if (porcentagem > 68 && porcentagem < 84) {
                $("#sshinstall").empty();
                $("#sshinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #69B34C ;'> </div> </div>");
                $("#sshinstall").append("<small id='sshinstalltxt'></small>");
              }
              else if (porcentagem > 84) {
                $("#sshinstall").empty();
                $("#sshinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #28A745 ;'> </div> </div> ");
                $("#sshinstall").append("<small id='sshinstalltxt'></small>");
              }
              document.getElementById("sshinstalltxt").innerHTML = porcentagem + "% Instalado";

            }, 53 * i);
          })(i);
        }

        setTimeout(function () {
          stt_servico('ssh');
        }, 5400);

      }
      else if (servico == "dhcp") {

        for (var i = 0; i <= 100; i++) {

          (function (i) {
            setTimeout(function () {
              var porcentagem = 0;
              porcentagem = i;

              if (porcentagem < 12) {
                $("#dhcpinstall").empty();
                $("#dhcpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF0D0D;'> </div> </div> ");
                $("#dhcpinstall").append("<small id='dhcpinstalltxt'></small>");
              }
              else if (porcentagem > 12 && porcentagem < 31) {
                $("#dhcpinstall").empty();
                $("#dhcpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF4E11;'> </div> </div>");
                $("#dhcpinstall").append("<small id='dhcpinstalltxt'></small>");
              }
              else if (porcentagem > 31 && porcentagem < 40) {
                $("#dhcpinstall").empty();
                $("#dhcpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF8E15;'> </div> </div>");
                $("#dhcpinstall").append("<small id='dhcpinstalltxt'></small>");
              }
              else if (porcentagem > 40 && porcentagem < 54) {
                $("#dhcpinstall").empty();
                $("#dhcpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FAB733 ;'> </div> </div>");
                $("#dhcpinstall").append("<small id='dhcpinstalltxt'></small>");
              }
              else if (porcentagem > 54 && porcentagem < 68) {
                $("#dhcpinstall").empty();
                $("#dhcpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #ACB334 ;'> </div> </div>");
                $("#dhcpinstall").append("<small id='dhcpinstalltxt'></small>");
              }
              else if (porcentagem > 68 && porcentagem < 84) {
                $("#dhcpinstall").empty();
                $("#dhcpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #69B34C ;'> </div> </div>");
                $("#dhcpinstall").append("<small id='dhcpinstalltxt'></small>");
              }
              else if (porcentagem > 84) {
                $("#dhcpinstall").empty();
                $("#dhcpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #28A745 ;'> </div> </div> ");
                $("#dhcpinstall").append("<small id='dhcpinstalltxt'></small>");
              }
              document.getElementById("dhcpinstalltxt").innerHTML = porcentagem + "% Instalado";

            }, 45 * i);
          })(i);
        }

        setTimeout(function () {
          stt_servico('dhcp');
        }, 4600);

      }
      else if (servico == "dns") {

        for (var i = 0; i <= 100; i++) {

          (function (i) {
            setTimeout(function () {
              var porcentagem = 0;
              porcentagem = i;

              if (porcentagem < 12) {
                $("#dnsinstall").empty();
                $("#dnsinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF0D0D;'> </div> </div> ");
                $("#dnsinstall").append("<small id='dnsinstalltxt'></small>");
              }
              else if (porcentagem > 12 && porcentagem < 31) {
                $("#dnsinstall").empty();
                $("#dnsinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF4E11;'> </div> </div>");
                $("#dnsinstall").append("<small id='dnsinstalltxt'></small>");
              }
              else if (porcentagem > 31 && porcentagem < 40) {
                $("#dnsinstall").empty();
                $("#dnsinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF8E15;'> </div> </div>");
                $("#dnsinstall").append("<small id='dnsinstalltxt'></small>");
              }
              else if (porcentagem > 40 && porcentagem < 54) {
                $("#dnsinstall").empty();
                $("#dnsinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FAB733 ;'> </div> </div>");
                $("#dnsinstall").append("<small id='dnsinstalltxt'></small>");
              }
              else if (porcentagem > 54 && porcentagem < 68) {
                $("#dnsinstall").empty();
                $("#dnsinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #ACB334 ;'> </div> </div>");
                $("#dnsinstall").append("<small id='dnsinstalltxt'></small>");
              }
              else if (porcentagem > 68 && porcentagem < 84) {
                $("#dnsinstall").empty();
                $("#dnsinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #69B34C ;'> </div> </div>");
                $("#dnsinstall").append("<small id='dnsinstalltxt'></small>");
              }
              else if (porcentagem > 84) {
                $("#dnsinstall").empty();
                $("#dnsinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #28A745 ;'> </div> </div> ");
                $("#dnsinstall").append("<small id='dnsinstalltxt'></small>");
              }
              document.getElementById("dnsinstalltxt").innerHTML = porcentagem + "% Instalado";

            }, 56 * i);
          })(i);
        }

        setTimeout(function () {
          stt_servico('dns');
        }, 5700);

      }
      else if (servico == "samba") {

        for (var i = 0; i <= 100; i++) {

          (function (i) {
            setTimeout(function () {
              var porcentagem = 0;
              porcentagem = i;

              if (porcentagem < 12) {
                $("#smbinstall").empty();
                $("#smbinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF0D0D;'> </div> </div> ");
                $("#smbinstall").append("<small id='smbinstalltxt'></small>");
              }
              else if (porcentagem > 12 && porcentagem < 31) {
                $("#smbinstall").empty();
                $("#smbinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF4E11;'> </div> </div>");
                $("#smbinstall").append("<small id='smbinstalltxt'></small>");
              }
              else if (porcentagem > 31 && porcentagem < 40) {
                $("#smbinstall").empty();
                $("#smbinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF8E15;'> </div> </div>");
                $("#smbinstall").append("<small id='smbinstalltxt'></small>");
              }
              else if (porcentagem > 40 && porcentagem < 54) {
                $("#smbinstall").empty();
                $("#smbinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FAB733 ;'> </div> </div>");
                $("#smbinstall").append("<small id='smbinstalltxt'></small>");
              }
              else if (porcentagem > 54 && porcentagem < 68) {
                $("#smbinstall").empty();
                $("#smbinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #ACB334 ;'> </div> </div>");
                $("#smbinstall").append("<small id='smbinstalltxt'></small>");
              }
              else if (porcentagem > 68 && porcentagem < 84) {
                $("#smbinstall").empty();
                $("#smbinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #69B34C ;'> </div> </div>");
                $("#smbinstall").append("<small id='smbinstalltxt'></small>");
              }
              else if (porcentagem > 84) {
                $("#smbinstall").empty();
                $("#smbinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #28A745 ;'> </div> </div> ");
                $("#smbinstall").append("<small id='smbinstalltxt'></small>");
              }
              document.getElementById("smbinstalltxt").innerHTML = porcentagem + "% Instalado";

            }, 40 * i);
          })(i);
        }

        setTimeout(function () {
          stt_servico('smb');
        }, 4100);

      }
      else if (servico == "snoopy") {
        for (var i = 0; i <= 100; i++) {

          (function (i) {
            setTimeout(function () {
              var porcentagem = 0;
              porcentagem = i;

              if (porcentagem < 12) {
                $("#snpinstall").empty();
                $("#snpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF0D0D;'> </div> </div> ");
                $("#snpinstall").append("<small id='snpinstalltxt'></small>");
              }
              else if (porcentagem > 12 && porcentagem < 31) {
                $("#snpinstall").empty();
                $("#snpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF4E11;'> </div> </div>");
                $("#snpinstall").append("<small id='snpinstalltxt'></small>");
              }
              else if (porcentagem > 31 && porcentagem < 40) {
                $("#snpinstall").empty();
                $("#snpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FF8E15;'> </div> </div>");
                $("#snpinstall").append("<small id='snpinstalltxt'></small>");
              }
              else if (porcentagem > 40 && porcentagem < 54) {
                $("#snpinstall").empty();
                $("#snpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #FAB733 ;'> </div> </div>");
                $("#snpinstall").append("<small id='snpinstalltxt'></small>");
              }
              else if (porcentagem > 54 && porcentagem < 68) {
                $("#snpinstall").empty();
                $("#snpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #ACB334 ;'> </div> </div>");
                $("#snpinstall").append("<small id='snpinstalltxt'></small>");
              }
              else if (porcentagem > 68 && porcentagem < 84) {
                $("#snpinstall").empty();
                $("#snpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #69B34C ;'> </div> </div>");
                $("#snpinstall").append("<small id='snpinstalltxt'></small>");
              }
              else if (porcentagem > 84) {
                $("#snpinstall").empty();
                $("#snpinstall").append("<div class='progress progress-sm'> <div class='progress-bar' role='progressbar' aria-valuenow='35' aria-valuemin='0' aria-valuemax='100' style='width: " + porcentagem + "%; background-color: #28A745 ;'> </div> </div> ");
                $("#snpinstall").append("<small id='snpinstalltxt'></small>");
              }
              document.getElementById("snpinstalltxt").innerHTML = porcentagem + "% Instalado";

            }, 31 * i);
          })(i);
        }

        setTimeout(function () {
          stt_servico('snp');
        }, 3200);
      }
    }).fail(() => {
      alert("Não houve resposta, certifique-se que o servidor está ligado.");
    })
  } else {
    alert("Ok, o serviço " + servico + " não foi instalado!")
  }
}
