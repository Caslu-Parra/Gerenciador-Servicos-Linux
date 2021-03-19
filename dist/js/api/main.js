// Requires Session
const express = require('express');
var cors = require('cors');
//const { version } = require('os');
const app = express();
const fs = require('fs');
const { exec } = require("child_process");
const porta = 3000
const crypto = require('crypto');
const util = require('util');
//const { fileURLToPath } = require('url');
//const { write } = require('fs');
//const setTimeoutPromise = util.promisify(setTimeout);
require('dotenv').config();
app.use(express.urlencoded({ extended: false }))


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    app.use(cors())
    next();
})

// Rotas
app.post('/auth/:id', (req, res) => {
    console.log("Auth foi acessado");
    console.log(req.params.id);

    if (req.params.id) {
        if (req.params.id == process.env.ID_COOKIE) {
            res.status(200);
        } else {
            res.send({ message: "Há algo de errado com suas credênciais, por favor logue novamente!", chave: 0 }).status(401);
        }
    }

})

// Rota de Login
app.post('/login', (req, res) => {
    // Se alguns dos campos enviados via post forem vazios, retornamos msg "Campos Vazios".
    if (req.body.user == "" || req.body.senha == "") {
        res.send({ message: "Campo(s) 'Usuário' ou 'Senha' vazio(s) !" }).status(204);
    } else {
        try {
            if (fs.existsSync('./.env')) {
                fs.readFile('./.env', 'utf8', function read(err, data) {
                    if (data == "") {
                        // Se o conteúdo dentro de ".env" estiver vazio retornamos uma mensagem junto com status "204".
                        res.send({ message: "1 Não existe uma conta administradora, registre uma imediatamente!" }).status(204);
                        // Removemos o arquivo ".env";
                        fs.unlink('./.env', (err) => {
                            if (err) {
                                console.error(err)
                                return
                            }
                        })
                    } else {
                        // Autenticamos comparando os dados dos campos enviados vs dados em ".env".
                        if (req.body.user == process.env.USER_NAME && req.body.senha == process.env.USER_PASSWD) {
                            res.send({ user_id: process.env.ID_COOKIE }).status(200);
                        } else {
                            // Caso os dados não baterem retornamos credenciais inválidas.
                            res.send({ message: "Usuário e/ou senha incorretos" }).status(401);
                        }
                    }
                })
            } else {
                // Retorna mensagem com status "204".
                res.send({ message: "2 Não existe uma conta administradora, registre uma imediatamente!" }).status(204);
            }
        } catch (error) {
            throw err;
        }
    }
})

