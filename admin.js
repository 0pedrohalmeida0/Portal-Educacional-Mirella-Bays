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

// 7. AGENDAR AULA (NOVA VERSÃO COM RECORRÊNCIA)
async function salvarAgendamento() {
    // 1. Pega os novos campos que você colocou no HTML
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    const hora = document.getElementById('hora-aula').value;
    
    // 2. Pega os dias da semana marcados (Segunda, Terça, etc.)
    const checkboxes = document.querySelectorAll('#dias-semana input:checked');
    const diasSemana = Array.from(checkboxes).map(cb => parseInt(cb.value));

    // 3. Validações usando sua variável alunoSelecionado
    if (!alunoSelecionado) return alert("Selecione um aluno na lista primeiro!");
    if (!dataInicio || !dataFim || !hora) return alert("Preencha o período (Início/Fim) e o horário!");
    if (diasSemana.length === 0) return alert("Selecione pelo menos um dia da semana!");

    try {
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({
                tipo: "AGENDAR_AULA",
                username: alunoSelecionado, // Sua variável global
                dataInicio: dataInicio,
                dataFim: dataFim,
                hora: hora,
                diasSemana: diasSemana
            })
        });

        const resultado = await response.json();
        alert(resultado); // Vai mostrar ex: "8 aulas agendadas!"

        // Limpa os campos para o próximo agendamento
        document.getElementById('data-inicio').value = "";
        document.getElementById('data-fim').value = "";
        document.getElementById('hora-aula').value = "";
        checkboxes.forEach(cb => cb.checked = false);

    } catch (e) {
        console.error(e);
        alert("Erro ao agendar as aulas.");
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

        if (!aulas || aulas.length === 0) {
            calendarioDiv.innerHTML = "<p>Não há aulas agendadas.</p>";
            return;
        }

        // Ordenação segura
        aulas.sort((a, b) => String(a[1]).localeCompare(String(b[1])));

        let html = '<table class="tabela-agenda">';
        html += '<thead><tr><th>Aluno</th><th>Data</th><th>Hora</th></tr></thead><tbody>';
        
        aulas.forEach(aula => {
            // 1. TRATAMENTO DA DATA
            let dataExibicao = "---";
            if (aula[1]) {
                const dataPura = String(aula[1]).split('T')[0];
                const partes = dataPura.split('-');
                if (partes.length === 3) {
                    dataExibicao = `${partes[2]}/${partes[1]}/${partes[0]}`;
                }
            }

            // 2. TRATAMENTO DA HORA (Para sumir com o 1899)
            let horaExibicao = "---";
            if (aula[2]) {
                const horaBruta = String(aula[2]);
                if (horaBruta.includes('T')) {
                    // Pega o que está DEPOIS do T (09:51:28) e corta os segundos
                    horaExibicao = horaBruta.split('T')[1].substring(0, 5);
                } else {
                    horaExibicao = horaBruta; // Caso já venha limpo
                }
            }

            html += `
                <tr>
                    <td><strong>${aula[0]}</strong></td>
                    <td>${dataExibicao}</td>
                    <td>${horaExibicao}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        calendarioDiv.innerHTML = html;

    } catch (e) {
        console.error("Erro fatal na agenda:", e);
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
