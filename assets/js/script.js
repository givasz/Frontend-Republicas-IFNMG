const URL_BASE_API = "https://backend-republicas-ifnmg.onrender.com";

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
const botaoMinhasRepublicas = document.getElementById("btn-minhas-republicas");
const botaoLogin = document.getElementById("btn-login");

// Variáveis de estado
let ehLogin = true;
let todasRepublicas = [];
let modoMinhasRepublicas = false;

// Lista de bairros atualizada
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

// Decodifica o token JWT - meio obsoleta mas mantive
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

//Dropdown de bairros com as opções disponíveis

function popularSelectBairros() {
    bairros.forEach(bairro => {
        const option = document.createElement("option");
        option.value = bairro;
        option.textContent = bairro;
        selectBairro.appendChild(option);
    });
}

//Carrega todas as repúblicas da API
async function carregarRepublicas() {
    try {
        const resposta = await fetch(`${URL_BASE_API}/republicas`);
        if (!resposta.ok) throw new Error("Erro ao buscar repúblicas.");
       
        todasRepublicas = await resposta.json();
        aplicarFiltros();
        modoMinhasRepublicas = false;
    } catch (erro) {
        console.error("Erro ao carregar repúblicas:", erro);
        republicasLista.innerHTML = `
            <div class="p-4 text-red-500 text-center">
                Erro ao carregar repúblicas. Tente recarregar a página.
            </div>
        `;
    }
}

//Carrega as repúblicas do usuário logado
async function carregarRepublicasDoUsuario() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Faça login para ver suas repúblicas!");
            window.location.href = "login.html";
            return;
        }

        const resposta = await fetch(`${URL_BASE_API}/minhasrepublicas`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!resposta.ok) throw new Error("Erro ao buscar suas repúblicas");

        const republicas = await resposta.json();
        exibirRepublicas(republicas, true);
        modoMinhasRepublicas = true;

    } catch (erro) {
        console.error("Erro:", erro);
        republicasLista.innerHTML = `
            <div class="p-4 text-red-500 text-center">
                ${erro.message || "Erro ao carregar suas repúblicas"}
            </div>
        `;
    }
}

//Aplica os filtros selecionados na lista de repúblicas
function aplicarFiltros() {
    if (modoMinhasRepublicas) {
        carregarRepublicasDoUsuario();
        return;
    }

    const bairroSelecionado = selectBairro.value.toUpperCase();
    const precoMax = parseFloat(filtroPreco.value) || Infinity;
    const vagasMin = parseInt(filtroVagas.value) || 0;

    const republicasFiltradas = todasRepublicas.filter(rep => {
        const bairroRep = rep.bairro?.trim().toUpperCase() || '';
        return (!bairroSelecionado || bairroRep === bairroSelecionado) &&
               rep.valorMensal <= precoMax &&
               rep.vagas >= vagasMin;
    });

    exibirRepublicas(republicasFiltradas);
}

//Exibe as repúblicas na tela
function exibirRepublicas(republicas, mostrarBotoes = false) {
    republicasLista.innerHTML = "";

    if (!republicas || republicas.length === 0) {
        republicasLista.innerHTML = `
            <div class="p-4 text-gray-400 text-center italic">
                Nenhuma república encontrada.
            </div>
        `;
        return;
    }

    republicas.forEach(rep => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-lg shadow-md p-4 transition-transform hover:-translate-y-1";
       
        const titulo = rep.titulo || "República sem nome";
        const descricao = rep.descricao || "Sem descrição disponível";
        const valorFormatado = rep.valorMensal ? `R$${rep.valorMensal.toFixed(2)}` : "Valor não informado";

        // Botões de add/excluir
        const botoes = mostrarBotoes ? `
            <div class="mt-4 flex gap-2">
                <button onclick="editarRepublica(${rep.id})" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button onclick="excluirRepublica(${rep.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                    <i class="bi bi-trash"></i> Excluir
                </button>
            </div>
        ` : '';

        card.innerHTML = `
            <h3 class="text-xl font-semibold mb-2 text-gray-800 border-b pb-2">${titulo}</h3>
            <p class="text-gray-600 mb-3">${descricao}</p>
            <div class="space-y-1 text-sm">
                <p><span class="font-medium text-gray-800">Bairro:</span> ${rep.bairro || "Não informado"}</p>
                <p><span class="font-medium text-gray-800">Endereço:</span> ${rep.rua || "Não informada"}, ${rep.numero ?? "s/n"}${rep.complemento ? ` - ${rep.complemento}` : ''}</p>
                <p><span class="font-medium text-gray-800">Valor Mensal:</span> ${valorFormatado}</p>
                <p><span class="font-medium text-gray-800">Vagas:</span> ${rep.vagas ?? "Não informado"}</p>
            </div>
            ${botoes}
        `;
        republicasLista.appendChild(card);
    });
}

