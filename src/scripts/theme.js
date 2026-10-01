const root = document.documentElement;
const buttons = [...document.querySelectorAll('[data-theme-choice]')];
const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');

function applyPreference(preference) {
  const theme = preference === 'system'
    ? (systemPreference.matches ? 'dark' : 'light')
    : preference;

  root.dataset.themePreference = preference;
  root.dataset.theme = theme;

  for (const button of buttons) {
    button.setAttribute('aria-pressed', String(button.dataset.themeChoice === preference));
  }
}

for (const button of buttons) {
  button.addEventListener('click', () => {
    const preference = button.dataset.themeChoice;
    applyPreference(preference);

    try {
      if (preference === 'system') localStorage.removeItem('sirius-theme');
      else localStorage.setItem('sirius-theme', preference);
    } catch {}
  });
}

systemPreference.addEventListener('change', () => {
  if (root.dataset.themePreference === 'system') applyPreference('system');
});

applyPreference(root.dataset.themePreference || 'system');
