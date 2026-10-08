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
  'ai-for-work': { en: 'AI for work', ar: 'الذكاء الاصطناعي في الشغل', href: '/lessons/' },
  finance: { en: 'Finance & CMA', ar: 'المالية وCMA', href: '/finance/' },
  'microsoft-365': { en: 'Microsoft 365', ar: 'Microsoft 365', href: '/microsoft-365/' },
} as const;

// The six Start Here steps. Step 1 is the prompt builder on the homepage; the rest are lessons.
export const START = [
  { slug: '', en: ['Understand AI', 'What AI is good at, and the 4-part prompt.'], ar: ['افهم الذكاء الاصطناعي', 'هو شاطر في إيه، والبرومبت اللي ليه 4 أجزاء.'] },
  { slug: 'prompt-patterns', en: ['Learn prompting', 'Five patterns that improve almost any prompt.'], ar: ['اتعلّم تكتب برومبت', '5 طرق تخلّي أي برومبت أحسن.'] },
  { slug: 'set-up-chatgpt-for-work', en: ['Master ChatGPT', 'Custom instructions, Projects and memory, set up for work.'], ar: ['اتمكّن من ChatGPT', 'التعليمات الخاصة والمشاريع والذاكرة، متظبطين للشغل.'] },
  { slug: 'claude-projects', en: ['Explore Claude', 'Projects that know your files and how you work.'], ar: ['جرّب Claude', 'مشاريع فاكرة ملفاتك وطريقة شغلك.'] },
  { slug: 'summarize-documents-and-meetings', en: ['Build AI workflows', 'Long documents and meetings into summaries you can act on.'], ar: ['اعمل خطوات شغل', 'حوّل الملفات الطويلة والاجتماعات لملخصات تشتغل بيها.'] },
  { slug: 'first-ai-automation', en: ['Automate your work', 'Your first no-code automation, with a human check.'], ar: ['خلّي شغلك يمشي لوحده', 'أول أتمتة من غير برمجة، وإنت بتراجع.'] },
];

