import SpellChecker from "hunspell-spellchecker";
import fs from 'fs';
import path from 'path';

let spellchecker, dict;

function initialise() {
  spellchecker = new SpellChecker();
  dict = spellchecker.parse({
    aff: fs.readFileSync(path.join(__dirname, '../data/en_GB.aff')),
    dic: fs.readFileSync(path.join(__dirname, '../data/en_GB.dic'))
  });
  spellchecker.use(dict);
}

function checkWord(word) {
  if (!spellchecker) {
    initialise();
  }
  word = word.replace(/\u2019/, "'");
  if (spellchecker.check(word)) {
    return true;
  }

  if (word.match(/'s$/)) {
    const wordWithoutPlural = word.substr(0, word.length - 2);
    if (spellchecker.check(wordWithoutPlural)) {
      return true;
    }
  }

  // for etc. as we cannot tell if it ends in "." as that is stripped
  // todo: could flag
  const wordWithDot = word + ".";
  if (spellchecker.check(wordWithDot)) {
    return true;
  }

  if(word.indexOf('-')) {
    const subWords = word.split('-');

    if (subWords.every((word)=> spellchecker.check(word))) {
      return true;
    }
  }

  return false;
}

function checkWords(words) {
  const mistakes = [];
  for (let i = 0; i < words.length; i++) {
    const wordInfo = words[i];
    if (!checkWord(wordInfo.word)) {
      mistakes.push(wordInfo);
    }
  }
  return mistakes;
}

function _addWord(word) {
  dict.dictionaryTable[word] = [[]];
}

var customDictionary = [];
var needsReset = false;
function addWord(word, temporary) {
  if (!spellchecker) {
    initialise();
  }

  if (!temporary) {
    customDictionary.push(word);
  } else {
    needsReset = true;
  }
  _addWord(word);
}

function resetTemporaryCustomDictionary() {
  if (needsReset) {
    initialise();
    customDictionary.forEach((word) => _addWord(word));
  }
}

function suggest(word) {
  return spellchecker.suggest(word);
}

export default {
  initialise,
  checkWords,
  checkWord,
  addWord,
  resetTemporaryCustomDictionary,
  suggest
};