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
    const chatHistoryDiv = document.getElementById('chat-history');
    const loadingDiv = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const charCount = document.getElementById('charCount');

    if (!questionInput || !askButton || !clearButton || !copyButton || !exitButton || !chatHistoryDiv || !loadingDiv || !errorMessage || !charCount) {
        console.error('Erro: Um ou mais elementos do DOM não foram encontrados');
        errorMessage.textContent = 'Erro interno: Elementos da página não encontrados.';
        return;
    }

    let lastAIResponse = '';
    // Array para armazenar o histórico de mensagens
    const chatHistory = [];

    // Função para criar e adicionar uma mensagem ao chat
    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
        messageDiv.textContent = text;
        chatHistoryDiv.appendChild(messageDiv);
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
    }

    // Função para atualizar o contador de caracteres
    function updateCharCount() {
        const count = questionInput.value.length;
        charCount.textContent = `${count} caracteres`;
    }

    // Evento para atualizar o contador em tempo real
    questionInput.addEventListener('input', updateCharCount);

    async function askAI() {
        const question = questionInput.value.trim();
        if (!question) {
            errorMessage.textContent = 'Digite uma pergunta!';
            return;
        }

        errorMessage.textContent = '';
        addMessage(question, true);

        // Adiciona a pergunta do usuário ao histórico
        chatHistory.push({
            role: 'user',
            content: question
        });

        questionInput.value = '';
        updateCharCount(); // Reseta o contador após enviar
        loadingDiv.classList.remove('hidden');
        askButton.disabled = true;

        let url, headers, body;
        if (provider === 'OpenAI') {
            url = 'https://api.openai.com/v1/chat/completions';
            headers = {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            };

            // Adiciona a instrução do sistema e usa o histórico completo
            const messages = [{
                role: 'system',
                content: 'Responda a todas as perguntas em texto puro, sem usar qualquer tipo de formatação de markdown como **negrito**, #títulos#, `código`, ou listas. Alem disso, seja simpatica nas respotas'
            }];
            messages.push(...chatHistory.map(m => ({ role: m.role, content: m.content })));

            body = JSON.stringify({
                model: model,
                messages: messages
            });

        } else if (provider === 'Gemini') {
            url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            headers = { 'Content-Type': 'application/json' };

            // Envia o histórico completo para o Gemini
            const contents = chatHistory.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));

            // Adiciona a instrução para o Gemini, que precisa ser parte do prompt
            const firstContent = contents[0].parts[0].text;
            contents[0].parts[0].text = `Responda em texto puro sem markdown. Pergunta: ${firstContent}`;

            body = JSON.stringify({
                contents: contents
            });
        }

        try {
            const res = await fetch(url, { method: 'POST', headers, body });
            if (!res.ok) {
                const errorData = await res.json();
                if (res.status === 429) {
                    if (provider === 'OpenAI') {
                        throw new Error('Limite de requisições excedido na OpenAI. Tente novamente em alguns minutos, use o modelo gpt-3.5-turbo, ou verifique sua cota em platform.openai.com.');
                    } else {
                        throw new Error('Limite de requisições excedido no Gemini. Tente novamente em alguns minutos, use o modelo gemini-1.5-flash, ou obtenha uma nova API Key em aistudio.google.com.');
                    }
                } else {
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

            lastAIResponse = answer;
            addMessage(answer, false);

            // Adiciona a resposta da IA ao histórico
            chatHistory.push({
                role: 'assistant',
                content: answer
            });

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
        const confirmClear = confirm('Tem certeza que deseja limpar o chat?');
        if (confirmClear) {
            chatHistoryDiv.innerHTML = '';
            questionInput.value = '';
            updateCharCount(); // Reseta o contador ao limpar
            lastAIResponse = '';
            errorMessage.textContent = '';
            chatHistory.length = 0;
        }
    });

    copyButton.addEventListener('click', () => {
        if (lastAIResponse) {
            navigator.clipboard.writeText(lastAIResponse);
            alert('Resposta copiada!');
        } else {
            errorMessage.textContent = 'Nenhuma resposta para copiar!';
        }
    });

    exitButton.addEventListener('click', () => {
        const confirmExit = confirm('Tem certeza que deseja sair? Todos os dados de configuração (API Key, Provedor e Modelo) serão excluídos.');
        if (confirmExit) {
            localStorage.clear();
            window.location.href = 'index.html';
        }
    });

    // Inicializa o contador ao carregar a página
    updateCharCount();
});