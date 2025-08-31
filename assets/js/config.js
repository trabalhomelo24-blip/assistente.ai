document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('configForm');
    const providerSelect = document.getElementById('provider');
    const modelSelect = document.getElementById('model');
    const errorMessage = document.getElementById('errorMessage');

    const models = {
        OpenAI: ['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4o'],
        Gemini: ['gemini-1.5-flash', 'gemini-1.5-pro']
    };

    providerSelect.addEventListener('change', (e) => {
        const provider = e.target.value;
        modelSelect.innerHTML = '<option value="">Selecione</option>';
        if (provider && models[provider]) {
            models[provider].forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });
            modelSelect.disabled = false;
        } else {
            modelSelect.disabled = true;
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const apiKey = document.getElementById('apiKey').value.trim();
        const provider = providerSelect.value;
        const model = modelSelect.value;

        if (!apiKey || !provider || !model) {
            errorMessage.textContent = 'Preencha todos os campos!';
            return;
        }

        localStorage.setItem('apiKey', apiKey);
        localStorage.setItem('provider', provider);
        localStorage.setItem('model', model);

        window.location.href = 'chat.html';
    });
});