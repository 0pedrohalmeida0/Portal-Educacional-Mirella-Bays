const URL_API = "https://script.google.com/macros/s/AKfycbzPNg6hIov_h3CinoarDRsxJDsdukpdI6x1NPbq3f2saiadEuJBfG4XU32wvNKOwjaVwA/exec";
let alunoSelecionado = null; // Guarda o username do aluno clicado

// 1. NAVEGAÇÃO ENTRE ABAS
function mostrarAba(idAba) {
    document.querySelectorAll('.tab-content').forEach(aba => {
        aba.style.display = 'none';
    });
    document.getElementById(idAba).style.display = 'block';

    if (idAba === 'aba-lista-usuarios') {
        listarAlunos();
    }
}

// 2. CADASTRAR NOVO ALUNO
async function salvarNovoUsuario() {
    const nome = document.getElementById('reg-nome').value.trim();
    const user = document.getElementById('reg-user').value.trim();
    const senha = document.getElementById('reg-senha').value.trim();
    const nivel = document.getElementById('reg-nivel').value;

    if (!nome || !user || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    const btn = document.querySelector('.btn-save');
    btn.innerText = "Salvando...";
    btn.disabled = true;

    try {
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({
                tipo: "CADASTRO_ALUNO",
                nome: nome,
                username: user,
                senha: senha,
                nivel: nivel
            })
        });
        const res = await response.json();
        alert(res);
        document.getElementById('form-cadastro-aluno').reset();
    } catch (e) {
        alert("Erro ao cadastrar aluno.");
    } finally {
        btn.innerText = "Cadastrar Aluno";
        btn.disabled = false;
    }
}

// 3. LISTAR ALUNOS CADASTRADOS
async function listarAlunos() {
    const container = document.getElementById('container-lista-alunos');
    container.innerHTML = "<p>Carregando alunos...</p>";

    try {
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({ tipo: "LISTAR_ALUNOS" })
        });
        const alunos = await response.json();

        if (alunos.length === 0) {
            container.innerHTML = "<p>Nenhum aluno encontrado.</p>";
            return;
        }

        let html = '<div class="lista-botoes-alunos">';
        alunos.forEach(aluno => {
            // aluno[0] = Nome, aluno[1] = Username
            html += `
                <button class="btn-aluno-item" onclick="verDetalhes('${aluno[1]}', '${aluno[0]}')">
                    ${aluno[0]} (${aluno[1]})
                </button>
            `;
        });
        html += '</div>';
        container.innerHTML = html;

    } catch (e) {
        container.innerHTML = "<p>Erro ao carregar lista.</p>";
    }
}

// 4. VER DETALHES DO ALUNO
function verDetalhes(username, nome) {
    alunoSelecionado = username;
    document.getElementById('detalhes-aluno').style.display = 'block';
    document.getElementById('nome-aluno-selecionado').innerText = "Aluno: " + nome;
    
    // Limpa campos de ações anteriores
    document.getElementById('msg-mural').value = "";
    
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}
// 5. ATUALIZAR NÍVEL DO ALUNO
async function atualizarNivel() {
    const novoNivel = document.getElementById('edit-nivel-aluno').value;
    
    if (!alunoSelecionado) return alert("Selecione um aluno primeiro!");

    try {
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({
                tipo: "ATUALIZAR_NIVEL",
                username: alunoSelecionado,
                nivel: novoNivel
            })
        });
        const res = await response.json();
        alert("Nível atualizado com sucesso!");
    } catch (e) {
        alert("Erro ao atualizar nível.");
    }
}

// 6. PUBLICAR NO MURAL
async function publicarNoMural() {
    const mensagem = document.getElementById('msg-mural').value.trim();
    
    if (!alunoSelecionado) return alert("Selecione um aluno!");
    if (!mensagem) return alert("Escreva algo para o mural!");

    try {
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({
                tipo: "POSTAR_MURAL",
                username: alunoSelecionado,
                mensagem: mensagem
            })
        });
        alert("Mensagem publicada!");
        document.getElementById('msg-mural').value = ""; // Limpa o campo
    } catch (e) {
        alert("Erro ao publicar no mural.");
    }
}

// 7. AGENDAR AULA
async function agendarAula() {
    const data = document.getElementById('data-aula').value;
    const hora = document.getElementById('hora-aula').value;

    if (!alunoSelecionado) return alert("Selecione um aluno!");
    if (!data || !hora) return alert("Preencha data e hora!");

    try {
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({
                tipo: "AGENDAR_AULA",
                username: alunoSelecionado,
                data: data,
                hora: hora
            })
        });
        alert("Aula agendada com sucesso!");
        document.getElementById('data-aula').value = "";
        document.getElementById('hora-aula').value = "";
    } catch (e) {
        alert("Erro ao agendar aula.");
    }
}

// 8. EXCLUIR USUÁRIO (Cuidado!)
async function excluirUsuario() {
    if (!alunoSelecionado) return;
    
    if (!confirm(`Tem certeza que deseja excluir o aluno ${alunoSelecionado}?`)) return;

    try {
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({
                tipo: "EXCLUIR_ALUNO",
                username: alunoSelecionado
            })
        });
        alert("Aluno excluído!");
        document.getElementById('detalhes-aluno').style.display = 'none';
        listarAlunos(); // Atualiza a lista para remover o nome de lá
    } catch (e) {
        alert("Erro ao excluir aluno.");
    }
}
// 9. CARREGAR TODAS AS AULAS NA AGENDA GERAL
async function carregarAgendaGeral() {
    const calendarioDiv = document.getElementById('calendario-admin');
    calendarioDiv.innerHTML = "<p>Buscando aulas...</p>";

    try {
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({ tipo: "LISTAR_AGENDA_GERAL" })
        });
        const aulas = await response.json();

        if (aulas.length === 0) {
            calendarioDiv.innerHTML = "<p>Não há aulas agendadas.</p>";
            return;
        }

        // Ordenação segura por texto (AAAA-MM-DD)
        aulas.sort((a, b) => String(a[1]).localeCompare(String(b[1])));

        let html = '<table class="tabela-agenda">';
        html += '<thead><tr><th>Aluno</th><th>Data</th><th>Hora</th></tr></thead><tbody>';
        
        aulas.forEach(aula => {
            let dataExibicao = "---";
            if (aula[1]) {
                const partes = String(aula[1]).substring(0, 10).split('-');
                if (partes.length === 3) {
                    dataExibicao = `${partes[2]}/${partes[1]}/${partes[0]}`;
                } else {
                    dataExibicao = String(aula[1]); 
                }
            }

            html += `
                <tr>
                    <td><strong>${aula[0]}</strong></td>
                    <td>${dataExibicao}</td>
                    <td>${aula[2]}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        calendarioDiv.innerHTML = html;

    } catch (e) {
        calendarioDiv.innerHTML = "<p>Erro ao carregar agenda.</p>";
    }
}

// Função mostrarAba para incluir essa chamada:
function mostrarAba(idAba) {
    document.querySelectorAll('.tab-content').forEach(aba => {
        aba.style.display = 'none';
    });
    document.getElementById(idAba).style.display = 'block';

    if (idAba === 'aba-lista-usuarios') {
        listarAlunos();
    } 
    else if (idAba === 'aba-agenda-geral') {
        carregarAgendaGeral();
    }
}
