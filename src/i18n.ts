// All interface text, in English and Arabic. Lesson text lives in src/content/lessons.
export type Lang = 'en' | 'ar';
export const SITE = 'https://ahmed-ai-lessons-website.vercel.app';

/** The same page in the other language: "/lessons/x/" <-> "/ar/lessons/x/". */
export function otherPath(path: string, lang: Lang): string {
  if (lang === 'en') return path === '/' ? '/ar/' : '/ar' + path;
  const p = path.replace(/^\/ar/, '');
  return p === '' ? '/' : p;
}
export const pre = (lang: Lang) => (lang === 'ar' ? '/ar' : '');

export function formatDate(iso: string, lang: Lang) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export const TRACKS = {
  'ai-for-work': { en: 'AI for work', ar: 'الذكاء الاصطناعي في العمل', href: '/lessons/' },
  finance: { en: 'Finance & CMA', ar: 'المالية وCMA', href: '/finance/' },
  'microsoft-365': { en: 'Microsoft 365', ar: 'Microsoft 365', href: '/microsoft-365/' },
} as const;

// The six Start Here steps. Step 1 is the prompt builder on the homepage; the rest are lessons.
export const START = [
  { slug: '', en: ['Understand AI', 'What AI is good at, and the 4-part prompt.'], ar: ['افهم الذكاء الاصطناعي', 'ما الذي يجيده، والطلب ذو الأجزاء الأربعة.'] },
  { slug: 'prompt-patterns', en: ['Learn prompting', 'Five patterns that improve almost any prompt.'], ar: ['تعلّم كتابة الطلبات', 'خمسة أنماط تحسّن أي طلب تقريبًا.'] },
  { slug: 'set-up-chatgpt-for-work', en: ['Master ChatGPT', 'Custom instructions, Projects and memory, set up for work.'], ar: ['أتقن ChatGPT', 'التعليمات المخصصة والمشاريع والذاكرة، مُعدّة للعمل.'] },
  { slug: 'claude-projects', en: ['Explore Claude', 'Projects that know your files and how you work.'], ar: ['اكتشف Claude', 'مشاريع تعرف ملفاتك وطريقة عملك.'] },
  { slug: 'summarize-documents-and-meetings', en: ['Build AI workflows', 'Long documents and meetings into summaries you can act on.'], ar: ['ابنِ سير عمل', 'حوّل المستندات الطويلة والاجتماعات إلى ملخصات تعمل بها.'] },
  { slug: 'first-ai-automation', en: ['Automate your work', 'Your first no-code automation, with a human check.'], ar: ['أتمت عملك', 'أول أتمتة دون برمجة، مع مراجعة بشرية.'] },
];

export const FREE_TOOLS = [
  { href: '/prompt-of-the-day', ar: '/ar/prompt-of-the-day', en: ['Prompt of the day', 'A new copy-paste prompt for work, every day.'], arT: ['طلب اليوم', 'طلب جديد جاهز للنسخ كل يوم.'] },
  { href: '/prompt-grader', ar: '/ar/prompt-grader', en: ['Prompt Grader', 'Paste a prompt, get a score out of 100 and a better version.'], arT: ['قيّم طلبك', 'الصق طلبًا واحصل على درجة من 100 ونسخة أفضل.'] },
  { href: '/ai-tool-quiz', ar: '/ar/ai-tool-quiz', en: ['Which AI tool should I use?', 'Six quick questions, one tool that fits your work.'], arT: ['أي أداة تناسبني؟', 'ستة أسئلة سريعة، وأداة واحدة مناسبة لعملك.'] },
  { href: '/time-saved', ar: '/ar/time-saved', en: ['How much time could AI save you?', 'Pick your tasks and get a realistic estimate in hours.'], arT: ['كم يوفّر لك من الوقت؟', 'اختر مهامك واحصل على تقدير واقعي بالساعات.'] },
  { href: '/prompt-library', ar: '/ar/prompt-library', en: ['Prompt Library', '30 ready prompts for finance and office work.'], arT: ['مكتبة الطلبات', '30 طلبًا جاهزًا لأعمال المالية والمكتب.'] },
];

