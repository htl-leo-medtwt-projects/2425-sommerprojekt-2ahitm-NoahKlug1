function showPage(pageId) {
    document.querySelectorAll('.content').forEach(div => {
        div.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}
// Swiper Initialisierung
var swiper = new Swiper('.swiper-container', {
    // Vertikale Richtung
    direction: 'vertical',
    
    // Nur ein Slide sichtbar
    slidesPerView: 1,
    
    // Zentrieren des aktiven Slides
    centeredSlides: true,
    
    // Übergangseffekt
    effect: 'slide',
    
    // Abstand zwischen Slides
    spaceBetween: 0,
    
    // Pagination aktivieren
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    
    // Navigation Buttons aktivieren
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    
    // Mouse-Wheel-Scrolling aktivieren
    mousewheel: true,
  });