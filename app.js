/**
 * ============================================================================
 * DRAGON BALL SUPER: SAGA DE BEERUS - LÓGICA DE APLICACIÓN Y REPRODUCTOR
 * Archivo: js/app.js
 * Funcionalidades: Carga dinámica, navegación sin recarga, servidores duales,
 * filtros, búsqueda reactiva, modo cine, showcase de personajes y analítica.
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // ENLACES SOCIALES Y COMUNIDAD OFICIALES
  // --------------------------------------------------------------------------
  const OFFICIAL_SOCIALS = {
    whatsappChannel: 'https://whatsapp.com/channel/0029VbDW2kT7tkj9YVMlwC1h',
    tiktok: 'https://www.tiktok.com/@dragn.ball.super28?_r=1&_t=ZS-9ATPOa8dHhH'
  };

  // --------------------------------------------------------------------------
  // ESTADO GLOBAL DE LA APLICACIÓN
  // --------------------------------------------------------------------------
  const state = {
    episodes: [],
    filteredEpisodes: [],
    currentIndex: 0,
    currentServer: 'streamwish', // 'streamwish' | 'streamhg' | 'latino'
    searchQuery: '',
    activeFilter: 'all',
    cinemaMode: false
  };

  // --------------------------------------------------------------------------
  // ELEMENTOS DEL DOM
  // --------------------------------------------------------------------------
  const DOM = {
    // Reproductor principal
    videoPlayer: document.getElementById('mainVideoPlayer'),
    playerAspectFrame: document.getElementById('playerAspectFrame'),
    playerLoader: document.getElementById('playerLoader'),
    playerEpBadge: document.getElementById('playerEpBadge'),
    playerTagBadge: document.getElementById('playerTagBadge'),
    playerCurrentTitle: document.getElementById('playerCurrentTitle'),
    playerCurrentJp: document.getElementById('playerCurrentJp'),
    playerSynopsisText: document.getElementById('playerSynopsisText'),
    specSaga: document.getElementById('specSaga'),
    specDuration: document.getElementById('specDuration'),
    specCharacters: document.getElementById('specCharacters'),
    mobileCurrentIndicator: document.getElementById('mobileCurrentIndicator'),

    // Botones de Navegación en Rombo Dorado
    btnPrevEpisode: document.getElementById('btnPrevEpisode'),
    btnNextEpisode: document.getElementById('btnNextEpisode'),
    btnPrevMobile: document.getElementById('btnPrevMobile'),
    btnNextMobile: document.getElementById('btnNextMobile'),

    // Servidores
    serverBtns: document.querySelectorAll('.server-tab-btn'),

    // Barra de Herramientas
    btnCinemaMode: document.getElementById('btnCinemaMode'),
    btnFullscreen: document.getElementById('btnFullscreen'),
    btnReloadPlayer: document.getElementById('btnReloadPlayer'),
    btnShareEpisode: document.getElementById('btnShareEpisode'),

    // Catálogo y Búsqueda
    episodesCardsGrid: document.getElementById('episodesCardsGrid'),
    episodeSearchInput: document.getElementById('episodeSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    filterPills: document.querySelectorAll('.filter-pill'),
    noResultsState: document.getElementById('noResultsState'),
    btnResetFilters: document.getElementById('btnResetFilters'),

    // Personajes Interactivos
    charCards: document.querySelectorAll('.char-selector-card'),
    heroCharLeftImg: document.getElementById('heroCharLeftImg'),
    heroCharLeftName: document.getElementById('heroCharLeftName'),
    heroCharRightImg: document.getElementById('heroCharRightImg'),
    heroCharRightName: document.getElementById('heroCharRightName'),

    // Navegación General
    siteHeader: document.getElementById('header'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileDrawer: document.getElementById('mobileDrawer'),
    drawerCloseBtn: document.getElementById('drawerCloseBtn'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    btnBackToTop: document.getElementById('btnBackToTop'),

    // Modal de Compartir
    shareModalBackdrop: document.getElementById('shareModalBackdrop'),
    closeShareModalBtn: document.getElementById('closeShareModalBtn'),
    shareUrlInput: document.getElementById('shareUrlInput'),
    btnCopyUrl: document.getElementById('btnCopyUrl'),
    copyNotice: document.getElementById('copyNotice'),
    shareWaLink: document.getElementById('shareWaLink'),
    shareFbLink: document.getElementById('shareFbLink'),
    shareTwLink: document.getElementById('shareTwLink'),
    shareTgLink: document.getElementById('shareTgLink'),

    // Botones Oficiales de Comunidad y Redes
    headerVipBtn: document.getElementById('headerVipBtn'),
    headerTiktokBtn: document.getElementById('headerTiktokBtn')
  };

  // --------------------------------------------------------------------------
  // CARGA DINÁMICA DE DATOS MEDIANTE FETCH (CON RESPALDO INTEGRADO)
  // --------------------------------------------------------------------------
  async function loadEpisodesData() {
    try {
      let response = await fetch('./episodes.json');
      if (!response.ok) {
        response = await fetch('./data/episodes.json');
      }
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      state.episodes = data;
      state.filteredEpisodes = [...data];
    } catch (err) {
      console.warn('[DBS-APP] Carga vía fetch falló o entorno local sin servidor HTTP. Usando datos internos de reserva.', err);
      state.episodes = getFallbackEpisodes();
      state.filteredEpisodes = [...state.episodes];
    }

    const hasInitialHash = checkUrlParams();
    renderEpisodesGrid();
    loadEpisode(state.currentIndex, hasInitialHash, false);
    if (!hasInitialHash) {
      window.scrollTo(0, 0);
    }
  }

  // --------------------------------------------------------------------------
  // GESTIÓN DEL REPRODUCTOR Y CARGA DE CAPÍTULOS
  // --------------------------------------------------------------------------
  function loadEpisode(index, smoothScrollToPlayer = true, updateHash = true) {
    if (index < 0 || index >= state.episodes.length) return;

    state.currentIndex = index;
    const ep = state.episodes[index];

    // Obtener URL según servidor activo
    const embedUrl = getEmbedUrlForServer(ep, state.currentServer);

    // Función de actualización de contenidos en el DOM
    const updateDOM = () => {
      // Actualizar iFrame
      if (DOM.videoPlayer) {
        DOM.videoPlayer.src = embedUrl;
      }

      // Actualizar Metadatos
      if (DOM.playerEpBadge) DOM.playerEpBadge.textContent = `EPISODIO ${ep.number}`;
      if (DOM.playerTagBadge) DOM.playerTagBadge.textContent = ep.badge || 'CANON';
      if (DOM.playerCurrentTitle) DOM.playerCurrentTitle.textContent = ep.title;
      if (DOM.playerCurrentJp) DOM.playerCurrentJp.textContent = ep.japaneseTitle || '';
      if (DOM.playerSynopsisText) DOM.playerSynopsisText.textContent = ep.synopsis;
      if (DOM.specSaga) DOM.specSaga.textContent = ep.saga || 'Batalla de los Dioses';
      if (DOM.specDuration) DOM.specDuration.textContent = ep.duration || '24 Minutos';
      if (DOM.specCharacters && ep.characters) {
        DOM.specCharacters.textContent = ep.characters.join(', ');
      }
      if (DOM.mobileCurrentIndicator) {
        DOM.mobileCurrentIndicator.textContent = `${ep.number} / ${state.episodes.length}`;
      }

      // Actualizar estado de botones de navegación (Deshabilitar en extremos)
      updateNavigationButtonsState();

      // Resaltar tarjeta activa en el catálogo (solo desplaza carrusel si el usuario interactuó)
      highlightActiveCard(ep.id, smoothScrollToPlayer);
    };

    // Animar transición con GSAP si está disponible
    if (window.DBSAnimations && typeof window.DBSAnimations.animateEpisodeTransition === 'function') {
      window.DBSAnimations.animateEpisodeTransition(DOM.playerAspectFrame, updateDOM);
    } else {
      updateDOM();
    }

    // Desplazar suavemente hacia el reproductor solo si fue invocado por interacción o hash explícito
    if (smoothScrollToPlayer) {
      const videosSection = document.getElementById('videos-section');
      if (videosSection) {
        const yOffset = -70;
        const y = videosSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }

    // Actualizar hash en la URL únicamente si el usuario hizo clic o interacción explícita
    if (updateHash) {
      updateUrlHash(ep.number);
    }
  }

  function getEmbedUrlForServer(episode, server) {
    if (server === 'streamhg') {
      return episode.streamHG || episode.streamWish;
    } else if (server === 'latino') {
      return `${episode.streamWish}?audio=latino`;
    }
    return episode.streamWish || episode.streamHG;
  }

  function updateNavigationButtonsState() {
    const isFirst = state.currentIndex === 0;
    const isLast = state.currentIndex === state.episodes.length - 1;

    // Botones de escritorio (Rombos dorados)
    if (DOM.btnPrevEpisode) {
      DOM.btnPrevEpisode.disabled = isFirst;
      DOM.btnPrevEpisode.classList.toggle('disabled', isFirst);
    }
    if (DOM.btnNextEpisode) {
      DOM.btnNextEpisode.disabled = isLast;
      DOM.btnNextEpisode.classList.toggle('disabled', isLast);
    }

    // Botones móviles
    if (DOM.btnPrevMobile) DOM.btnPrevMobile.disabled = isFirst;
    if (DOM.btnNextMobile) DOM.btnNextMobile.disabled = isLast;
  }

  function goToPreviousEpisode() {
    if (state.currentIndex > 0) {
      if (window.DBSAnimations && typeof window.DBSAnimations.pulseRhombusBtn === 'function') {
        window.DBSAnimations.pulseRhombusBtn(DOM.btnPrevEpisode);
      }
      loadEpisode(state.currentIndex - 1, true, true);
    }
  }

  function goToNextEpisode() {
    if (state.currentIndex < state.episodes.length - 1) {
      if (window.DBSAnimations && typeof window.DBSAnimations.pulseRhombusBtn === 'function') {
        window.DBSAnimations.pulseRhombusBtn(DOM.btnNextEpisode);
      }
      loadEpisode(state.currentIndex + 1, true, true);
    }
  }

  // --------------------------------------------------------------------------
  // CAMBIO DE SERVIDORES DE REPRODUCCIÓN
  // --------------------------------------------------------------------------
  function setServer(serverName) {
    if (state.currentServer === serverName) return;
    state.currentServer = serverName;

    DOM.serverBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-server') === serverName);
    });

    loadEpisode(state.currentIndex, false, false);
  }

  // --------------------------------------------------------------------------
  // RENDERIZADO Y GESTIÓN DEL CATÁLOGO DE EPISODIOS CON PORTADAS OFICIALES
  // --------------------------------------------------------------------------
  function renderEpisodesGrid() {
    if (!DOM.episodesCardsGrid) return;

    DOM.episodesCardsGrid.innerHTML = '';

    if (state.filteredEpisodes.length === 0) {
      if (DOM.noResultsState) DOM.noResultsState.classList.remove('hidden');
      return;
    }

    if (DOM.noResultsState) DOM.noResultsState.classList.add('hidden');

    const fragment = document.createDocumentFragment();

    state.filteredEpisodes.forEach(ep => {
      const card = document.createElement('article');
      card.className = 'episode-card';
      card.setAttribute('data-id', ep.id);
      card.setAttribute('data-number', ep.number);
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Reproducir Capítulo ${ep.number}: ${ep.title}`);

      const isCurrent = state.episodes[state.currentIndex] && state.episodes[state.currentIndex].id === ep.id;
      if (isCurrent) {
        card.classList.add('active-playing');
      }

      const rootFallbackImg = ep.thumbnail.replace('assets/images/', '');

      card.innerHTML = `
        <div class="card-thumbnail-wrap">
          <img src="${ep.thumbnail}" alt="Capítulo ${ep.number}" class="card-img" loading="lazy" onerror="this.src='${rootFallbackImg}'">
          <span class="card-number-badge">EP ${ep.number}</span>
          <span class="card-duration-badge">${ep.duration}</span>
          <div class="card-play-hover-btn">
            <img src="assets/images/rhom.png" alt="Play" onerror="this.src='rhom.png'">
            <i class="fa-solid fa-play"></i>
          </div>
          <div class="card-playing-indicator">
            <i class="fa-solid fa-volume-high"></i> EN REPRODUCCIÓN
          </div>
        </div>
        <div class="card-body">
          <div class="card-tag-row">
            <span class="card-badge">${ep.badge || 'CANON'}</span>
            <span class="card-type">${ep.type || 'Saga Beerus'}</span>
          </div>
          <h4 class="card-title">${ep.title}</h4>
          <p class="card-synopsis-snippet">${ep.synopsis}</p>
          <div class="card-footer">
            <span class="card-characters"><i class="fa-solid fa-users"></i> ${ep.characters ? ep.characters.slice(0, 2).join(', ') : 'Goku, Beerus'}</span>
            <span class="card-play-action">VER AHORA <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        const fullIndex = state.episodes.findIndex(item => item.id === ep.id);
        if (fullIndex !== -1) {
          loadEpisode(fullIndex, true, true);
        }
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const fullIndex = state.episodes.findIndex(item => item.id === ep.id);
          if (fullIndex !== -1) {
            loadEpisode(fullIndex, true, true);
          }
        }
      });

      fragment.appendChild(card);
    });

    DOM.episodesCardsGrid.appendChild(fragment);

    if (window.DBSAnimations && typeof window.DBSAnimations.animateCardsStagger === 'function') {
      window.DBSAnimations.animateCardsStagger('.episode-card');
    }
  }

  function highlightActiveCard(episodeId, scrollCarousel = true) {
    const cards = document.querySelectorAll('.episode-card');
    cards.forEach(card => {
      const id = parseInt(card.getAttribute('data-id'), 10);
      const isActive = (id === episodeId);
      card.classList.toggle('active-playing', isActive);
      if (isActive && scrollCarousel && DOM.episodesCardsGrid) {
        // Desplazar únicamente el contenedor horizontal del carrusel sin alterar el scroll global de la ventana
        const cardLeft = card.offsetLeft;
        const containerWidth = DOM.episodesCardsGrid.clientWidth;
        const cardWidth = card.clientWidth;
        DOM.episodesCardsGrid.scrollTo({
          left: cardLeft - (containerWidth / 2) + (cardWidth / 2),
          behavior: 'smooth'
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // BÚSQUEDA Y FILTRADO REACTIVO
  // --------------------------------------------------------------------------
  function applyFilters() {
    const q = state.searchQuery.toLowerCase().trim();
    const filter = state.activeFilter;

    state.filteredEpisodes = state.episodes.filter(ep => {
      const matchSearch = 
        !q || 
        ep.title.toLowerCase().includes(q) ||
        ep.number.includes(q) ||
        (ep.synopsis && ep.synopsis.toLowerCase().includes(q));

      let matchCategory = true;
      if (filter !== 'all') {
        matchCategory = (ep.badge && ep.badge.toUpperCase() === filter.toUpperCase());
      }

      return matchSearch && matchCategory;
    });

    renderEpisodesGrid();
  }

  function handleSearchInput(e) {
    state.searchQuery = e.target.value;
    if (DOM.clearSearchBtn) {
      DOM.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    }
    applyFilters();
  }

  function clearSearch() {
    if (DOM.episodeSearchInput) {
      DOM.episodeSearchInput.value = '';
    }
    state.searchQuery = '';
    if (DOM.clearSearchBtn) {
      DOM.clearSearchBtn.style.display = 'none';
    }
    applyFilters();
  }

  function handleFilterPillClick(btn) {
    const filterVal = btn.getAttribute('data-filter');
    state.activeFilter = filterVal;

    DOM.filterPills.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');

    applyFilters();
  }

  function resetAllFilters() {
    clearSearch();
    state.activeFilter = 'all';
    DOM.filterPills.forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-filter') === 'all');
    });
    applyFilters();
  }

  // --------------------------------------------------------------------------
  // INTERACCIÓN DE PERSONAJES (BEERUS, GOKU, WHIS, VEGETA)
  // --------------------------------------------------------------------------
  function setupCharactersShowcase() {
    if (!DOM.charCards || DOM.charCards.length === 0) return;

    DOM.charCards.forEach(card => {
      card.addEventListener('click', () => {
        const char = card.getAttribute('data-char');
        DOM.charCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        if (typeof gsap !== 'undefined') {
          if (char === 'beerus') {
            gsap.to('#beerusGraphic', { scale: 0.95, duration: 0.2, yoyo: true, repeat: 1 });
            if (DOM.heroCharLeftImg) DOM.heroCharLeftImg.src = 'assets/images/cr-beerus.jpg';
            if (DOM.heroCharLeftName) DOM.heroCharLeftName.textContent = 'LORD BEERUS';
          } else if (char === 'whis') {
            gsap.to('#beerusGraphic', { scale: 0.95, duration: 0.2, yoyo: true, repeat: 1 });
            if (DOM.heroCharLeftImg) DOM.heroCharLeftImg.src = 'assets/images/cr-whis.jpg';
            if (DOM.heroCharLeftName) DOM.heroCharLeftName.textContent = 'WHIS SAMA';
          } else if (char === 'goku') {
            gsap.to('#gokuGraphic', { scale: 0.95, duration: 0.2, yoyo: true, repeat: 1 });
            if (DOM.heroCharRightImg) DOM.heroCharRightImg.src = 'assets/images/cr-goku.jpg';
            if (DOM.heroCharRightName) DOM.heroCharRightName.textContent = 'SON GOKU GOD';
          } else if (char === 'vegeta') {
            gsap.to('#gokuGraphic', { scale: 0.95, duration: 0.2, yoyo: true, repeat: 1 });
            if (DOM.heroCharRightImg) DOM.heroCharRightImg.src = 'assets/images/cr-vegeta.jpg';
            if (DOM.heroCharRightName) DOM.heroCharRightName.textContent = 'PRÍNCIPE VEGETA';
          }
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // UTILIDADES DEL REPRODUCTOR (MODO CINE, PANTALLA COMPLETA, RECARGA)
  // --------------------------------------------------------------------------
  function toggleCinemaMode() {
    state.cinemaMode = !state.cinemaMode;
    document.body.classList.toggle('cinema-active', state.cinemaMode);

    if (DOM.btnCinemaMode) {
      const icon = DOM.btnCinemaMode.querySelector('i');
      if (icon) {
        icon.className = state.cinemaMode ? 'fa-solid fa-lightbulb text-gold' : 'fa-regular fa-lightbulb';
      }
    }
  }

  function toggleFullscreen() {
    const el = DOM.playerAspectFrame || DOM.videoPlayer;
    if (!el) return;

    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  function reloadCurrentPlayer() {
    if (DOM.videoPlayer) {
      const currentSrc = DOM.videoPlayer.src;
      DOM.videoPlayer.src = '';
      setTimeout(() => {
        DOM.videoPlayer.src = currentSrc;
      }, 150);
    }
  }

  // --------------------------------------------------------------------------
  // MODAL DE COMPARTIR CAPÍTULO
  // --------------------------------------------------------------------------
  function openShareModal() {
    const ep = state.episodes[state.currentIndex];
    if (!ep) return;

    const currentUrl = `${window.location.origin}${window.location.pathname}#ep-${ep.number}`;
    const shareText = encodeURIComponent(`¡Mira el Episodio ${ep.number} de Dragon Ball Super (Saga de Beerus): "${ep.title}" en HD!`);

    if (DOM.shareUrlInput) DOM.shareUrlInput.value = currentUrl;

    if (DOM.shareWaLink) {
      DOM.shareWaLink.href = `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(currentUrl)}`;
    }
    if (DOM.shareFbLink) {
      DOM.shareFbLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    }
    if (DOM.shareTwLink) {
      DOM.shareTwLink.href = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(currentUrl)}`;
    }
    if (DOM.shareTgLink) {
      DOM.shareTgLink.href = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${shareText}`;
    }

    if (DOM.shareModalBackdrop) {
      DOM.shareModalBackdrop.classList.add('open');
      DOM.shareModalBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeShareModal() {
    if (DOM.shareModalBackdrop) {
      DOM.shareModalBackdrop.classList.remove('open');
      DOM.shareModalBackdrop.setAttribute('aria-hidden', 'true');
    }
    if (DOM.copyNotice) {
      DOM.copyNotice.classList.remove('show');
    }
  }

  function copyShareUrlToClipboard() {
    if (!DOM.shareUrlInput) return;
    DOM.shareUrlInput.select();
    navigator.clipboard.writeText(DOM.shareUrlInput.value).then(() => {
      if (DOM.copyNotice) {
        DOM.copyNotice.classList.add('show');
        setTimeout(() => {
          DOM.copyNotice.classList.remove('show');
        }, 2500);
      }
    });
  }

  // --------------------------------------------------------------------------
  // SINCRONIZACIÓN DE PARÁMETROS URL (DEEP LINKING #ep-05)
  // --------------------------------------------------------------------------
  function checkUrlParams() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#ep-')) {
      const epNum = hash.replace('#ep-', '');
      const foundIdx = state.episodes.findIndex(item => item.number === epNum);
      if (foundIdx !== -1) {
        state.currentIndex = foundIdx;
        return true;
      }
    }
    return false;
  }

  function updateUrlHash(epNumber) {
    if (history.replaceState) {
      history.replaceState(null, null, `#ep-${epNumber}`);
    }
  }

  // --------------------------------------------------------------------------
  // INTERACCIÓN MÓVIL Y SCROLL LISTENER
  // --------------------------------------------------------------------------
  function setupScrollAndNavigation() {
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      if (DOM.siteHeader) {
        DOM.siteHeader.classList.toggle('scrolled', scrollY > 40);
      }

      if (DOM.btnBackToTop) {
        DOM.btnBackToTop.classList.toggle('visible', scrollY > 400);
      }
    }, { passive: true });

    if (DOM.mobileMenuBtn && DOM.mobileDrawer && DOM.drawerBackdrop) {
      const toggleDrawer = (open) => {
        DOM.mobileDrawer.classList.toggle('open', open);
        DOM.drawerBackdrop.classList.toggle('open', open);
        DOM.mobileDrawer.setAttribute('aria-hidden', !open);
      };

      DOM.mobileMenuBtn.addEventListener('click', () => toggleDrawer(true));
      if (DOM.drawerCloseBtn) DOM.drawerCloseBtn.addEventListener('click', () => toggleDrawer(false));
      DOM.drawerBackdrop.addEventListener('click', () => toggleDrawer(false));

      document.querySelectorAll('.drawer-link').forEach(link => {
        link.addEventListener('click', () => toggleDrawer(false));
      });
    }

    if (DOM.shareModalBackdrop) {
      DOM.shareModalBackdrop.addEventListener('click', (e) => {
        if (e.target === DOM.shareModalBackdrop) {
          closeShareModal();
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // ENLACES SOCIALES Y COMUNIDAD OFICIALES
  // --------------------------------------------------------------------------
  function setupOfficialSocials() {
    // Sincronizar enlaces del Canal VIP Oficial en WhatsApp
    const waSelectors = [
      '#headerVipBtn',
      '.btn-vip-hero',
      '.vip-banner-action a',
      '.drawer-footer a',
      '.footer-links-list a[href*="whatsapp"]'
    ];
    waSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(link => {
        link.href = OFFICIAL_SOCIALS.whatsappChannel;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      });
    });

    // Sincronizar enlaces de la Cuenta Oficial de TikTok
    const tiktokSelectors = [
      '#headerTiktokBtn',
      '.drawer-tiktok',
      '.footer-links-list a[href*="tiktok"]'
    ];
    tiktokSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(link => {
        link.href = OFFICIAL_SOCIALS.tiktok;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      });
    });
  }

  // --------------------------------------------------------------------------
  // REGISTRO DE EVENT LISTENERS PRINCIPALES
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    if (DOM.btnPrevEpisode) DOM.btnPrevEpisode.addEventListener('click', goToPreviousEpisode);
    if (DOM.btnNextEpisode) DOM.btnNextEpisode.addEventListener('click', goToNextEpisode);
    if (DOM.btnPrevMobile) DOM.btnPrevMobile.addEventListener('click', goToPreviousEpisode);
    if (DOM.btnNextMobile) DOM.btnNextMobile.addEventListener('click', goToNextEpisode);

    DOM.serverBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const s = btn.getAttribute('data-server');
        setServer(s);
      });
    });

    if (DOM.btnCinemaMode) DOM.btnCinemaMode.addEventListener('click', toggleCinemaMode);
    if (DOM.btnFullscreen) DOM.btnFullscreen.addEventListener('click', toggleFullscreen);
    if (DOM.btnReloadPlayer) DOM.btnReloadPlayer.addEventListener('click', reloadCurrentPlayer);
    if (DOM.btnShareEpisode) DOM.btnShareEpisode.addEventListener('click', openShareModal);
    if (DOM.closeShareModalBtn) DOM.closeShareModalBtn.addEventListener('click', closeShareModal);
    if (DOM.btnCopyUrl) DOM.btnCopyUrl.addEventListener('click', copyShareUrlToClipboard);

    if (DOM.episodeSearchInput) DOM.episodeSearchInput.addEventListener('input', handleSearchInput);
    if (DOM.clearSearchBtn) DOM.clearSearchBtn.addEventListener('click', clearSearch);
    DOM.filterPills.forEach(pill => {
      pill.addEventListener('click', () => handleFilterPillClick(pill));
    });
    if (DOM.btnResetFilters) DOM.btnResetFilters.addEventListener('click', resetAllFilters);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.shareModalBackdrop && DOM.shareModalBackdrop.classList.contains('open')) {
          closeShareModal();
        }
        if (state.cinemaMode) {
          toggleCinemaMode();
        }
      }
    });

    setupOfficialSocials();
    setupScrollAndNavigation();
    setupCharactersShowcase();
  }

  // --------------------------------------------------------------------------
  // DATOS DE RESPALDO CON MINIATURAS OFICIALES (OFFLINE / FILE:// FALLBACK)
  // --------------------------------------------------------------------------
  function getFallbackEpisodes() {
    return [
      { id: 1, number: "01", title: "¡La recompensa por la paz! ¿Quién obtendrá los 100 millones de Zenis?", japaneseTitle: "平和の報酬 1億円は誰の手に!?", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "CANON", type: "Capítulo Estreno", synopsis: "Seis meses después de derrotar a Majin Buu, la Tierra vive una aparente paz. Goku trabaja como granjero obligado por Chi-Chi, mientras en los confines del cosmos, el Dios de la Destrucción Beerus despierta.", streamHG: "https://hgcloud.to/e/cuf640d1o5xn", streamWish: "https://hgcloud.to/e/cuf640d1o5xn", thumbnail: "assets/images/mv-thum01.jpg", characters: ["Goku", "Goten", "Beerus", "Whis"] },
      { id: 2, number: "02", title: "¡Hacia las vacaciones prometidas! ¿Vegeta va a un viaje familiar?", japaneseTitle: "約束のリゾートへ! ベジータが家族旅行!?", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "CANON", type: "Especial Familiar", synopsis: "Vegeta cumple la promesa que le hizo a Trunks y lo lleva de vacaciones. Beerus recuerda una premonición sobre un ser formidable: el Dios Super Saiyajin.", streamHG: "https://streamwish.to/e/demo-dbs-02", streamWish: "https://streamwish.to/e/demo-dbs-02", thumbnail: "assets/images/mv-thum02.jpg", characters: ["Vegeta", "Bulma", "Trunks", "Beerus"] },
      { id: 3, number: "03", title: "¿Dónde está la continuación del sueño? ¡Encuentra al Dios Super Saiyajin!", japaneseTitle: "夢の続きはどこだ!? 超サイヤ人ゴッドを探せ!", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "CLAVE", type: "Profecía", synopsis: "Beerus y Whis consultan al Pez Oráculo para confirmar si el Dios Super Saiyajin existe. Al enterarse de la derrota de Freezer, viajan al planeta de Kaio.", streamHG: "https://streamwish.to/e/demo-dbs-03", streamWish: "https://streamwish.to/e/demo-dbs-03", thumbnail: "assets/images/mv-thum03_en.jpg", characters: ["Beerus", "Whis", "Pez Oráculo", "Kaio del Norte"] },
      { id: 4, number: "04", title: "¡Objetivo: Las Esferas del Dragón! ¡La gran maniobra de la banda de Pilaf!", japaneseTitle: "目指せドラゴンボール! ピラフ一味の大作戦!", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "CANON", type: "Bulma's Party", synopsis: "Bulma celebra su cumpleaños en un crucero de lujo con las Esferas del Dragón como premio. La banda de Pilaf intenta infiltrarse para robarlas.", streamHG: "https://streamwish.to/e/demo-dbs-04", streamWish: "https://streamwish.to/e/demo-dbs-04", thumbnail: "assets/images/mv-thum04.jpg", characters: ["Bulma", "Pilaf", "Mai", "Shu"] },
      { id: 5, number: "05", title: "¡Batalla decisiva en el planeta de Kaio! ¡Goku contra el Dios de la Destrucción Beerus!", japaneseTitle: "界王星の決戦! 悟空VS破壊神ビルス", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "COMBATE", type: "Goku vs Beerus I", synopsis: "Goku utiliza el Super Saiyajin 3 para enfrentarse a Beerus, pero es derrotado con solo dos golpes certeros del Dios de la Destrucción.", streamHG: "https://streamwish.to/e/demo-dbs-05", streamWish: "https://streamwish.to/e/demo-dbs-05", thumbnail: "assets/images/mv-thum05.jpg", characters: ["Goku SSJ3", "Beerus", "Kaio del Norte"] },
      { id: 6, number: "06", title: "¡No hagas enojar al Dios de la Destrucción! Una emocionante fiesta de cumpleaños", japaneseTitle: "破壊神を怒らせるな! ドキドキ誕生パーティー", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "TENSIÓN", type: "Tierra en Peligro", synopsis: "Beerus y Whis llegan al crucero. Vegeta, advertido del peligro, intenta mantener de buen humor a Beerus para evitar la aniquilación de la Tierra.", streamHG: "https://streamwish.to/e/demo-dbs-06", streamWish: "https://streamwish.to/e/demo-dbs-06", thumbnail: "assets/images/mv-thum01.jpg", characters: ["Vegeta", "Beerus", "Whis", "Bulma"] },
      { id: 7, number: "07", title: "¡¿Cómo te atreves a tocar a mi Bulma?! ¡La furiosa mutación de Vegeta!", japaneseTitle: "よくもオレのブルマを! ベジータ怒りの突然変異!?", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "ÉPICO", type: "Furia de Vegeta", synopsis: "Cuando Beerus golpea a Bulma, Vegeta desata una furia colosal superando temporalmente a Goku y propinando una ráfaga de ataques contra Beerus.", streamHG: "https://streamwish.to/e/demo-dbs-07", streamWish: "https://streamwish.to/e/demo-dbs-07", thumbnail: "assets/images/mv-thum02.jpg", characters: ["Vegeta Furia", "Beerus", "Bulma", "Majin Buu"] },
      { id: 8, number: "08", title: "¡Goku llega por fin! ¿La última oportunidad de parte de Beerus?", japaneseTitle: "悟空見参! ビルス様からのラストチャンス!?", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "CANON", type: "Piedra Papel Tijera", synopsis: "Oolong se juega el destino del planeta en piedra, papel o tijera. Goku llega justo a tiempo y convoca a Shenlong para descubrir el misterio del Dios Super Saiyajin.", streamHG: "https://streamwish.to/e/demo-dbs-08", streamWish: "https://streamwish.to/e/demo-dbs-08", thumbnail: "assets/images/mv-thum03_en.jpg", characters: ["Goku", "Oolong", "Beerus", "Shenlong"] },
      { id: 9, number: "09", title: "¡Disculpa la demora, Beerus-sama! ¡Al fin nace el Dios Super Saiyajin!", japaneseTitle: "お待たせ, ビルス様 ついに超サイヤ人ゴッド誕生!", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "RITUAL", type: "Nacimiento Divino", synopsis: "Con cinco saiyajins de corazón puro infundiendo su luz en Goku (incluyendo al bebé en el vientre de Videl), nace el Super Saiyajin Dios con aura carmesí.", streamHG: "https://streamwish.to/e/demo-dbs-09", streamWish: "https://streamwish.to/e/demo-dbs-09", thumbnail: "assets/images/mv-thum04.jpg", characters: ["Goku SSJ God", "Videl", "Vegeta", "Gohan"] },
      { id: 10, number: "10", title: "¡Desata tu poder, Goku! ¡El poder del Dios Super Saiyajin!", japaneseTitle: "見せろ悟空! 超サイヤ人ゴッドの力!", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "COMBATE", type: "Rango Divino", synopsis: "Goku empieza a dominar la velocidad y fuerza que otorga el ki divino. Beerus se entusiasma al encontrar por fin a un contrincante formidable.", streamHG: "https://streamwish.to/e/demo-dbs-10", streamWish: "https://streamwish.to/e/demo-dbs-10", thumbnail: "assets/images/mv-thum05.jpg", characters: ["Goku SSJ God", "Beerus", "Whis"] },
      { id: 11, number: "11", title: "¡Continuemos, Beerus-sama! ¡La batalla de los Dioses!", japaneseTitle: "続けようぜビルス様! 神と神の戦いを!", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "ÉPICO", type: "Duelo Estratosférico", synopsis: "La batalla se traslada al espacio sobre la Tierra. Goku experimenta las misteriosas facultades de regeneración y control de energía celestial.", streamHG: "https://streamwish.to/e/demo-dbs-11", streamWish: "https://streamwish.to/e/demo-dbs-11", thumbnail: "assets/images/mv-thum01.jpg", characters: ["Goku SSJ God", "Beerus"] },
      { id: 12, number: "12", title: "¡¿El universo se destruirá?! ¡El choque entre el Dios de la Destrucción y el Dios Super Saiyajin!", japaneseTitle: "宇宙が砕ける!? 激突! 破壊神VS超サイヤ人ゴッド", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "CLÍMAX", type: "Ondas Universales", synopsis: "El impacto de los golpes de Goku y Beerus genera ondas cósmicas capaces de colapsar la estructura del Universo 7 si no logran equilibrar su fuerza.", streamHG: "https://streamwish.to/e/demo-dbs-12", streamWish: "https://streamwish.to/e/demo-dbs-12", thumbnail: "assets/images/mv-thum02.jpg", characters: ["Goku SSJ God", "Beerus", "Shin", "Kaio Anciano"] },
      { id: 13, number: "13", title: "¡Goku, sobrepasa al Dios Super Saiyajin!", japaneseTitle: "悟空よ、超サイヤ人ゴッドを越えてゆけ!", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "CANON", type: "Ki Asimilado", synopsis: "El tiempo del estado divino concluye, pero el cuerpo de Goku ha asimilado ese poder en su estado base y Super Saiyajin ordinario sin retroceder.", streamHG: "https://streamwish.to/e/demo-dbs-13", streamWish: "https://streamwish.to/e/demo-dbs-13", thumbnail: "assets/images/mv-thum04.jpg", characters: ["Goku", "Beerus", "Whis"] },
      { id: 14, number: "14", title: "¡Este es todo el poder que tengo! ¡El desenlace de la batalla de los Dioses!", japaneseTitle: "これがオラのありったけの力だ! 決着! 神と神", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "FINAL DE SAGA", type: "Desenlace Divino", synopsis: "Goku supera sus límites finales para disipar la esfera de destrucción masiva de Beerus. La Tierra se salva y se abre la puerta al multiverso divino.", streamHG: "https://streamwish.to/e/demo-dbs-14", streamWish: "https://streamwish.to/e/demo-dbs-14", thumbnail: "assets/images/mv-thum05.jpg", characters: ["Goku", "Beerus", "Whis", "Vegeta"] },
      { id: 15, number: "15", title: "¡Héroe Satán, haz un milagro! ¡Un desafío desde el espacio exterior!", japaneseTitle: "勇者サタンよ奇跡を起こせ! 宇宙からの挑戦状!?", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "CANON", type: "Héroe Satán", synopsis: "Mr. Satán se adjudica la victoria contra el Dios de la Destrucción, pero embajadores alienígenas visitan la Tierra para enfrentarlo, obligándolo a pedir auxilio urgente a Goku.", streamHG: "https://streamwish.to/e/demo-dbs-15", streamWish: "https://streamwish.to/e/demo-dbs-15", thumbnail: "assets/images/mv-thum01.jpg", characters: ["Mr. Satán", "Goku", "Kibito-shin"] },
      { id: 16, number: "16", title: "¡¿Vegeta se convierte en discípulo?! ¡Convence a Whis!", japaneseTitle: "ベジータが弟子入り!? ウイスを攻略せよ!", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "ENTRENAMIENTO", type: "Vegeta & Whis", synopsis: "Vegeta busca superar a Goku por su propia cuenta y descubre que Whis es el maestro de Beerus. Tras deleitarlo con la exquisita gastronomía terrestre, Whis acepta entrenarlo en el planeta de la destrucción.", streamHG: "https://streamwish.to/e/demo-dbs-16", streamWish: "https://streamwish.to/e/demo-dbs-16", thumbnail: "assets/images/mv-thum02.jpg", characters: ["Vegeta", "Whis", "Bulma"] },
      { id: 17, number: "17", title: "¡El nacimiento de Pan! ¡¿Goku se va a entrenar?!", japaneseTitle: "パン誕生! そして悟空は修行の旅へ!?", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "CANON", type: "Nacimiento de Pan", synopsis: "Nace la pequeña Pan, hija de Gohan y Videl. Mientras la familia celebra, Goku descubre con asombro que Vegeta lleva seis meses entrenando en el planeta de Beerus y le ruega a Whis que lo lleve.", streamHG: "https://streamwish.to/e/demo-dbs-17", streamWish: "https://streamwish.to/e/demo-dbs-17", thumbnail: "assets/images/mv-thum03_en.jpg", characters: ["Goku", "Pan", "Gohan", "Whis"] },
      { id: 18, number: "18", title: "¡Yo también llegué! ¡Comienza el entrenamiento en el planeta de Beerus!", japaneseTitle: "オラも来たぞ! ビルス星での修行開始!", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "ENTRENAMIENTO", type: "Goku & Vegeta", synopsis: "Goku llega al planeta sagrado de Beerus. Junto a Vegeta, es sometido a un brutal régimen de entrenamiento con pesas divinas capaces de absorber el movimiento de sus cuerpos, preparándose para el siguiente nivel divino.", streamHG: "https://streamwish.to/e/demo-dbs-18", streamWish: "https://streamwish.to/e/demo-dbs-18", thumbnail: "assets/images/mv-thum04.jpg", characters: ["Goku", "Vegeta", "Whis", "Beerus"] },
      { id: 19, number: "19", title: "¡La desesperación regresa! ¡La resurrección del emperador del mal, Freezer!", japaneseTitle: "絶望ふたたび! 悪の帝王フリーザの復活!", saga: "Saga de la Batalla de los Dioses (Beerus)", duration: "24 min", badge: "ÉPICO", type: "Regreso de Freezer", synopsis: "Los restos del ejército de Freezer, comandados por Sorbet y Tagoma, viajan a la Tierra y utilizan las Esferas del Dragón para resucitar al temible emperador del mal, desatando una nueva era de terror cósmico.", streamHG: "https://streamwish.to/e/demo-dbs-19", streamWish: "https://streamwish.to/e/demo-dbs-19", thumbnail: "assets/images/mv-thum05.jpg", characters: ["Freezer", "Sorbet", "Tagoma", "Shenlong"] }
    ];
  }

  // --------------------------------------------------------------------------
  // INICIALIZACIÓN
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    // Si la visita no contiene un hash explícito, forzar inicio en la cabecera
    if (!window.location.hash) {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
    setupEventListeners();
    loadEpisodesData();
  });

})();
