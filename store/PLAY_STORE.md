# ChordWeaver en Google Play

Todo lo que pide Play Console para publicar la app, listo para copiar y pegar. Los gráficos están en esta carpeta.

| Dato | Valor |
| --- | --- |
| Nombre del paquete | `com.samuelcastillo.chordweaver` (no se puede cambiar después de la primera subida) |
| Categoría | Música y audio |
| Etiquetas | Música, Educación musical, Herramientas para músicos |
| Precio | Gratis (sin compras dentro de la app por ahora) |
| Anuncios | No |
| Política de privacidad | https://samuelcastillogt.github.io/chordsAppWeb/privacidad/ |
| Eliminar la cuenta (URL) | https://samuelcastillogt.github.io/chordsAppWeb/eliminar-cuenta/ |
| Sitio web | https://samuelcastillogt.github.io/chordsAppWeb/ |
| Correo de contacto | *(el correo de soporte que vayas a usar; Play lo muestra públicamente)* |

## Ficha principal

**Nombre de la app** (30 caracteres máx.)

```
ChordWeaver: acordes y armonía
```

**Descripción breve** (80 caracteres máx.)

```
Descubre qué acorde sigue, la tensión de cada cambio y crea tablaturas.
```

**Descripción completa** (4000 caracteres máx.)

```
¿Por qué suena así una canción? ChordWeaver te lo explica en español.

Elige un acorde y la app te muestra qué acordes conectan con él, ordenados de la conexión más natural a la más tensa. Arma tu progresión tocando acordes, pulsa «Ver tensión» y descubre la tonalidad, el grado de cada acorde (I, IV, V…) y su función: tónica, subdominante, dominante o prestado. Después conviértela en tablatura de guitarra con un toque.

LO QUE PUEDES HACER
• Encontrar el siguiente acorde: sugerencias según la tonalidad, con un puntaje de fluidez para cada cambio.
• Analizar una progresión: tonalidad detectada automáticamente, grados en números romanos y colores por función armónica.
• Ver la curva de tensión: qué cambios suenan suaves y cuáles generan tensión.
• Generar tablatura: posiciones de guitarra y un arpegio sugerido, listos para copiar.
• Guardar tus progresiones: crea una cuenta gratis y ábrelas también en la web de ChordWeaver.

PARA QUIÉN ES
• Guitarristas que aprenden de oído o con cifrados y quieren entender lo que tocan.
• Equipos de alabanza que preparan repertorio y cambian de tono.
• Docentes y estudiantes de música que necesitan ejemplos claros de armonía.
• Compositores que buscan una salida para su progresión.

SIN PUBLICIDAD
ChordWeaver no muestra anuncios ni ventanas emergentes. Puedes usar todas las herramientas sin crear una cuenta; la cuenta solo sirve para guardar tus progresiones.

Acepta cifrado americano (C, Dm, G7) y nombres latinos (DO, REm, SOL7).
```

## Gráficos

| Recurso | Archivo | Requisito de Play |
| --- | --- | --- |
| Ícono | `icono-512.png` | 512 × 512 PNG |
| Gráfico destacado | `grafico-destacado-1024x500.png` | 1024 × 500 PNG o JPG |
| Capturas de teléfono | `capturas/01-inicio.png` … `06-cuenta.png` | 2 a 8 capturas, 1080 × 1920 |

Las capturas salen de la app real con datos de ejemplo. Orden sugerido: inicio, sugerencias, editor, análisis, tablatura, cuenta.

## Clasificación del contenido (cuestionario IARC)

- **Categoría:** Referencia, noticias o educación.
- Violencia, sexo, lenguaje soez, drogas, apuestas, miedo: **No** a todo.
- ¿Los usuarios pueden interactuar o intercambiar contenido dentro de la app? **No** (la app no tiene chat ni perfiles públicos; compartir progresiones solo existe en la web).
- ¿Comparte la ubicación del usuario? **No**.
- ¿Permite comprar productos digitales? **No**.
- Resultado esperado: **PEGI 3 / Para todos**.

