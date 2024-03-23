for (var i = 0; i < 128; i++) {
    var bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.style.setProperty('--size', (2 + Math.random() * 4) + 'rem');
    bubble.style.setProperty('--distance', (6 + Math.random() * 4) + 'rem');
    bubble.style.setProperty('--position', (-5 + Math.random() * 110) + '%');
    bubble.style.setProperty('--time', (2 + Math.random() * 2) + 's');
    bubble.style.setProperty('--delay', (-1 * (2 + Math.random() * 2)) + 's');
    document.querySelector('.bubbles').appendChild(bubble);
}