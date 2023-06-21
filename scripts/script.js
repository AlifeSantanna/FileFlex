var tableData = [];

function searchTable() {
  var input = document.getElementById("searchInput");
  var filter = input.value.toUpperCase();
  var table = document.getElementById("data-table");
  var rows = table.getElementsByTagName("tr");

  for (var i = 1; i < rows.length; i++) {
    var cells = rows[i].getElementsByTagName("td");
    var found = false;

    for (var j = 0; j < cells.length; j++) {
      var cell = cells[j];
      if (cell) {
        var text = cell.textContent || cell.innerText;
        if (text.toUpperCase().indexOf(filter) > -1) {
          found = true;
          break;
        }
      }
    }

    rows[i].style.display = found ? "" : "none";
  }
}

function displayDataInTable(data) {
  var table = document.getElementById("data-table");

  for (var i = 0; i < data.length; i++) {
    var row = table.insertRow(-1);
    var checkboxCell = row.insertCell(0);
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "row-checkbox";
    checkboxCell.appendChild(checkbox);

    var columnNames = Object.keys(data[i]);
    for (var j = 0; j < columnNames.length; j++) {
      var cell = row.insertCell(-1);
      cell.innerHTML = data[i][columnNames[j]];
    }

    var hour = parseInt(data[i]["Hora"]);
    var chapa = parseInt(data[i]["Chapa"]);
    if ([4, 5, 6, 7, 8, 9].includes(hour) || [parseInt("00000")].includes(chapa)) {
      row.style.backgroundColor = "#ff3c38ba";
      row.style.color = "#ffffff";
    }
  }
}

function showLoader() {
  var loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "flex";
  }
}

function hideLoader() {
  var loader = document.getElementById("loader");
  if (loader) {
    setTimeout(function () {
      loader.style.display = "none";
    }, 1000);
  }
}

function handleTXTFileChange(event) {
  var fileInput = event.target;
  var file = fileInput.files[0];
  var fileNameSpan = document.getElementById("txtFileName");
  var nextButton = document.getElementById("nextButton");

  if (file && file.type === "text/plain") {
    window.txtFile = file;
    fileNameSpan.textContent = file.name;
    nextButton.disabled = false;
  } else {
    fileNameSpan.textContent = "Clique ou arraste para adicionar algum arquivo";
    fileInput.value = "";
    nextButton.disabled = true;
  }
}

function processTXTFile() {
  if (window.txtFile) {
    const reader = new FileReader();

    reader.onload = function (event) {
      const content = event.target.result;
      const lines = content.trim().split("\n");
      const spacing = [10, 5, 2, 2, 2, 2, 2, 2, 6];

      const data = lines.map((line) => {
        let startIndex = 0;
        const row = [];

        for (let i = 0; i < spacing.length; i++) {
          const length = spacing[i];
          const chunk = line.substring(startIndex, startIndex + length);
          row.push(chunk.trim());
          startIndex += length;
        }

        return row.slice(1, -1);
      });

      const modifiedData = data.map((row) => {
        const columnNames = [
          "Chapa",
          "Dia",
          "Mês",
          "Ano",
          "Hora",
          "Minuto",
          "Segundo",
        ];

        return Object.fromEntries(
          row.map((value, index) => [columnNames[index], value])
        );
      });

      displayDataInTable(modifiedData);
      displayTotalData(modifiedData);
      countData(modifiedData);
      hideLoader();
    };

    reader.readAsText(window.txtFile);
  }
}

