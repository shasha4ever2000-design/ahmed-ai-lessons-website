// A small spoken-and-shown message ("Lesson done · 3 of 19"). Lives in a polite live region.
let el: HTMLElement | null = null, timer = 0;
export function toast(text: string) {
  if (!el) { el = document.createElement('p'); el.className = 'toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
  el.textContent = text; el.classList.add('is-on');
  clearTimeout(timer); timer = window.setTimeout(() => el!.classList.remove('is-on'), 2600);
}
