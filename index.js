const totalPokemon = 1025;
let currentNumber = null;
let memorizedPokemon = [];
let filteredPokemon = [];

document.addEventListener('DOMContentLoaded', function () {
  const pokemonTable = document.getElementById('pokemonTable');
  pokemonTable.innerHTML = createPokemonTable();

  document.getElementById('startButton').addEventListener('click', pickRandomPokemon);
  document.getElementById('applyFilter').addEventListener('click', applyFilter);
  document.getElementById('memorizedButton').addEventListener('click', memorizePokemon);
  document.getElementById('notMemorizedButton').addEventListener('click', resetSelection);
  document.getElementById('showAnswerButton').addEventListener('click', showAnswer);
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
  const availablePokemon = filteredPokemon.filter(num => !memorizedPokemon.includes(num));
  if (availablePokemon.length === 0) {
    return alert('全てのポケモンを覚えました！');
  }

  currentNumber = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
  highlightPokemon(currentNumber);
}

function highlightPokemon(number) {
  document.querySelectorAll('#pokemonTable td').forEach(td => td.classList.remove('selected'));
  document.getElementById(`pokemon-${number}`).classList.add('selected');
}

function memorizePokemon() {
  if (currentNumber !== null && !memorizedPokemon.includes(currentNumber)) {
    memorizedPokemon.push(currentNumber);
    resetSelection();
  }
}

function resetSelection() {
  document.querySelectorAll('#pokemonTable td').forEach(td => td.classList.remove('selected'));
  currentNumber = null;
  document.getElementById('answer').textContent = '';
  document.getElementById('pokemonImage').style.display = 'none';
}

function showAnswer() {
  if (currentNumber !== null) {
    const detailUrl = `https://pokeapi.co/api/v2/pokemon-species/${currentNumber}`;

    fetch(detailUrl)
      .then(response => response.json())
      .then(data => {
        const name = data.names.find(name => name.language.name === 'ja').name;
        document.getElementById('answer').textContent = `答え: ${name}`;

        // 画像の表示
        const paddedNumberForImage = String(currentNumber).padStart(3, '0');
        const imageUrl = `https://all-pokemon-ierukana.com/img/pokemon/${paddedNumberForImage}.png`;
        document.getElementById('pokemonImage').src = imageUrl;
        document.getElementById('pokemonImage').style.display = 'block';
      })
      .catch(error => console.error('Error:', error));
  }
}
