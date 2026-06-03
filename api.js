function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var res;
  
  try {
    var dados = JSON.parse(e.postData.contents);
    var tipo = dados.tipo;

    var abaUsuarios = ss.getSheetByName("Usuarios");
    var abaMural = ss.getSheetByName("Mural");
    var abaAgenda = ss.getSheetByName("Agenda");

    switch (tipo) {
      
      case "LOGIN_ALUNO":
        var registros = abaUsuarios.getDataRange().getValues();
        var loginSucesso = false;
        var nivelEncontrado = ""; 
        for (var i = 1; i < registros.length; i++) {
          if (registros[i][1].toString().trim().toLowerCase() === dados.username.toString().trim().toLowerCase() && 
              registros[i][2].toString().trim() === dados.senha.toString().trim()) {
            loginSucesso = true;
            nivelEncontrado = registros[i][3]; 
            break;
          }
        }
        res = { sucesso: loginSucesso, nivel: nivelEncontrado };
        break;

      case "CADASTRO_ALUNO":
        abaUsuarios.appendRow([dados.nome, dados.username, dados.senha, dados.nivel, new Date()]);
        res = "Usuário cadastrado com sucesso!";
        break;

      case "LISTAR_ALUNOS":
        var lista = abaUsuarios.getDataRange().getValues();
        lista.shift(); 
        res = lista;
        break;

      case "CARREGAR_DADOS_ALUNO":
        var userBusca = dados.username.toLowerCase();
        var mural = abaMural.getDataRange().getValues();
        var agenda = abaAgenda.getDataRange().getValues();
        var recados = mural.filter(row => row[0].toString().toLowerCase() === userBusca || row[0] === "GERAL");
        var aulas = agenda.filter(row => row[0].toString().toLowerCase() === userBusca);
        res = { mural: recados, agenda: aulas };
        break;

      case "LISTAR_AGENDA_GERAL":
        var aulasGerais = abaAgenda.getDataRange().getValues();
        aulasGerais.shift(); // Remove o cabeçalho
        res = aulasGerais;
        break;

      case "ATUALIZAR_NIVEL":
        var registrosNivel = abaUsuarios.getDataRange().getValues();
        for (var i = 1; i < registrosNivel.length; i++) {
          if (registrosNivel[i][1].toString().toLowerCase() === dados.username.toLowerCase()) {
            abaUsuarios.getRange(i + 1, 4).setValue(dados.nivel); // Coluna D (4)
            res = "Nível atualizado!";
            break;
          }
        }
        break;

      case "POSTAR_MURAL":
        abaMural.appendRow([dados.username, dados.mensagem, new Date()]);
        res = "Mensagem postada!";
        break;

      // NOVO: AGENDAMENTO COM RECORRÊNCIA E ID
      case "AGENDAR_AULA":
        var aulasParaInserir = [];
        var dataAtual = new Date(dados.dataInicio + 'T00:00:00');
        var dataFinal = new Date(dados.dataFim + 'T23:59:59');
        var diasEscolhidos = dados.diasSemana; // Ex: [1, 3] para Seg e Qua

        while (dataAtual <= dataFinal) {
          var diaSemana = dataAtual.getDay();
          if (diasEscolhidos.includes(diaSemana)) {
            // Cria ID único para cada aula
            var idUnico = "ID-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
            
            // Ordem das colunas: Aluno, Data, Hora, Status, ID
            aulasParaInserir.push([
              dados.username, 
              new Date(dataAtual), 
              dados.hora, 
              "Agendada", 
              idUnico
            ]);
          }
          dataAtual.setDate(dataAtual.getDate() + 1);
        }

        if (aulasParaInserir.length > 0) {
          abaAgenda.getRange(abaAgenda.getLastRow() + 1, 1, aulasParaInserir.length, 5).setValues(aulasParaInserir);
          res = aulasParaInserir.length + " aulas agendadas!";
        } else {
          res = "Nenhuma data válida encontrada no período.";
        }
        break;

      // NOVO: CANCELAR AULA POR ID
      case "CANCELAR_AULA":
        var registrosAgenda = abaAgenda.getDataRange().getValues();
        var excluiu = false;
        for (var i = 1; i < registrosAgenda.length; i++) {
          if (registrosAgenda[i][4].toString() === dados.idAula.toString()) {
            abaAgenda.deleteRow(i + 1);
            excluiu = true;
            res = "Aula cancelada!";
            break;
          }
        }
        if (!excluiu) res = "Aula não encontrada.";
        break;

      case "EXCLUIR_ALUNO":
        var registrosExcluir = abaUsuarios.getDataRange().getValues();
        for (var i = 1; i < registrosExcluir.length; i++) {
          if (registrosExcluir[i][1].toString().toLowerCase() === dados.username.toLowerCase()) {
            abaUsuarios.deleteRow(i + 1);
            res = "Aluno removido!";
            break;
          }
        }
        break;

      default:
        res = "Ação não encontrada: " + tipo;
    }

    return ContentService.createTextOutput(JSON.stringify(res))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (erro) {
    return ContentService.createTextOutput(JSON.stringify("Erro: " + erro.message))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