export const FREE_TOOLS = [
  { href: '/prompt-of-the-day', ar: '/ar/prompt-of-the-day', en: ['Prompt of the day', 'A new copy-paste prompt for work, every day.'], arT: ['برومبت النهارده', 'برومبت جديد جاهز تنسخه كل يوم.'] },
  { href: '/prompt-grader', ar: '/ar/prompt-grader', en: ['Prompt Grader', 'Paste a prompt, get a score out of 100 and a better version.'], arT: ['قيّم البرومبت بتاعك', 'حط البرومبت وخد درجة من 100 ونسخة أحسن.'] },
  { href: '/ai-tool-quiz', ar: '/ar/ai-tool-quiz', en: ['Which AI tool should I use?', 'Six quick questions, one tool that fits your work.'], arT: ['أنهي أداة تنفعني؟', '6 أسئلة سريعة، وأداة واحدة تناسب شغلك.'] },
  { href: '/time-saved', ar: '/ar/time-saved', en: ['How much time could AI save you?', 'Pick your tasks and get a realistic estimate in hours.'], arT: ['هيوفّرلك قد إيه من وقتك؟', 'اختار مهامك وخد تقدير واقعي بالساعات.'] },
  { href: '/prompt-library', ar: '/ar/prompt-library', en: ['Prompt Library', '30 ready prompts for finance and office work.'], arT: ['مكتبة البرومبتات', '30 برومبت جاهز لشغل المالية والمكتب.'] },
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
  weekly: 'Subscribe',
  home: {
    title: 'Ahmed Hussein · AI lessons in plain words',
    description: 'Practical AI lessons in plain English and Arabic from an accountant in Riyadh: better prompts, ChatGPT, Claude, Excel and Microsoft 365, and habits you can use the same day.',
    kicker: 'From an accountant in Riyadh',
    h1: 'AI, softened into light you can work in.',
    lead: 'Like a mashrabiya softening the sun, these lessons turn AI into clear, same-day steps in English and Arabic.',
    cta1: 'Build a prompt', cta2: 'Start here',
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
    latestH: 'Start with what you\'ll use this week', latestP: 'Short, practical lessons with prompts you can copy.', allLessons: 'All lessons',
    stats: [['lessons', 'short lessons, each under ten minutes'], [2, 'languages: English and Arabic'], [30, 'prompts ready to copy'], [0, 'sign-ups needed']], statsLabel: 'The site in numbers',
    facts: [['9+', 'years in finance'], ['Riyadh', 'where I work'], ['EN · ع', 'every lesson in both']], toolPrev: { today: 'Today', perMonth: 'hours a month', score: 'Score' },
    toolsH: 'Try it on your own work', toolsP: 'Free tools that run in your browser. No sign-up, and your text never leaves your device.',
    aboutH: 'Hi, I\'m Ahmed.', about: ['I\'m an accountant based in Riyadh, with more than nine years in finance. I use Claude and ChatGPT for real work: reports, reconciliations, emails and study.', 'Most people don\'t need more AI news. They need clear steps. So that\'s what this site is: short lessons in plain English and Arabic that you can use the same day.'],
    aboutNote: 'Independent site. Not affiliated with OpenAI or Anthropic.', photo: 'Ahmed Hussein smiling, wearing glasses, a white shirt and a dark blazer',
  },
  news: { h: 'One useful AI lesson a week.', p: 'A short email with one idea, one prompt to copy, and one thing to try. No spam, no hype.', label: 'Email address', join: 'Subscribe', hint: 'Free. Unsubscribe any time with one click.', bad: 'Enter an email address like name@company.com.', hLesson: 'Get the next lesson by email' },
  lesson: { home: 'Home', all: 'All lessons', n: 'Lesson {n}', level: 'Level', read: '{n} min read', updated: 'Updated', toc: 'On this page', done: 'Mark this lesson as done', isDone: 'Lesson done', shareH: 'Share this lesson', shareP: 'Found it useful? Send it to a colleague.', copyLink: 'Copy link', linkCopied: 'Link copied', prev: 'Previous lesson', next: 'Next lesson', related: 'Keep reading', textSize: 'Text size', sizes: ['Smaller text', 'Normal text', 'Larger text'], copy: 'Copy', copiedBtn: 'Copied', copiedSr: 'Copied to clipboard' },
  list: { title: 'All lessons', lede: 'Short, practical lessons you can use the same day. New to AI? Start with the prompt builder on the homepage.', all: 'All', count: '{n} lessons', doneN: 'You\'ve finished {n} of 19.', ring: 'Your progress', ringOf: 'of 19 done', filter: 'Filter by topic', builder: 'Lesson 0: the 4-part prompt', builderP: 'The one habit that makes every answer better. Interactive, on the homepage.' },
  tools: { search: 'Search tools', placeholder: 'Try "meetings", "images" or "Excel"', all: 'All', count: '{n} tools', none: 'No tools match. Try a shorter word or pick "All".', best: 'Best for:', visit: 'Visit', newTab: '(opens a new tab)' },
  glossary: { jump: 'Jump to a term' },
  prompts: { fillHint: 'Type in the highlighted parts, then copy. What you type is remembered.', clear: 'Clear', blank: 'Fill in', save: 'Save', saved: 'Saved', saveLabel: 'Save prompt: {l}', savedToast: 'Saved to My prompts.', removedToast: 'Removed from My prompts.', title: 'My prompts', lede: 'Prompts you saved from the lessons, ready to fill in and copy. They are kept in this browser, on this device.', empty: 'Nothing saved yet. Open any lesson and press Save on a prompt you like.', copy: 'Copy', copied: 'Copied', remove: 'Remove', from: 'From', copyAll: 'Copy all', copiedAll: 'All prompts copied.', count: '{n} saved', link: 'My saved prompts', linkN: 'My saved prompts ({n})', download: 'Download all prompts', downloadNote: 'A text file with every prompt in this lesson, filled in with what you typed.' },
  terms: { more: 'Open in the glossary', close: 'Close', label: 'Meaning of' },
  tocFab: 'On this page',
  search: { open: 'Search', label: 'Search the site', placeholder: 'Search lessons, AI words and tools', none: 'Nothing found for "{q}". Try a shorter word.', count: '{n} results', suggested: 'Suggestions', keys: '↑ ↓ to move · Enter to open · Esc to close', kinds: { lesson: 'Lesson', section: 'In a lesson', term: 'AI word', tool: 'AI tool', free: 'Free tool', page: 'Page', faq: 'Question' }, sugg: [['Start here', '/#start'], ['All lessons', '/lessons/'], ['Prompt Library', '/prompt-library'], ['AI words', '/glossary/']] },
  ai: { tryIn: 'Try it in', openIn: 'Open in {a} (new tab)', explain: 'Explain', explainIn: 'Explain this in {a}', copySel: 'Copy', copiedSel: 'Copied', explainPrompt: 'Explain this in simple words, for someone new to the topic at work. Then give one short example.\n\nFrom the lesson "{t}":\n"{s}"', bar: 'Ask AI about the selected text' },
  listen: { btn: 'Listen', btnLabel: 'Listen to this lesson', pause: 'Pause', play: 'Play', back: 'Back one part', fwd: 'Skip one part', speed: 'Reading speed: {s}', stop: 'Stop listening', player: 'Lesson audio', now: 'Reading part {i} of {n}', note: 'Read by your device voice.' },
  keys: { title: 'Keyboard shortcuts', hint: 'Press ? for keyboard shortcuts', close: 'Close', list: [['/', 'Search'], ['N', 'Next lesson'], ['P', 'Previous lesson'], ['D', 'Mark lesson as done'], ['L', 'Listen to the lesson'], ['T', 'Light or dark theme'], ['?', 'Show this list']] },
  resume: { h: 'Continue where you stopped', read: '{p}% read', go: 'Continue', back: 'Jump back to where you stopped ({p}%)', left: 'About {n} min left', end: 'You reached the end' },
  foot: { tag: 'Practical AI lessons in plain words, in English and Arabic.', learn: 'Learn', site: 'Site', follow: 'Follow along for a new practical AI tip every week.', legal: 'Independent site. Not affiliated with any AI company mentioned here. Product names are trademarks of their owners.', top: 'Back to top', links: [['All lessons', '/lessons/'], ['Start here', '/#start'], ['Finance & CMA', '/finance/'], ['Microsoft 365', '/microsoft-365/'], ['Glossary', '/glossary/']], links2: [['AI tools', '/tools/'], ['Prompt Library', '/prompt-library'], ['Prompt Grader', '/prompt-grader'], ['My prompts', '/my-prompts/'], ['About', '/#about'], ['Questions', '/#faq']] },
  notFound: { title: 'Page not found', h: 'This page isn\'t here.', p: 'The link may be old, or the page moved. These will get you back on track:', home: 'Homepage', lessons: 'All lessons' },
};