export const SOCIALS = [
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/aboelshash/' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/ahmed-hussien-elsayed-3a3050135/' },
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/ahmed.hussien.94402' },
  { id: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/966507384045' },
];

const en = {
  dir: 'ltr', name: 'Ahmed Hussein', brandTag: 'AI Lessons', siteName: 'Ahmed Hussein · AI Lessons',
  skip: 'Skip to content', menu: 'Menu', close: 'Close', mainNav: 'Main', langSwitch: 'العربية', langSwitchLabel: 'Read this page in Arabic',
  themeLight: 'Switch to light mode', themeDark: 'Switch to dark mode',
  nav: [['Lessons', '/lessons/'], ['Start here', '/#start'], ['Finance & CMA', '/finance/'], ['Microsoft 365', '/microsoft-365/'], ['Tools', '/tools/'], ['Glossary', '/glossary/']],
  weekly: 'Weekly lesson',
  home: {
    title: 'Ahmed Hussein · AI lessons in plain words',
    description: 'Practical AI lessons in plain English and Arabic from an accountant in Riyadh: better prompts, ChatGPT, Claude, Excel and Microsoft 365, and habits you can use the same day.',
    kicker: 'From an accountant in Riyadh',
    h1: 'AI is bright. These lessons turn it into light you can work in.',
    lead: 'A mashrabiya turns harsh sun into soft, patterned light you can live with. These short lessons do the same for AI: clear steps you can use the same day, in English and Arabic.',
    cta1: 'Build a prompt', cta2: 'Start here',
    stats: ['19 lessons', '22-term glossary', 'English & العربية', 'Free'],
    times: ['Dawn', 'Noon', 'Dusk'], timesLabel: 'Light in the room',
    scene: 'A carved wooden lattice window. Sunlight passes through it and throws a star pattern across the floor.',
    bH: 'Build a prompt. Let the light in.',
    bP: 'Every strong prompt has four parts. Fill them in and watch the room above fill with light. Pick an example or write your own, then copy it into ChatGPT, Claude or Copilot.',
    labels: ['Role · who should the AI be?', 'Task · what exactly do you want?', 'Context · what can\'t it guess?', 'Format · length, shape, tone'],
    parts: ['role', 'task', 'context', 'format'],
    yours: 'Your prompt', copy: 'Copy prompt', seeLight: 'See the light', copied: 'Copied. Paste it into your AI tool.', selected: 'Selected. Press Ctrl+C or Cmd+C to copy.', empty: 'Fill in a part to start.',
    lightOf: 'of the light gets through', hintMiss: 'Add a {p} to let more light in.', hintFull: 'All four parts are in. The room is full of light.',
    stepDone: 'Step 1 of Start Here is done.',
    tabs: ['Email', 'Spreadsheet', 'Month-end'], examplesLabel: 'Examples',
    ex: [
      ['You\'re my office assistant.', 'Write a short email to my team saying Thursday\'s meeting moves to 2 pm.', 'There are 6 of us and some work remotely.', 'Keep it under 80 words and end with a question.'],
      ['You\'re an Excel expert who explains simply.', 'Give me one formula that flags duplicate invoice numbers in column B.', 'The sheet has 4,000 rows, Excel 365, headers in row 1.', 'Show the formula first, then two lines on how it works.'],
      ['You\'re a finance manager at a small company.', 'List accruals I might be missing before I close the month.', 'Usual costs: rent, electricity, cleaning, consultants, staff bonus, software. Made-up example.', 'A table with the expense, why it may need an accrual, and the document to check.'],
    ],
    startH: 'New to AI? Six arches, one path.', startP: 'Walk through them in order. Each one is a short lesson, and your progress is saved on this device.',
    progress: '{n} of 6 steps done.', next: 'Next: {t}', certLine: 'Finish all six for a free certificate you can add to LinkedIn.', certGo: 'See your progress', certReady: 'All six steps done. Your certificate is ready.', certGet: 'Get your certificate',
    tracksH: 'Three courtyards, 19 lessons', tracksP: 'Every lesson is free, under ten minutes, and ends with a prompt you can copy.',
    trackText: { 'ai-for-work': 'Prompts, ChatGPT, Claude, safe use and automation, from the very first step.', finance: 'Month-end close, variance notes and CMA study, with AI as your helper.', 'microsoft-365': 'Excel, Power BI, Word, Outlook and Teams, with Copilot tips.' },
    open: 'Open',
    latestH: 'Start with what you\'ll use this week', latestP: 'Short, practical lessons with prompts you can copy.', allLessons: 'See all lessons',
    toolsH: 'Try it on your own work', toolsP: 'Free tools that run in your browser. No sign-up, and your text never leaves your device.',
    aboutH: 'Hi, I\'m Ahmed.', about: ['I\'m an accountant based in Riyadh, with more than nine years in finance. I use Claude and ChatGPT for real work: reports, reconciliations, emails and study.', 'Most people don\'t need more AI news. They need clear steps. So that\'s what this site is: short lessons in plain English and Arabic that you can use the same day.'],
    aboutNote: 'Independent site. Not affiliated with OpenAI or Anthropic.', photo: 'Ahmed Hussein smiling, wearing glasses, a white shirt and a dark blazer',
  },
  news: { h: 'One useful AI lesson a week.', p: 'A short email with one idea, one prompt to copy, and one thing to try. No spam, no hype.', label: 'Email address', join: 'Join the list', hint: 'Free. Unsubscribe any time with one click.', bad: 'Enter an email address like name@company.com.', hLesson: 'Get the next lesson by email' },
  lesson: { home: 'Home', all: 'All lessons', n: 'Lesson {n}', level: 'Level', read: '{n} min read', updated: 'Updated', toc: 'On this page', done: 'Mark this lesson as done', isDone: 'Lesson done', shareH: 'Share this lesson', shareP: 'Found it useful? Send it to a colleague.', copyLink: 'Copy link', linkCopied: 'Link copied', prev: 'Previous lesson', next: 'Next lesson', copy: 'Copy', copiedBtn: 'Copied', copiedSr: 'Copied to clipboard' },
  list: { title: 'All lessons', lede: 'Short, practical lessons you can use the same day. New to AI? Start with the prompt builder on the homepage.', all: 'All', count: '{n} lessons', doneN: 'You\'ve finished {n} of 19.', ring: 'Your progress', ringOf: 'of 19 done', filter: 'Filter by topic', builder: 'Lesson 0: the 4-part prompt', builderP: 'The one habit that makes every answer better. Interactive, on the homepage.' },
  tools: { search: 'Search tools', placeholder: 'Try "meetings", "images" or "Excel"', all: 'All', count: '{n} tools', none: 'No tools match. Try a shorter word or pick "All".', best: 'Best for:', visit: 'Visit', newTab: '(opens a new tab)' },
  glossary: { jump: 'Jump to a term' },
  prompts: { fillHint: 'Type in the highlighted parts, then copy. What you type is remembered.', clear: 'Clear', blank: 'Fill in', save: 'Save', saved: 'Saved', saveLabel: 'Save prompt: {l}', savedToast: 'Saved to My prompts.', removedToast: 'Removed from My prompts.', title: 'My prompts', lede: 'Prompts you saved from the lessons, ready to fill in and copy. They are kept in this browser, on this device.', empty: 'Nothing saved yet. Open any lesson and press Save on a prompt you like.', browse: 'Browse lessons', copy: 'Copy', copied: 'Copied', remove: 'Remove', from: 'From', copyAll: 'Copy all', copiedAll: 'All prompts copied.', count: '{n} saved', link: 'My saved prompts', linkN: 'My saved prompts ({n})' },
  terms: { more: 'Open in the glossary', close: 'Close', label: 'Meaning of' },
  tocFab: 'On this page',
  search: { open: 'Search', label: 'Search the site', placeholder: 'Search lessons, AI words and tools', none: 'Nothing found for "{q}". Try a shorter word.', count: '{n} results', suggested: 'Suggestions', keys: '↑ ↓ to move · Enter to open · Esc to close', kinds: { lesson: 'Lesson', section: 'In a lesson', term: 'AI word', tool: 'AI tool', free: 'Free tool', page: 'Page', faq: 'Question' }, sugg: [['Start here', '/#start'], ['All lessons', '/lessons/'], ['Prompt Library', '/prompt-library'], ['AI words', '/glossary/']] },
  resume: { h: 'Continue where you stopped', read: '{p}% read', go: 'Continue', back: 'Jump back to where you stopped ({p}%)', left: 'About {n} min left', end: 'You reached the end' },
  foot: { tag: 'Practical AI lessons in plain words, in English and Arabic.', learn: 'Learn', site: 'Site', follow: 'Follow along for a new practical AI tip every week.', legal: 'Independent site. Not affiliated with any AI company mentioned here. Product names are trademarks of their owners.', top: 'Back to top', links: [['All lessons', '/lessons/'], ['Start here', '/#start'], ['Finance & CMA', '/finance/'], ['Microsoft 365', '/microsoft-365/'], ['Glossary', '/glossary/']], links2: [['AI tools', '/tools/'], ['Prompt Library', '/prompt-library'], ['Prompt Grader', '/prompt-grader'], ['My prompts', '/my-prompts/'], ['About', '/#about'], ['Questions', '/#faq']] },
  notFound: { title: 'Page not found', h: 'This page isn\'t here.', p: 'The link may be old, or the page moved. These will get you back on track:', home: 'Homepage', lessons: 'All lessons' },
};

