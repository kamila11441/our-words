// Add the project's Supabase URL and public anon key here (see SETUP.md).
const SUPABASE_URL = 'https://ivlpuykrratybgtkspfd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_3juSI4heCdi9uk3AWXReAw_iUM0Dber';
const configured = SUPABASE_URL.startsWith('https://') && SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_');
const client = configured && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;

const $ = id => document.getElementById(id);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ------------------------------------------------------------------ icons */
const ICONS = {
  book: '<path d="M4 5.5C7 4 10 4.5 12 6c2-1.5 5-2 8-.5V19c-3-1.5-6-1-8 .5C10 18 7 17.5 4 19zM12 6v13.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-5.5 7-5.5s6 1.5 7 5.5"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  print: '<path d="M7 9V4h10v5M7 17H5v-6h14v6h-2M7 14h10v6H7z"/>',
  more: '<circle cx="5" cy="12" r="1.1"/><circle cx="12" cy="12" r="1.1"/><circle cx="19" cy="12" r="1.1"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  out: '<path d="M15 17l5-5-5-5M20 12H9M12 20H5V4h7"/>',
  edit: '<path d="M4 20l1-4L16.5 4.5a2 2 0 013 3L8 19z"/>',
  del: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 4l16 16"/>'
};
const ico = (name, size = 20) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
$$('[data-ico]').forEach(el => { el.outerHTML = ico(el.dataset.ico, +el.dataset.size || 20); });

/* ------------------------------------------------------------------ state */
let user = null, profile = null, entries = [];
let authMode = 'login', editing = null, isGuest = false, fullView = false;
let loaded = false, activeCat = null, chosenProfile = null, enteredId = null, syncState = 'connecting';
let language = localStorage.getItem('our-words-language') || 'en';

const WORD_TYPES = ['noun', 'verb', 'saying', 'adjective'];
const ALPHABET = 'A Ą B C Ć D E Ę F G H I J K L Ł M N Ń O Ó P R S Ś T U W Y Z Ź Ż'.split(' ');
// Words are Polish whatever the interface language is, so always collate as Polish.
const PL = new Intl.Collator('pl');