## Público objetivo y contenido

- **Edad objetivo:** 13–15, 16–17 y 18 o más. **No** marcar menores de 13 (los términos piden 13 años para crear cuenta).
- ¿La app puede atraer a niños sin querer? **No** (herramienta de teoría musical, sin personajes ni juegos).
- **Anuncios:** No contiene anuncios.
- **Acceso a la app:** algunas funciones necesitan iniciar sesión (guardar progresiones). Hay que dar a los revisores una **cuenta de prueba**: créala tú en la app con un correo de pruebas y pon el correo y la contraseña en *Contenido de la app → Acceso a la app*. Si no, la revisión puede rechazarla.
- App de noticias, de salud, financiera, gubernamental, de COVID-19: **No**.
- **Eliminación de la cuenta:** la app permite eliminarla desde *Mi cuenta → Eliminar mi cuenta*, y la URL de arriba explica cómo hacerlo sin la app.

## Seguridad de los datos

Respuestas según lo que la app hace hoy (versión 1.0.0). La app **no** incluye analítica, anuncios ni SDK de terceros aparte de Firebase Authentication.

**Preguntas generales**

| Pregunta | Respuesta |
| --- | --- |
| ¿La app recopila o comparte datos del usuario de los tipos requeridos? | **Sí** |
| ¿Todos los datos se encriptan en tránsito? | **Sí** (todo va por HTTPS) |
| ¿Ofreces una forma de solicitar la eliminación de los datos? | **Sí** (en la app y en la URL de eliminación) |

**Datos recopilados**

| Tipo de dato | ¿Recopilado? | ¿Compartido? | ¿Opcional? | Para qué |
| --- | --- | --- | --- | --- |
| Información personal → Dirección de correo electrónico | Sí | No | Sí (solo si creas cuenta) | Funcionalidad de la app, administración de la cuenta |
| Información personal → Nombre | Sí | No | Sí | Administración de la cuenta |
| Información personal → ID de usuario | Sí | No | Sí | Administración de la cuenta |
| Actividad en la app → Otro contenido generado por el usuario (progresiones guardadas) | Sí | No | Sí | Funcionalidad de la app |

- Ninguno de estos datos se procesa de forma efímera: se guardan mientras exista la cuenta.
- "Compartido" es **No** porque Firebase (Google) y Vercel actúan como proveedores de servicio por cuenta de ChordWeaver, y Play no cuenta eso como compartir.
- **No se recopilan:** ubicación, contactos, fotos, audio, archivos, calendario, información financiera, salud, mensajes, historial de navegación, identificadores del dispositivo, diagnósticos ni datos de analítica.

> Si más adelante se agrega analítica (Firebase Analytics) o pagos, hay que actualizar esta sección **antes** de publicar esa versión.

## Prueba cerrada

1. Sube el AAB a **Prueba interna** primero, instala desde el enlace y comprueba que el inicio de sesión funciona.
2. Crea la pista **Prueba cerrada**. Agrega a los testers con una lista de correos de Gmail o un Grupo de Google y comparte el enlace de participación.
3. Hacen falta **al menos 12 testers con la app instalada durante 14 días seguidos** (cuentas personales creadas después de noviembre de 2023). Anota la fecha de inicio: el día 15 se puede pedir el acceso a producción.
4. Pide a los testers que abran la app varios días y dejen comentarios: Google pregunta cómo se probó la app al solicitar producción.

## Compras dentro de la app (pendiente)

Google Play exige su propio sistema de facturación para vender suscripciones digitales dentro de la app, y no permite enlazar a un pago externo. Por eso la versión 1.0.0 **no muestra precios ni botones de compra**: al llegar al límite del plan Gratis solo explica el límite. Para vender Pro en Android habrá que integrar Google Play Billing (por ejemplo con RevenueCat) y declarar las compras en la ficha.
