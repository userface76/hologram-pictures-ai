function openDetail() {
  window.location.assign('/holo-detail.html');
}

function addLandingEntry() {
  const nav = document.querySelector('.landingNav');
  if (!nav || document.getElementById('landing-about')) return;
  const button = document.createElement('button');
  button.id = 'landing-about';
  button.type = 'button';
  button.textContent = 'HOLO 소개';
  button.addEventListener('click', openDetail);
  nav.prepend(button);
}

function addMemberEntry() {
  const dock = document.querySelector('.memberDock');
  if (!dock || document.getElementById('member-about')) return;
  const button = document.createElement('button');
  button.id = 'member-about';
  button.type = 'button';
  button.textContent = 'HOLO 소개';
  button.addEventListener('click', openDetail);
  const firstButton = dock.querySelector('button');
  if (firstButton?.nextSibling) dock.insertBefore(button, firstButton.nextSibling);
  else dock.appendChild(button);
}

function syncDetailEntry() {
  addLandingEntry();
  addMemberEntry();
}

const observer = new MutationObserver(syncDetailEntry);
observer.observe(document.documentElement, { childList: true, subtree: true });
syncDetailEntry();
