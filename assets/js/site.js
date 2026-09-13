(function () {
  const menuButton = document.querySelector('.menu-button');
  const navigation = document.querySelector('.site-nav');

  if (menuButton && navigation) {
    menuButton.addEventListener('click', function () {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      navigation.classList.toggle('is-open', !isOpen);
    });

    navigation.addEventListener('click', function (event) {
      if (event.target.matches('a')) {
        menuButton.setAttribute('aria-expanded', 'false');
        navigation.classList.remove('is-open');
      }
    });
  }

  const year = document.querySelector('#current-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