/* ------------------------------------------------------------------ i18n */
const translations = {
  en: {
    brandSub: 'our family dictionary', signOut: 'Sign out', headline: 'The words that made us.',
    intro: 'The words we grew up with, the way we say them, and the stories we want to remember.',
    addWord: 'Add a word', wordsCollected: 'words collected', contributors: 'family contributors',
    search: 'Search words…', sortNew: 'Recently added', sortAZ: 'A to Z', sortOld: 'Oldest first',
    wordLabel: 'Word or phrase *', soundLabel: 'How they say it (optional)', typeLabel: 'Word type *',
    meaningLabel: 'What it means *', exampleLabel: 'A sentence or memory', cancel: 'Cancel', saveWord: 'Save word',
    addTitle: 'Add a word', editTitle: 'Edit word', first: 'Let’s save one of their words.',
    firstHint: 'Add a word, a saying, or a memory we want to keep in the family.',
    noMatch: 'No matching words yet.', trySearch: 'Try another search or category.', addedBy: 'Added by',
    confirmDelete: 'Delete this word from our dictionary?', synced: 'Synced', syncIssue: 'Sync issue', connecting: 'Connecting…',
    guestView: 'Browse as guest', guestMode: 'Guest · read only', returnSignIn: 'Return to sign in',
    authHeadline: 'Their words.|Our words.', authIntro: 'A place for our grandparents’ words,|sayings, and stories.',
    loginTab: 'Sign in', signupTab: 'Create profile', profileNameLabel: 'Name for your profile',
    emailLabel: 'Email for account recovery', passwordLabel: 'Password', noProfiles: 'No profiles yet. Let’s create the first one.',
    deleteTitle: 'Delete', categoryLabel: 'Category or topic (optional)', changePhoto: 'Change photo',
    englishTranslationLabel: 'English translation (optional)', englishLabel: 'English', removePhoto: 'Remove photo',
    confirmRemovePhoto: 'Remove your profile picture?', printDictionary: 'Print dictionary',
    navWords: 'Words', navProfile: 'Profile', fullTitle: 'Full dictionary', back: 'Back to words',
    moreFor: 'More actions for', moreDetails: 'More details (optional)', langName: 'Language', langSwitchTo: 'Polski',
    familyMember: 'Family member', showPassword: 'Show password', hidePassword: 'Hide password',
    saved: 'Word saved', deleted: 'Word deleted', photoUpdated: 'Photo updated', photoRemoved: 'Photo removed', iconUpdated: 'App icon updated',
    tag_noun: 'Noun', tag_verb: 'Verb', tag_saying: 'Phrase', tag_adjective: 'Adjective',
    seg_noun: 'Noun', seg_verb: 'Verb', seg_saying: 'Phrase', seg_adjective: 'Adj.',
    inflectionLabel: 'Word forms / inflection (optional)', inflectionPh: 'e.g. babcia, babci, babci, babcię, babcią, babci, babciu', formsLabel: 'Forms',
    noPermission: 'You don’t have permission to edit this word.',
    saidByLabel: 'Who says it (optional)', saidByPh: 'e.g. Grandma Ania, Uncle Marek', saidBy: 'Said by',
    wordPh: 'The word as you remember it', soundPh: 'Syllables or a sound-alike', meaningPh: 'What does it mean?',
    categoryPh: 'e.g. food, weather, family', translationPh: 'A short English equivalent',
    examplePh: 'A sentence, story, or who used to say it', namePh: 'e.g. Grandma Ania', passwordPh: 'At least 8 characters',
    setupNeeded: 'Setup needed: connect a Supabase project first.', needName: 'Please choose a profile name.',
    checkEmail: 'Check your email to confirm your account, then sign in.', chooseFirst: 'Choose your profile first.',
    signinFail: 'Sign in failed. Check the password.', iconTooBig: 'Choose an image under 2 MB.',
    photoTooBig: 'Choose an image under 4 MB.', iconTitle: 'Change app icon'
  },
  pl: {
    brandSub: 'nasz rodzinny słownik', signOut: 'Wyloguj się', headline: 'Słowa, które nas tworzą.',
    intro: 'Słowa, z którymi dorastaliśmy, nasza wymowa i historie, które chcemy zachować.',
    addWord: 'Dodaj słowo', wordsCollected: 'zapisanych słów', contributors: 'osób dodających',
    search: 'Szukaj słów…', sortNew: 'Ostatnio dodane', sortAZ: 'Alfabetycznie', sortOld: 'Najstarsze',
    wordLabel: 'Słowo lub zwrot *', soundLabel: 'Jak oni mówią (opcjonalnie)', typeLabel: 'Rodzaj słowa *',
    meaningLabel: 'Co oznacza *', exampleLabel: 'Zdanie lub wspomnienie', cancel: 'Anuluj', saveWord: 'Zapisz słowo',
    addTitle: 'Dodaj słowo', editTitle: 'Edytuj słowo', first: 'Zapiszmy jedno z ich słów.',
    firstHint: 'Dodaj słowo, powiedzenie lub wspomnienie, które chcemy zachować w rodzinie.',
    noMatch: 'Brak pasujących słów.', trySearch: 'Spróbuj innego wyszukiwania lub kategorii.', addedBy: 'Dodał(a)',
    confirmDelete: 'Usunąć to słowo z naszego słownika?', synced: 'Zsynchronizowano', syncIssue: 'Problem z synchronizacją', connecting: 'Łączenie…',
    guestView: 'Przeglądaj jako gość', guestMode: 'Gość · tylko do odczytu', returnSignIn: 'Wróć do logowania',
    authHeadline: 'Ich słowa.|Nasze słowa.', authIntro: 'Miejsce na słowa naszych dziadków,|powiedzenia i historie.',
    loginTab: 'Zaloguj się', signupTab: 'Utwórz profil', profileNameLabel: 'Nazwa Twojego profilu',
    emailLabel: 'E-mail do odzyskiwania konta', passwordLabel: 'Hasło', noProfiles: 'Nie ma jeszcze profili. Utwórzmy pierwszy.',
    deleteTitle: 'Usuń', categoryLabel: 'Kategoria lub temat (opcjonalnie)', changePhoto: 'Zmień zdjęcie',
    englishTranslationLabel: 'Tłumaczenie na angielski (opcjonalnie)', englishLabel: 'Angielski', removePhoto: 'Usuń zdjęcie',
    confirmRemovePhoto: 'Usunąć zdjęcie profilowe?', printDictionary: 'Drukuj słownik',
    navWords: 'Słowa', navProfile: 'Profil', fullTitle: 'Cały słownik', back: 'Wróć do słów',
    moreFor: 'Więcej działań dla', moreDetails: 'Więcej szczegółów (opcjonalnie)', langName: 'Język', langSwitchTo: 'English',
    familyMember: 'Członek rodziny', showPassword: 'Pokaż hasło', hidePassword: 'Ukryj hasło',
    saved: 'Zapisano słowo', deleted: 'Usunięto słowo', photoUpdated: 'Zaktualizowano zdjęcie', photoRemoved: 'Usunięto zdjęcie', iconUpdated: 'Zaktualizowano ikonę aplikacji',
    tag_noun: 'Rzeczownik', tag_verb: 'Czasownik', tag_saying: 'Zwrot', tag_adjective: 'Przymiotnik',
    seg_noun: 'Rzecz.', seg_verb: 'Czas.', seg_saying: 'Zwrot', seg_adjective: 'Przym.',
    inflectionLabel: 'Odmiana słowa (opcjonalnie)', inflectionPh: 'np. babcia, babci, babci, babcię, babcią, babci, babciu', formsLabel: 'Odmiana',
    noPermission: 'Nie masz uprawnień do edycji tego słowa.',
    saidByLabel: 'Kto tak mówi (opcjonalnie)', saidByPh: 'np. babcia Ania, wujek Marek', saidBy: 'Tak mówi',
    wordPh: 'Słowo tak, jak je pamiętasz', soundPh: 'Sylaby lub podobnie brzmiące słowo', meaningPh: 'Co to znaczy?',
    categoryPh: 'np. jedzenie, pogoda, rodzina', translationPh: 'Krótki odpowiednik po angielsku',
    examplePh: 'Zdanie, historia lub kto tak mówił', namePh: 'np. Babcia Ania', passwordPh: 'Co najmniej 8 znaków',
    setupNeeded: 'Wymagana konfiguracja: najpierw połącz projekt Supabase.', needName: 'Wybierz nazwę profilu.',
    checkEmail: 'Sprawdź e-mail, potwierdź konto, a potem się zaloguj.', chooseFirst: 'Najpierw wybierz profil.',
    signinFail: 'Nie udało się zalogować. Sprawdź hasło.', iconTooBig: 'Ikona musi mieć mniej niż 2 MB.',
    photoTooBig: 'Zdjęcie musi mieć mniej niż 4 MB.', iconTitle: 'Zmień ikonę aplikacji'
  }
};
const t = key => translations[language][key] || translations.en[key] || key;

