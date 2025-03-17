const URL_BASE_API = "http://localhost:3000";

const formulario = document.getElementById("form-autenticacao");
const botaoAlternar = document.getElementById("botao-alternar");
const tituloFormulario = document.getElementById("titulo-formulario");
const campoNome = document.getElementById("nome");

let ehLogin = true;

function mostrarSenha(){
    var inputPass = document.getElementById('senha')
    var btnShowPass = document.getElementById('icone-senha')

    if (inputPass.type === 'password'){
        inputPass.setAttribute('type', 'text')
        btnShowPass.classList.replace('bi-eye-fill', 'bi-eye-slash-fill')
    }else{ 
        inputPass.setAttribute('type', 'password')
        btnShowPass.classList.replace('bi-eye-slash-fill', 'bi-eye-fill')
    }
}

botaoAlternar.addEventListener("click", () => {
    ehLogin = !ehLogin;
    tituloFormulario.textContent = ehLogin ? "Login" : "Cadastro";
    campoNome.style.display = ehLogin ? "none" : "block";
    botaoAlternar.textContent = ehLogin ? "Criar conta" : "Já tem uma conta? Entre";
});

formulario.addEventListener("submit", async (evento) => {
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
        const resposta = await fetch(`${URL_BASE_API}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpo),
            mode: "cors" 
        });

        if (!resposta.ok) {
            const erroDados = await resposta.json();
            throw new Error(erroDados.error || "Erro desconhecido");
        }

        const dados = await resposta.json();
        alert(ehLogin ? "Login realizado com sucesso!" : "Cadastro concluído com sucesso!");
        
        if (ehLogin) {
            localStorage.setItem("token", dados.token);
        }
    } catch (erro) {
        console.error("Erro ao fazer requisição:", erro);
        alert("Erro ao conectar com o servidor: " + erro.message);
    }
});

