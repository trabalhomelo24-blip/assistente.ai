document.addEventListener('DOMContentLoaded', () => {
    console.log('chat.js carregado com sucesso');

    const apiKey = localStorage.getItem('apiKey');
    const provider = localStorage.getItem('provider');
    const model = localStorage.getItem('model');

    if (!apiKey || !provider || !model) {
        console.error('Erro: Configurações não encontradas no localStorage');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('providerDisplay').textContent = provider;
    document.getElementById('modelDisplay').textContent = model;

    const questionInput = document.getElementById('question');
    const askButton = document.getElementById('askButton');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    const exitButton = document.getElementById('exitButton');
    const responseDiv = document.getElementById('response');
    const loadingDiv = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');

    if (!questionInput || !askButton || !clearButton || !copyButton || !exitButton || !responseDiv || !loadingDiv || !errorMessage) {
        console.error('Erro: Um ou mais elementos do DOM não foram encontrados');
        errorMessage.textContent = 'Erro interno: Elementos da página não encontrados.';
        return;
    }

    async function askAI() {
        const question = questionInput.value.trim();
        if (!question) {
            errorMessage.textContent = 'Digite uma pergunta!';
            console.error('Erro: Pergunta vazia');
            return;
        }

        errorMessage.textContent = '';
        loadingDiv.classList.remove('hidden');
        askButton.disabled = true;
        responseDiv.style.display = 'none';

        let url, headers, body;
        if (provider === 'OpenAI') {
            url = 'https://api.openai.com/v1/chat/completions';
            headers = {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            };
            body = JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: question }]
            });
        } else if (provider === 'Gemini') {
            url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            headers = { 'Content-Type': 'application/json' };
            body = JSON.stringify({
                contents: [{ parts: [{ text: question }] }]
            });
        }

        try {
            const res = await fetch(url, { method: 'POST', headers, body });
            if (!res.ok) {
                const errorData = await res.json();
                if (res.status === 429) {
                    console.error(`Erro 429: Limite de cota excedido para ${provider}`, errorData);
                    if (provider === 'OpenAI') {
                        throw new Error('Limite de requisições excedido na OpenAI. Tente novamente em alguns minutos, use o modelo gpt-3.5-turbo, ou verifique sua cota em platform.openai.com.');
                    } else {
                        throw new Error('Limite de requisições excedido no Gemini. Tente novamente em alguns minutos, use o modelo gemini-1.5-flash, ou obtenha uma nova API Key em aistudio.google.com.');
                    }
                } else {
                    console.error(`Erro ${res.status}:`, errorData);
                    throw new Error(`Erro ${res.status}: ${errorData.error?.message || 'Falha na conexão com a API.'}`);
                }
            }
            const data = await res.json();

            let answer;
            if (provider === 'OpenAI') {
                answer = data.choices[0].message.content;
            } else if (provider === 'Gemini') {
                answer = data.candidates[0].content.parts[0].text;
            }

            responseDiv.textContent = answer;
            responseDiv.style.display = 'block';
        } catch (err) {
            errorMessage.textContent = `Erro ao conectar com a IA: ${err.message}`;
            console.error('Erro na requisição:', err);
        } finally {
            loadingDiv.classList.add('hidden');
            askButton.disabled = false;
        }
    }

    askButton.addEventListener('click', askAI);

    clearButton.addEventListener('click', () => {
        questionInput.value = '';
        responseDiv.textContent = '';
        responseDiv.style.display = 'none';
        errorMessage.textContent = '';
    });

    copyButton.addEventListener('click', () => {
        if (responseDiv.textContent) {
            navigator.clipboard.writeText(responseDiv.textContent);
            alert('Resposta copiada!');
        } else {
            errorMessage.textContent = 'Nenhuma resposta para copiar!';
        }
    });

    exitButton.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
});