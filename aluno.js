const URL_API = "https://script.google.com/macros/s/AKfycbzPNg6hIov_h3CinoarDRsxJDsdukpdI6x1NPbq3f2saiadEuJBfG4XU32wvNKOwjaVwA/exec";

async function carregarPortal() {
    console.log("Função carregarPortal iniciada...");

    const usuario = localStorage.getItem("usuarioLogado");
    const nivel = localStorage.getItem("nivelLogado");

    if (!usuario) {
        window.location.href = "index.html";
        return;
    }

    // Preenche o nível (Sabemos que esse ID existe e funciona)
    const labelNivel = document.getElementById('label-nivel');
    if (labelNivel) {
        labelNivel.innerText = "Nível: " + (nivel || "A1");
    }

    try {
        console.log("Chamando Google API para:", usuario);
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({ 
                tipo: "CARREGAR_DADOS_ALUNO", 
                username: usuario 
            })
        });

        const dados = await response.json();
        console.log("Dados recebidos:", dados);

        // Atualiza o Mural
        const mural = document.getElementById('mural-texto');
        if (mural) mural.innerText = dados.mural || "Nenhum recado hoje.";

        // Atualiza a Agenda
        const agendaDiv = document.getElementById('agenda-aluno');
        if (agendaDiv) {
            if (!dados.agenda || dados.agenda.length === 0) {
                agendaDiv.innerHTML = "<p>Sem aulas agendadas.</p>";
            } else {
                let html = '<ul style="list-style:none; padding:0;">';
                dados.agenda.forEach(aula => {
                    let d = "---", h = "---";
                    if (aula[1]) {
                        const p = String(aula[1]).split('T')[0].split('-');
                        if (p.length === 3) d = `${p[2]}/${p[1]}/${p[0]}`;
                    }
                    if (aula[2]) {
                        const hb = String(aula[2]);
                        h = hb.includes('T') ? hb.split('T')[1].substring(0, 5) : hb;
                    }
                    html += `<li>📅 <b>${d}</b> às ⏰ ${h}</li>`;
                });
                html += '</ul>';
                agendaDiv.innerHTML = html;
            }
        }

    } catch (e) {
        console.error("Erro na chamada API:", e);
    }
}

// Garante que a função rode
document.addEventListener('DOMContentLoaded', () => {
    carregarPortal().catch(err => console.error("Erro na inicialização:", err));
});
