// Enlaces de la web en un solo sitio: descargas (GitHub Releases) y compra
// (Checkout Links de Polar, cuenta de produccion). Los botones llevan
// data-link="<clave>" y aqui se les pone el href.
const FRACTAX_LINKS = {
  macArm: 'https://github.com/Fractax-Browser/fractax-web/releases/latest/download/Fractax-mac-arm64.dmg',
  macIntel: 'https://github.com/Fractax-Browser/fractax-web/releases/latest/download/Fractax-mac-x64.dmg',
  windows: 'https://github.com/Fractax-Browser/fractax-web/releases/latest/download/Fractax-windows-setup.exe',
  linux: 'https://github.com/Fractax-Browser/fractax-web/releases/latest/download/Fractax-linux.AppImage',
  buyMonthly: 'https://buy.polar.sh/polar_cl_WIaVqh52XuEvEhNRSZ9KUltmp9z2LujUn8uac3RUmpj',
  buyYearly: 'https://buy.polar.sh/polar_cl_VSe2jd23eSojOW2zjevhZQ8x2C4zC2BdVzBf424L5Sv',
  // Business: aun sin boton en la web ("Proximamente").
  buyBusinessMonthly: 'https://buy.polar.sh/polar_cl_e2SrNcvLmwEQYQDikVOUakYXrWVOa8y9iTCqA2bEYqM',
  buyBusinessYearly: 'https://buy.polar.sh/polar_cl_x8qVworFLotxZgLxuTBVjDMZFuxKuwYJuWuyG1lXbQE',
  portal: 'https://polar.sh/fractax/portal',
  // Oferta de lanzamiento: Personal gratis 6 meses (producto gratuito en Polar).
  earlyAdopter: 'https://buy.polar.sh/polar_cl_XvzuBUkfqdw0nNOOenfqqBGrzSBs30VbbYQOf2VxiKC',
}

// Plataformas con instalador publicado en la release. Las que estan a false
// salen deshabilitadas y sin enlace (asi no dan 404); ponerlas a true
// cuando su instalador este publicado.
const AVAILABLE = { macArm: true, macIntel: true, windows: true, linux: true }
for (const el of document.querySelectorAll('[data-link]')) {
  const key = el.dataset.link
  if (AVAILABLE[key] === false) {
    el.removeAttribute('href')
    el.setAttribute('aria-disabled', 'true')
    el.classList.add('btn-soon')
    continue
  }
  const url = FRACTAX_LINKS[key]
  if (url && /^https:\/\//.test(url)) el.href = url
}

// Boton principal de descarga segun el sistema de quien visita.
const primary = document.querySelector('[data-auto-download]')
if (primary) {
  const ua = navigator.userAgent
  const isWin = /Windows/i.test(ua)
  const isMac = /Macintosh|Mac OS X/i.test(ua)
  const isLinux = /Linux/i.test(ua) && !/Android/i.test(ua)
  if (isWin && AVAILABLE.windows) {
    primary.href = FRACTAX_LINKS.windows
    primary.querySelector('span').textContent = primary.dataset.labelWindows
  } else if (isMac) {
    primary.href = FRACTAX_LINKS.macArm
    primary.querySelector('span').textContent = primary.dataset.labelMac
  } else if (isLinux && AVAILABLE.linux) {
    primary.href = FRACTAX_LINKS.linux
    primary.querySelector('span').textContent = primary.dataset.labelLinux
  }
}

document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear())

// Videos de la app (<video data-autoplay>): en bucle y sin sonido, solo
// mientras se ven en pantalla (no gastan datos ni bateria fuera de vista).
// Con "reducir movimiento" no arrancan solos: se quedan con sus controles.
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const videos = document.querySelectorAll('video[data-autoplay]')
if (reduceMotion || !('IntersectionObserver' in window)) {
  for (const video of videos) video.controls = true
} else {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) entry.target.play().catch(() => { entry.target.controls = true })
      else entry.target.pause()
    }
  }, { threshold: 0.35 })
  for (const video of videos) observer.observe(video)
}

// Analitica (GoatCounter): sin cookies y sin guardar la IP, asi que no hace
// falta banner. Panel en https://fractax.goatcounter.com. Cuenta las visitas
// y, como eventos, los clics en cada boton de descarga ("descarga-macArm"...).
// Para que no cuenten tus propias visitas, abre una vez
// https://fractax.com/#toggle-goatcounter en cada navegador que uses.
const GOATCOUNTER_URL = 'https://fractax.goatcounter.com/count'
const DOWNLOAD_KEYS = { macArm: 1, macIntel: 1, windows: 1, linux: 1 }
if (location.hostname === 'fractax.com' || location.hostname === 'www.fractax.com') {
  const gc = document.createElement('script')
  gc.async = true
  gc.src = 'https://gc.zgo.at/count.js'
  gc.dataset.goatcounter = GOATCOUNTER_URL
  document.head.appendChild(gc)
}
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href]')
  if (!a || !window.goatcounter || !window.goatcounter.count) return
  let key = a.dataset.link
  if (a.hasAttribute('data-auto-download')) {
    key = Object.keys(DOWNLOAD_KEYS).find((k) => FRACTAX_LINKS[k] === a.href) || 'auto'
  }
  if (!key || !(key in DOWNLOAD_KEYS || key === 'auto')) return
  window.goatcounter.count({ path: 'descarga-' + key, title: 'Descarga ' + key, event: true })
})

