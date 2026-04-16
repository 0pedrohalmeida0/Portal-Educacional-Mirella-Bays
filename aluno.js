const URL_API = "https://script.google.com/macros/s/AKfycbzPNg6hIov_h3CinoarDRsxJDsdukpdI6x1NPbq3f2saiadEuJBfG4XU32wvNKOwjaVwA/exec";

async function carregarPortal() {
    // 1. Busca o que o login salvou no localStorage
    const usuario = localStorage.getItem("usuarioLogado");
    const nivel = localStorage.getItem("nivelLogado");

    // 2. Pega o nível e coloca no ID do HTML
    const labelNivel = document.getElementById('label-nivel');
    if (labelNivel) {
        labelNivel.innerText = "Nível: " + (nivel || "A1");
    }

    // 3. Se não tiver usuário logado, expulsa para o login
    if (!usuario) {
        window.location.href = "index.html";
        return;
    }

    // 4. Pede ao Google o Mural e a Agenda
    try {
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({ 
                tipo: "CARREGAR_DADOS_ALUNO", 
                username: usuario 
            })
        });
        const dados = await response.json();

        // Preenche o Mural
        const mural = document.getElementById('conteudo-mural');
        if (mural && dados.mural) {
            mural.innerHTML = dados.mural.reverse().map(p => `
                <div class="post-it">
                    <p>${p[1]}</p>
                    <small>${new Date(p[2]).toLocaleDateString()}</small>
                </div>
            `).join('');
        }

        // Preenche a Agenda
        const agenda = document.getElementById('minha-agenda');
        if (agenda && dados.agenda) {
            agenda.innerHTML = dados.agenda.map(a => `
                <div class="card-aula"><span>Dia ${a[1]} às ${a[2]}</span></div>
            `).join('');
        }

    } catch (e) {
        console.error("Erro ao carregar os dados da planilha:", e);
    }
}

// Executa assim que a página terminar de carregar
document.addEventListener('DOMContentLoaded', carregarPortal);
