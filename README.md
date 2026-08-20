# El Ultimo Camino

Version vertical jugable de un roguelite narrativo de fantasia oscura, preparada para abrirse por doble clic o publicarse como sitio estatico.

## Como abrir

Abre `index.html` con doble clic. No requiere servidor, instalacion, internet ni dependencias.

## Contenido actual

- 1 protagonista: La Guardiana.
- 2 companeros: Maia y Brann.
- 7 eventos narrativos.
- 4 enemigos normales.
- 1 campamento con dos acciones disponibles.
- 1 jefe final.
- Mapa por tramos con bifurcaciones: eliges un nodo y bloqueas los otros de ese tramo.
- Enemigos rebalanceados para que sus turnos importen mas.
- Guardado automatico local de la partida activa.
- Pantalla de titulo cinematografica.
- Niebla y transiciones CSS.
- Feedback visual de combate.
- Retratos SVG estilizados.
- Audio procedural con ambiente y efectos.
- Cinco decisiones con consecuencias diferidas durante la misma partida.

No incluye todavia metajuego ni progresion permanente entre partidas.

## Controles

- Raton o toque para escoger opciones.
- `Enter` activa el boton principal visible.
- `M` alterna el sonido minimo.

## Pruebas

Abre `tests.html` con doble clic para ejecutar una pequena bateria local sin dependencias. Comprueba datos base, ruta, opciones, API de audio, consecuencias diferidas y una simulacion de partida completa.

## Guardado

La partida activa se guarda automaticamente en `localStorage`. Al terminar y volver al titulo, el guardado de esta iteracion se limpia para empezar de nuevo.

## Estructura

- `index.html`: documento principal.
- `styles.css`: aspecto visual y disposicion.
- `data.js`: contenido narrativo, personajes, enemigos y ruta.
- `audio.js`: capa minima de sonido procedural.
- `game.js`: estado, navegacion, eventos, campamento, combate y final.
- `tests.html` y `tests.js`: pruebas locales sin dependencias.

## Publicacion estatica

El juego no necesita backend. Puede publicarse directamente en GitHub Pages, Netlify, Vercel, Cloudflare Pages o cualquier hosting de archivos estaticos que sirva `index.html`, `styles.css`, `data.js`, `audio.js` y `game.js` desde la misma carpeta.

Para GitHub Pages, sube todos los archivos de esta carpeta salvo `.agents` y `.git`, activa Pages desde la rama principal y usa la carpeta raiz como origen. El archivo `.nojekyll` ya esta incluido para que GitHub sirva los archivos tal cual.
