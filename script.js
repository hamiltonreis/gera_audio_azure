document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    var form = event.target;
    var escolha_voz = form.elements['escolha_voz'].value;
    var phrase = form.elements['phrase'].value;
    var audio_filename = form.elements['audio_filename'].value;
    
    // Faz a primeira requisição para obter o token
    var url_token = 'https://brazilsouth.api.cognitive.microsoft.com/sts/v1.0/issuetoken';
    var headers_token = {
        'Ocp-Apim-Subscription-Key': '97a55956e85e471193434e9317e358d6',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': '0'
    };

    fetch(url_token, {
        method: 'POST',
        headers: headers_token,
        body: ''
    })
    .then(function(response_token) {
        if (response_token.ok) {
            return response_token.text();
        } else {
            throw new Error('Erro na solicitação');
        }
    })
    .then(function(azure_token) {
        var token = azure_token.trim();

        // Define a voz com base na escolha do usuário
        var voice;
        if (escolha_voz.toLowerCase() === 'm') {
            voice = 'pt-BR-AntonioNeural';
        } else if (escolha_voz.toLowerCase() === 'f') {
            voice = 'pt-BR-FranciscaNeural';
        } else {
            throw new Error('Escolha de voz inválida');
        }

        // Faz a segunda requisição para gerar o arquivo de áudio
        var url_audio = 'https://brazilsouth.tts.speech.microsoft.com/cognitiveservices/v1';
        var payload_audio = '<speak version=\'1.0\' xml:lang=\'en-US\'><voice name=\'' + voice + '\'> ' + phrase + ' </voice></speak>';
        var headers_audio = {
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-48khz-192kbitrate-mono-mp3',
            'Authorization': 'Bearer ' + token
        };

        return fetch(url_audio, {
            method: 'POST',
            headers: headers_audio,
            body: payload_audio
        });
    })
    .then(function(response_audio) {
        if (response_audio.ok) {
            return response_audio.blob();
        } else {
            throw new Error('Erro na solicitação');
        }
    })
    .then(function(blob) {
        // Cria um link para download do arquivo de áudio
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = audio_filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    })
    .catch(function(error) {
        console.error(error);
        alert('Ocorreu um erro ao gerar o áudio.');
    });
});