const ar: typeof en = {
  dir: 'rtl', name: 'أحمد حسين', brandTag: 'دروس الذكاء الاصطناعي', siteName: 'أحمد حسين · دروس الذكاء الاصطناعي',
  skip: 'روح للمحتوى', menu: 'القايمة', close: 'اقفل', mainNav: 'الرئيسية', langSwitch: 'English', langSwitchLabel: 'Read this page in English',
  themeLight: 'حوّل للوضع الفاتح', themeDark: 'حوّل للوضع الغامق',
  nav: [['الدروس', '/ar/lessons/'], ['ابدأ من هنا', '/ar/#start'], ['المالية وCMA', '/ar/finance/'], ['Microsoft 365', '/ar/microsoft-365/'], ['الأدوات', '/ar/tools/'], ['القاموس', '/ar/glossary/']],
  weekly: 'اشترك',
  home: {
    title: 'أحمد حسين · الذكاء الاصطناعي بكلام بسيط',
    description: 'دروس عملية في الذكاء الاصطناعي بالعربي والإنجليزي من محاسب في الرياض: برومبتات أحسن وChatGPT وClaude وExcel وMicrosoft 365، وحاجات تستخدمها في نفس اليوم.',
    kicker: 'من محاسب في الرياض',
    h1: 'الذكاء الاصطناعي، بنور هادي تعرف تشتغل فيه.',
    lead: 'زي ما المشربية بتهدّي نور الشمس، الدروس دي بتحوّل الذكاء الاصطناعي لخطوات واضحة تطبّقها في نفس اليوم، بالعربي والإنجليزي.',
    cta1: 'اكتب برومبت', cta2: 'ابدأ من هنا',
    times: ['الفجر', 'الضهر', 'المغرب'], timesLabel: 'النور في الأوضة',
    scene: 'شبّاك خشب منقوش، نور الشمس بيعدّي منه ويرسم نجوم على الأرض.',
    bH: 'اكتب البرومبت بتاعك، وخلّي النور يدخل.',
    bP: 'البرومبت القوي ليه 4 أجزاء. املاهم وشوف الأوضة اللي فوق وهي بتنوّر. اختار مثال أو اكتب البرومبت بتاعك، وبعدين انسخه في ChatGPT أو Claude أو Copilot.',
    labels: ['الدور · مين الذكاء الاصطناعي المرة دي؟', 'المهمة · عايز إيه بالظبط؟', 'السياق · إيه اللي مش هيعرف يخمّنه؟', 'الشكل · الطول والشكل والأسلوب'],
    parts: ['الدور', 'المهمة', 'السياق', 'الشكل'],
    yours: 'البرومبت بتاعك', copy: 'انسخ البرومبت', seeLight: 'شوف النور', copied: 'اتنسخ. حطّه في أداة الذكاء الاصطناعي.', selected: 'اتحدد. دوس Ctrl+C أو Cmd+C عشان تنسخ.', empty: 'املا أي جزء عشان تبدأ.',
    lightOf: 'من النور بيعدّي', hintMiss: 'زوّد {p} عشان النور يدخل أكتر.', hintFull: 'الأجزاء الأربعة موجودة. الأوضة كلها نور.',
    stepDone: 'خلّصت أول خطوة في «ابدأ من هنا».',
    tabs: ['إيميل', 'شيت', 'آخر الشهر'], examplesLabel: 'أمثلة',
    ex: [
      ['إنت المساعد بتاعي في المكتب.', 'اكتب إيميل قصير لفريقي إن اجتماع الخميس اتأجل للساعة 2 الضهر.', 'إحنا 6 وفينا ناس بتشتغل من البيت.', 'خليه أقل من 80 كلمة وخلّصه بسؤال.'],
      ['إنت خبير Excel وبتشرح ببساطة.', 'إديني معادلة واحدة تطلّع أرقام الفواتير المتكررة في عمود B.', 'الشيت فيه 4,000 صف، وExcel 365، والعناوين في أول صف.', 'اكتب المعادلة الأول، وبعدها سطرين يشرحوا بتشتغل إزاي.'],
      ['إنت مدير مالي في شركة صغيرة.', 'قولّي على المستحقات اللي ممكن أكون نسيتها قبل ما أقفل الشهر.', 'المصاريف العادية: الإيجار والكهربا والنضافة والاستشارات ومكافأة الموظفين والاشتراكات. ده مثال مش حقيقي.', 'جدول فيه المصروف، وليه ممكن يحتاج استحقاق، والمستند اللي أراجعه.'],
    ],
    startH: 'جديد على الذكاء الاصطناعي؟ 6 أقواس، وطريق واحد.', startP: 'امشي فيهم بالترتيب. كل قوس درس قصير، وتقدّمك بيتحفظ على الجهاز ده.',
    progress: 'خلّصت {n} من 6 خطوات.', next: 'اللي بعده: {t}', certLine: 'خلّص الخطوات الست وخد شهادة مجانية تحطها على LinkedIn.', certGo: 'شوف تقدّمك', certReady: 'خلّصت الخطوات الست. شهادتك جاهزة.', certGet: 'خد شهادتك',
    tracksH: '3 مسارات، و19 درس', tracksP: 'كل الدروس ببلاش، أقل من 10 دقايق، وفي آخر كل درس برومبت جاهز تنسخه.',
    trackText: { 'ai-for-work': 'البرومبتات وChatGPT وClaude والاستخدام الآمن والأتمتة، من أول خطوة.', finance: 'قفل الشهر وشرح الفروقات والمذاكرة لامتحان CMA، والذكاء الاصطناعي بيساعدك.', 'microsoft-365': 'Excel وPower BI وWord وOutlook وTeams، مع نصايح Copilot.' },
    open: 'افتح',
    latestH: 'ابدأ باللي هتستخدمه الأسبوع ده', latestP: 'دروس قصيرة وعملية فيها برومبتات جاهزة تنسخها.', allLessons: 'كل الدروس',
    stats: [['lessons', 'درس قصير، كل درس أقل من 10 دقايق'], [2, 'لغتين: عربي وإنجليزي'], [30, 'برومبت جاهز تنسخه'], [0, 'تسجيل مطلوب']], statsLabel: 'الموقع بالأرقام',
    facts: [['+9', 'سنين في المالية'], ['الرياض', 'مكان شغلي'], ['ع · EN', 'كل درس باللغتين']], toolPrev: { today: 'النهارده', perMonth: 'ساعة في الشهر', score: 'الدرجة' },
    toolsH: 'جرّبها على شغلك', toolsP: 'أدوات مجانية شغالة جوه المتصفح. من غير تسجيل، والكلام اللي بتكتبه مش بيخرج من جهازك.',
    aboutH: 'أهلًا، أنا أحمد.', about: ['محاسب عايش في الرياض، وعندي أكتر من 9 سنين خبرة في المالية. بستخدم Claude وChatGPT في شغل حقيقي: تقارير وتسويات وإيميلات ومذاكرة.', 'أغلب الناس مش محتاجة أخبار أكتر عن الذكاء الاصطناعي، محتاجة خطوات واضحة. وده بالظبط الموقع ده: دروس قصيرة بالعربي والإنجليزي تقدر تطبّقها في نفس اليوم.'],
    aboutNote: 'موقع مستقل، ملوش علاقة بـ OpenAI ولا Anthropic.', photo: 'أحمد حسين بيضحك، لابس نضارة وقميص أبيض وجاكيت غامق',
  },
  news: { h: 'درس واحد مفيد كل أسبوع.', p: 'إيميل قصير فيه فكرة واحدة، وبرومبت جاهز تنسخه، وحاجة واحدة تجرّبها. من غير إزعاج ولا مبالغة.', label: 'الإيميل', join: 'اشترك', hint: 'ببلاش. تقدر تلغي الاشتراك في أي وقت بضغطة واحدة.', bad: 'اكتب إيميل زي name@company.com.', hLesson: 'خد الدرس الجاي على الإيميل' },
  lesson: { home: 'الرئيسية', all: 'كل الدروس', n: 'الدرس {n}', level: 'المستوى', read: 'هتقراه في {n} دقايق', updated: 'آخر تحديث', toc: 'في الصفحة دي', done: 'علّم إنك خلّصت الدرس', isDone: 'خلّصت الدرس', shareH: 'شارك الدرس ده', shareP: 'عجبك؟ ابعته لحد زميلك.', copyLink: 'انسخ اللينك', linkCopied: 'اللينك اتنسخ', prev: 'الدرس اللي قبله', next: 'الدرس اللي بعده', related: 'كمّل قراية', textSize: 'حجم الخط', sizes: ['خط أصغر', 'خط عادي', 'خط أكبر'], copy: 'انسخ', copiedBtn: 'اتنسخ', copiedSr: 'اتنسخ' },
  list: { title: 'كل الدروس', lede: 'دروس قصيرة وعملية تستخدمها في نفس اليوم. جديد على الذكاء الاصطناعي؟ ابدأ بأداة كتابة البرومبت في الصفحة الرئيسية.', all: 'الكل', count: '{n} درس', doneN: 'خلّصت {n} من 19.', ring: 'تقدّمك', ringOf: 'من 19 خلصانين', filter: 'فلتر حسب الموضوع', builder: 'الدرس 0: البرومبت اللي ليه 4 أجزاء', builderP: 'العادة الواحدة اللي بتحسّن أي إجابة. تفاعلي، في الصفحة الرئيسية.' },
  tools: { search: 'دوّر في الأدوات', placeholder: 'جرّب «اجتماعات» أو «صور» أو «Excel»', all: 'الكل', count: '{n} أداة', none: 'مفيش أدوات بالكلمة دي. جرّب كلمة أقصر أو اختار «الكل».', best: 'أحسن حاجة لـ:', visit: 'افتح', newTab: '(بيفتح في تاب جديدة)' },
  glossary: { jump: 'روح لكلمة' },
  prompts: { fillHint: 'اكتب في الأجزاء المتلوّنة وبعدين انسخ. اللي بتكتبه بيتحفظ.', clear: 'امسح', blank: 'اكتب هنا', save: 'احفظ', saved: 'محفوظ', saveLabel: 'احفظ البرومبت: {l}', savedToast: 'اتحفظ في «البرومبتات المحفوظة».', removedToast: 'اتشال من «البرومبتات المحفوظة».', title: 'البرومبتات المحفوظة', lede: 'البرومبتات اللي حفظتها من الدروس، جاهزة تملاها وتنسخها. محفوظة في المتصفح ده على الجهاز ده.', empty: 'لسه محفظتش حاجة. افتح أي درس ودوس «احفظ» على برومبت عاجبك.', copy: 'انسخ', copied: 'اتنسخ', remove: 'امسح', from: 'من', copyAll: 'انسخ الكل', copiedAll: 'كل البرومبتات اتنسخت.', count: '{n} محفوظ', link: 'البرومبتات اللي حفظتها', linkN: 'البرومبتات اللي حفظتها ({n})', download: 'نزّل كل البرومبتات', downloadNote: 'ملف نص فيه كل برومبتات الدرس ده، باللي كتبته في الفراغات.' },
  terms: { more: 'افتح في القاموس', close: 'اقفل', label: 'معنى' },
  tocFab: 'في الصفحة دي',
  search: { open: 'دوّر', label: 'دوّر في الموقع', placeholder: 'دوّر في الدروس والكلمات والأدوات', none: 'مفيش نتايج لـ «{q}». جرّب كلمة أقصر.', count: '{n} نتيجة', suggested: 'اقتراحات', keys: '↑ ↓ عشان تتنقل · Enter عشان تفتح · Esc عشان تقفل', kinds: { lesson: 'درس', section: 'جوه درس', term: 'كلمة', tool: 'أداة ذكاء اصطناعي', free: 'أداة مجانية', page: 'صفحة', faq: 'سؤال' }, sugg: [['ابدأ من هنا', '/ar/#start'], ['كل الدروس', '/ar/lessons/'], ['مكتبة البرومبتات', '/ar/prompt-library'], ['القاموس', '/ar/glossary/']] },
  ai: { tryIn: 'جرّبه في', openIn: 'افتحه في {a} (تاب جديدة)', explain: 'اشرحلي', explainIn: 'اشرح الجزء ده في {a}', copySel: 'انسخ', copiedSel: 'اتنسخ', explainPrompt: 'اشرحلي الكلام ده ببساطة، كأني لسه جديد في الموضوع ده في الشغل. وبعدين اديني مثال واحد قصير.\n\nمن درس «{t}»:\n«{s}»', bar: 'اسأل الذكاء الاصطناعي عن الكلام اللي علّمت عليه' },
  listen: { btn: 'اسمع', btnLabel: 'اسمع الدرس ده', pause: 'وقّف', play: 'شغّل', back: 'ارجع جزء', fwd: 'عدّي جزء', speed: 'سرعة القراية: {s}', stop: 'اقفل الصوت', player: 'صوت الدرس', now: 'بيقرا الجزء {i} من {n}', note: 'بيقراه صوت جهازك.' },
  keys: { title: 'اختصارات الكيبورد', hint: 'دوس ? عشان تشوف اختصارات الكيبورد', close: 'اقفل', list: [['/', 'دوّر'], ['N', 'الدرس اللي بعده'], ['P', 'الدرس اللي قبله'], ['D', 'علّم إنك خلّصت الدرس'], ['L', 'اسمع الدرس'], ['T', 'الوضع الفاتح أو الغامق'], ['?', 'اعرض القايمة دي']] },
  resume: { h: 'كمّل من مكان ما وقفت', read: 'قريت {p}%', go: 'كمّل', back: 'ارجع للمكان اللي وقفت فيه ({p}%)', left: 'فاضل حوالي {n} دقايق', end: 'وصلت للآخر' },
  foot: { tag: 'دروس عملية في الذكاء الاصطناعي بكلام بسيط، بالعربي والإنجليزي.', learn: 'اتعلّم', site: 'الموقع', follow: 'تابعني وخد نصيحة عملية جديدة في الذكاء الاصطناعي كل أسبوع.', legal: 'موقع مستقل، ملوش علاقة بأي شركة ذكاء اصطناعي مذكورة فيه. أسماء المنتجات علامات تجارية لأصحابها.', top: 'اطلع لفوق', links: [['كل الدروس', '/ar/lessons/'], ['ابدأ من هنا', '/ar/#start'], ['المالية وCMA', '/ar/finance/'], ['Microsoft 365', '/ar/microsoft-365/'], ['القاموس', '/ar/glossary/']], links2: [['أدوات الذكاء الاصطناعي', '/ar/tools/'], ['مكتبة البرومبتات', '/ar/prompt-library'], ['قيّم البرومبت بتاعك', '/ar/prompt-grader'], ['البرومبتات المحفوظة', '/ar/my-prompts/'], ['عنّي', '/ar/#about'], ['أسئلة بتتكرر', '/ar/#faq']] },
  notFound: { title: 'الصفحة مش موجودة', h: 'الصفحة دي مش موجودة.', p: 'يمكن اللينك قديم أو الصفحة اتنقلت. اللينكات دي هترجّعك:', home: 'الصفحة الرئيسية', lessons: 'كل الدروس' },
};

export const T = { en, ar };
export const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
