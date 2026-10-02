/*
 * Social links: the ONE place to edit your accounts.
 * Paste the full profile link into `href`. Leave it as '' to hide that icon.
 * Used by the /links page and the "Follow" strip at the bottom of every page.
 */
window.AHL_SOCIALS = [
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/aboelshash/' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/ahmed-hussien-elsayed-3a3050135/' },
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/ahmed.hussien.94402' },
  { id: 'youtube', label: 'YouTube', href: '' },
  { id: 'tiktok', label: 'TikTok', href: '' },
  { id: 'x', label: 'X', href: '' },
  { id: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/966507384045' },
];

(function () {
  var ICONS = {
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
    youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/>',
    tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.8 2.3 4.5 5 4.8"/>',
    facebook: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M15.5 8.5H14a2 2 0 0 0-2 2V21M9.5 13h5"/>',
    x: '<path d="M4 4l16 16M20 4L4 20"/>',
    whatsapp: '<path d="M3.5 20.5l1.3-4.1A8.5 8.5 0 1 1 8 19.5z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a5 5 0 0 1-2.8-2.8l.8-1-1-2z" fill="currentColor" stroke="none"/>',
  };

  function icon(id) {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[id] || '') + '</svg>';
  }

  function active() {
    return window.AHL_SOCIALS.filter(function (s) { return s.href; });
  }

  // Renders icon buttons into any element; used by /links.
  window.AHL_renderSocials = function (el) {
    el.innerHTML = active().map(function (s) {
      return '<a class="ahl-social" href="' + s.href + '" target="_blank" rel="noopener me" aria-label="' + s.label + '" title="' + s.label + '">' + icon(s.id) + '</a>';
    }).join('');
  };

  // "Follow" strip after the React app on normal pages (kept outside #root so hydration never removes it).
  function addStrip() {
    var root = document.getElementById('root');
    if (!root || document.querySelector('.ahl-follow') || !active().length) return;
    var ar = document.documentElement.lang === 'ar';
    var css = document.createElement('style');
    css.textContent =
      '.ahl-follow{border-top:1px solid var(--line);background:var(--bg);color:var(--text)}' +
      // Bottom padding keeps the icons clear of the floating chat button.
      '.ahl-follow__in{max-width:var(--maxw,1200px);margin:0 auto;padding:22px var(--gutter,16px) 88px;display:flex;flex-wrap:wrap;gap:14px 24px;align-items:center;justify-content:space-between}' +
      '.ahl-follow__txt{margin:0;color:var(--text-2);font-size:15px}' +
      '.ahl-follow__txt b{color:var(--text)}' +
      '.ahl-follow__new{display:inline-block;margin-top:4px;color:var(--accent-text,var(--accent));font-weight:600;text-decoration:none}' +
      '.ahl-follow__new:hover{text-decoration:underline}' +
      '.ahl-follow__list{display:flex;flex-wrap:wrap;gap:10px}' +
      '.ahl-social{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:12px;border:1px solid var(--line-2);background:var(--surface);color:var(--text-2);transition:color .2s,border-color .2s,transform .2s}' +
      '.ahl-social:hover{color:var(--accent);border-color:var(--accent);transform:translateY(-2px)}' +
      '.ahl-social:focus-visible{outline:2px solid var(--accent);outline-offset:2px}';
    document.head.appendChild(css);
    var sec = document.createElement('section');
    sec.className = 'ahl-follow';
    sec.setAttribute('aria-label', ar ? 'تابعني' : 'Follow Ahmed');
    sec.innerHTML = '<div class="ahl-follow__in"><p class="ahl-follow__txt">' +
      (ar ? '<b>تابعني</b> لنصيحة عملية جديدة في الذكاء الاصطناعي كل أسبوع.' : '<b>Follow along</b> for a new practical AI tip every week.') +
      '<br>' + (ar ? 'أدوات مجانية جديدة: ' : 'New free tools: ') +
      '<a class="ahl-follow__new" href="' + (ar ? '/ar/prompt-grader' : '/prompt-grader') + '">' + (ar ? 'قيّم طلبك' : 'Prompt Grader') + '</a> · ' +
      '<a class="ahl-follow__new" href="' + (ar ? '/ar/ai-tool-quiz' : '/ai-tool-quiz') + '">' + (ar ? 'أي أداة تناسبني؟' : 'Which AI tool should I use?') + '</a>' +
      '</p><div class="ahl-follow__list"></div></div>';
    root.parentNode.insertBefore(sec, root.nextSibling);
    window.AHL_renderSocials(sec.querySelector('.ahl-follow__list'));
  }

  if (!document.body.hasAttribute('data-no-follow-strip')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addStrip);
    else addStrip();
  }

  // Homepage "free tools" band, placed before the featured lessons. Styled by ahl-theme.css.
  function addToolsBand() {
    var featured = document.getElementById('lessons');
    if (!featured || !document.querySelector('.hero--stage') || document.querySelector('.ahl-tools')) return;
    var ar = document.documentElement.lang === 'ar', p = ar ? '/ar' : '';
    var items = ar ? [
      ['قيّم طلبك', 'الصق طلبًا واحصل على درجة من 100 ونسخة محسّنة.', p + '/prompt-grader', 'جرّبها'],
      ['أي أداة تناسبني؟', 'ستة أسئلة سريعة، وأداة واحدة مناسبة لعملك.', p + '/ai-tool-quiz', 'ابدأ الاختبار'],
      ['كم يوفّر لك من الوقت؟', 'اختر مهامك واحصل على تقدير واقعي بالساعات.', p + '/time-saved', 'احسب وقتك'],
      ['مكتبة الطلبات', '30 طلبًا جاهزًا لأعمال المالية والمكتب.', '/prompt-library.html?lang=ar', 'تصفّح']
    ] : [
      ['Prompt Grader', 'Paste a prompt, get a score out of 100 and an upgraded version.', '/prompt-grader', 'Grade a prompt'],
      ['Which AI tool should I use?', 'Six quick questions, one tool that fits your work.', '/ai-tool-quiz', 'Take the quiz'],
      ['How much time could AI save you?', 'Pick your tasks and get a realistic estimate in hours.', '/time-saved', 'Work it out'],
      ['Prompt Library', '30 ready prompts for finance and office work.', '/prompt-library.html', 'Browse prompts']
    ];
    var sec = document.createElement('section');
    sec.className = 'ahl-tools';
    sec.setAttribute('aria-labelledby', 'ahl-tools-title');
    sec.innerHTML = '<div class="ahl-tools__in"><div><h2 id="ahl-tools-title" class="h2">' +
      (ar ? 'جرّبها على عملك' : 'Try it on your own work') + '</h2><p>' +
      (ar ? 'أدوات مجانية تعمل داخل متصفحك. لا تسجيل، ولا يغادر نصك جهازك.' : 'Free tools that run in your browser. No sign-up, and your text never leaves your device.') +
      '</p></div><ul class="ahl-tools__list" role="list">' + items.map(function (i) {
        return '<li><a href="' + i[2] + '"><span class="ahl-tools__name">' + i[0] + '</span><span class="ahl-tools__what">' + i[1] +
          '</span><span class="ahl-tools__go">' + i[3] + '</span></a></li>';
      }).join('') + '</ul></div>';
    featured.parentNode.insertBefore(sec, featured);
  }

  // Under the six Start Here steps: progress toward the certificate.
  var CERT_SLUGS = ['prompt-patterns', 'set-up-chatgpt-for-work', 'claude-projects', 'summarize-documents-and-meetings', 'first-ai-automation'];
  function addCertLine() {
    var path = document.querySelector('#start .path');
    if (!path || document.querySelector('.ahl-cert')) return;
    var done = [], cert = {};
    try { done = JSON.parse(localStorage.getItem('ahl:done') || '[]'); cert = JSON.parse(localStorage.getItem('ahl:cert') || '{}'); } catch (e) {}
    var n = CERT_SLUGS.filter(function (s) { return done.indexOf(s) > -1; }).length + (cert.step1 ? 1 : 0);
    var ar = document.documentElement.lang === 'ar';
    var msg = n >= 6 ? (ar ? 'أنجزت الخطوات الست. شهادتك جاهزة.' : 'All six steps done. Your certificate is ready.')
      : (ar ? 'أكمل الخطوات الست واحصل على شهادة مجانية تضيفها إلى LinkedIn.' : 'Finish all six steps for a free certificate you can add to LinkedIn.');
    var p = document.createElement('p');
    p.className = 'ahl-cert';
    p.innerHTML = '<span>' + msg + '</span> <a href="' + (ar ? '/ar/certificate' : '/certificate') + '">' +
      (n >= 6 ? (ar ? 'احصل على شهادتك' : 'Get your certificate') : (ar ? 'تابع تقدّمك' : 'See your progress')) + '</a>';
    path.parentNode.insertBefore(p, path.nextSibling);
  }

  // The homepage sections are hydrated lazily, a while after the page loads. Adding a node inside <main>
  // before that makes React reject the server HTML and re-render everything. So wait until React has
  // attached to the featured section (its DOM node gets a __reactFiber key), then insert.
  function hydrated(el) {
    for (var k in el) if (k.indexOf('__reactFiber') === 0) return true;
    return false;
  }
  function whenHydrated() {
    if (!document.querySelector('.hero--stage')) return;
    var tries = 0;
    (function poll() {
      var f = document.getElementById('lessons');
      if (f && hydrated(f)) {
        addToolsBand();
        addCertLine();
        // If React ever re-renders <main>, put the band back.
        new MutationObserver(function () { if (!document.querySelector('.ahl-tools')) addToolsBand(); })
          .observe(document.getElementById('main'), { childList: true });
      } else if (++tries < 100) setTimeout(poll, 200);
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', whenHydrated);
  else whenHydrated();
})();
