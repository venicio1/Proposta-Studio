const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const STORAGE_KEY = 'proposta-studio-draft-v1';
const THEME_KEY = 'proposta-studio-theme';
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const fields = ['proposalTitle','proposalNumber','proposalValidity','sellerName','sellerEmail','clientName','deliveryTime','paymentTerms','proposalMessage'];
const initial = {
  proposalTitle: 'Presença digital que gera resultados', proposalNumber: '2025-014', proposalValidity: '2025-11-15',
  sellerName: 'Venício Gomes', sellerEmail: 'contato@veniciogomes.com.br', clientName: 'Studio Aurora',
  deliveryTime: '15 dias úteis', paymentTerms: '50% no início · 50% na entrega',
  proposalMessage: 'Obrigado pela oportunidade de apresentar esta proposta. Estou animado para construir algo incrível com vocês!',
  templateId: 'classic',
  services: [
    { name: 'Criação de site institucional', description: 'Design personalizado, responsivo e otimizado para todos os dispositivos.', amount: 2800 },
    { name: 'Configuração de presença digital', description: 'Configuração de domínio, publicação e orientações para atualização.', amount: 650 }
  ]
};
let data = structuredClone(initial);
let toastTimer;
let currentView = 'editor';

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
}
function amountValue(value) {
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}
function formatDate(dateString) {
  if (!dateString) return 'Não informada';
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'Não informada';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).replace('.', '');
}
function renderServices() {
  $('#serviceList').innerHTML = data.services.map((service, index) => `
    <div class="service-row" data-index="${index}">
      <div class="service-main-fields"><input class="service-name" aria-label="Nome do serviço ${index + 1}" placeholder="Nome do serviço" value="${escapeHTML(service.name)}" /><input class="service-description" aria-label="Descrição do serviço ${index + 1}" placeholder="Breve descrição (opcional)" value="${escapeHTML(service.description)}" /></div>
      <div class="amount-wrap"><input class="service-amount" aria-label="Valor do serviço ${index + 1}" inputmode="decimal" value="${escapeHTML(service.amount)}" /></div>
      <button class="remove-service" type="button" aria-label="Remover serviço" title="Remover serviço">×</button>
    </div>`).join('');
  $$('.service-row').forEach((row, index) => {
    row.querySelector('.service-name').addEventListener('input', event => { data.services[index].name = event.target.value; updatePreview(); saveDraft(); });
    row.querySelector('.service-description').addEventListener('input', event => { data.services[index].description = event.target.value; updatePreview(); saveDraft(); });
    row.querySelector('.service-amount').addEventListener('input', event => { data.services[index].amount = event.target.value; updatePreview(); saveDraft(); });
    row.querySelector('.remove-service').addEventListener('click', () => {
      if (data.services.length === 1) { showToast('A proposta precisa ter pelo menos um serviço.'); return; }
      data.services.splice(index, 1); renderServices(); updatePreview(); saveDraft();
    });
  });
}
function updatePreview() {
  const templateId = ['classic', 'editorial', 'minimal'].includes(data.templateId) ? data.templateId : 'classic';
  $('#proposalPaper').dataset.template = templateId;
  const set = (selector, value, fallback) => { $(selector).textContent = value || fallback; };
  set('#previewTitle', data.proposalTitle, 'Sua proposta comercial');
  set('#previewNumber', `#${data.proposalNumber || '—'}`, '#—');
  set('#previewValidity', formatDate(data.proposalValidity), 'Não informada');
  set('#previewSeller', data.sellerName, 'Seu nome ou empresa');
  set('#previewClient', data.clientName, 'Seu cliente');
  set('#previewClientGreeting', data.clientName, 'cliente');
  set('#previewEmail', data.sellerEmail, '');
  set('#previewDelivery', data.deliveryTime, 'A combinar');
  set('#previewPayment', data.paymentTerms, 'A combinar');
  const message = data.proposalMessage.trim();
  $('#previewMessage').textContent = message ? `“${message}”` : '';
  $('#previewServices').innerHTML = data.services.map(service => `<div class="paper-service-row"><div><strong>${escapeHTML(service.name || 'Serviço a definir')}</strong><span>${escapeHTML(service.description || '')}</span></div><b>${money.format(amountValue(service.amount))}</b></div>`).join('');
  const total = data.services.reduce((sum, service) => sum + amountValue(service.amount), 0);
  set('#previewTotal', money.format(total), money.format(0));
  set('#formTotal', money.format(total), money.format(0));
}
function readForm() {
  fields.forEach(id => { data[id] = $(`#${id}`).value; });
}
function saveDraft() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    $('.saved-status').innerHTML = '<span class="saved-check">✓</span> Salvo automaticamente';
  } catch {
    $('.saved-status').textContent = 'Não foi possível salvar localmente';
  }
}
function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === 'object') data = { ...structuredClone(initial), ...saved, services: Array.isArray(saved.services) && saved.services.length ? saved.services : structuredClone(initial.services) };
  } catch { data = structuredClone(initial); }
  fields.forEach(id => { $(`#${id}`).value = data[id] ?? ''; });
  renderServices();
  updatePreview();
}
function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function setView(view) {
  currentView = view;
  $('#editorView').hidden = view !== 'editor';
  $('#workspaceView').hidden = view === 'editor';
  $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  const titles = { editor: 'Nova proposta', proposals: 'Minhas propostas', templates: 'Modelos', settings: 'Configurações' };
  $('.breadcrumbs strong').textContent = titles[view] || titles.editor;
  if (view === 'editor') return;
  const viewRoot = $('#workspaceView');
  if (view === 'proposals') {
    viewRoot.innerHTML = `<div class="workspace-heading"><div><div class="eyebrow">SEU ESPAÇO</div><h1>Minhas propostas<span>.</span></h1><p>Continue de onde parou ou crie uma nova proposta.</p></div><button class="button button-primary" data-action="new">＋ Nova proposta</button></div><div class="proposal-list-card"><div class="list-card-mark">${escapeHTML((data.clientName || 'C').slice(0, 1).toUpperCase())}</div><div class="list-card-copy"><strong>${escapeHTML(data.proposalTitle || 'Proposta sem título')}</strong><span>${escapeHTML(data.clientName || 'Cliente não informado')} · #${escapeHTML(data.proposalNumber || '—')}</span></div><span class="list-draft"><i></i> Rascunho</span><strong class="list-amount">${money.format(data.services.reduce((sum, item) => sum + amountValue(item.amount), 0))}</strong><button class="icon-button" data-action="open" aria-label="Abrir proposta">↗</button></div><div class="empty-tip"><span>✦</span><strong>Uma proposta bem apresentada faz diferença.</strong><p>Edite seu rascunho e baixe um PDF pronto para enviar ao cliente.</p></div>`;
  } else if (view === 'templates') {
    const templates = [
      { name: 'Site e presença digital', category: 'DESIGN E DESENVOLVIMENTO', description: 'Uma estrutura para apresentar criação de sites e serviços digitais.', title: 'Presença digital que gera resultados', client: 'Studio Aurora', services: initial.services, color: 'green', templateId: 'classic', style: 'Clássico', preview: 'Divisão equilibrada, destaque verde e escopo em lista.' },
      { name: 'Consultoria e planejamento', category: 'ESTRATÉGIA E CONSULTORIA', description: 'Organize diagnóstico, plano de ação e acompanhamento.', title: 'Estratégia para o próximo passo', client: 'Projeto Horizonte', services: [{ name: 'Diagnóstico e planejamento', description: 'Levantamento de necessidades e plano de ação personalizado.', amount: 1800 }, { name: 'Acompanhamento mensal', description: 'Reuniões de acompanhamento e suporte consultivo.', amount: 900 }], color: 'sand', templateId: 'editorial', style: 'Editorial', preview: 'Título amplo, paleta quente e blocos de serviço.' },
      { name: 'Projeto personalizado', category: 'PROPOSTA FLEXÍVEL', description: 'Comece com uma etapa de descoberta e monte seu escopo.', title: 'Proposta de projeto personalizado', client: 'Novo cliente', services: [{ name: 'Etapa de descoberta', description: 'Alinhamento de objetivos, escopo e próximos passos.', amount: 1200 }], color: 'lavender', templateId: 'minimal', style: 'Minimalista', preview: 'Layout compacto, sem ornamentos e foco no investimento.' }
    ];
    viewRoot.innerHTML = `<div class="workspace-heading"><div><div class="eyebrow">PONTO DE PARTIDA</div><h1>Modelos<span>.</span></h1><p>Os modelos mudam o visual do documento e o exemplo de conteúdo. Seus dados de contato e número atual serão mantidos.</p></div></div><div class="template-grid">${templates.map((item, index) => `<article class="template-card"><div class="template-art template-art-${item.color}"><span class="template-paper-mini mini-${item.templateId}"><b class="mini-brand"></b><i></i><i></i><i></i><b class="mini-total"></b><i></i></span><span class="template-preview-label">${item.style} · PRÉVIA</span></div><div class="template-card-copy"><span>${item.category}</span><h2>${item.name}</h2><p>${item.description}</p><div class="template-difference">${item.preview}</div><div class="template-meta"><span>${item.services.length} ${item.services.length === 1 ? 'serviço' : 'serviços'} de exemplo</span><strong>${money.format(item.services.reduce((sum, service) => sum + service.amount, 0))}</strong></div><button class="button button-light template-use" data-template="${index}" type="button">Ver e usar este modelo <span>→</span></button></div></article>`).join('')}</div>`;
    viewRoot._templates = templates;
  } else if (view === 'settings') {
    viewRoot.innerHTML = `<div class="workspace-heading"><div><div class="eyebrow">PERSONALIZE</div><h1>Configurações<span>.</span></h1><p>Esses dados aparecem no cabeçalho e no rodapé das propostas.</p></div></div><div class="settings-card"><div class="settings-card-heading"><div class="settings-mark">VG</div><div><h2>Dados de apresentação</h2><p>Edite suas informações de contato.</p></div></div><div class="settings-fields"><label class="field"><span>Nome ou empresa</span><input id="settingsSellerName" value="${escapeHTML(data.sellerName)}" /></label><label class="field"><span>E-mail de contato</span><input id="settingsSellerEmail" type="email" value="${escapeHTML(data.sellerEmail)}" /></label><button class="button button-primary" data-action="save-settings">Salvar alterações</button></div></div><div class="settings-note"><span>♧</span> As informações são guardadas apenas neste navegador.</div>`;
  }
  viewRoot.querySelector('[data-action="new"]')?.addEventListener('click', () => setView('editor'));
  viewRoot.querySelector('[data-action="open"]')?.addEventListener('click', () => setView('editor'));
  viewRoot.querySelectorAll('[data-template]').forEach(button => button.addEventListener('click', () => {
    const template = viewRoot._templates[Number(button.dataset.template)];
    const applyTemplate = () => {
      data.proposalTitle = template.title; data.clientName = template.client; data.services = structuredClone(template.services); data.templateId = template.templateId;
      fields.forEach(id => { $(`#${id}`).value = data[id]; });
      renderServices(); updatePreview(); saveDraft(); setView('editor'); showToast('Modelo aplicado. Agora personalize os detalhes.');
    };
    if (data.proposalTitle !== initial.proposalTitle || data.clientName !== initial.clientName || JSON.stringify(data.services) !== JSON.stringify(initial.services)) {
      if (window.confirm('Este modelo vai substituir o título, o cliente e os serviços do rascunho atual. Deseja continuar?')) applyTemplate();
    } else applyTemplate();
  }));
  viewRoot.querySelector('[data-action="save-settings"]')?.addEventListener('click', () => {
    data.sellerName = $('#settingsSellerName').value.trim(); data.sellerEmail = $('#settingsSellerEmail').value.trim();
    $('#sellerName').value = data.sellerName; $('#sellerEmail').value = data.sellerEmail;
    updatePreview(); saveDraft(); showToast('Seus dados foram atualizados.');
  });
}

