# Arquitectura Offline de EducAndes

Este documento explica de forma técnica y detallada cómo EducAndes logra funcionar sin conexión a internet (modo offline), una de las características principales de la aplicación para entornos rurales. 

Esta documentación te servirá de apoyo para sustentar la lógica ante tu profesor o jurado evaluador.

---

## 1. Aplicación Web Progresiva (PWA) y Service Workers
La base de la estrategia offline radica en convertir la aplicación web (React) en una PWA (Progressive Web App). Para esto, utilizamos el ecosistema de **Vite PWA** (`vite-plugin-pwa`).

* **¿Cómo funciona?** Cuando un usuario entra a la aplicación con internet, el navegador instala un "Service Worker" en segundo plano. Este es un script que actúa como un puente entre la aplicación y la red.
* **Caché Estático:** El Service Worker descarga y almacena automáticamente los archivos base de la aplicación (`index.html`, archivos de JavaScript, CSS y recursos estáticos esenciales como íconos).
* **Beneficio:** Si el usuario se queda sin conexión y refresca la página, el navegador **no** muestra el clásico error del "dinosaurio de Chrome". En su lugar, el Service Worker intercepta la solicitud y devuelve los archivos de la app directamente desde el disco duro del usuario.

## 2. Estrategia de Intercepción de Red (API Caching)
Aunque la aplicación cargue visualmente sin internet, necesita tener datos (cursos, foros, el perfil del usuario) para ser útil. Esto se logra a través de un interceptor global de **Axios** (ubicado en `src/services/api.ts`).

* **Caché Automático (Modo Lectura):** Cada vez que la aplicación hace una petición `GET` exitosa (ej. obtener la lista de cursos o el perfil de usuario), el interceptor copia esa respuesta y la guarda en el `localStorage` (o memoria del navegador) etiquetándola con la URL exacta de la petición.
* **Respuesta Resiliente:** Si el usuario está offline y la aplicación intenta hacer un `GET`, la solicitud a internet va a fallar. Sin embargo, antes de mostrarle un error al usuario, el interceptor atrapa el fallo, busca en el `localStorage` la respuesta guardada anteriormente y la devuelve como si el servidor hubiera respondido con éxito (`Promise.resolve({...})`).
* **Soporte de Logeo Offline:** Gracias a esto, si la aplicación solicita validar el token (`/auth/me`) y falla por falta de red, la tienda de autenticación (`auth.store.ts`) sabe distinguir que es un error de conexión y no un token expirado (401), manteniendo al usuario con la sesión iniciada basándose en sus datos cacheados.

## 3. Cursos Descargables (`downloads.store.ts`)
EducAndes permite descargar el contenido pesado de los cursos para consumirlo totalmente offline.

* Al pulsar "Descargar", el sistema hace peticiones para traer todas las lecciones y preguntas del cuestionario de ese curso en particular, almacenando el gran objeto JSON del curso completo de forma persistente a través de Zustand (`useDownloadsStore`).
* El usuario puede filtrar y ver únicamente los cursos que tiene guardados localmente, asegurando que tiene todo el material teórico accesible aunque no exista red.

## 4. Colas de Sincronización y Progreso Optimista
El verdadero desafío del offline no es solo *leer* datos, sino *modificarlos* (ej. terminar una lección, enviar un cuestionario) y que la app no se rompa.

* **Cola de Acciones (`offlineSync.service.ts`):** Si un usuario aprueba una lección sin internet, el sistema no puede hacer un `POST` al servidor. En lugar de eso, la acción (junto con la hora exacta y el puntaje) se encripta y se mete en una "Cola de Tareas Pendientes" dentro del `localStorage`.
* **Actualización Optimista:** Al momento de encolar la acción, la Interfaz de Usuario (React Query / Zustand) se actualiza de forma *optimista*. Es decir, se altera el estado local inmediatamente (cambiando el progreso de 25% a 50%, desbloqueando la siguiente lección y pintando las respuestas correctas de verde). El usuario siente que el sistema respondió de inmediato.
* **Sincronización Diferida:** Cuando el dispositivo del usuario vuelve a detectar internet (a través de un `window.addEventListener('online', ...)` en `App.tsx`), el servicio de sincronización despierta, toma todas las tareas pendientes de la cola, y las ejecuta silenciosamente contra el backend una por una.

## 5. El Tutor Virtual (Graceful Degradation)
Dado que Yachay (el tutor de IA) depende exclusivamente de la API de un LLM en la nube para procesar las respuestas, no es posible alojarlo localmente en el dispositivo. 
* Se implementó un patrón de diseño llamado "Graceful Degradation" (Degradación Elegante).
* Cuando la aplicación detecta que no hay internet, no desactiva por completo el botón del tutor. El usuario aún puede abrirlo y ver el historial de sus conversaciones. Si intenta enviar un mensaje nuevo, el sistema intercepta el envío y Yachay responde localmente con un mensaje preprogramado indicando su falta de conexión, manteniendo la inmersión sin lanzar pantallas de error técnicas.

---

### Resumen para Sustentación
Si el jurado te pregunta: *"¿Por qué elegir esta arquitectura offline en lugar de una app nativa en Android o iOS?"*
**Tu respuesta técnica debe ser:**
> "Optamos por una arquitectura **PWA Cache-First con Service Workers** porque nos permite ofrecer una experiencia casi idéntica a una aplicación nativa, pero sin la fricción de obligar al usuario a entrar a la Play Store y descargar cientos de megabytes. Para estudiantes en zonas rurales con conectividad intermitente, basta con abrir la web una sola vez en un cibercafé o punto WiFi: el Service Worker instala la app, el Axios Interceptor guarda los datos de lectura localmente, y la Cola de Sincronización (Sync Queue) retiene todas sus respuestas y avances para enviarlos a la base de datos automáticamente la próxima vez que encuentren señal. Es la solución más ligera, accesible y resiliente."
