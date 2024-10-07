const totalPokemon = 1025;
let currentNumber = null;
let memorizedPokemon = [];
let filteredPokemon = [];
let hintNumbers = [];
let answerRevealed = false;  // 答えが表示されたかどうかのフラグ
let hint1Used = false;
let difficulty = "easy";  // デフォルトは難しいモード

// 初期化
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('applyFilter').addEventListener('click', applyFilter);
  document.getElementById('memorizedButton').addEventListener('click', memorizePokemon);
  document.getElementById('notMemorizedButton').addEventListener('click', notMemorized);
  document.getElementById('showAnswerButton').addEventListener('click', showAnswer);
  document.getElementById('hint1Button').addEventListener('click', showHint1);
  document.getElementById('hint2Button').addEventListener('click', showHint2);
  document.getElementById('resetMemorizedButton').addEventListener('click', resetMemorizedPokemon);

  // モード選択時のイベント
  document.getElementById('difficulty').addEventListener('change', function (e) {
    difficulty = e.target.value;
  });

  // 初期表示
  applyFilter();
});

// フィルター適用
function applyFilter() {
  const numberInput = document.getElementById('numberInput').value;
  const fromNumber = parseInt(document.getElementById('fromNumber').value, 10);
  const toNumber = parseInt(document.getElementById('toNumber').value, 10);

  let numberList = [];
  if (numberInput) {
    numberList = numberInput.split(',').map(num => parseInt(num.trim(), 10)).filter(num => num >= 1 && num <= totalPokemon);
  }

  let rangeList = [];
  if (!isNaN(fromNumber) && !isNaN(toNumber)) {
    for (let i = fromNumber; i <= toNumber; i++) {
      rangeList.push(i);
    }
  }

  if (numberList.length > 0 && rangeList.length > 0) {
    filteredPokemon = numberList.filter(num => rangeList.includes(num));
  } else if (numberList.length > 0) {
    filteredPokemon = numberList;
  } else if (rangeList.length > 0) {
    filteredPokemon = rangeList;
  } else {
    filteredPokemon = Array.from({ length: totalPokemon }, (_, i) => i + 1);
  }

  pickRandomPokemon();
}

// ランダムなポケモンを選ぶ
function pickRandomPokemon() {
  answerRevealed = false;  // 答えが表示されていない状態にリセット
  clearAllHints();  // 答えを表示している場合、リセットする

  const availablePokemon = filteredPokemon.filter(num => !memorizedPokemon.includes(num));
  if (availablePokemon.length === 0) {
    return alert('全てのポケモンを覚えました！');
  }

  currentNumber = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
  displayCurrentNumber();  // currentNumberを表示
  displayHintsForDefault(currentNumber);
  hint1Used = false;
  document.getElementById('hint1Button').style.display = 'none';
  document.getElementById('hint2Button').style.display = 'none';
  document.getElementById('showAnswerButton').style.display = 'none';

  if(difficulty === 'hard') {
    document.getElementById('hint1Button').style.display = 'block';
  }
  if (difficulty === 'normal') {
    document.getElementById('hint2Button').style.display = 'block';
  }
  if (difficulty === 'easy') {
    document.getElementById('showAnswerButton').style.display = 'block';
  }
}

// currentNumberを表示
function displayCurrentNumber() {
  const currentNumberDisplay = document.getElementById('currentNumberDisplay');
  currentNumberDisplay.innerHTML = `現在のポケモン番号: ${currentNumber}`;
}

