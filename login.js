const URL_API = "https://script.google.com/macros/s/AKfycbzPNg6hIov_h3CinoarDRsxJDsdukpdI6x1NPbq3f2saiadEuJBfG4XU32wvNKOwjaVwA/exec";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const btn = document.getElementById('btn-login');
    const messageArea = document.getElementById('login-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede a página de recarregar

        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();

        // 1. Visual: Desativa o botão enquanto carrega
        const textoOriginal = btn.innerText;
        btn.innerText = "Verificando...";
        btn.disabled = true;
        messageArea.innerText = "";

        // 2. Loga no Admin (Mirella)
        if (user === "Mirella.bays" && pass === "bays123") {
            localStorage.setItem("usuarioLogado", "Mirella");
            localStorage.setItem("tipoUsuario", "admin");
            window.location.href = "admin.html";
            return;
        }

        // 3. Verificação: Aluno (Via Google Planilha)
        try {
            const response = await fetch(URL_API, {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    tipo: "LOGIN_ALUNO",
                    username: user,
                    senha: pass
                })
            });

            const resultado = await response.json();

            if (resultado.sucesso) {
                localStorage.setItem("usuarioLogado", user);
                localStorage.setItem("nivelLogado", resultado.nivel || "A1");
                localStorage.setItem("tipoUsuario", "aluno");

                // Vai para a página do aluno
                window.location.href = "aluno.html";
            } else {
                messageArea.innerText = "Usuário ou senha incorretos!";
                btn.innerText = textoOriginal;
                btn.disabled = false;
            }

        } catch (erro) {
            console.error("Erro no login:", erro);
            messageArea.innerText = "Erro ao conectar com o servidor.";
            btn.innerText = textoOriginal;
            btn.disabled = false;
        }
    });
});