// --- Lista de espera de Business ("Avisadme cuando este") ----------------
// Los botones con data-notify="business" abren un formulario que guarda el
// email en Brevo (lista "Fractax Business"; Brevo manda un email para
// confirmar el alta, doble opt-in). BREVO_BUSINESS_FORM es la direccion del
// formulario de Brevo: Brevo -> Contactos -> Formularios -> el formulario ->
// Compartir -> "action" del codigo HTML (https://...sibforms.com/serve/...).
// Mientras este vacia, el boton abre el correo como antes.
const BREVO_BUSINESS_FORM = ''

const NOTIFY_TEXT = {
  es: {
    title: 'Te avisamos cuando salga Business',
    text: 'Déjanos tu email y te escribimos en cuanto Fractax Business esté disponible. Nada más.',
    email: 'Tu email',
    consent: 'Acepto que Fractax guarde mi email para avisarme del lanzamiento de Business, según la <a href="/privacidad.html" target="_blank">política de privacidad</a>.',
    send: 'Avisadme',
    cancel: 'Cancelar',
    sending: 'Enviando…',
    done: '¡Listo! Te hemos enviado un email: pulsa el enlace para confirmar y quedarás en la lista.',
    error: 'No se ha podido enviar. Inténtalo de nuevo o escríbenos a support@fractax.com.',
    close: 'Cerrar',
  },
  en: {
    title: 'We’ll let you know when Business is out',
    text: 'Leave your email and we’ll write as soon as Fractax Business is available. Nothing else.',
    email: 'Your email',
    consent: 'I agree that Fractax stores my email to tell me when Business launches, as described in the <a href="/en/privacy.html" target="_blank">privacy policy</a>.',
    send: 'Notify me',
    cancel: 'Cancel',
    sending: 'Sending…',
    done: 'Done! We’ve sent you an email: click the link to confirm and you’ll be on the list.',
    error: 'It couldn’t be sent. Please try again or write to support@fractax.com.',
    close: 'Close',
  },
}

function openNotifyDialog() {
  const lang = (document.documentElement.lang || 'es').startsWith('en') ? 'en' : 'es'
  const tx = NOTIFY_TEXT[lang]
  const dialog = document.createElement('dialog')
  dialog.className = 'notify-dialog'
  dialog.innerHTML = `
    <form class="notify-form">
      <h3>${tx.title}</h3>
      <p class="notify-text">${tx.text}</p>
      <label class="notify-label" for="notify-email">${tx.email}</label>
      <input id="notify-email" name="EMAIL" type="email" required autocomplete="email" placeholder="nombre@despacho.es">
      <!-- Trampa para bots de Brevo: debe ir vacio -->
      <input name="email_address_check" type="text" value="" tabindex="-1" autocomplete="off" class="notify-trap" aria-hidden="true">
      <input type="hidden" name="locale" value="${lang}">
      <label class="notify-consent"><input name="OPT_IN" type="checkbox" value="1" required> <span>${tx.consent}</span></label>
      <p class="notify-status" role="status"></p>
      <div class="notify-actions">
        <button type="button" class="btn btn-outline btn-small notify-cancel">${tx.cancel}</button>
        <button type="submit" class="btn btn-primary btn-small notify-send">${tx.send}</button>
      </div>
    </form>`
  document.body.appendChild(dialog)
  const form = dialog.querySelector('form')
  const status = dialog.querySelector('.notify-status')
  const send = dialog.querySelector('.notify-send')
  const cancel = dialog.querySelector('.notify-cancel')
  const close = () => { dialog.close(); dialog.remove() }
  cancel.addEventListener('click', close)
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close() })
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    send.disabled = true
    send.textContent = tx.sending
    status.textContent = ''
    try {
      // Brevo no deja leer la respuesta desde otra web (no-cors): si la
      // peticion sale, el alta queda pendiente de que la persona confirme.
      await fetch(BREVO_BUSINESS_FORM, { method: 'POST', mode: 'no-cors', body: new FormData(form) })
      form.innerHTML = `<h3>${tx.title}</h3><p class="notify-text">${tx.done}</p>
        <div class="notify-actions"><button type="button" class="btn btn-primary btn-small">${tx.close}</button></div>`
      form.querySelector('button').addEventListener('click', close)
      if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: 'lista-business', title: 'Alta lista Business', event: true })
    } catch {
      status.textContent = tx.error
      send.disabled = false
      send.textContent = tx.send
    }
  })
  dialog.showModal()
  dialog.querySelector('#notify-email').focus()
}

if (BREVO_BUSINESS_FORM && /^https:\/\//.test(BREVO_BUSINESS_FORM)) {
  for (const el of document.querySelectorAll('[data-notify="business"]')) {
    el.addEventListener('click', (e) => { e.preventDefault(); openNotifyDialog() })
  }
}