//Edita república
async function editarRepublica(id) {
    window.location.href = `editar_republica.html?id=${id}`;
}

//Exclui república

async function excluirRepublica(id) {
    if (!confirm("Tem certeza que deseja excluir esta república?")) return;

    try {
        const resposta = await fetch(`${URL_BASE_API}/republicas/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!resposta.ok) throw new Error("Erro ao excluir");
        alert("República excluída com sucesso!");
        carregarRepublicasDoUsuario(); // Recarrega a lista
    } catch (erro) {
        alert(erro.message || "Erro ao excluir república");
    }
}

// Vincula os eventos de filtro aos elementos

function vincularEventosFiltro() {
    selectBairro?.addEventListener("change", aplicarFiltros);
    filtroPreco?.addEventListener("input", aplicarFiltros);
    filtroVagas?.addEventListener("input", aplicarFiltros);
    botaoFiltrar?.addEventListener("click", aplicarFiltros);
}

//Alterna login e cadastro

function alternarLoginCadastro() {
    ehLogin = !ehLogin;
    tituloFormulario.textContent = ehLogin ? "Login" : "Cadastro";
    campoNome.style.display = ehLogin ? "none" : "block";
    botaoAlternar.textContent = ehLogin ? "Criar conta" : "Já tem uma conta? Entre";
}

// Manipula o envio do formulário de autenticação

async function handleAutenticacao(evento) {
    evento.preventDefault();
   
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const nome = campoNome.value.trim();

    if (!email || !senha || (!ehLogin && !nome)) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    try {
        const endpoint = ehLogin ? "/login" : "/register";
        const corpo = ehLogin ? { email, password: senha } : { name: nome, email, password: senha };

        const resposta = await fetch(URL_BASE_API + endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpo),
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.message || "Erro no login/cadastro.");
        }

        if (ehLogin) {
            const { token } = await resposta.json();
            localStorage.setItem("token", token);
        }

        alert(ehLogin ? "Login realizado com sucesso!" : "Cadastro concluído!");
        window.location.href = "index.html";
    } catch (erro) {
        console.error("Erro:", erro);
        alert(erro.message || "Erro ao conectar com o servidor.");
    }
}

// Manipula o envio do formulário de nova república

async function handleNovaRepublica(evento) {
    evento.preventDefault();

    const formData = {
        titulo: document.getElementById("titulo").value,
        descricao: document.getElementById("descricao").value,
        bairro: document.getElementById("bairro").value,
        rua: document.getElementById("rua").value,
        numero: parseInt(document.getElementById("numero").value),
        complemento: document.getElementById("complemento").value,
        valorMensal: parseFloat(document.getElementById("valorMensal").value),
        vagas: parseInt(document.getElementById("vagas").value)
    };

    // Validação
    if (!formData.titulo || !formData.descricao || !formData.bairro ||
        !formData.rua || isNaN(formData.numero) ||
        isNaN(formData.valorMensal) || isNaN(formData.vagas)) {
        alert("Preencha todos os campos obrigatórios corretamente!");
        return;
    }

    try {
        const resposta = await fetch(`${URL_BASE_API}/republicas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(formData)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.error || "Erro ao cadastrar república.");
        }

        alert("República cadastrada com sucesso!");
        window.location.href = "index.html";
    } catch (erro) {
        console.error("Erro ao cadastrar república:", erro);
        alert(`Erro: ${erro.message}`);
    }
}

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", () => {
    popularSelectBairros();
    vincularEventosFiltro();
    carregarRepublicas();

    if (localStorage.getItem("token") && botaoAddRepublica) {
        botaoAddRepublica.classList.remove("hidden");
    }

    botaoMinhasRepublicas?.addEventListener("click", carregarRepublicasDoUsuario);
});

// Event Listeners
botaoAlternar?.addEventListener("click", alternarLoginCadastro);
formulario?.addEventListener("submit", handleAutenticacao);

document.getElementById("icone-senha")?.addEventListener("click", function() {
    const senhaInput = document.getElementById("senha");
    const icone = this;
    senhaInput.type = senhaInput.type === "password" ? "text" : "password";
    icone.classList.toggle("bi-eye-fill");
    icone.classList.toggle("bi-eye-slash-fill");
});

document.getElementById("form-adicionar-republica")?.addEventListener("submit", handleNovaRepublica);

// Botão para adicionar república
botaoAddRepublica?.addEventListener("click", () => {
    if (!localStorage.getItem("token")) {
        window.location.href = "login.html";
    } else {
        window.location.href = "adicionar_republica.html";
    }
});

// Botão de login 
botaoLogin?.addEventListener("click", () => {
    window.location.href = "login.html";
});