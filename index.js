// modulos externos
import inquirer from 'inquirer';
import chalk from 'chalk';

// modulos internos
import fs from 'fs';
import { parse } from 'path';

function operation() {
    inquirer.prompt([{
        type: 'list',
        name: 'pergunta',
        message: 'O que você deseja fazer?',
        choices: [
            'Criar conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]
    }]).then((answer) => {
        const action = answer['pergunta']

        if (action == 'Criar conta') {
            CriarConta()
        } else if (action == 'Consultar Saldo') {
            BuscarSaldoConta()
        } else if (action == 'Depositar') {
            deposito()
        } else if (action == 'Sacar') {
            SacarSaldo()
        } else if (action == 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
            process.exit()
        }

    }).catch(erro => console.log(erro))
}
operation()

//criar conta
function CriarConta() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'))
    //console.log(chalk.green('Defina as opções que você deseja seguir.'))

    CriarArquivoContaUser()
}
//criar arquivo da conta do usuário
function CriarArquivoContaUser() {
    inquirer.prompt([
        {
            name: 'NomeConta',
            message: 'Digite o nome da conta'
        }
    ]).then(retorno => {
        const NomeDaConta = retorno['NomeConta']

        if (!NomeDaConta) {
            console.log(chalk.bgRed.black("O nome da conta não pode ser vazio, digite um nome válido"))
            return CriarArquivoContaUser()
        }
        console.info(retorno['NomeConta'])

        if (!fs.existsSync('contas')) {
            fs.mkdirSync('contas')
        }

        if (fs.existsSync(`contas/${NomeDaConta}.json`)) {
            console.log(
                chalk.bgRed.black('Esta conta já existe, digite outro nome')
            )
            CriarArquivoContaUser()
            return
        }

        fs.writeFileSync(
            `contas/${NomeDaConta}.json`,
            '{"Saldo": 0}',
            function (erro) {
                console.log(erro)
            })

        console.log(chalk.green('Parabéns, a sua conta foi criada.'))
        operation()
    }).catch(erro => console.log(erro))
}

//criando funcao de deposito
function deposito() {
    inquirer.prompt([
        {
            name: 'NomeConta',
            message: 'Digite o nome da conta que deseja fazer o depósito: '
        }
    ]).then((retorno) => {
        const NomeConta = retorno['NomeConta']

        if (!checarContaExistente(NomeConta)) {
            return deposito()
        }

        inquirer.prompt([
            {
                name: 'quantidade',
                message: 'Quanto deseja depositar'
            }
        ]).then((retorno) => {
            const quantidade = retorno['quantidade']

            adicionarSaldo(NomeConta, quantidade)
            //operation()
        }).catch(erro => console.log(erro))


    }).catch(erro => console.log(erro))
}

//verifica se o arquivo nomeConta.json ja existe
function checarContaExistente(NomeConta) {
    if (!fs.existsSync(`contas/${NomeConta}.json`)) {
        console.log(chalk.bgRed.black("Esta conta não existe, escolha outro nome"))
        return false
    }
    return true
}

function buscarConta(NomeConta) {
    const ContaJson = fs.readFileSync(`Contas/${NomeConta}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    })

    return JSON.parse(ContaJson)
}

//buscar a conta em json "objeto js"
//essa função é chamada pela função deposito
function adicionarSaldo(NomeConta, quantidade) {
    const DadosDaConta = buscarConta(NomeConta)

    if (!quantidade) {
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente"))
        return deposito()
    } else if (quantidade < 0) {
        console.log(chalk.bgRed.black('Você não pode efetuar o depósito de um valor negativo'))
        desicao()
        //return false
    } else {
        //alterando o valor da conta
        DadosDaConta.Saldo = parseFloat(quantidade) + parseFloat(DadosDaConta.Saldo)

        //salvar o arquivo
        fs.writeFileSync(
            `Contas/${NomeConta}.json`,
            JSON.stringify(DadosDaConta),
            function (error) {
                console.log(error)
            }
        )

        if (quantidade > 1) {
            var plural = ' reais'
        } else {
            var plural = ' real'
        }
        console.log(chalk.green.black("foi depositado o valor de R$" + quantidade + plural + " na sua conta"))
        operation()
    }
}

function desicao() {
    inquirer.prompt([{
        type: 'list',
        name: 'pergunta',
        message: 'O que você deseja fazer?',
        choices: [
            'Sair',
            'Tentar novamente',
        ]
    }]).then((retorno) => {
        const Escolha = retorno['pergunta']

        if (Escolha == 'Tentar novamente') {
            deposito()
        } else if (Escolha == 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
            process.exit()
        }
    }).catch(erro => console.log(erro))
}

//buscar saldo da conta para exibir na tela
function BuscarSaldoConta() {
    inquirer.prompt([
        {
            name: 'NomeConta',
            message: 'Digite o nome da conta que deseja consultar saldo: '
        }
    ]).then((retorno) => {
        const NomeConta = retorno['NomeConta']

        //verificar se conta existe
        if (!checarContaExistente(NomeConta)) {
            return BuscarSaldoConta()
        }

        const ContaUsuario = buscarConta(NomeConta)
        console.log(chalk.bgBlue.black('Ola ' + NomeConta + ', o saldo da sua conta é de R$' + ContaUsuario.Saldo))

        operation()

    }).catch(erro => console.log(erro))

}

function SacarSaldo() {
    inquirer.prompt([{
        name: 'NomeConta',
        message: 'Digite o nome da conta que deseja efetuar o saque'
    }]).then((retorno) => {
        const NomeConta = retorno['NomeConta']

        if (!checarContaExistente(NomeConta)) {
            SacarSaldo()
        } else {
            //buscar saldo da conta
            const saldoConta = buscarConta(NomeConta)

            inquirer.prompt(
                [{
                    name: 'ValorSaque',
                    message: 'Digite o valor que deseja sacar'
                }]
            ).then((retorno) => {
                const valorSaque = retorno['ValorSaque']
                removerSaldo(NomeConta, valorSaque)

            })
        }
    })

}

function removerSaldo(NomeConta, valorSaque) {
    const contaUsuario = buscarConta(NomeConta)

    var saldoConta = parseFloat(contaUsuario.Saldo)
    var valorRetirada = valorSaque

    //validar se o valor do saque é maior que o valor da conta
    if (valorRetirada < 0) {
        console.log(chalk.bgRed.black('O valor do saque não pode ser menor que zero'))
        SacarSaldo()

    } else if (valorRetirada > saldoConta) {
        if (saldoConta > 1) {
            var plural = ' reais'
        } else {
            var plural = ' real'
        }
        console.log(chalk.bgRed.black('O valor de: ' + valorSaque + ' é maior que o valor que você possui na sua conta'))
        console.log(chalk.bgRed.black('O seu saldo disponível para saque é de: ' + saldoConta + plural))
    } else {
        contaUsuario.Saldo = saldoConta - valorRetirada;
        const status = commit(NomeConta, contaUsuario)

        if (status == true) {
            console.log(chalk.bgRed('Algo deu errado, consulte o suporte.'))
        } else {
            console.log('O seu saque de R$' + valorRetirada + ' foi efetuado com suceesso.')
            operation()
        }


    }

}

function commit(NomeConta, DadosDaConta) {
    try {
        //salvar o arquivo
        fs.writeFileSync(
            `contas/${NomeConta}.json`,
            JSON.stringify(DadosDaConta),
            function (error) {
                console.log(error)
            }
        )
    } catch {
        return { success: false, error: error.message };
    }

}

