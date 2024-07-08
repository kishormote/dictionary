const dictionryApiUrl =
 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const translateApiUrl = 'https://api.mymemory.translated.net/get';
let lastSearchWord = " ";
async function searchWord() {
  const wordInput = document.getElementById("wordinput");
  const languageSelect = document.getElementById("lanuageSelect");
  const resultDiv = document.getElementById("result");
  const word = wordInput.value.trim();

  const targetLanguage = languageSelect.value;
  if (!word) {
    resultDiv.textContent = "please enter a word or sentence";
    return;
  }
  if(word!==lastSearchWord){
    lastSearchWord=word;
    resultDiv.textContent='listening....'
  
  try{
    //tranlate to the target language
    const translateResponse= await fetch(`${translateApiUrl}?q=${encodeURIComponent(word)}&langpair=en|${targetLanguage}`);
    if(!translateResponse.ok){
        throw new Error(`HTTP error! Status: ${translateResponse.status}`);
    }
    const translateData = await translateResponse.json();
    const dictionaryResponse = await fetch(dictionryApiUrl + encodeURIComponent(word));
let dictionaryData = [];
if(dictionaryResponse.ok){
    dictionaryData = await dictionaryResponse.json();
}
let result = `word/phrase:${word}\n`
result +=`Translation (${getLanguageName(targetLanguage)}): ${translateData.responseData.translatedText}\n\n`;
if (dictionaryData && dictionaryData.length > 0){
    dictionaryData[0].meanings.forEach((meaning, index) => {
        result+=`Meaning ${index + 1} (${meaning.partOfSpeech || 'Unknown' }):\n`;
        meaning.definitions.forEach((def,defIndex)=>{
          result+=`${defIndex + 1}. ${def.definition}\n`;
          if(def.example){
            result += ` Example: ${def.example}\n`;
          }
          
        });
        result += `\n`;
    });
}
else{
  result += `No additional definitions found for this word.\n`;
}
resultDiv.textContent = result

}
catch(error){
  console.error('Error:', error);
    resultDiv.textContent = ` An error occurred: ${error.message}`;
  
}
  }
else{
  location.reload();
}
  
}
function getLanguageName(code){
  const lan={

  'en':'English',
  'hi':'Hindi',
  'mr':'Marathi',
  'es':'Spanish',
  'fr':'Frech',
  'de':'German',
  'ja':'Japnese',
  'Ko':'Korean',
  };
  return lan[code] || code;
}

function toggleSpeechRecognition(){
  const modal = document.getElementById('speechModal');
  modal.style.display = 'flex';

  // stare speech recognition process
  startSpeechRecognition();

}
// funtion to close speech rec modal
function closeSpeechModal(){
  const modal= document.getElementById('speechModal');
  modal.style.display = 'none';
}
function startSpeechRecognition(){
  const selectlan = document.getElementById('lanuageSelect').value;
  const reconition = new webkitSpeechRecognition();
  reconition.lang = selectlan;
  reconition.interimResults = false;
  reconition.onresult = function(event){
    const result = event.results[0][0].transcript;
    document.getElementById('wordinput').value = result;
    closeSpeechModal();
  }
  reconition.onerror = function(event){
    console.error('speech recongnition error:', event.error);
    closeSpeechModal();
  }
  reconition.onend = function(){
    console.log('speech recognize ended.')
  }
  reconition.start();
}


