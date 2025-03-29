const URL_BASE_API = "http://localhost:3000";

// Elementos do DOM
const formulario = document.getElementById("form-autenticacao");
const botaoAlternar = document.getElementById("botao-alternar");
const tituloFormulario = document.getElementById("titulo-formulario");
const campoNome = document.getElementById("nome");
const republicasLista = document.getElementById("republicas-lista");
const botaoAddRepublica = document.getElementById("btn-add-republica");
const botaoFiltrar = document.getElementById("btn-filtrar");
const filtroPreco = document.getElementById("filtro-preco");
const filtroVagas = document.getElementById("filtro-vagas");
const selectBairro = document.getElementById("select-bairro");

// Variável de controle para alternar entre login e cadastro
let ehLogin = true;

// Lista de bairros
const bairros = [
    "ALTO PARAISO", "ALVORADA", "ALTO CASA BLANCA", "ALTO SÃO JOÃO", "AROERAS",
    "BELVEDERE", "BETEL", "BETEL 2", "BOA VISTA", "BOULEVARD", "CÂNDIDO VILAGE",
    "CASA BLANCA", "CHÁCARA BANANAL", "CENTRO", "CIDADE JARDIM", "CIDADE NOVA",
    "ESPLANADA", "FLORESTA", "FRUTAL", "INDUSTRIAL", "JOANA COSTA", "MARACANÃ",
    "MÁRIO GUEDES", "MURITIBA", "NOVA ESPERANÇA", "NOVO PANORAMA", "NOVO PANORAMA 2",
    "PARQUE INDUSTRIAL", "PARQUE RAQUEL", "PENIEL", "PRIMAVERA", "PROLONGAMENTO SANTO ANTÔNIO",
    "PROGRESSO", "RAQUEL", "RODOVIA SALTAIOBEIRAS", "SAGRADA FAMÍLIA", "SÃO GERALDO",
    "SANTA FELICIDADE", "SANTA MARTA", "SANTA MÔNICA", "SANTO ANTÔNIO", "SANTO EXPEDITO",
    "SÃO FIDÉLIS", "SÃO FIDÉLIS 2", "SÃO JOSÉ", "SÃO MIGUEL", "SÃO PEDRO", "SETOR INDUSTRIAL",
    "SÍLVIO SANTIAGO", "SOSEVENDO", "VALE DO SOL", "VARGINHA-SÃO GERALDO", "VEREDA",
    "VILA APARECIDA", "VILA CANAÃ", "VILA JANUÁRIA", "VILA SANTA MARTA", "VILA SANTA CRUZ",
    "VILA SOBRADINHO", "VISTA ALEGRE"
];

// Função para decodificar o token JWT
function getUserId() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded?.userId;
    } catch (erro) {
        console.error("Erro ao decodificar o token:", erro);
        return null;
    }
}

// Popular o select de bairros
function popularSelectBairros() {
    bairros.forEach(bairro => {
        const option = document.createElement("option");
        option.value = bairro;
        option.textContent = bairro;
        selectBairro.appendChild(option);
    });
}

// Carregar todas as repúblicas
let todasRepublicas = [];

async function carregarRepublicas() {
    try {
        const resposta = await fetch(`${URL_BASE_API}/republicas`);
        if (!resposta.ok) throw new Error("Erro ao buscar repúblicas.");
        todasRepublicas = await resposta.json();
        aplicarFiltros();
    } catch (erro) {
        console.error("Erro ao carregar repúblicas:", erro);
        republicasLista.innerHTML = "<p class='erro-carregamento'>Erro ao carregar repúblicas. Tente recarregar a página.</p>";
    }
}

// Aplicar Filtros de Pesquisa
function aplicarFiltros() {
    // Obter valores dos filtros
    const bairroSelecionado = selectBairro.value.toUpperCase();
    const precoMax = parseFloat(filtroPreco.value) || Infinity;
    const vagasMin = parseInt(filtroVagas.value) || 0;

    // Filtra as repúblicas
    const republicasFiltradas = todasRepublicas.filter(rep => {
        const bairroRep = rep.bairro?.trim().toUpperCase() || '';
        const bairroMatch = !bairroSelecionado || bairroRep === bairroSelecionado;
        const precoMatch = rep.valorMensal <= precoMax;
        const vagasMatch = rep.vagas >= vagasMin;

        return bairroMatch && precoMatch && vagasMatch;
    });

    exibirRepublicas(republicasFiltradas);
}