function displayTotalData(data) {
  var table = document.getElementById("data-table-final");
  var tbody = table.querySelector("tbody");

  // Limpar o conteúdo da tabela antes de exibir os dados atualizados
  tbody.innerHTML = "";

  for (var i = 0; i < data.length; i++) {
    var row = document.createElement("tr");

    var cellEmpresa = document.createElement("td");
    var inputEmpresa = document.createElement("span");
    inputEmpresa.type = "text";
    inputEmpresa.className = "empresa-input";
    cellEmpresa.appendChild(inputEmpresa);
    row.appendChild(cellEmpresa);

    var cellEstabelecimento = document.createElement("td");
    var inputEstabelecimento = document.createElement("span");
    inputEstabelecimento.type = "text";
    inputEstabelecimento.className = "estabelecimento-input";
    cellEstabelecimento.appendChild(inputEstabelecimento);
    row.appendChild(cellEstabelecimento);

    var cellChapa = document.createElement("td");
    var chapaValue = data[i]["Chapa"];
    var chapaWithZeros = chapaValue.toString().padStart(8, "0");
    cellChapa.textContent = chapaWithZeros;
    row.appendChild(cellChapa);

    var cellQuantitativo = document.createElement("td");
    var numRefeicoes = parseInt(data[i]["Nº de Refeições"]) || 0;
    var quantitativo = (numRefeicoes * 1000).toString().padStart(6, "0");
    
    var inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.maxLength = 6; // Define o limite máximo de caracteres
    inputElement.value = quantitativo;
    
    inputElement.addEventListener("input", function() {
      var inputValue = inputElement.value;
      if (inputValue.length > 6) {
        inputElement.value = inputValue.slice(0, 6); // Trunca o valor para 6 caracteres
      }
      quantitativo = inputElement.value;
    });
    
    cellQuantitativo.appendChild(inputElement);
    row.appendChild(cellQuantitativo);
    tbody.appendChild(row);
    
    
  }

  var totalInfoSpan = document.getElementById("totalInfoSpan");
  if (totalInfoSpan) {
    totalInfoSpan.textContent = "Total de informações: " + data.length;
  }
}

function updateInputValues() {
  var table = document.getElementById("data-table-final");
  var rows = table.getElementsByTagName("tr");

  // Começando do índice 1 para ignorar o cabeçalho da tabela
  for (var i = 1; i < rows.length; i++) {
    var cells = rows[i].getElementsByTagName("td");

    // Obter os inputs da linha atual
    var empresaInput = document.getElementById("empresa");
    var estabelecimentoInput = document.getElementById("estabelecimento");

    // Obter os valores digitados nos inputs
    var empresaValue = empresaInput.value;
    var estabelecimentoValue = estabelecimentoInput.value;

    // Atualizar os textContent das células da tabela
    cells[0].textContent = empresaValue;
    cells[1].textContent = estabelecimentoValue;
  }
}

function selectAllRows() {
  var checkboxes = document.querySelectorAll("#data-table .row-checkbox");

  for (var i = 0; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    var row = checkbox.parentNode.parentNode;
    var backgroundColor = row.style.backgroundColor;

    if (backgroundColor === "rgba(255, 60, 56, 0.73)") {
      checkbox.checked = !checkbox.checked;
    }
  }
}

function deleteSelectedRows() {
  var checkboxes = document.querySelectorAll("#data-table .row-checkbox");
  var totalInfoSpan = document.getElementById("totalInfoSpan");
  var rowCount = 0;

  for (var i = checkboxes.length - 1; i >= 0; i--) {
    if (checkboxes[i].checked) {
      var row = checkboxes[i].parentNode.parentNode;
      row.parentNode.removeChild(row);
    } else {
      rowCount++;
    }
  }

  if (totalInfoSpan) {
    totalInfoSpan.textContent = "Total de informações: " + rowCount;
  }
}

function updateStepThreeTable() {
  var tableTwoRows = document.querySelectorAll("#data-table tr");

  var finalTable = document.getElementById("data-table-final");
  var finalTableRows = finalTable.getElementsByTagName("tr");

  // Limpar a tabela do passo 3
  for (var i = finalTableRows.length - 1; i >= 0; i--) {
    finalTable.removeChild(finalTableRows[i]);
  }

  // Criar as linhas da tabela do passo 3 com base nos dados atualizados da tabela do passo 2
  for (var i = 1; i < tableTwoRows.length; i++) {
    var tableTwoRow = tableTwoRows[i];

    if (tableTwoRow.style.display !== "none") {
      var chapa = tableTwoRow.cells[1].textContent;
      var numRefeicoes = tableTwoRow.cells[3].textContent;
      var row = document.createElement("tr");
      var cellEmpresa = document.createElement("td");
      var inputEmpresa = document.createElement("input");
      inputEmpresa.type = "text";
      inputEmpresa.className = "empresa-input";
      cellEmpresa.appendChild(inputEmpresa);
      row.appendChild(cellEmpresa);

      var cellEstabelecimento = document.createElement("td");
      var inputEstabelecimento = document.createElement("input");
      inputEstabelecimento.type = "text";
      inputEstabelecimento.className = "estabelecimento-input";
      cellEstabelecimento.appendChild(inputEstabelecimento);
      row.appendChild(cellEstabelecimento);

      var cellChapa = document.createElement("td");
      cellChapa.textContent = chapa;
      row.appendChild(cellChapa);

      var cellNumRefeicoes = document.createElement("td");
      cellNumRefeicoes.textContent = numRefeicoes;
      row.appendChild(cellNumRefeicoes);

      var cellQuantitativo = document.createElement("td");
      var quantitativo = parseInt(numRefeicoes) * 1000;
      cellQuantitativo.textContent = quantitativo;
      row.appendChild(cellQuantitativo);

      finalTable.appendChild(row);
    }
  }
}

