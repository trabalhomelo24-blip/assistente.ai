# Assistente de IA Web

## Objetivo do Projeto
Este projeto é uma aplicação web simples e interativa que permite aos usuários configurar uma API Key para OpenAI ou Gemini, escolher um modelo de IA, e interagir com um chat para fazer perguntas e receber respostas geradas por IA. O foco é demonstrar integração com APIs externas, manipulação do DOM, eventos, e boas práticas de UX/UI, baseado em requisitos de um curso de JavaScript.

## Passo a Passo de Uso
1. Abra `index.html` no navegador.
2. Insira sua API Key (obtenha gratuitamente no site da OpenAI ou Google AI Studio para Gemini).
3. Escolha o provedor (OpenAI ou Gemini).
4. Selecione um modelo disponível (ex: gpt-3.5-turbo para OpenAI, gemini-1.5-flash para Gemini).
5. Clique em "Entrar" – as configurações são salvas no localStorage e você é redirecionado para `chat.html`.
6. No chat, digite uma pergunta e clique em "Perguntar".
7. Veja a resposta da IA no painel. Use "Limpar" para resetar, "Copiar Resposta" para clipboard, ou "Sair" para limpar dados e voltar à configuração.
8. Em caso de erros (ex: API Key inválida), mensagens amigáveis são exibidas.

## Observações sobre OpenAI e Gemini
- **OpenAI**: Usa endpoint `/v1/chat/completions`. Requer API Key paga (créditos gratuitos limitados para novos usuários). Modelos: gpt-3.5-turbo, gpt-4o-mini, gpt-4o.
- **Gemini**: Usa endpoint `/v1beta/models/{model}:generateContent` (gratuito para desenvolvimento, sem adicionar pagamento). Modelos: gemini-1.5-flash, gemini-1.5-pro. Obtenha API Key no Google AI Studio.
- Segurança: A API Key é armazenada apenas no localStorage (não enviada para servidores). Não compartilhe chaves em produção.
- Limites: Consulte a documentação oficial para quotas de uso.

## Créditos
- Melhorias e design por **Jully Serra**.
- Baseado em requisitos de aula prática de JavaScript.
- Integrações com APIs da OpenAI e Google Gemini."# assistente.ai" 
