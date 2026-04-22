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

        // --- ATUALIZAÇÃO DO MURAL (CORRIGIDA) ---
        const muralElement = document.getElementById('mural-texto');
        if (muralElement) {
            if (!dados.mural || dados.mural.length === 0) {
                muralElement.innerHTML = "Nenhum recado hoje.";
            } else {
                // Transforma em lista se for um único recado, para o loop funcionar
                const listaRecados = Array.isArray(dados.mural) ? dados.mural : [dados.mural];
                
                let htmlMural = '<ul style="list-style: none; padding: 0; margin: 0;">';
                
                listaRecados.forEach(item => {
                    const partes = String(item).split(',');
                    const textoRecado = partes[1] ? partes[1].trim() : partes[0];
                    
                    if (textoRecado && textoRecado !== "undefined") {
                        htmlMural += `<li style="margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px dotted #ccc;">📢 ${textoRecado}</li>`;
                    }
                });
                
                htmlMural += '</ul>';
                // AQUI ESTAVA O ERRO: Usei muralElement.innerHTML = htmlMural;
                muralElement.innerHTML = htmlMural; 
            }
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