function deleteSelectedRows() {
  var checkboxes = document.querySelectorAll("#data-table .row-checkbox");
  var totalInfoSpan = document.getElementById("totalInfoSpan");
  var rowCount = 0;

  for (var i = checkboxes.length - 1; i >= 0; i--) {
    if (checkboxes[i].checked) {
      var row = checkboxes[i].parentNode.parentNode;
      row.parentNode.removeChild(row);
    } else {
      rowCount++;
    }
  }

  if (totalInfoSpan) {
    totalInfoSpan.textContent = "Total de informações: " + rowCount;
  }

  updateStepThreeTable(); // Atualizar a tabela do passo 3 após excluir as linhas no passo 2
}

function hideElements() {
  var step1 = document.getElementById("step1");
  var step2 = document.getElementById("step2");
  var nextButton = document.getElementById("nextButton");

  step1.style.display = "none";
  step2.style.display = "block";
  nextButton.textContent = "Próximo (2/3)";
}

var currentStep = 1;

function countChapaOccurrences(data, chapa) {
  var count = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i]["Chapa"] === chapa) {
      count++;
    }
  }
  return count;
}

function stepOne() {
  if (currentStep === 1) {
    processTXTFile();
    hideElements();
    currentStep = 2;
  } else if (currentStep === 2) {
    var step2 = document.getElementById("step2");
    var step3 = document.getElementById("step3");

    step2.style.display = "none";
    step3.style.display = "block";
    currentStep = 3;
    stepTwo();

    // Processar os dados atualizados do passo 2 no passo 3
    var table = document.getElementById("data-table");
    var rows = table.getElementsByTagName("tr");
    var data = [];
    var chapaOccurrences = {}; // Armazenar o número de ocorrências de cada chapa

    for (var i = 1; i < rows.length; i++) {
      var cells = rows[i].getElementsByTagName("td");
      var rowData = {};

      rowData["Empresa"] = ""; // Obtenha o valor da empresa, por exemplo: cells[1].textContent
      rowData["Estabelecimento"] = ""; // Obtenha o valor do estabelecimento, por exemplo: cells[2].textContent
      rowData["Chapa"] = cells[1].textContent;

      // Incrementar o contador de ocorrências da chapa
      if (chapaOccurrences[rowData["Chapa"]]) {
        chapaOccurrences[rowData["Chapa"]]++;
      } else {
        chapaOccurrences[rowData["Chapa"]] = 1;
        data.push(rowData);
      }
    }

    for (var i = 0; i < data.length; i++) {
      var chapa = data[i]["Chapa"];
      var numRefeicoes = chapaOccurrences[chapa];
      data[i]["Nº de Refeições"] = numRefeicoes;

      var quantitativo = (numRefeicoes * 1000).toString().padStart(6, "0");
      data[i]["Quantitativo"] = quantitativo;
    }

    displayDataInTable(data);
    displayTotalData(data);
    updateInputValues();
  }
}

function stepTwo() {
  var nextButton = document.getElementById("nextButton");
  nextButton.innerText = "Gerar arquivo";
  nextButton.onclick = stepThree;
  nextButton.disabled = false;
}

function stepThree() {
  var table = document.getElementById("data-table-final");
  var rows = table.getElementsByTagName("tr");

  var content = "";
  for (var i = 1; i < rows.length; i++) {
    var cells = rows[i].getElementsByTagName("td");

    if (cells.length > 0) {
      var empresa = cells[0].innerText.trim();
      var estabelecimento = cells[1].innerText.trim();
      var chapa = cells[2].innerText.trim();
      var quantitativo = cells[3].innerText.trim();
      var line = empresa + estabelecimento + chapa + quantitativo;
      content += line + "\n";
    }
  }

  // Create a Blob object to save the text content as a file
  var blob = new Blob([content], { type: "text/plain" });

  // Create a temporary link element to trigger the file download
  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Log_de_Acesso.txt";

  // Append the link to the document and trigger the click event
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
}