fields.forEach(id => $(`#${id}`).addEventListener('input', () => { readForm(); updatePreview(); saveDraft(); }));
$$('.nav-item').forEach(item => item.addEventListener('click', () => setView(item.dataset.view)));
$('#workspaceButton').addEventListener('click', () => setView(currentView === 'settings' ? 'editor' : 'settings'));
$('#profileButton').addEventListener('click', () => setView('settings'));
$('#helpButton').addEventListener('click', () => showToast('Preencha os campos, confira a prévia e use Baixar proposta para gerar o PDF.'));
function setTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  $('#themeIcon').textContent = dark ? '☀' : '☾';
  $('.theme-label').textContent = dark ? 'Modo claro' : 'Modo escuro';
  $('#themeButton').setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro');
  try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch {}
}
$('#themeButton').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
$('#addService').addEventListener('click', () => {
  data.services.push({ name: '', description: '', amount: 0 });
  renderServices(); updatePreview(); saveDraft();
  const inputs = $$('.service-name'); inputs.at(-1)?.focus();
});
$('#downloadButton').addEventListener('click', () => window.print());
$('#shareButton').addEventListener('click', async () => {
  const shareData = { title: data.proposalTitle || 'Proposta comercial', text: `Proposta para ${data.clientName || 'cliente'} — ${money.format(data.services.reduce((sum, item) => sum + amountValue(item.amount), 0))}` };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch (error) { if (error.name !== 'AbortError') showToast('Não foi possível abrir o compartilhamento.'); }
  } else if (navigator.clipboard) {
    try { await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`); showToast('Resumo da proposta copiado!'); }
    catch { showToast('O compartilhamento não está disponível neste navegador.'); }
  } else showToast('O compartilhamento não está disponível neste navegador.');
});
$('#resetButton').addEventListener('click', () => {
  data = structuredClone(initial); fields.forEach(id => { $(`#${id}`).value = data[id]; });
  renderServices(); updatePreview(); saveDraft(); showToast('Formulário restaurado para o exemplo inicial.');
});
$('#expandPreview').addEventListener('click', () => {
  document.body.classList.toggle('preview-open');
  $('#expandPreview').textContent = document.body.classList.contains('preview-open') ? '×' : '⛶';
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') document.body.classList.remove('preview-open'); });
window.addEventListener('afterprint', () => showToast('Pronto! Selecione “Salvar como PDF” na janela de impressão.'));
loadDraft();
try { setTheme(localStorage.getItem(THEME_KEY) || 'light'); } catch { setTheme('light'); }