function applyLanguage() {
  document.documentElement.lang = language;
  $$('[data-i18n]').forEach(el => { if (!['authHeadline', 'authIntro'].includes(el.dataset.i18n)) el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  $$('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  const [their, our] = t('authHeadline').split('|');
  document.querySelector('[data-i18n="authHeadline"]').innerHTML = `<span class="their-words">${their}</span><span class="our-words">${our}</span>`;
  document.querySelector('[data-i18n="authIntro"]').innerHTML = t('authIntro').split('|').join('<br>');
  $$('.js-lang-label').forEach(l => { l.textContent = t('langSwitchTo'); });
  $$('.js-lang').forEach(b => b.setAttribute('aria-label', language === 'pl' ? 'Switch to English' : 'Przełącz na polski'));
  $('search').placeholder = t('search'); $('search').setAttribute('aria-label', language === 'pl' ? 'Szukaj słów, znaczeń, przykładów' : 'Search words, meanings, examples');
  $('sort').options[0].text = t('sortNew'); $('sort').options[1].text = t('sortAZ'); $('sort').options[2].text = t('sortOld');
  $('modal-title').textContent = editing ? t('editTitle') : t('addTitle');
  $('auth-submit').textContent = t(authMode === 'login' ? 'loginTab' : 'signupTab');
  setPwToggle();
  setSync(syncState);
  updateIdentity();
  loadBrandingTitles();
  render();
}
function switchLanguage() {
  language = language === 'en' ? 'pl' : 'en';
  localStorage.setItem('our-words-language', language);
  applyLanguage();
  if ($('auth').style.display === 'grid' && client) loadProfiles();
}

/* ------------------------------------------------------------------ helpers */
function esc(s = '') { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function status(msg, where = 'auth-status') { $(where).textContent = msg; }
let toastTimer;
function toast(msg) {
  const el = $('toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function setSync(state) {
  syncState = state;
  const p = $('connection-pill');
  p.className = 'sync' + (state === 'ok' ? ' is-synced' : state === 'issue' ? ' is-issue' : '');
  p.textContent = state === 'ok' ? t('synced') : state === 'issue' ? t('syncIssue') : state === 'guest' ? t('guestMode') : t('connecting');
}
function updateIdentity() {
  const name = isGuest ? t('guestMode') : (profile?.display_name || user?.email || t('familyMember'));
  const url = !isGuest && profile?.avatar_url;
  $$('.js-name').forEach(n => { n.textContent = name; });
  $$('.js-avatar').forEach(a => {
    a.style.backgroundImage = url ? `url("${String(url).replace(/"/g, '%22')}")` : '';
    a.textContent = url ? '' : (isGuest ? '?' : name.trim().charAt(0).toUpperCase() || '?');
  });
  $$('.js-signout-label').forEach(l => { l.textContent = isGuest ? t('returnSignIn') : t('signOut'); });
}
function setAdd(hidden) { $$('.js-add').forEach(b => { b.hidden = hidden; }); }

/* ------------------------------------------------------------------ overlays */
const focusBack = {};
function openOverlay(id, focusEl) {
  const o = $(id);
  focusBack[id] = document.activeElement;
  o.classList.add('show'); document.body.classList.add('lock');
  setTimeout(() => (focusEl || o.querySelector('.sheet'))?.focus?.({ preventScroll: true }), 60);
}
function closeOverlay(id) {
  $(id).classList.remove('show');
  if (!$$('.overlay.show').length) document.body.classList.remove('lock');
  focusBack[id]?.focus?.({ preventScroll: true }); focusBack[id] = null;
}
$$('.overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.dispatchEvent(new Event('dismiss')); });
  const sheet = o.querySelector('.sheet'); sheet.tabIndex = -1; sheet.style.outline = 'none';
});
$('entry-modal').addEventListener('dismiss', closeEntry);
$('profile-modal').addEventListener('dismiss', () => closeOverlay('profile-modal'));
$('confirm-modal').addEventListener('dismiss', () => $('confirm-cancel').click());
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeMenu();
  const top = $$('.overlay.show').pop();
  if (top) top.dispatchEvent(new Event('dismiss'));
});
// swipe a sheet down by its handle to dismiss it
$$('.handle').forEach(h => {
  const sheet = h.closest('.sheet'), ov = h.closest('.overlay'); let y0 = null;
  const reset = () => { y0 = null; sheet.classList.remove('dragging'); sheet.style.transform = ''; };
  h.addEventListener('pointerdown', e => { y0 = e.clientY; h.setPointerCapture(e.pointerId); sheet.classList.add('dragging'); });
  h.addEventListener('pointermove', e => { if (y0 !== null) sheet.style.transform = `translateY(${Math.max(0, e.clientY - y0)}px)`; });
  h.addEventListener('pointerup', e => { if (y0 === null) return; const dy = e.clientY - y0; reset(); if (dy > 100) ov.dispatchEvent(new Event('dismiss')); });
  h.addEventListener('pointercancel', reset);
});
function confirmDialog(message, okLabel) {
  return new Promise(resolve => {
    $('confirm-msg').textContent = message; $('confirm-ok').textContent = okLabel;
    openOverlay('confirm-modal', $('confirm-cancel'));
    const done = v => { $('confirm-ok').onclick = $('confirm-cancel').onclick = null; closeOverlay('confirm-modal'); resolve(v); };
    $('confirm-ok').onclick = () => done(true);
    $('confirm-cancel').onclick = () => done(false);
  });
}

/* ------------------------------------------------------------------ auth */
function showAuth() {
  $$('.overlay.show').forEach(o => o.classList.remove('show')); document.body.classList.remove('lock');
  $('auth').style.display = 'grid'; $('app').hidden = true; $('tabbar').hidden = true;
  $('setup-note').style.display = client ? 'none' : 'block';
  if (client) loadProfiles();
}
function showApp() {
  $('auth').style.display = 'none'; $('app').hidden = false; $('tabbar').hidden = false;
  window.scrollTo(0, 0);
}
async function init() {
  if (!client) { showAuth(); status(t('setupNeeded')); return; }
  const { data: { session } } = await client.auth.getSession();
  if (session) await enter(session.user); else showAuth();
  client.auth.onAuthStateChange(async (_event, session) => {
    if (session) await enter(session.user);
    else { enteredId = null; user = null; profile = null; entries = []; loaded = false; showAuth(); }
  });
}
async function enter(u) {
  if (enteredId === u.id) return;           // ignore duplicate auth events (INITIAL_SESSION, token refresh…)
  enteredId = u.id; isGuest = false; user = u;
  const { data, error } = await client.from('profiles').select('*').eq('id', u.id).single();
  if (error) { enteredId = null; status(error.message); return; }
  profile = data; setAdd(false); showApp(); setSync('ok'); updateIdentity();
  await loadBranding(); await loadEntries();
}
function brandTitle() { return profile?.is_admin ? t('iconTitle') : ''; }
function loadBrandingTitles() { $$('.brand-mark').forEach(m => { m.title = brandTitle(); }); }
async function loadBranding() {
  const { data } = await client.from('family_settings').select('logo_url').eq('id', true).single();
  $$('.brand-mark').forEach(mark => {
    mark.textContent = data?.logo_url ? '' : 'W';
    mark.style.backgroundImage = data?.logo_url ? `url(${data.logo_url})` : '';
    mark.classList.toggle('admin-logo', !!profile?.is_admin);
    mark.title = brandTitle();
  });
}
$('tab-login').onclick = () => setAuthMode('login');
$('tab-signup').onclick = () => setAuthMode('signup');
async function loadProfiles() {
  if (!client) return;
  const { data } = await client.from('profiles').select('id,display_name,avatar_url').order('created_at');
  const host = $('profile-picker');
  host.innerHTML = data?.length
    ? data.map(p => `<button type="button" class="profile-choice ${chosenProfile === p.id ? 'selected' : ''}" data-profile="${esc(p.id)}">${p.avatar_url ? `<img src="${esc(p.avatar_url)}" alt="">` : `<i class="avatar">${esc((p.display_name || '?')[0].toUpperCase())}</i>`}<span>${esc(p.display_name)}</span></button>`).join('')
    : `<div class="profile-empty">${t('noProfiles')}</div>`;
  $$('[data-profile]', host).forEach(b => b.onclick = () => {
    chosenProfile = b.dataset.profile;
    $$('.profile-choice', host).forEach(x => x.classList.toggle('selected', x === b));
    $('password').focus();
  });
}
function setAuthMode(mode) {
  authMode = mode;
  $('tab-login').classList.toggle('active', mode === 'login'); $('tab-signup').classList.toggle('active', mode === 'signup');
  $('tab-login').setAttribute('aria-selected', mode === 'login'); $('tab-signup').setAttribute('aria-selected', mode === 'signup');
  $('name-field').hidden = mode === 'login'; $('email-field').hidden = mode === 'login'; $('profile-picker').hidden = mode !== 'login';
  $('auth-submit').textContent = t(mode === 'login' ? 'loginTab' : 'signupTab');
  $('password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  if (mode === 'login') loadProfiles();
  status('');
}
function setPwToggle() {
  const shown = $('password').type === 'text';
  $('pw-toggle').innerHTML = ico(shown ? 'eyeoff' : 'eye');
  $('pw-toggle').setAttribute('aria-label', t(shown ? 'hidePassword' : 'showPassword'));
}
$('pw-toggle').onclick = () => { const p = $('password'); p.type = p.type === 'password' ? 'text' : 'password'; setPwToggle(); };

$('guest-view').onclick = async () => {
  if (!client) { status(t('setupNeeded')); return; }
  isGuest = true; user = null; profile = null; enteredId = null;
  $('auth').style.display = 'none'; $('app').hidden = false; $('tabbar').hidden = false;
  setAdd(true); setSync('guest'); updateIdentity(); loaded = false; render();
  await loadEntries();
};
$('auth-form').addEventListener('submit', async e => {
  e.preventDefault(); if (!client) return; status('');
  const password = $('password').value;
  if (authMode === 'signup') {
    const display_name = $('display-name').value.trim(), email = $('email').value.trim();
    if (!display_name) { status(t('needName')); return; }
    const { data, error } = await client.auth.signUp({ email, password, options: { data: { display_name } } });
    if (error) { status(error.message); return; }
    if (!data.session) status(t('checkEmail'));
  } else {
    if (!chosenProfile) { status(t('chooseFirst')); return; }
    const { data, error } = await client.functions.invoke('profile-login', { body: { profile_id: chosenProfile, password } });
    if (error) { status(t('signinFail')); return; }
    if (data?.session) await client.auth.setSession(data.session);
  }
});

/* ------------------------------------------------------------------ data */
async function loadEntries() {
  if (!client) return;
  const { data, error } = await client.from('entries').select('*, profiles(display_name)').order('created_at', { ascending: false });
  loaded = true;
  if (error) { setSync('issue'); render(); return; }
  entries = data || []; setSync(isGuest ? 'guest' : 'ok'); render();
}
function entryTagValues(e) { return [...new Set([e.category, e.topic].map(v => (v || '').trim()).filter(Boolean))]; }
function entryTag(e) { return entryTagValues(e).join(' · '); }
function allCategories() { return [...new Set(entries.flatMap(entryTagValues))].sort(PL.compare); }
function letterOf(word) {
  const c = (word || '').trim().normalize('NFC').charAt(0).toLocaleUpperCase('pl');
  return /\p{L}/u.test(c) ? c : '#';
}
function filtered() {
  const q = $('search').value.trim().toLowerCase();
  const list = entries.filter(e =>
    (!activeCat || entryTagValues(e).includes(activeCat)) &&
    (!q || [e.word, e.pronunciation, e.said_by, e.inflection, e.meaning, e.english_translation, e.category, e.example, e.topic, e.profiles?.display_name].some(v => (v || '').toLowerCase().includes(q))));
  const sort = $('sort').value;
  if (sort === 'az') list.sort((a, b) => PL.compare(a.word, b.word));
  else if (sort === 'oldest') list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return list;
}

/* ------------------------------------------------------------------ render */
function rowHTML(e) {
  const own = !!user && e.created_by === user.id, admin = !!profile?.is_admin;
  const type = WORD_TYPES.includes(e.word_type) ? e.word_type : 'noun';
  const cats = entryTagValues(e);
  return `<article class="row" data-id="${esc(e.id)}">
    <div class="row-title"><div class="word-line"><h2 class="word">${esc(e.word)}</h2><span class="tag tag-inline type-${type}">${t('tag_' + type)}</span></div>${e.pronunciation ? `<div class="pron">${esc(e.pronunciation)}</div>` : ''}</div>
    <div class="row-side"><span class="tag tag-side type-${type}">${t('tag_' + type)}</span>${own || admin ? `<button type="button" class="icon-btn" data-more="${esc(e.id)}" aria-haspopup="menu" aria-expanded="false" aria-label="${esc(t('moreFor'))} ${esc(e.word)}">${ico('more')}</button>` : ''}</div>
    <div class="row-main">
      <p class="meaning">${esc(e.meaning)}</p>
      ${e.english_translation ? `<div class="english">${t('englishLabel')}: ${esc(e.english_translation)}</div>` : ''}
    </div>
    <div class="row-extra">
      ${e.inflection ? `<p class="forms"><strong>${t('formsLabel')}:</strong> ${esc(e.inflection)}</p>` : ''}
      ${e.example ? `<p class="example">“${esc(e.example)}”</p>` : ''}
      <div class="meta">${cats.map(c => `<span class="cat">${esc(c)}</span>`).join('')}${e.said_by ? `<span>${t('saidBy')} <strong>${esc(e.said_by)}</strong></span>` : ''}<span>${t('addedBy')} <strong>${esc(e.profiles?.display_name || t('familyMember'))}</strong></span></div>
    </div>
  </article>`;
}
function skeleton() { return '<div aria-hidden="true">' + '<div class="skel"><i></i><i></i><i></i></div>'.repeat(4) + '</div>'; }
function emptyHTML(hasFilter) {
  return `<div class="empty"><div class="empty-ico">${ico('book', 26)}</div><strong>${hasFilter ? t('noMatch') : t('first')}</strong><span>${hasFilter ? t('trySearch') : t('firstHint')}</span>${!hasFilter && !isGuest ? `<button type="button" class="btn primary js-add">${ico('plus', 18)}${t('addWord')}</button>` : ''}</div>`;
}
function azHTML(list) {
  const sorted = [...list].sort((a, b) => PL.compare(a.word, b.word));
  const groups = new Map();
  sorted.forEach(e => { const L = letterOf(e.word); if (!groups.has(L)) groups.set(L, []); groups.get(L).push(e); });
  const extras = [...groups.keys()].filter(L => L !== '#' && !ALPHABET.includes(L));
  const letters = [...new Set([...ALPHABET, ...extras])].sort(PL.compare);
  if (groups.has('#')) letters.push('#');
  const body = letters.filter(L => groups.has(L)).map(L =>
    `<section class="az-group" data-letter="${esc(L)}"><h3 class="az-letter">${esc(L)}</h3>${groups.get(L).map(rowHTML).join('')}</section>`).join('');
  return `<div class="az"><div class="az-list">${body}</div><div class="rail" aria-hidden="true">${letters.map(L => `<span data-letter="${esc(L)}"${groups.has(L) ? '' : ' class="dim"'}>${esc(L)}</span>`).join('')}</div></div>`;
}
function bindRail(host) {
  const rail = host.querySelector('.rail'); if (!rail) return;
  const spans = [...rail.children];
  const jump = i => {
    const find = k => host.querySelector(`.az-group[data-letter="${spans[k].dataset.letter}"]`);
    let el = null;
    for (let k = i; k < spans.length && !el; k++) el = find(k);
    for (let k = i; k >= 0 && !el; k--) el = find(k);
    el?.scrollIntoView({ block: 'start' });
  };
  const go = y => { const r = rail.getBoundingClientRect(); jump(Math.max(0, Math.min(spans.length - 1, Math.floor((y - r.top) / r.height * spans.length)))); };
  rail.onpointerdown = e => { rail.setPointerCapture(e.pointerId); go(e.clientY); };
  rail.onpointermove = e => { if (rail.hasPointerCapture(e.pointerId)) go(e.clientY); };
}
function render() {
  const host = $('entries');
  $('app').classList.toggle('is-full', fullView);
  $('headline').textContent = fullView ? t('fullTitle') : t('headline');
  $('hero-intro').hidden = fullView;
  $('topbar-home').hidden = fullView; $('topbar-full').hidden = !fullView;
  $('page-actions').hidden = !fullView;
  $('sort-wrap').hidden = fullView; $('chip-az').hidden = fullView;
  $$('.nv[data-nav]').forEach(el => el.classList.toggle('on', (el.dataset.nav === 'full') === fullView));
  $('word-count').textContent = entries.length;
  $('contributor-count').textContent = new Set(entries.map(e => e.created_by)).size;

  const cats = allCategories();
  if (activeCat && !cats.includes(activeCat)) activeCat = null;
  $('cat-chips').innerHTML = cats.map(c => `<button type="button" class="chip${c === activeCat ? ' on' : ''}" data-cat="${esc(c)}" aria-pressed="${c === activeCat}">${esc(c)}</button>`).join('');
  $('chip-sep').hidden = fullView || !cats.length;
  $('chips').hidden = fullView && !cats.length;
  $('category-options').innerHTML = cats.map(c => `<option value="${esc(c)}">`).join('');

  const list = filtered();
  const hasFilter = !!$('search').value.trim() || !!activeCat;
  if (!loaded) host.innerHTML = skeleton();
  else if (!list.length) host.innerHTML = emptyHTML(hasFilter && entries.length > 0);
  else if (fullView) { host.innerHTML = azHTML(list); bindRail(host); }
  else host.innerHTML = list.map(rowHTML).join('');
}
function setView(full) { fullView = full; closeMenu(); render(); window.scrollTo(0, 0); }

/* ------------------------------------------------------------------ row menu */
let menuFor = null;
function openMenu(btn) {
  const e = entries.find(x => x.id === btn.dataset.more); if (!e) return;
  closeMenu();
  const own = !!user && e.created_by === user.id, admin = !!profile?.is_admin;
  $('menu-edit').hidden = !(own || admin);   // admins can edit any word $('menu-delete').hidden = !(own || admin);
  const m = $('row-menu'); m.style.visibility = 'hidden'; m.hidden = false;
  const r = btn.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight;
  let top = r.bottom + 6; if (top + h > innerHeight - 16) top = Math.max(16, r.top - h - 6);
  m.style.top = top + 'px'; m.style.left = Math.min(Math.max(16, r.right - w), innerWidth - w - 16) + 'px';
  m.style.visibility = ''; menuFor = { id: e.id, btn }; btn.setAttribute('aria-expanded', 'true');
  m.querySelector('button:not([hidden])')?.focus();
}
function closeMenu() {
  if (!menuFor) return;
  menuFor.btn.setAttribute('aria-expanded', 'false'); $('row-menu').hidden = true; menuFor = null;
}
window.addEventListener('scroll', closeMenu, { passive: true });
window.addEventListener('resize', closeMenu);
$('menu-edit').onclick = () => { const e = entries.find(x => x.id === menuFor?.id); closeMenu(); if (e) openEntry(e); };
$('menu-delete').onclick = () => { const id = menuFor?.id; closeMenu(); if (id) deleteEntry(id); };

/* ------------------------------------------------------------------ add / edit */
function openEntry(e) {
  if (isGuest) return;
  editing = e || null;
  $('entry-form').reset(); $('entry-id').value = e?.id || '';
  $('modal-title').textContent = e ? t('editTitle') : t('addTitle');
  $('word').value = e?.word || '';
  $$('input[name="word-type"]').forEach(r => { r.checked = r.value === (e?.word_type || 'noun'); });
  $('category').value = e ? entryTag(e) : '';
  $('english-translation').value = e?.english_translation || '';
  $('pronunciation').value = e?.pronunciation || '';
  $('said-by').value = e?.said_by || '';
  $('inflection').value = e?.inflection || '';
  $('meaning').value = e?.meaning || '';
  $('example').value = e?.example || '';
  $('more-fields').open = !!(e && (e.pronunciation || e.said_by || e.inflection || entryTag(e) || e.english_translation || e.example));
  status('', 'entry-status');
  openOverlay('entry-modal', $('word'));
}
function closeEntry() { closeOverlay('entry-modal'); editing = null; }
$('cancel-entry').onclick = closeEntry;
$('entry-form').onsubmit = async e => {
  e.preventDefault(); if (!client || !user) return;
  const row = {
    word: $('word').value.trim(),
    word_type: $('entry-form').querySelector('input[name="word-type"]:checked')?.value || 'noun',
    category: $('category').value.trim() || null, topic: null,
    english_translation: $('english-translation').value.trim() || null,
    pronunciation: $('pronunciation').value.trim() || null,
    meaning: $('meaning').value.trim(), example: $('example').value.trim() || null
  };
  // Only send said_by / inflection when used, so saving still works before the columns exist.
  [['said_by', 'said-by'], ['inflection', 'inflection']].forEach(([col, id]) => {
    const v = $(id).value.trim();
    if (v) row[col] = v; else if (editing?.[col]) row[col] = null;
  });
  $('save-entry').disabled = true;
  const result = editing
    ? await client.from('entries').update(row).eq('id', editing.id).select('id')
    : await client.from('entries').insert({ ...row, created_by: user.id });
  $('save-entry').disabled = false;
  if (result.error) { status(result.error.message, 'entry-status'); return; }
  // Row-level security can silently match 0 rows instead of returning an error.
  if (editing && !result.data?.length) { status(t('noPermission'), 'entry-status'); return; }
  closeEntry(); toast(t('saved')); await loadEntries();
};
async function deleteEntry(id) {
  if (!await confirmDialog(t('confirmDelete'), t('deleteTitle'))) return;
  const { error } = await client.from('entries').delete().eq('id', id);
  if (error) { toast(error.message); return; }
  toast(t('deleted')); await loadEntries();
}

/* ------------------------------------------------------------------ profile, avatar, logo */
function openProfile() {
  $('change-avatar').hidden = isGuest;
  $('remove-avatar').hidden = isGuest || !profile?.avatar_url;
  openOverlay('profile-modal');
}
$('change-avatar').onclick = () => $('avatar-file').click();
$('remove-avatar').onclick = async () => {
  if (!user || !profile?.avatar_url) return;
  if (!await confirmDialog(t('confirmRemovePhoto'), t('removePhoto'))) return;
  const { error: removeError } = await client.storage.from('avatars').remove([`${user.id}/profile`]);
  if (removeError) { toast(removeError.message); return; }
  const { error } = await client.from('profiles').update({ avatar_url: null }).eq('id', user.id);
  if (error) { toast(error.message); return; }
  profile.avatar_url = null; updateIdentity(); $('remove-avatar').hidden = true; toast(t('photoRemoved'));
};
$('avatar-file').onchange = async () => {
  const file = $('avatar-file').files[0]; $('avatar-file').value = '';
  if (!file || !client || !user) return;
  if (file.size > 4 * 1024 * 1024) { toast(t('photoTooBig')); return; }
  const path = `${user.id}/profile`;
  const { error: upError } = await client.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
  if (upError) { toast(upError.message); return; }
  const { data } = client.storage.from('avatars').getPublicUrl(path);
  const avatar_url = data.publicUrl + '?v=' + Date.now();
  const { error } = await client.from('profiles').update({ avatar_url }).eq('id', user.id);
  if (error) { toast(error.message); return; }
  profile.avatar_url = avatar_url; updateIdentity(); $('remove-avatar').hidden = false; toast(t('photoUpdated')); loadEntries();
};
$('logo-file').onchange = async () => {
  const file = $('logo-file').files[0]; $('logo-file').value = '';
  if (!file || !client || !profile?.is_admin) return;
  if (file.size > 2 * 1024 * 1024) { toast(t('iconTooBig')); return; }
  const path = `${user.id}/app-icon`;
  const { error: upError } = await client.storage.from('branding').upload(path, file, { upsert: true, contentType: file.type });
  if (upError) { toast(upError.message); return; }
  const { data } = client.storage.from('branding').getPublicUrl(path);
  const logo_url = data.publicUrl + '?v=' + Date.now();
  const { error } = await client.from('family_settings').update({ logo_url }).eq('id', true);
  if (error) { toast(error.message); return; }
  await loadBranding(); toast(t('iconUpdated'));
};
$$('.brand-mark').forEach(mark => { mark.onclick = () => { if (profile?.is_admin) $('logo-file').click(); }; });

/* ------------------------------------------------------------------ global events */
document.addEventListener('click', e => {
  const more = e.target.closest('[data-more]');
  if (more) { menuFor && menuFor.btn === more ? closeMenu() : openMenu(more); return; }
  if (!e.target.closest('#row-menu')) closeMenu();

  const cat = e.target.closest('[data-cat]');
  if (cat) { activeCat = activeCat === cat.dataset.cat ? null : cat.dataset.cat; render(); return; }

  const act = e.target.closest('.js-add,.js-home,.js-full,.js-print,.js-lang,.js-signout,.js-profile');
  if (!act) return;
  if (act.matches('.js-add')) openEntry();
  else if (act.matches('.js-home')) setView(false);
  else if (act.matches('.js-full')) setView(true);
  else if (act.matches('.js-print')) { $('search').value = ''; activeCat = null; $('sort').value = 'az'; fullView = true; render(); window.print(); }
  else if (act.matches('.js-lang')) switchLanguage();
  else if (act.matches('.js-profile')) openProfile();
  else if (act.matches('.js-signout')) {
    closeOverlay('profile-modal');
    if (isGuest) { isGuest = false; entries = []; loaded = false; fullView = false; showAuth(); }
    else client?.auth.signOut();
  }
});
$('search').oninput = render;
$('sort').onchange = render;

if ('serviceWorker' in navigator && location.protocol !== 'file:') window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
applyLanguage();
init();
