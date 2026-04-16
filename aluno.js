const URL_API = "https://script.google.com/macros/s/AKfycbzPNg6hIov_h3CinoarDRsxJDsdukpdI6x1NPbq3f2saiadEuJBfG4XU32wvNKOwjaVwA/exec";

async function carregarPortal() {
    const usuario = localStorage.getItem("usuarioLogado");
    const nivel = localStorage.getItem("nivelLogado");

    const labelNivel = document.getElementById('label-nivel');
    if (labelNivel) {
        labelNivel.innerText = "Nível: " + (nivel || "A1");
    }

    if (!usuario) {
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({ 
                tipo: "CARREGAR_DADOS_ALUNO", 
                username: usuario 
            })
        });
        const dados = await response.json();

        // --- CORREÇÃO DO MURAL ---
        const muralElemento = document.getElementById('conteudo-mural'); // Definimos a variável aqui!
        if (muralElemento && dados.mural) {
            let htmlMural = "";
            
            // Usando forEach para processar um por um com segurança
            dados.mural.reverse().forEach(p => {
                let dataFormatada = "---";
                if (p[2]) {
                    const partes = String(p[2]).substring(0, 10).split('-');
                    if (partes.length === 3) {
                        dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
                    }
                }

                htmlMural += `
                    <div class="post-it">
                        <p>${p[1]}</p>
                        <small>${dataFormatada}</small>
                    </div>
                `;
            });
            muralElemento.innerHTML = htmlMural;
        }

        // --- CORREÇÃO DA AGENDA ---
        const agendaElemento = document.getElementById('minha-agenda');
        if (agendaElemento && dados.agenda) {
            let htmlAgenda = "";
            
            dados.agenda.forEach(a => {
                let dataAula = "---";
                if (a[1]) {
                    const partes = String(a[1]).substring(0, 10).split('-');
                    if (partes.length === 3) dataAula = `${partes[2]}/${partes[1]}/${partes[0]}`;
                }

                htmlAgenda += `
                    <div class="card-aula">
                        <span>Dia ${dataAula} às ${a[2]}</span>
                    </div>
                `;
            });
            agendaElemento.innerHTML = htmlAgenda;
        }

    } catch (e) {
        console.error("Erro ao carregar os dados da planilha:", e);
    }
}

document.addEventListener('DOMContentLoaded', carregarPortal);