// Exibir repúblicas na tela
function exibirRepublicas(republicas) {
    republicasLista.innerHTML = "";

    if (!republicas || republicas.length === 0) {
        republicasLista.innerHTML = "<p class='nenhuma-republica'>Nenhuma república encontrada com os filtros selecionados.</p>";
        return;
    }

    republicas.forEach(rep => {
        const div = document.createElement("div");
        div.classList.add("card");
        
        // Tratamento seguro para todos os campos
        const titulo = rep.titulo || rep.título || "República sem nome";
        const descricao = rep.descricao || "Sem descrição disponível";
        const bairro = rep.bairro || "Bairro não informado";
        const rua = rep.rua || "Rua não informada";
        const numero = rep.numero !== undefined ? rep.numero : "s/n";
        const complemento = rep.complemento ? ` - ${rep.complemento}` : '';
        const valorFormatado = rep.valorMensal ? `R$${rep.valorMensal.toFixed(2)}` : "Valor não informado";
        const vagas = rep.vagas !== undefined ? rep.vagas : "Não informado";

        div.innerHTML = `
            <h3>${titulo}</h3>
            <p class="descricao">${descricao}</p>
            <p><strong>Bairro:</strong> ${bairro}</p>
            <p><strong>Endereço:</strong> ${rua}, ${numero}${complemento}</p>
            <p><strong>Valor Mensal:</strong> ${valorFormatado}</p>
            <p><strong>Vagas:</strong> ${vagas}</p>
        `;
        republicasLista.appendChild(div);
    });
}

// Vincular eventos de filtro
function vincularEventosFiltro() {
    // Filtro automático ao mudar seleção
    selectBairro?.addEventListener("change", aplicarFiltros);
    filtroPreco?.addEventListener("input", aplicarFiltros);
    filtroVagas?.addEventListener("input", aplicarFiltros);
    
    // Botão de filtrar (opcional)
    botaoFiltrar?.addEventListener("click", aplicarFiltros);
}

// Botão add república
botaoAddRepublica?.addEventListener("click", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Para adicionar uma república, você precisa estar logado!");
        window.location.href = "login.html";
    } else {
        window.location.href = "adicionar_republica.html";
    }
});

// Inicialização ao Carregar a Página
document.addEventListener("DOMContentLoaded", () => {
    popularSelectBairros();
    vincularEventosFiltro();
    carregarRepublicas();

    const token = localStorage.getItem("token");
    if (token && botaoAddRepublica) {
        botaoAddRepublica.style.display = "block";
    }
});

// Alternar entre Login/Cadastro
botaoAlternar?.addEventListener("click", () => {
    ehLogin = !ehLogin;
    tituloFormulario.textContent = ehLogin ? "Login" : "Cadastro";
    campoNome.style.display = ehLogin ? "none" : "block";
    botaoAlternar.textContent = ehLogin ? "Criar conta" : "Já tem uma conta? Entre";
});

// Formulário de Login/Cadastro
formulario?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const nome = campoNome.value.trim();

    if (!email || !senha || (!ehLogin && !nome)) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    const endpoint = ehLogin ? "/login" : "/register";
    const corpo = ehLogin ? { email, password: senha } : { name: nome, email, password: senha };

    try {
        const resposta = await fetch(URL_BASE_API + endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpo),
        });
        if (!resposta.ok) throw new Error("Erro no login/cadastro.");

        alert(ehLogin ? "Login realizado com sucesso!" : "Cadastro concluído!");
        if (ehLogin) localStorage.setItem("token", (await resposta.json()).token);
        window.location.href = "index.html";
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
});

// ver a senha
document.getElementById("icone-senha")?.addEventListener("click", () => {
    const senhaInput = document.getElementById("senha");
    senhaInput.type = senhaInput.type === "password" ? "text" : "password";
});

// Adicionar república
document.getElementById("form-adicionar-republica")?.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    // Formulário republica
    const titulo = document.getElementById("titulo").value;
    const descricao = document.getElementById("descricao").value;
    const bairro = document.getElementById("bairro").value;
    const rua = document.getElementById("rua").value;
    const numero = parseInt(document.getElementById("numero").value);
    const complemento = document.getElementById("complemento").value;
    const valorMensal = parseFloat(document.getElementById("valorMensal").value);
    const vagas = parseInt(document.getElementById("vagas").value);

    // Validação dos campos
    if (!titulo || !descricao || !bairro || !rua || isNaN(numero) || isNaN(valorMensal) || isNaN(vagas)) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    try {
        const resposta = await fetch(`${URL_BASE_API}/republicas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                titulo,
                descricao,
                bairro,
                rua,
                numero,
                complemento,
                valorMensal,
                vagas
            })
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.error || "Erro ao cadastrar república.");
        }

        alert("República cadastrada com sucesso!");
        window.location.href = "index.html";
    } catch (erro) {
        console.error("Erro ao cadastrar república:", erro);
        alert(`Erro ao cadastrar república: ${erro.message}`);
    }
});