// Rota de registro 
app.post('/registrar', (req, res) => {
    // Se alguns dos campos enviados via post forem vazios, retornamos msg "Campos Vazios".
    if (req.body.user == "" || req.body.senha == "") {
        res.send({ message: "Campo(s) 'Usuário' ou 'Senha' vazio(s) !" }).status(204);
    } else {
        try {
            // Checa se aquivo existe 
            if (fs.existsSync('./.env')) {
                // Le conteudo do arquivo
                fs.readFile('./.env', 'utf8', function read(err, data) {
                    // Caso de erro, retorna o erro.
                    if (err) {
                        throw err;
                    }
                    // Se arquivo existir e não etiver vazio, significa que já existe um root.
                    if (data != "") {
                        // Retorna mensagem com status "204".
                        res.send({ message: "Já existe uma conta administradora, não é possível criar outra!" }).status(204);
                    } else {
                        /* Se existir o arquivo e estiver vazio uma conta administrador
                         será criada com os dados informados pelo usuário via POST */

                        // Define o padrão do cookie de autenticação, "id_cookie".
                        var id_cookie = req.body.user.toUpperCase() + Math.floor(Math.random() * 101) + '@';
                        // Assim que padrão for aplicado seu conteúdo é hasheado em SHA256. 
                        var id_cookie = crypto.createHash('sha256').update(id_cookie).digest('hex');
                        // Senha do usuário é hasheada em SHA256.
                        var user_passwd = crypto.createHash('sha256').update(req.body.senha).digest('hex');

                        fs.writeFile('./.env',
                            `ID_COOKIE=${id_cookie}
                            \nUSER_PASSWD=${user_passwd}
                            \nUSER_NAME=${req.body.user}`,
                            (err) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        // Retorna ao usuário o valor do cookie e a confirmação do registro.
                        res.send({
                            message: 1,
                        });

                    }
                })
                // Se não existir, cria e insere dados do root.
            } else {
                // Define o padrão do cookie de autenticação, "id_cookie".
                var id_cookie = req.body.user.toUpperCase() + Math.floor(Math.random() * 101) + '@';
                // Assim que padrão for aplicado seu conteúdo é hasheado em SHA256. 
                var id_cookie = crypto.createHash('sha256').update(id_cookie).digest('hex');
                // Senha do usuário é hasheada em SHA256.
                var user_passwd = crypto.createHash('sha256').update(req.body.senha).digest('hex');

                fs.writeFile('./.env',
                    `ID_COOKIE=${id_cookie}
                    \nUSER_PASSWD=${user_passwd}
                    \nUSER_NAME=${req.body.user}`,
                    (err) => {
                        if (err) {
                            console.log(err);
                        }
                    })
                // Retorna ao usuário o valor do cookie e a confirmação do registro.
                res.send({
                    message: 1,
                });
            }
            // Caso de erro nos retorna.
        } catch (error) {
            console.error(err);
        }
    }
})

// Rota de listagem de serviço
app.get('/listar/geral/:item/:id', function (req, res) {
        if (req.params.id == process.env.ID_COOKIE) {
            if (req.params.item == "ssh") {
                global.ssh_version = "";
                global.ssh_status = "";
                const { exec } = require("child_process");

                exec(`apt-show-versions openssh-server | awk '{print $2,$3}'`, (error, stdout, stderr) => {
                    console.log("################ SSH QUERY RESULTS")
                    if (error) {
                        console.log(`error: ${error.message}`);
                        global.ssh_status = 0;
                        analiza();
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        if (stderr.length == 14) {
                            global.ssh_status = 0;
                            analiza();
                        } else {
                            global.ssh_status = 1;
                            analiza();
                        }
                    }
                    if (stdout) {
                        console.log(`stdout: ${stdout}`);
                        if (stdout.length == 14) {
                            global.ssh_status = 0;
                            analiza();
                        } else {
                            global.ssh_status = 1;
                            analiza();
                        }
                    }
                });

                function analiza() {
                    if (global.ssh_status == 1) {
                        exec("ssh -V ", (error, stdout, stderr) => {
                            if (error) {
                                console.log(`error: ${error.message}`);
                                global.ssh_version = "Não encontrado";
                                enviar();
                                return;
                            }
                            if (stderr) {
                                console.log(`stderr: ${stderr}`);
                                global.ssh_version = stderr;
                                enviar();
                                return;
                            }
                            if (stdout) {
                                console.log(`stdout: ${stdout}`);
                                global.ssh_version = stderr;
                                enviar();

                            }
                        });

                    } else {
                        global.ssh_version = 0;
                        enviar();
                    }
                }

                function enviar() {
                    console.log(global.ssh_status);
                    console.log(global.ssh_version);
                    res.json({ versao: global.ssh_version, status: global.ssh_status })
                };
            }
            else if (req.params.item == "dhcp") {
                global.dhcp_version = "";
                global.dhcp_status = "";
                const { exec } = require("child_process");

                exec(`apt-show-versions isc-dhcp-server | awk '{print $2,$3}'`, (error, stdout, stderr) => {
                    console.log("################ DHCP QUERY RESULTS")
                    if (error) {
                        console.log(`error: ${error.message}`);
                        global.dhcp_status = 0;
                        analiza();
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        if (stderr.length == 14) {
                            global.ssh_status = 0;
                            analiza();
                        } else {
                            global.ssh_status = 1;
                            analiza();
                        }
                    }
                    if (stdout) {
                        console.log(`stdout: ${stdout}`);
                        if (stdout.length == 14) {
                            global.dhcp_status = 0;
                            analiza();
                        } else {
                            global.dhcp_status = 1;
                            analiza();
                        }
                    }
                });

                function analiza() {
                    if (global.dhcp_status == 1) {
                        exec("dhcpd --version ", (error, stdout, stderr) => {
                            if (error) {
                                console.log(`error: ${error.message}`);
                                global.dhcp_version = "Não encontrado";
                                enviar();
                                return;
                            }
                            if (stderr) {
                                console.log(`stderr: ${stderr}`);
                                global.dhcp_version = stderr;
                                enviar();
                                return;
                            }
                            if (stdout) {
                                console.log(`stdout: ${stdout}`);
                                global.dhcp_version = stderr;
                                enviar();

                            }
                        });
                    } else {
                        global.dhcp_version = 0;
                        enviar();
                    }
                }

                function enviar() {
                    console.log(global.dhcp_status);
                    console.log(global.dhcp_version);
                    res.json({ versao: global.dhcp_version, status: global.dhcp_status })
                };
            }
            else if (req.params.item == "dns") {
                global.dns_version = "";
                global.dns_status = "";
                const { exec } = require("child_process");

                exec(`apt-show-versions bind9 | awk '{print $2,$3}' `, (error, stdout, stderr) => {
                    console.log("################ DNS QUERY RESULTS")
                    if (error) {
                        console.log(`error: ${error.message}`);
                        global.dns_status = 0;
                        analiza();
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        if (stderr.length == 14) {
                            global.dns_status = 0;
                            analiza();
                        } else {
                            global.dns_status = 1;
                            analiza();
                        }
                    }
                    if (stdout) {
                        console.log(`stdout: ${stdout}`);
                        if (stdout.length == 14) {
                            global.dns_status = 0;
                            analiza();
                        } else {
                            global.dns_status = 1;
                            analiza();
                        }
                    }
                });
                function analiza() {
                    if (global.dns_status == 1) {
                        exec(`named -v | awk '{print $1,$2}'`, (error, stdout, stderr) => {
                            if (error) {
                                console.log(`error: ${error.message}`);
                                global.dns_version = "Não encontrado";
                                enviar();
                                return;
                            }
                            if (stderr) {
                                console.log(`stderr: ${stderr}`);
                                global.dns_version = "Não encontrado";
                                enviar();
                                return;
                            }
                            if (stdout) {
                                console.log(`stdout: ${stdout}`);
                                global.dns_version = stdout;
                                enviar();

                            }
                        });

                    } else {
                        global.dns_version = 0;
                        enviar();
                    }
                }

                function enviar() {
                    console.log(global.dns_status);
                    console.log(global.dns_version);
                    res.json({ versao: global.dns_version, status: global.dns_status })
                };
            }
            else if (req.params.item == "smb") {
                global.smb_version = "";
                global.smb_status = "";
                const { exec } = require("child_process");

                exec(`apt-show-versions samba | awk '{print $2,$3}'`, (error, stdout, stderr) => {
                    console.log("################ SAMBA QUERY RESULTS")
                    if (error) {
                        console.log(`error: ${error.message}`);
                        global.smb_status = 0;
                        analiza();
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        if (stderr.length == 14) {
                            global.smb_status = 0;
                            analiza();
                        } else {
                            global.smb_status = 1;
                            analiza();
                        }
                    }
                    if (stdout) {
                        console.log(`stdout: ${stdout}`);
                        if (stdout.length == 14) {
                            global.smb_status = 0;
                            analiza();
                        } else {
                            global.smb_status = 1;
                            analiza();
                        }
                    }
                });

                function analiza() {
                    if (global.smb_status == 1) {
                        exec("smbcontrol -V", (error, stdout, stderr) => {
                            if (error) {
                                console.log(`error: ${error.message}`);
                                global.smb_version = "Não encontrado";
                                enviar();
                                return;
                            }
                            if (stderr) {
                                console.log(`stderr: ${stderr}`);
                                global.smb_version = stderr;
                                enviar();
                                return;
                            }
                            if (stdout) {
                                console.log(`stdout: ${stdout}`);
                                global.smb_version = stdout;
                                enviar();

                            }
                        });

                    } else {
                        global.smb_version = 0;
                        enviar();
                    }
                }

                function enviar() {
                    console.log(global.smb_status);
                    console.log(global.smb_version);
                    res.json({ versao: global.smb_version, status: global.smb_status })
                };
            }
            else if (req.params.item == "snoopy") {
                global.snp_versao = "";
                const { exec } = require("child_process");

                exec(`apt-show-versions snoopy | awk '{print $2,$3}'`, (error, stdout, stderr) => {
                    console.log("################ SNOOPY QUERY RESULTS")
                    if (error) {
                        console.log(`error: ${error.message}`);
                        global.snp_versao = error.message;
                        enviar();
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        if (stderr.length == "14") {
                            global.snp_versao = 0;
                        } else {
                            global.snp_versao = stderr;
                        }
                        enviar();
                        return;
                    }
                    if (stdout) {
                        console.log(`stdout: ${stdout}`);
                        if (stdout.length == "14") {
                            global.snp_versao = 0;
                        } else {
                            global.snp_versao = stdout;
                        }
                        enviar();
                    }
                });

                function enviar() {
                    console.log(global.snp_versao);
                    res.json({ versao: global.snp_versao })
                };
            }
        } else {
            res.send({ message: "Acesso negado" }).status(401);
        }
})

app.get('/purge/:item/:id', function (req, res) {
    if (req.params.id == process.env.ID_COOKIE) {
        if (req.params.item == "ssh") {
            exec("sudo apt purge openssh-server openssh-client -y");
            enviar();
        }
        else if (req.params.item == "dhcp") {
            exec("sudo apt purge isc-dhcp-server -y ");
            enviar();
        }
        else if (req.params.item == "dns") {
            exec("sudo apt purge bind9 -y ");
            enviar();
        }
        else if (req.params.item == "samba") {
            exec("sudo apt purge samba -y ");
            enviar();
        }
        else if (req.params.item == "snoopy") {
            exec("sudo apt purge snoopy -y ");
            enviar();
        }
        function enviar() {
            console.log(`################ PURGE ${req.params.item}`)
            res.status(200);
        };
    } else {
        res.send({ message: "Acesso negado" }).status(401);
    }
})

app.get('/install/:item/:id', function (req, res) {
    if (req.params.id == process.env.ID_COOKIE) {
        if (req.params.item == "ssh") {
            exec("sudo apt install openssh-server openssh-client -y");
            enviar();
        }
        else if (req.params.item == "dhcp") {
            exec("sudo apt install isc-dhcp-server -y ");
            enviar();
        }
        else if (req.params.item == "dns") {
            exec("sudo apt install bind9 -y ");
            enviar();
        }
        else if (req.params.item == "samba") {
            exec("sudo apt install samba -y ");
            enviar();
        }
        else if (req.params.item == "snoopy") {
            exec("sudo apt install snoopy ");
            enviar();
        }
    } else {
        res.send({ message: "Acesso negado" }).status(401);
    }

    function enviar() {
        console.log(`################ INSTALL ${req.params.item}`)
        res.status(200);
    };
})

app.listen(porta, () => {
    console.log(`Server is Running on port ${porta}`);
});
