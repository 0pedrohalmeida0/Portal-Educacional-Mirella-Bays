const URL_API = "https://script.google.com/macros/s/AKfycbzPNg6hIov_h3CinoarDRsxJDsdukpdI6x1NPbq3f2saiadEuJBfG4XU32wvNKOwjaVwA/exec";

async function carregarPortal() {
    const usuario = localStorage.getItem("usuarioLogado");
    const nivel = localStorage.getItem("nivelLogado");

    if (!usuario) {
        window.location.href = "index.html";
        return;
    }

    const labelNivel = document.getElementById('label-nivel');
    if (labelNivel) labelNivel.innerText = "Nível: " + (nivel || "A1");

    try {
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({ tipo: "CARREGAR_DADOS_ALUNO", username: usuario })
        });

        const dados = await response.json();

        // --- AJUSTE DO MURAL (Para limpar as vírgulas e textos extras) ---
        const mural = document.getElementById('mural-texto');
        if (mural) {
            let recadoLimpo = "Nenhum recado hoje.";
            
            if (dados.mural) {
                // O split(',') corta a linha do Google nas vírgulas
                const partes = String(dados.mural).split(',');
                // Pegamos a segunda parte (o recado) se ela existir, senão a primeira.
                recadoLimpo = partes[1] ? partes[1].trim() : partes[0];
            }
            mural.innerText = recadoLimpo;
        }
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
