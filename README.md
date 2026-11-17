# Iterando por mi vida — sitio oficial

Sitio estático del juego: historia, personajes, cómo se juega, Newton-Raphson
explicado paso a paso, la gráfica del panel, aspectos técnicos, galería con
visor ampliado, aprendizaje, créditos y descargas para PC y Android.

## Cómo abrirlo

No necesita instalación ni conexión: abrí `index.html` con doble clic.
Funciona con `file://` porque todo el arte, la música y los binarios están
dentro de esta carpeta.

Si preferís un servidor local (recomendado para probar descargas y audio):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\web\_servidor.ps1
```

Después entrá a <http://localhost:8765/>.

> El servidor local sirve `.svg` como `image/svg+xml`, `.jpg` como `image/jpeg`
> y los binarios con su tipo correcto. Si publicás en otro hosting, verificá que
> el SVG no se entregue como `application/octet-stream` o la ilustración del
> grimorio no se verá.

## Cómo publicarla

Subí el contenido de esta carpeta (`web/`) a cualquier hosting estático:
GitHub Pages, Netlify, Cloudflare Pages, Vercel o un servidor propio.
No hay backend ni variables de entorno.

Importante: para que las descargas funcionen, la carpeta `descargas/` tiene que
viajar junto con `index.html`, `styles.css`, `app.js` y `assets/`.

## Estructura

- `index.html` — contenido, secciones y datos estructurados del videojuego.
- `iterando-por-mi-vida.html` — página independiente de un solo archivo con las
  descargas, la explicación de Newton-Raphson desde cero, el simulador y la
  música del juego. No usa `styles.css` ni `app.js`: lleva su CSS y su JS dentro.
- `styles.css` — estilos, animaciones, línea de tiempo, galería y responsive.
- `app.js` — navegación, música, laboratorio con narración del grimorio,
  anatomía de la gráfica, comparación matemática/juego, gráfica del panel, demo,
  galería y visor.
- `assets/` — título en WebP, escenarios, sprites, grimorio, foto del equipo y música.
- `descargas/` — APK, ZIP alternativo y EXE de Windows (versión 2.2).
- `_servidor.ps1` — servidor local de prueba en el puerto 8765.

## Secciones del sitio

1. **Portada**: título original, la frase del juego y la bruja frente a la Parca.
2. **Historia**: línea de tiempo con seis hitos, de la cripta a la última puerta.
3. **Personajes**: tarjetas de la Bruja y la Parca con objetivos y reglas.
4. **Cómo se juega**: mecánicas, condiciones de victoria y derrota, controles
   para PC y celular, y explicación del HUD.
5. **Newton-Raphson**: la idea, la fórmula término por término, la tabla que
   separa el ejemplo educativo del código del juego, la anatomía clicable de la
   gráfica (ejes, función, punto inicial, derivada, tangente, raíz, siguiente
   aproximación e iteraciones), el ejemplo numérico resuelto (`x² − 4 = 0` desde
   `x₀ = 3`), el laboratorio interactivo con el grimorio narrando cada paso, la
   comparación lado a lado entre la gráfica y la persecución, y el código
   GDScript anotado línea por línea.
6. **La gráfica**: réplica ampliada del panel del juego, con la recta, la raíz,
   el punto actual, la tangente, el historial y la franja de límites 70–400.
7. **Demo jugable** en canvas.
8. **Detrás de la cripta**: Godot, GDScript, movimiento, colisiones, rastro,
   IA de persecución, animaciones 2D y fragmentos reales de código.
9. **Galería**: arte real con filtros y visor ampliado; las capturas que faltan
   están marcadas como espacios reservados, sin inventar imágenes.
10. **Aprendizaje**: qué enseña el juego y qué conceptos aparecen.
11. **Créditos**: foto del equipo y nombres del proyecto.
12. **Descargas** para PC y Android, con instrucciones de instalación.

## La sección de Newton-Raphson en detalle

Dentro de `#newton` hay un índice con enlaces directos y cinco bloques que se
pueden leer en orden:

1. **Dos terrenos que no hay que mezclar** — tabla que compara el ejemplo
   educativo (`f(x) = x² − 4`, varios pasos, raíz en `x = 2`) con lo que hace el
   código del juego (`f(x) = x − 0,97·v`, `f′(x) = 1`, un solo paso por cálculo,
   resultado limitado a 70–400 px/s).
2. **Anatomía de la gráfica** — SVG con nueve elementos seleccionables por clic,
   chip o teclado (ejes X e Y, función, punto inicial, derivada, tangente, raíz,
   siguiente aproximación e iteraciones). Cada uno actualiza una ficha con una
   explicación corta y su valor numérico.
