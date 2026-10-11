# Dragon Ball Super: Saga de Beerus - Plataforma Web Oficial

Plataforma frontend moderna, prémium y ultraligera dedicada a la **Saga de Beerus y el Entrenamiento Divino (Capítulos 1 al 19)** de *Dragon Ball Super*, integrando fielmente los recursos visuales y la estética del sitio web oficial japonés (`dragonball-super.com`).

---

## 📁 Estructura del Proyecto

```text
├── index.html         # Estructura semántica, slots de Adsterra, avatares oficiales y SEO
├── css/
│   └── styles.css     # Carrusel horizontal (5 capítulos visibles), scroll dorado y alto contraste
├── js/
│   ├── gsap-config.js # Animaciones de entrada, flotación continua, transiciones y stagger
│   └── app.js         # Reproductor sin recarga (19 capítulos), selector de personajes y auto-centrado
├── data/
│   └── episodes.json  # Base de datos de los 19 episodios completos con miniaturas oficiales
├── assets/
│   ├── icons/         # Favicon y logo VIP de WhatsApp
│   └── images/        # Recursos oficiales: cr-beerus, cr-goku, cr-whis, cr-vegeta, rhom, logo_en, etc.
├── vercel.json        # Configuración de caché ultrarrápida y cabeceras para Vercel
└── README.md          # Documentación del proyecto
```

---

## 🌟 Novedades y Ajustes Implementados

1. **Catálogo Ampliado a 19 Episodios Canónicos:**
   - Abarca desde el despertar de Beerus (Episodio 1) hasta la conclusión del combate divino (Episodio 14) y la transición al entrenamiento con Whis en el planeta de la destrucción más la resurrección de Freezer (Episodios 15 al 19).
   - Títulos y filtros actualizados: "TODOS LOS EPISODIOS (1 - 19)" y botón "TODOS (19)".

2. **Carrusel con Scroll Horizontal Fluido:**
   - Contenedor `.episodes-cards-grid` con `overflow-x: auto; display: flex; gap: 15px; scroll-snap-type: x mandatory;`.
   - Dimensiones calculadas para mostrar los primeros 5 capítulos de forma simultánea en pantallas estándar (`calc((100% - 60px) / 5)`) permitiendo deslizar suavemente hacia la derecha para ver los 19 capítulos.
   - Barra de desplazamiento personalizada con degradado dorado metálico y riel oscuro.
   - Auto-centrado suave en el carrusel cuando se cambia de capítulo desde el reproductor.

3. **Legibilidad y Alto Contraste:**
   - Títulos del catálogo ("SELECCIÓN DE CAPÍTULOS OFICIALES", "TODOS LOS EPISODIOS (1 - 19)" y descripción) en color oscuro de alto contraste (`#0f0f14` / `#1a1921`).
   - Botones de filtros inactivos estilizados con fondo oscuro `#1a1a24`, borde dorado visible y sombras nítidas.

---

## 💰 Monetización (Adsterra) y Despliegue en Vercel

Configurado con `vercel.json` para despliegue inmediato:
```bash
npx vercel
```
O conectando el repositorio directamente a tu panel de Vercel.
