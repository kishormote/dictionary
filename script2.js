const dictionaryApiUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const translateApiUrl = "https://api.mymemory.translated.net/get";
let lastSearchWord = "";

async function searchWord() {
    const wordInput = document.getElementById("wordinput");
    const languageSelect = document.getElementById("languageSelect");
    const resultDiv = document.getElementById("result");
    const word = wordInput.value.trim();

    const targetLanguage = languageSelect.value;
    if (!word) {
        resultDiv.textContent = "Please enter a word or sentence";
        return;
    }

    if (word !== lastSearchWord) {
        lastSearchWord = word;
        resultDiv.textContent = 'Listening...';

        try {
            // Translate to the target language
            const translateResponse = await fetch(`${translateApiUrl}?q=${encodeURIComponent(word)}&langpair=en|${targetLanguage}`);
            if (!translateResponse.ok) {
                throw new Error(`HTTP error! Status: ${translateResponse.status}`);
            }
            const translateData = await translateResponse.json();

            // Get the word's definitions
            const dictionaryResponse = await fetch(dictionaryApiUrl + encodeURIComponent(word));
            let dictionaryData = [];
            if (dictionaryResponse.ok) {
                dictionaryData = await dictionaryResponse.json();
            } else if (dictionaryResponse.status === 404) {
                resultDiv.textContent = `No definitions found for the word "${word}".`;
                return;
            } else {
                throw new Error(`HTTP error! Status: ${dictionaryResponse.status}`);
            }

            // Build the result string
            let result = `Word/phrase: ${word}\n`;
            result += `Translation (${getLanguageName(targetLanguage)}): ${translateData.responseData.translatedText}\n\n`;

            if (dictionaryData && dictionaryData.length > 0) {
                dictionaryData[0].meanings.forEach((meaning, index) => {
                    result += `Meaning ${index + 1} (${meaning.partOfSpeech}):\n`;
                    meaning.definitions.forEach((def, defIndex) => {
                        result += `${defIndex + 1}. ${def.definition}\n`;
                        if (def.example) {
                            result += ` Example: ${def.example}\n`;
                        }
                    });
                    result += `\n`;
                });
            } else {
                result += `No additional definitions found for this word.\n`;
            }

            resultDiv.textContent = result;
        } catch (error) {
            console.error('Error:', error);
            resultDiv.textContent = `An error occurred: ${error.message}`;
        }
    } else {
        location.reload();
    }
}

function getLanguageName(code) {
    const languages = {
        'en': 'English',
        'hi': 'Hindi',
        'mr': 'Marathi',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'ja': 'Japanese',
        'ko': 'Korean',
    };
    return languages[code] || code;
}