3. **Laboratorio con grimorio** — el botón «Recorrer las iteraciones» reinicia en
   `x₀ = 3`, anima cada paso de Newton y hace que el grimorio cuente qué leyó,
   qué calculó y cuánto bajó el error. Los cuatro pasos de la lista se marcan a
   medida que se completan.
4. **Comparación lado a lado** — a la izquierda la gráfica matemática, a la
   derecha la bruja y la Parca. El control `v` fija la velocidad de la bruja y el
   botón «Un paso de Newton» muestra qué valor toma `x_n` en el juego, incluido
   el recorte al límite 70–400.
5. **Código anotado** — fragmentos reales de `scenes/parca.gd` y
   `scenes/grafica_newton.gd` con una nota por línea y avisos sobre `k_v` y el
   historial por frame.

> La comparación es una **simplificación en línea recta**: usa la diferencia
> `v − x_n` para mostrar si la brecha crece o se cierra en un segundo. No modela
> obstáculos, paredes, rastro ni la curva real del nivel. Los puntos de la
> gráfica matemática no son posiciones físicas de la bruja o la Parca: la
> posición se maneja aparte con `global_position`.

## Página `iterando-por-mi-vida.html`

Es la versión de un solo archivo pensada para compartir y descargar el juego.
Incluye las doce secciones pedidas: cabecera, descargas, historia, los tres pasos
del método, cómo lo usa el juego, simulador, tabla de `f(x) = x² − 2`, código con
pestañas GDScript/Python, diccionario desplegable y foto del equipo.

- **Descargas**: los enlaces se configuran al inicio del `<script>`:

  ```js
  const LINKS = {
    pc: "descargas/IterandoPorMiVida-PC-v2.2.exe",
    apk: "descargas/IterandoPorMiVida-Android-v2.2.apk"
  };
  ```

  Si un enlace se deja vacío (`""`), el botón muestra «Próximamente» y queda
  deshabilitado. Con un enlace, el botón descarga el archivo y muestra el nombre
  de la plataforma.
- **Música**: usa `assets/musiquita2.ogg` con un botón flotante abajo a la
  derecha. Arranca apagada porque los navegadores bloquean el autoplay; se
  enciende con el clic del usuario y queda en bucle.
- **Tipografía**: los títulos usan la misma familia del sitio principal
  (`Segoe UI Variable`/`Segoe UI`) para que se lean bien; la fuente pixelada
  Press Start 2P queda como acento en botones, etiquetas y navegación.
- **Decoración**: cielo pixelado animado, líneas de scanline, barra de progreso
  de lectura, sprites de la bruja, la puerta y la Parca en la cabecera, galería
  de escenarios y grimorio en el panel de la fórmula.
- **Responsive**: probado a 320, 360, 420, 768, 900, 1086 y 1440 px sin scroll
  horizontal del cuerpo. La tabla y los bloques de código tienen scroll interno
  en pantallas angostas.

## Notas

- La página usa la regla `0,97` que mueve a la Parca. El panel real del juego
  es compacto y tiene su propia constante interna; la réplica de la web es una
  versión ampliada y conceptual para enseñar la idea.
- El panel del juego dibuja la recta con `k_v = 1.02`, pero el movimiento usa
  `factor_nr = 0.97`. La web explica el movimiento con `0,97` y aclara que el
  dibujo del panel es otra constante.
- El historial del panel agrega un valor de `x_n` por frame de física, no una
  iteración de Newton por punto. La web lo dice explícitamente para no sugerir
  una convergencia que el código no hace.
- El ejemplo numérico (`x² − 4 = 0`, desde `x₀ = 3`) es independiente del juego:
  sirve para ver la convergencia en pocos pasos.
- Los binarios de `descargas/` son enlaces duros a `build/` para no duplicar
  cientos de MB. Al copiar la carpeta a otro disco o subirla a un hosting se
  comportan como archivos normales; asegurate de incluir la carpeta completa.
- La galería no incluye capturas de gameplay inventadas: hay dos espacios
  reservados para agregarlas cuando existan.
- El título de la portada se sirve en WebP (298 KB en lugar de 1,83 MB) con
  transparencia intacta. El PNG original sigue en `assets/principio/titulo.png`
  del proyecto de Godot, por si hace falta reexportarlo.
- Probado en Chromium/Edge modernos a 1086, 885, 785, 420 y 360 px de ancho. En
  pantallas angostas el SVG de la anatomía se desplaza en horizontal (mínimo
  560 px) para que las etiquetas sigan legibles. No usa dependencias externas ni
  peticiones a terceros.
