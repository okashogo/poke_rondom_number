const totalPokemon = 1025;
let currentNumber = null;
let memorizedPokemon = [];
let filteredPokemon = [];
let hintNumbers = [];
let displayedAnswerNumbers = [];
let hint1Used = false;

document.addEventListener('DOMContentLoaded', function () {
  const pokemonTable = document.getElementById('pokemonTable');
  pokemonTable.innerHTML = createPokemonTable();

  // ローカルストレージから状態を読み込む
  loadStateFromLocalStorage();

  document.getElementById('applyFilter').addEventListener('click', applyFilter);
  document.getElementById('memorizedButton').addEventListener('click', memorizePokemon);
  document.getElementById('notMemorizedButton').addEventListener('click', notMemorized);
  document.getElementById('showAnswerButton').addEventListener('click', showAnswer);
  document.getElementById('hint1Button').addEventListener('click', showHint1);
  document.getElementById('hint2Button').addEventListener('click', showHint2);
  document.getElementById('resetMemorizedButton').addEventListener('click', resetMemorizedPokemon);

  // 初期表示: ページを読み込んだときにランダムなポケモンを表示
  applyFilter();
});

function createPokemonTable() {
  let html = '<table>';
  for (let i = 1; i <= totalPokemon; i++) {
    if (i % 20 === 1) html += `<tr id="row-${Math.floor((i - 1) / 20) + 1}">`; // <tr>には行番号を追加
    html += `<td id="pokemon-${i}">${i}</td>`;
    if (i % 20 === 0) html += '</tr>';
  }
  html += '</table>';
  return html;
}

function applyFilter() {
  const numberInput = document.getElementById('numberInput').value;
  const fromNumber = parseInt(document.getElementById('fromNumber').value, 10);
  const toNumber = parseInt(document.getElementById('toNumber').value, 10);

  // 数字をカンマ区切りで指定
  let numberList = [];
  if (numberInput) {
    numberList = numberInput.split(',').map(num => parseInt(num.trim(), 10)).filter(num => num >= 1 && num <= totalPokemon);
  }

  // Noのfrom-to指定
  let rangeList = [];
  if (!isNaN(fromNumber) && !isNaN(toNumber)) {
    for (let i = fromNumber; i <= toNumber; i++) {
      rangeList.push(i);
    }
  }

  // 両方が指定された場合は両方の条件に合う番号を絞り込む
  if (numberList.length > 0 && rangeList.length > 0) {
    filteredPokemon = numberList.filter(num => rangeList.includes(num));
  } else if (numberList.length > 0) {
    filteredPokemon = numberList;
  } else if (rangeList.length > 0) {
    filteredPokemon = rangeList;
  } else {
    filteredPokemon = Array.from({ length: totalPokemon }, (_, i) => i + 1); // 全範囲が対象
  }

  updateTableColors();
  pickRandomPokemon(); // フィルターに基づきランダム表示
  saveStateToLocalStorage(); // 絞り込み条件を保存
}

function updateTableColors() {
  document.querySelectorAll('#pokemonTable td').forEach(td => {
    const num = parseInt(td.id.replace('pokemon-', ''));
    if (filteredPokemon.includes(num)) {
      td.classList.remove('not-filtered');
    } else {
      td.classList.add('not-filtered');
    }
  });
}

function pickRandomPokemon() {
  clearAll(); // 前回のヒントと答えをすべてクリア

  const availablePokemon = filteredPokemon.filter(num => !memorizedPokemon.includes(num));
  if (availablePokemon.length === 0) {
    return alert('全てのポケモンを覚えました！');
  }

  currentNumber = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
  highlightPokemon(currentNumber);
  displayHintsForDefault(currentNumber); // デフォルトのヒントを表示
  document.getElementById('hint2Button').disabled = true;
  hint1Used = false;

  // <table>の行表示を調整
  showRelevantRows(currentNumber);
}

function highlightPokemon(number) {
  document.querySelectorAll('#pokemonTable td').forEach(td => td.classList.remove('selected'));
  document.getElementById(`pokemon-${number}`).classList.add('selected');
}

function memorizePokemon() {
  if (currentNumber !== null && !memorizedPokemon.includes(currentNumber)) {
    memorizedPokemon.push(currentNumber);
    resetSelection();
    pickRandomPokemon(); // 次のポケモンを自動で表示
    updateMemorizedColors();
    saveStateToLocalStorage(); // 覚えたポケモンを保存
  }
}

function notMemorized() {
  resetSelection();
  pickRandomPokemon(); // 覚えていない場合も次のポケモンを表示
}

function resetSelection() {
  document.querySelectorAll('#pokemonTable td').forEach(td => td.classList.remove('selected'));
  clearAll(); // ヒントと答えをすべてクリア
  currentNumber = null;
}

