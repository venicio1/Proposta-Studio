# Proposta Studio

Um gerador simples de propostas comerciais para pequenos negócios e profissionais independentes. Preencha os dados, confira a prévia e imprima ou salve o documento em PDF pelo navegador.

## Recursos

- Prévia da proposta atualizada enquanto você edita
- Três apresentações: clássica, editorial e minimalista
- Serviços com descrição, valores e cálculo automático do total
- Prazo, validade, condições de pagamento e mensagem ao cliente
- Rascunho salvo no armazenamento local do navegador
- Tema claro e escuro, com preferência salva no dispositivo
- Layout adaptável para telas menores
- Impressão em formato A4, com suporte a propostas com várias páginas

## Como usar

Não é necessário instalar dependências. Abra `index.html` em um navegador moderno. Preencha os campos e selecione **Baixar proposta**. Na janela de impressão, escolha **Salvar como PDF**.

Também é possível servir a pasta com qualquer servidor estático. Por exemplo, com Python instalado:

```bash
python -m http.server 8000
```

Depois, acesse `http://localhost:8000`.

## Arquivos

```text
index.html   Estrutura da aplicação
styles.css   Layout, temas e estilos de impressão
app.js       Modelos, formulário, prévia e armazenamento local
```

## Tecnologias

HTML, CSS e JavaScript sem framework. O projeto usa fontes DM Sans e Manrope servidas pelo Google Fonts; se estiver sem conexão, o navegador usa fontes alternativas.

## Armazenamento

O rascunho e a preferência de tema são guardados no `localStorage` do navegador. Os dados não são enviados a um servidor. Limpar os dados do navegador remove o rascunho salvo.

## Próximas melhorias

- Permitir personalizar logotipo, cores e dados comerciais
- Criar múltiplas propostas salvas no mesmo dispositivo
- Validar e formatar moeda e dados de contato
- Adicionar testes automatizados para totais e modelos
