(() => {
  const VISIT_COUNTER_API_URL = 'https://script.google.com/macros/s/AKfycbxD5_L3iuS_pxfIwqzIJ6aM6hlPKisCffju2itBZO80CpIa6z3WD2SS2yNFG7xWUnjlPg/exec';
  const VISIT_STORAGE_KEY = 'catastro_site_visit_date_v1';
  const counterElements = Array.from(document.querySelectorAll('[data-site-visit-count]'));

  if (!counterElements.length) return;

  const setCounterText = value => {
    counterElements.forEach(element => {
      element.textContent = value;
    });
  };

  const localDateKey = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  };

  const readLastVisit = () => {
    try {
      return localStorage.getItem(VISIT_STORAGE_KEY) || '';
    } catch (error) {
      return '';
    }
  };

  const rememberVisit = dateKey => {
    try {
      localStorage.setItem(VISIT_STORAGE_KEY, dateKey);
    } catch (error) {
      // El contador sigue funcionando aunque el navegador bloquee localStorage.
    }
  };

  const loadVisitCount = async () => {
    const dateKey = localDateKey();
    const isPublishedSite = window.location.hostname === 'geofotodata.github.io';
    const previewCount = new URLSearchParams(window.location.search).get('visitas_demo');
    if (!isPublishedSite && /^\d+$/.test(previewCount || '')) {
      setCounterText(new Intl.NumberFormat('es-CL').format(Number(previewCount)));
      return;
    }

    const shouldIncrement = isPublishedSite && readLastVisit() !== dateKey;
    const url = new URL(VISIT_COUNTER_API_URL);
    url.searchParams.set('action', 'visit');
    url.searchParams.set('increment', shouldIncrement ? '1' : '0');

    try {
      const response = await fetch(url.toString(), { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      const count = Number(result && result.count);
      if (!result || result.ok !== true || !Number.isFinite(count) || count < 0) {
        throw new Error('Respuesta de contador no válida');
      }

      setCounterText(new Intl.NumberFormat('es-CL').format(Math.trunc(count)));
      if (shouldIncrement) rememberVisit(dateKey);
    } catch (error) {
      setCounterText('no disponible');
    }
  };

  loadVisitCount();
})();