function updateMemorizedColors() {
  memorizedPokemon.forEach(num => {
    const td = document.getElementById(`pokemon-${num}`);
    if (td) {
      td.classList.add('memorized');
    }
  });
}

function showAnswer() {
  if (currentNumber !== null) {
    displayAnswers([currentNumber]);
  }
}

function showHint1() {
  const hint1Numbers = [currentNumber - 2, currentNumber + 2].filter(n => n >= 1 && n <= totalPokemon);
  hintNumbers = [...hintNumbers, ...hint1Numbers];  // ヒント1の番号をhintNumbersに追加
  displayAnswers(hint1Numbers);
  hint1Used = true;
  document.getElementById('hint2Button').disabled = false;
}

function showHint2() {
  if (hint1Used) {
    const hint2Numbers = [currentNumber - 1, currentNumber + 1].filter(n => n >= 1 && n <= totalPokemon);
    hintNumbers = [...hintNumbers, ...hint2Numbers];  // ヒント2の番号をhintNumbersに追加
    displayAnswers(hint2Numbers);
  }
}

function displayHintsForDefault(number) {
  const defaultHintNumbers = [
    number - 3, number - 4, number - 5,
    number + 3, number + 4, number + 5
  ].filter(n => n >= 1 && n <= totalPokemon); // ポケモン番号の範囲を超えないようにする

  hintNumbers = [...defaultHintNumbers]; // 表示されたデフォルトヒントを保存
  displayAnswers(hintNumbers);
}

function displayAnswers(numbers) {
  const validNumbers = numbers.filter(n => n >= 1 && n <= totalPokemon); // ポケモン番号の範囲を超えないようにする
  displayedAnswerNumbers = validNumbers;

  validNumbers.forEach(hintNumber => {
    const detailUrl = `https://pokeapi.co/api/v2/pokemon-species/${hintNumber}`;

    fetch(detailUrl)
      .then(response => response.json())
      .then(data => {
        const name = data.names.find(name => name.language.name === 'ja').name;

        // セルの中に名前と画像を表示
        const paddedNumberForImage = String(hintNumber).padStart(3, '0');
        const imageUrl = `https://all-pokemon-ierukana.com/img/pokemon/${paddedNumberForImage}.png`;
        
        const hintCell = document.getElementById(`pokemon-${hintNumber}`);
        hintCell.innerHTML = `
          <img src="${imageUrl}" alt="${name}">
          <span>${name}</span>
        `;
      })
      .catch(error => console.error('Error:', error));
  });
}

function clearAnswers() {
  displayedAnswerNumbers.forEach(hintNumber => {
    const hintCell = document.getElementById(`pokemon-${hintNumber}`);
    if (hintCell) {
      hintCell.innerHTML = hintNumber; // 数字のみを表示
    }
  });
  displayedAnswerNumbers = [];
}

function clearHints() {
  hintNumbers.forEach(hintNumber => {
    const hintCell = document.getElementById(`pokemon-${hintNumber}`);
    if (hintCell) {
      hintCell.innerHTML = hintNumber; // 数字のみを表示
    }
  });
  hintNumbers = [];  // ヒント番号をクリア
}

function clearAll() {
  clearAnswers();
  clearHints();
}

function showRelevantRows(number) {
  const rowNumber = Math.ceil(number / 20); // 行番号を取得
  document.querySelectorAll('#pokemonTable tr').forEach(row => {
    row.style.display = 'none'; // すべての行を非表示
  });

  // 現在の行とその前後の行を表示
  const rowsToShow = [`#row-${rowNumber}`, `#row-${rowNumber - 1}`, `#row-${rowNumber + 1}`];
  rowsToShow.forEach(selector => {
    const row = document.querySelector(selector);
    if (row) row.style.display = '';
  });
}

// ローカルストレージに状態を保存
function saveStateToLocalStorage() {
  const state = {
    filteredPokemon,
    memorizedPokemon
  };
  localStorage.setItem('pokemonGameState', JSON.stringify(state));
}

// ローカルストレージから状態を読み込む
function loadStateFromLocalStorage() {
  const savedState = localStorage.getItem('pokemonGameState');
  if (savedState) {
    const { filteredPokemon: savedFilteredPokemon, memorizedPokemon: savedMemorizedPokemon } = JSON.parse(savedState);
    filteredPokemon = savedFilteredPokemon || [];
    memorizedPokemon = savedMemorizedPokemon || [];
    updateTableColors();
    updateMemorizedColors();
  }
}

function resetMemorizedPokemon() {
  memorizedPokemon = [];  // 覚えたポケモンのリストをリセット
  saveStateToLocalStorage();  // ローカルストレージのデータもリセット
  updateMemorizedColors();  // 表示の更新
  alert('覚えたポケモンをリセットしました');
}