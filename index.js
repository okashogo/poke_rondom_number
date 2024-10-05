const totalPokemon = 1025;
let currentNumber = null;
let memorizedPokemon = [];
let filteredPokemon = [];
let hintNumbers = [];

document.addEventListener('DOMContentLoaded', function () {
  const pokemonTable = document.getElementById('pokemonTable');
  pokemonTable.innerHTML = createPokemonTable();

  document.getElementById('applyFilter').addEventListener('click', applyFilter);
  document.getElementById('memorizedButton').addEventListener('click', memorizePokemon);
  document.getElementById('notMemorizedButton').addEventListener('click', notMemorized);
  document.getElementById('showAnswerButton').addEventListener('click', showAnswer);

  // 初期表示: ページを読み込んだときにランダムなポケモンを表示
  applyFilter();
});

function createPokemonTable() {
  let html = '<table>';
  for (let i = 1; i <= totalPokemon; i++) {
    if (i % 20 === 1) html += '<tr>';
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

  pickRandomPokemon(); // フィルターに基づきランダム表示
}

function pickRandomPokemon() {
  clearHints(); // 前回のヒントをクリア
  const availablePokemon = filteredPokemon.filter(num => !memorizedPokemon.includes(num));
  if (availablePokemon.length === 0) {
    return alert('全てのポケモンを覚えました！');
  }

  currentNumber = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
  highlightPokemon(currentNumber);
  displayHints(currentNumber); // ヒントを表示
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
  }
}

function notMemorized() {
  resetSelection();
  pickRandomPokemon(); // 覚えていない場合も次のポケモンを表示
}

function resetSelection() {
  document.querySelectorAll('#pokemonTable td').forEach(td => td.classList.remove('selected'));
  clearHints(); // ヒントをクリア
  currentNumber = null;
}

function showAnswer() {
  if (currentNumber !== null) {
    const detailUrl = `https://pokeapi.co/api/v2/pokemon-species/${currentNumber}`;

    fetch(detailUrl)
      .then(response => response.json())
      .then(data => {
        const name = data.names.find(name => name.language.name === 'ja').name;

        // セルの中に名前と画像を表示
        const paddedNumberForImage = String(currentNumber).padStart(3, '0');
        const imageUrl = `https://all-pokemon-ierukana.com/img/pokemon/${paddedNumberForImage}.png`;
        
        const pokemonCell = document.getElementById(`pokemon-${currentNumber}`);
        pokemonCell.innerHTML = `
          <img src="${imageUrl}" alt="${name}">
          <span>${name}</span>
        `;
      })
      .catch(error => console.error('Error:', error));
  }
}

function displayHints(number) {
  hintNumbers = [
    number - 4, number - 3, number + 3, number + 4
  ].filter(n => n >= 1 && n <= totalPokemon); // ポケモン番号の範囲を超えないようにする

  hintNumbers.forEach(hintNumber => {
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

function clearHints() {
  hintNumbers.forEach(hintNumber => {
    const hintCell = document.getElementById(`pokemon-${hintNumber}`);
    if (hintCell) {
      hintCell.innerHTML = hintNumber; // 数字のみを表示
    }
  });
  hintNumbers = [];
}
