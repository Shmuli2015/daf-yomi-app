function applyLang(lang) {
  var isEn = lang === 'en';
  document.documentElement.lang = isEn ? 'en' : 'he';
  document.documentElement.dir = isEn ? 'ltr' : 'rtl';
  document.documentElement.classList.toggle('lang-en', isEn);
  document.documentElement.classList.toggle('lang-he', !isEn);

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    var active = btn.getAttribute('data-lang') === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  var hePanel = document.getElementById('privacy-he');
  var enPanel = document.getElementById('privacy-en');
  if (hePanel) hePanel.hidden = isEn;
  if (enPanel) enPanel.hidden = !isEn;
}

function langFromHash() {
  return location.hash === '#en' ? 'en' : 'he';
}

applyLang(langFromHash());

document.querySelectorAll('.lang-btn').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var lang = btn.getAttribute('data-lang');
    var nextHash = '#' + lang;
    if (location.hash !== nextHash) {
      history.pushState(null, '', nextHash);
    }
    applyLang(lang);
    window.scrollTo(0, 0);
  });
});

window.addEventListener('popstate', function () {
  applyLang(langFromHash());
});
