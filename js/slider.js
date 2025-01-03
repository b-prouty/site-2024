const swiper = new Swiper('.swiper', {
  slidesPerView: 'auto', 
  spaceBetween: 16, // Space between slides
  loop: true, // Enable looping
  speed: 500, // Speed of the animation (lower is faster)
  effect: 'coverflow',

  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

  pagination: {
    el: ".swiper-pagination",
  },

  autoplay: {
      delay: 5000, // Continuous scrolling
      disableOnInteraction: false, // Keep autoplay even on interaction
  },

  //freeMode: true, // Enable free mode for smooth scrolling
  });

  // function Marquee(selector, speed) {
  //   const parentSelector = document.querySelector(selector);
  //   const clone = parentSelector.innerHTML;
  //   const firstElement = parentSelector.children[0];
  //   let i = 0;
  //   console.log(firstElement);
  //   parentSelector.insertAdjacentHTML('beforeend', clone);
  //   parentSelector.insertAdjacentHTML('beforeend', clone);
  
  //   setInterval(function () {
  //     firstElement.style.marginLeft = `-${i}px`;
  //     if (i > firstElement.clientWidth) {
  //       i = 0;
  //     }
  //     i = i + speed;
  //   }, 0);
  // }
  
  // //after window is completed load
  // //1 class selector for marquee
  // //2 marquee speed 0.2
  // window.addEventListener('load', Marquee('.marquee', 0.2))