const ar: typeof en = {
  dir: 'rtl', name: 'أحمد حسين', brandTag: 'دروس الذكاء الاصطناعي', siteName: 'أحمد حسين · دروس الذكاء الاصطناعي',
  skip: 'انتقل إلى المحتوى', menu: 'القائمة', close: 'إغلاق', mainNav: 'الرئيسية', langSwitch: 'English', langSwitchLabel: 'Read this page in English',
  themeLight: 'التبديل إلى الوضع الفاتح', themeDark: 'التبديل إلى الوضع الداكن',
  nav: [['الدروس', '/ar/lessons/'], ['ابدأ هنا', '/ar/#start'], ['المالية وCMA', '/ar/finance/'], ['Microsoft 365', '/ar/microsoft-365/'], ['الأدوات', '/ar/tools/'], ['المسرد', '/ar/glossary/']],
  weekly: 'درس كل أسبوع',
  home: {
    title: 'أحمد حسين · دروس الذكاء الاصطناعي بكلام بسيط',
    description: 'دروس عملية في الذكاء الاصطناعي بالعربية والإنجليزية من محاسب في الرياض: طلبات أفضل وChatGPT وClaude وExcel وMicrosoft 365، وعادات تستخدمها في اليوم نفسه.',
    kicker: 'من محاسب في الرياض',
    h1: 'الذكاء الاصطناعي ساطع. هذه الدروس تجعله ضوءًا تعمل فيه.',
    lead: 'المشربية تحوّل الشمس الحارقة إلى ضوء ناعم منقوش تعيش فيه. وهذه الدروس القصيرة تفعل الشيء نفسه مع الذكاء الاصطناعي: خطوات واضحة تستخدمها في اليوم نفسه، بالعربية والإنجليزية.',
    cta1: 'ابنِ طلبًا', cta2: 'ابدأ هنا',
    stats: ['19 درسًا', 'مسرد من 22 مصطلحًا', 'العربية و English', 'مجاني'],
    times: ['الفجر', 'الظهر', 'المغرب'], timesLabel: 'الضوء في الغرفة',
    scene: 'نافذة خشبية منقوشة يمر ضوء الشمس عبرها فيرسم نجومًا على الأرض.',
    bH: 'ابنِ طلبك، ودع الضوء يدخل.',
    bP: 'الطلب القوي له أربعة أجزاء. املأها وشاهد الغرفة في الأعلى تمتلئ بالضوء. اختر مثالًا أو اكتب طلبك، ثم انسخه إلى ChatGPT أو Claude أو Copilot.',
    labels: ['الدور · من يكون الذكاء الاصطناعي؟', 'المهمة · ماذا تريد بالضبط؟', 'السياق · ما الذي لا يستطيع تخمينه؟', 'الشكل · الطول والهيئة والأسلوب'],
    parts: ['الدور', 'المهمة', 'السياق', 'الشكل'],
    yours: 'طلبك', copy: 'انسخ الطلب', seeLight: 'شاهد الضوء', copied: 'تم النسخ. الصقه في أداة الذكاء الاصطناعي.', selected: 'تم التحديد. اضغط Ctrl+C أو Cmd+C للنسخ.', empty: 'املأ جزءًا لتبدأ.',
    lightOf: 'من الضوء يمر', hintMiss: 'أضف {p} ليدخل ضوء أكثر.', hintFull: 'الأجزاء الأربعة كلها موجودة. الغرفة مليئة بالضوء.',
    stepDone: 'أنجزت الخطوة الأولى من «ابدأ هنا».',
    tabs: ['إيميل', 'جدول بيانات', 'نهاية الشهر'], examplesLabel: 'أمثلة',
    ex: [
      ['أنت مساعدي في المكتب.', 'اكتب إيميلًا قصيرًا لفريقي بأن اجتماع الخميس تأجّل إلى الساعة 2 ظهرًا.', 'نحن 6 أشخاص وبعضنا يعمل عن بُعد.', 'اجعله أقل من 80 كلمة وأنهِه بسؤال.'],
      ['أنت خبير Excel يشرح ببساطة.', 'أعطني معادلة واحدة تكشف أرقام الفواتير المكررة في العمود B.', 'الملف فيه 4,000 صف، وExcel 365، والعناوين في الصف الأول.', 'اكتب المعادلة أولًا، ثم سطرين يشرحان طريقة عملها.'],
      ['أنت مدير مالي في شركة صغيرة.', 'اذكر المستحقات التي قد أكون نسيتها قبل إقفال الشهر.', 'المصاريف المعتادة: الإيجار والكهرباء والنظافة والاستشارات ومكافأة الموظفين والاشتراكات. مثال مختلَق.', 'جدول فيه المصروف، ولماذا قد يحتاج إلى استحقاق، والمستند الذي أراجعه.'],
    ],
    startH: 'جديد على الذكاء الاصطناعي؟ ست أقواس، طريق واحد.', startP: 'امشِ فيها بالترتيب. كل قوس درس قصير، ويُحفظ تقدّمك على هذا الجهاز.',
    progress: 'أنجزت {n} من 6 خطوات.', next: 'التالي: {t}', certLine: 'أكمل الخطوات الست واحصل على شهادة مجانية تضيفها إلى LinkedIn.', certGo: 'تابع تقدّمك', certReady: 'أنجزت الخطوات الست. شهادتك جاهزة.', certGet: 'احصل على شهادتك',
    tracksH: 'ثلاثة أفنية، 19 درسًا', tracksP: 'كل الدروس مجانية، أقل من عشر دقائق، وتنتهي بطلب جاهز للنسخ.',
    trackText: { 'ai-for-work': 'الطلبات وChatGPT وClaude والاستخدام الآمن والأتمتة، من أول خطوة.', finance: 'إقفال الشهر وشرح الفروقات والتحضير لاختبار CMA، والذكاء الاصطناعي يساعدك.', 'microsoft-365': 'Excel وPower BI وWord وOutlook وTeams، مع نصائح Copilot.' },
    open: 'افتح',
    latestH: 'ابدأ بما ستستخدمه هذا الأسبوع', latestP: 'دروس قصيرة وعملية فيها طلبات جاهزة للنسخ.', allLessons: 'كل الدروس',
    toolsH: 'جرّبها على عملك', toolsP: 'أدوات مجانية تعمل داخل متصفحك. لا تسجيل، ولا يغادر نصك جهازك.',
    aboutH: 'أهلًا، أنا أحمد.', about: ['محاسب مقيم في الرياض، ولديّ أكثر من تسع سنوات من الخبرة في المالية. أستخدم Claude وChatGPT في عمل حقيقي: التقارير والتسويات والإيميلات والدراسة.', 'معظم الناس لا يحتاجون المزيد من أخبار الذكاء الاصطناعي، بل يحتاجون خطوات واضحة. وهذا هو هدف الموقع: دروس قصيرة بالعربية والإنجليزية تستطيع تطبيقها في نفس اليوم.'],
    aboutNote: 'موقع مستقل غير تابع لـ OpenAI أو Anthropic.', photo: 'أحمد حسين مبتسمًا، يرتدي نظارة وقميصًا أبيض وسترة داكنة',
  },
  news: { h: 'درس مفيد واحد كل أسبوع.', p: 'رسالة قصيرة فيها فكرة واحدة، وطلب جاهز للنسخ، وشيء واحد تجرّبه. بدون إزعاج وبدون مبالغة.', label: 'البريد الإلكتروني', join: 'اشترك', hint: 'مجاني. يمكنك إلغاء الاشتراك في أي وقت بضغطة واحدة.', bad: 'اكتب بريدًا إلكترونيًا مثل name@company.com.', hLesson: 'احصل على الدرس القادم بالإيميل' },
  lesson: { home: 'الرئيسية', all: 'كل الدروس', n: 'الدرس {n}', level: 'المستوى', read: 'قراءة في {n} دقائق', updated: 'آخر تحديث', toc: 'في هذه الصفحة', done: 'علّم هذا الدرس كمكتمل', isDone: 'أنهيت الدرس', shareH: 'شارك هذا الدرس', shareP: 'وجدته مفيدًا؟ أرسله لزميل.', copyLink: 'انسخ الرابط', linkCopied: 'تم نسخ الرابط', prev: 'الدرس السابق', next: 'الدرس التالي', copy: 'انسخ', copiedBtn: 'تم النسخ', copiedSr: 'تم النسخ' },
  list: { title: 'كل الدروس', lede: 'دروس قصيرة وعملية تستخدمها في اليوم نفسه. جديد على الذكاء الاصطناعي؟ ابدأ بمنشئ الطلبات في الصفحة الرئيسية.', all: 'الكل', count: '{n} درسًا', doneN: 'أنهيت {n} من 19.', ring: 'تقدّمك', ringOf: 'من 19 مكتمل', filter: 'صنّف حسب الموضوع', builder: 'الدرس 0: الطلب ذو الأجزاء الأربعة', builderP: 'العادة الواحدة التي تحسّن كل إجابة. تفاعلي، في الصفحة الرئيسية.' },
  tools: { search: 'ابحث في الأدوات', placeholder: 'جرّب «اجتماعات» أو «صور» أو «Excel»', all: 'الكل', count: '{n} أداة', none: 'لا توجد أدوات مطابقة. جرّب كلمة أقصر أو اختر «الكل».', best: 'الأفضل لـ:', visit: 'زيارة', newTab: '(يفتح في نافذة جديدة)' },
  glossary: { jump: 'انتقل إلى مصطلح' },
  prompts: { fillHint: 'اكتب في الأجزاء المظلّلة ثم انسخ. ما تكتبه يُحفظ لك.', clear: 'امسح', blank: 'املأ', save: 'احفظ', saved: 'محفوظ', saveLabel: 'احفظ الطلب: {l}', savedToast: 'حُفظ في «طلباتي».', removedToast: 'أُزيل من «طلباتي».', title: 'طلباتي', lede: 'الطلبات التي حفظتها من الدروس، جاهزة للتعبئة والنسخ. تُحفظ في هذا المتصفح على هذا الجهاز.', empty: 'لم تحفظ شيئًا بعد. افتح أي درس واضغط «احفظ» على طلب يعجبك.', browse: 'تصفّح الدروس', copy: 'انسخ', copied: 'تم النسخ', remove: 'احذف', from: 'من', copyAll: 'انسخ الكل', copiedAll: 'تم نسخ كل الطلبات.', count: '{n} محفوظ', link: 'طلباتي المحفوظة', linkN: 'طلباتي المحفوظة ({n})' },
  terms: { more: 'افتح في المسرد', close: 'إغلاق', label: 'معنى' },
  tocFab: 'في هذه الصفحة',
  search: { open: 'بحث', label: 'ابحث في الموقع', placeholder: 'ابحث في الدروس والمصطلحات والأدوات', none: 'لا نتائج لـ «{q}». جرّب كلمة أقصر.', count: '{n} نتيجة', suggested: 'اقتراحات', keys: '↑ ↓ للتنقل · Enter للفتح · Esc للإغلاق', kinds: { lesson: 'درس', section: 'داخل درس', term: 'مصطلح', tool: 'أداة ذكاء اصطناعي', free: 'أداة مجانية', page: 'صفحة', faq: 'سؤال' }, sugg: [['ابدأ هنا', '/ar/#start'], ['كل الدروس', '/ar/lessons/'], ['مكتبة الطلبات', '/ar/prompt-library'], ['المسرد', '/ar/glossary/']] },
  resume: { h: 'تابع من حيث توقفت', read: 'قرأت {p}%', go: 'تابع', back: 'ارجع إلى حيث توقفت ({p}%)', left: 'باقي نحو {n} دقائق', end: 'وصلت إلى النهاية' },
  foot: { tag: 'دروس عملية في الذكاء الاصطناعي بكلام بسيط، بالعربية والإنجليزية.', learn: 'تعلّم', site: 'الموقع', follow: 'تابعني لنصيحة عملية جديدة في الذكاء الاصطناعي كل أسبوع.', legal: 'موقع مستقل غير تابع لأي شركة ذكاء اصطناعي مذكورة فيه. أسماء المنتجات علامات تجارية لأصحابها.', top: 'العودة إلى الأعلى', links: [['كل الدروس', '/ar/lessons/'], ['ابدأ هنا', '/ar/#start'], ['المالية وCMA', '/ar/finance/'], ['Microsoft 365', '/ar/microsoft-365/'], ['المسرد', '/ar/glossary/']], links2: [['أدوات الذكاء الاصطناعي', '/ar/tools/'], ['مكتبة الطلبات', '/ar/prompt-library'], ['قيّم طلبك', '/ar/prompt-grader'], ['طلباتي', '/ar/my-prompts/'], ['عنّي', '/ar/#about'], ['أسئلة شائعة', '/ar/#faq']] },
  notFound: { title: 'الصفحة غير موجودة', h: 'هذه الصفحة غير موجودة.', p: 'ربما الرابط قديم أو نُقلت الصفحة. هذه الروابط تعيدك إلى الطريق:', home: 'الصفحة الرئيسية', lessons: 'كل الدروس' },
};

export const T = { en, ar };
export const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
