/**
 * ============================================================================
 * DRAGON BALL SUPER: SAGA DE BEERUS - CONFIGURACIÓN DE ANIMACIONES GSAP
 * Archivo: js/gsap-config.js
 * Tecnologías: GSAP 3.12+ & ScrollTrigger Plugin
 * ============================================================================
 */

(function () {
  'use strict';

  // Verificar disponibilidad de GSAP
  if (typeof gsap === 'undefined') {
    console.warn('[DBS-GSAP] GSAP no fue detectado en la ventana global.');
    return;
  }

  // Registrar ScrollTrigger si está presente
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /**
   * Objeto global exportado para control de animaciones desde app.js
   */
  window.DBSAnimations = {
    /**
     * 1. Animaciones de entrada inicial (Fade & Slide)
     */
    initEntranceAnimations: function () {
      // Entrada del menú superior (Navbar)
      gsap.from('.site-header', {
        y: -80,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });

      // Entrada suave del contenido principal del Hero
      const heroTl = gsap.timeline({ delay: 0.2 });
      heroTl
        .from('.hero-badge', { y: -20, opacity: 0, duration: 0.6, ease: 'power2.out' })
        .from('.hero-main-title .title-sub', { y: 25, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
        .from('.hero-main-title .title-focus', { scale: 0.92, opacity: 0, duration: 0.8, ease: 'back.out(1.5)' }, '-=0.4')
        .from('.hero-main-title .title-jp', { opacity: 0, duration: 0.5, ease: 'power1.out' }, '-=0.3')
        .from('.hero-description', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
        .from('.hero-cta-group', { y: 25, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
        .from('.hero-features-bar', { y: 15, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2');

      // Entrada de los Personajes Clave (Beerus entra por la izquierda, Goku por la derecha)
      gsap.from('#beerusGraphic', {
        x: -90,
        opacity: 0,
        duration: 1.4,
        ease: 'power3.out',
        delay: 0.3
      });

      gsap.from('#gokuGraphic', {
        x: 90,
        opacity: 0,
        duration: 1.4,
        ease: 'power3.out',
        delay: 0.3
      });

      // Entrada con ScrollTrigger para el título de la sección VIDEOS
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.from('.section-ornament-header', {
          scrollTrigger: {
            trigger: '.videos-section',
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out'
        });

        // Entrada del contenedor central del reproductor
        gsap.from('.player-master-card', {
          scrollTrigger: {
            trigger: '.player-master-card',
            start: 'top 88%',
            toggleActions: 'play none none none'
          },
          scale: 0.97,
          y: 30,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out'
        });
      }
    },

    /**
     * 2. Animación continua de flotación suave (yoyo / sine.inOut)
     * en los elementos gráficos principales (Beerus y Goku)
     */
    initFloatingLoops: function () {
      // Flotación de Lord Beerus
      const beerusEl = document.querySelector('#beerusGraphic .float-element');
      if (beerusEl) {
        gsap.to(beerusEl, {
          y: -18,
          rotation: 1.2,
          duration: 3.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      // Flotación de Son Goku SSG (con leve desfase temporal y rotación opuesta)
      const gokuEl = document.querySelector('#gokuGraphic .float-element-alt');
      if (gokuEl) {
        gsap.to(gokuEl, {
          y: -16,
          rotation: -1.2,
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.4
        });
      }

      // Respiración de las auras de energía divina
      gsap.to('.char-glow-purple', {
        scale: 1.2,
        opacity: 0.85,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.char-glow-orange', {
        scale: 1.25,
        opacity: 0.8,
        duration: 2.7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.3
      });

      // Pulso continuo del rombo de botón de reproducción en el banner
      const rhombusPlay = document.querySelector('.btn-rhombus-icon');
      if (rhombusPlay) {
        gsap.to(rhombusPlay, {
          scale: 1.12,
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    },

    /**
     * 3. Transición fluida al cambiar de capítulo en el reproductor
     * @param {HTMLElement} playerElement Contenedor del video iframe
     * @param {Function} updateContentCallback Función que actualiza el src y textos
     */
    animateEpisodeTransition: function (playerElement, updateContentCallback) {
      if (!playerElement) {
        if (typeof updateContentCallback === 'function') updateContentCallback();
        return;
      }

      const tl = gsap.timeline();

      // Desvanecimiento sutil y reducción milimétrica
      tl.to(playerElement, {
        opacity: 0.25,
        scale: 0.985,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: function () {
          if (typeof updateContentCallback === 'function') {
            updateContentCallback();
          }
        }
      })
      // Entrada con resplandor dorado
      .to(playerElement, {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: 'power2.out'
      });

      // Animar también los textos de título y sinopsis
      gsap.fromTo(
        '#playerCurrentTitle, #playerCurrentJp, #playerSynopsisText',
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.15 }
      );
    },

    /**
     * 4. Efecto de aparición en cascada (stagger) para las tarjetas de episodios
     * @param {string|NodeList} cardsElements Elementos de las tarjetas de episodios
     */
    animateCardsStagger: function (cardsElements) {
      const cards = typeof cardsElements === 'string' 
        ? document.querySelectorAll(cardsElements) 
        : cardsElements;

      if (!cards || cards.length === 0) return;

      gsap.killTweensOf(cards);

      gsap.fromTo(
        cards,
        {
          y: 35,
          opacity: 0,
          scale: 0.96
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.45,
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'transform,opacity,scale'
        }
      );
    },

    /**
     * Microinteracción de clic en botones de rombo dorado
     * @param {HTMLElement} btnElement Botón clickeado
     */
    pulseRhombusBtn: function (btnElement) {
      if (!btnElement) return;
      const shape = btnElement.querySelector('.rhombus-shape') || btnElement;
      gsap.fromTo(
        shape,
        { scale: 0.9 },
        { scale: 1, duration: 0.3, ease: 'back.out(2)' }
      );
    }
  };

  // Inicializar animaciones de entrada y bucles de flotación al cargar la página
  document.addEventListener('DOMContentLoaded', function () {
    window.DBSAnimations.initEntranceAnimations();
    window.DBSAnimations.initFloatingLoops();
  });

})();
