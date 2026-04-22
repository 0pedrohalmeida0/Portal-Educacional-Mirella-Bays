const URL_API = "https://script.google.com/macros/s/AKfycbzPNg6hIov_h3CinoarDRsxJDsdukpdI6x1NPbq3f2saiadEuJBfG4XU32wvNKOwjaVwA/exec";

async function carregarPortal() {
    // 1. Busca o que o login salvou no "baú" (localStorage)
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

    // 4. Agora pede ao Google o Mural e a Agenda
    try {
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({ 
                tipo: "CARREGAR_DADOS_ALUNO", 
                username: usuario 
            })
        });

        const dados = await response.json();

        // 1. ATUALIZAR MURAL
        const muralElement = document.getElementById('mural-texto');
        if (muralElement) {
            muralElement.innerText = dados.mural || "Nenhum recado hoje.";
        }

        // 2. ATUALIZAR AGENDA DO ALUNO
        const agendaDiv = document.getElementById('agenda-aluno');
        
        if (agendaDiv) {
            if (!dados.agenda || dados.agenda.length === 0) {
                agendaDiv.innerHTML = "<p>Você não tem aulas agendadas.</p>";
            } else {
                let htmlAgenda = '<ul class="lista-agenda-aluno">';
                
                dados.agenda.forEach(aula => {
                    // TRATAMENTO DA DATA
                    let dataExibicao = "---";
                    if (aula[1]) {
                        const dataPura = String(aula[1]).split('T')[0];
                        const partes = dataPura.split('-');
                        if (partes.length === 3) {
                            dataExibicao = `${partes[2]}/${partes[1]}/${partes[0]}`;
                        }
                    }

                    // TRATAMENTO DA HORA
                    let horaExibicao = "---";
                    if (aula[2]) {
                        const horaBruta = String(aula[2]);
                        if (horaBruta.includes('T')) {
                            horaExibicao = horaBruta.split('T')[1].substring(0, 5);
                        } else {
                            horaExibicao = horaBruta;
                        }
                    }

                    htmlAgenda += `<li>📅 <strong>${dataExibicao}</strong> às ⏰ ${horaExibicao}</li>`;
                });
                
                htmlAgenda += '</ul>';
                agendaDiv.innerHTML = htmlAgenda;
            }
        }

    } catch (e) {
        console.error("Erro ao carregar dados do aluno:", e);
    }
} // Fechamento da função carregarPortal

// Executa assim que a página terminar de carregar
document.addEventListener('DOMContentLoaded', carregarPortal);