// 指定範囲に基づいてポケモン番号を表示する関数
function displayHintsForDefault(number) {
  const hintRangeMinus = [number - 4, number - 3].filter(n => n >= 1 && n <= totalPokemon);
  const hintRangePlus = [number + 3, number + 4].filter(n => n <= totalPokemon);
  // const hintRangeMinus = [number - 5, number - 4, number - 3].filter(n => n >= 1 && n <= totalPokemon);
  // const hintRangePlus = [number + 3, number + 4, number + 5].filter(n => n <= totalPokemon);

  const numberRange = [number - 2, number - 1, number, number + 1, number + 2].filter(n => n >= 1 && n <= totalPokemon);

  // 難易度に応じてHintを表示
  const shouldShowHint1 = difficulty === 'normal' || difficulty === 'easy';  // 普通、簡単はHint1(-2, +2)を最初から表示
  const shouldShowHint2 = difficulty === 'easy';  // 簡単はHint2(-1, +1)も最初から表示
  
  // 各ヒント用のdivに数字を設定
  // updateDivWithNumber('hint_-5', hintRangeMinus[0]);
  updateDivWithNumber('hint_-4', hintRangeMinus[0]);
  updateDivWithNumber('hint_-3', hintRangeMinus[1]);

  updateDivWithNumber('hint_-2', numberRange[0], shouldShowHint1);
  updateDivWithNumber('hint_-1', numberRange[1], shouldShowHint2);
  updateDivWithNumber('current', numberRange[2], answerRevealed);  // 答えが表示されている場合のみcurrentNumberを表示
  updateDivWithNumber('hint_1', numberRange[3], shouldShowHint2);
  updateDivWithNumber('hint_2', numberRange[4], shouldShowHint1);

  updateDivWithNumber('hint_3', hintRangePlus[0]);
  updateDivWithNumber('hint_4', hintRangePlus[1]);
  // updateDivWithNumber('hint_5', hintRangePlus[2]);
}

// 特定のdivに数字や画像を設定
function updateDivWithNumber(className, num, shouldShowImage = false) {
  const div = document.querySelector(`.${className}`);
  if (!div) return;

  div.innerHTML = `No.${num}`;

  // Hint-3～-5, +3～+5、もしくはボタン操作で画像を表示
  if (shouldShowImage || className === 'hint_-5' || className === 'hint_-4' || className === 'hint_-3' ||
      className === 'hint_3' || className === 'hint_4' || className === 'hint_5' || hintNumbers.includes(num)) {
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${num}`)
      .then(response => response.json())
      .then(data => {
        const name = data.names.find(name => name.language.name === 'ja').name;
        const paddedNumberForImage = String(num).padStart(3, '0');
        const imageUrl = `https://all-pokemon-ierukana.com/img/pokemon/${paddedNumberForImage}.png`;
        div.innerHTML = `
          <span>No.${num}</span>
          <img src="${imageUrl}" alt="${name}">
          <span>${name}</span>
        `;
      })
      .catch(error => console.error('Error:', error));
  }
}

// 答えが表示されたときにヒントをリセット
function clearAllHints() {
  answerRevealed = false;
  hintNumbers = [];
}

// ポケモンを覚えたとして記録
function memorizePokemon() {
  if (currentNumber !== null && !memorizedPokemon.includes(currentNumber)) {
    memorizedPokemon.push(currentNumber);
    pickRandomPokemon();
  }
}

// ポケモンを覚えていないとして次へ
function notMemorized() {
  pickRandomPokemon();
}

// 覚えたポケモンをリセット
function resetMemorizedPokemon() {
  memorizedPokemon = [];
  alert('覚えたポケモンをリセットしました');
  pickRandomPokemon();
}

// showAnswer 関数: 答えが表示される
function showAnswer() {
  answerRevealed = true;
  displayHintsForDefault(currentNumber);
  document.getElementById('hint1Button').style.display = 'none';
  document.getElementById('hint2Button').style.display = 'none';
  document.getElementById('showAnswerButton').style.display = 'block';
}

// ヒント1を表示
function showHint1() {
  const hint1Numbers = [currentNumber - 2, currentNumber + 2].filter(n => n >= 1 && n <= totalPokemon);
  hintNumbers = [...new Set([...hintNumbers, ...hint1Numbers])];  // ヒント1の番号をhintNumbersに追加
  displayHintsForDefault(currentNumber);
  hint1Used = true;
  document.getElementById('hint1Button').style.display = 'none';
  document.getElementById('hint2Button').style.display = 'block';
  document.getElementById('showAnswerButton').style.display = 'none';
}

// ヒント2を表示
function showHint2() {
  const hint2Numbers = [currentNumber - 1, currentNumber + 1].filter(n => n >= 1 && n <= totalPokemon);
  hintNumbers = [...new Set([...hintNumbers, ...hint2Numbers])];  // ヒント2の番号をhintNumbersに追加
  displayHintsForDefault(currentNumber);
  
  document.getElementById('hint1Button').style.display = 'none';
  document.getElementById('hint2Button').style.display = 'none';
  document.getElementById('showAnswerButton').style.display = 'block';
}
