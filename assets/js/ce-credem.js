//VISION CARD, TAP TO SHOW BIBLE VERSE // ce-credem.html; ce-credem.css;
document.addEventListener("DOMContentLoaded", function () {
  window.toggleOverlay = function (card) {
    document.querySelectorAll(".vision-card").forEach((el) => {
      if (el !== card) el.classList.remove("active");
    });
    card.classList.toggle("active");
  };
});

//ACCORDION EFFECT // ce-credem.html; ce-credem.css;
const accordionItems = document.querySelectorAll(".accordion-item");
accordionItems.forEach((item) => {
  const title = item.querySelector(".accordion-title");
  const content = item.querySelector(".accordion-content");

  title.addEventListener("click", () => {
    const isOpen = item.classList.contains("active");

    // CLOSE;
    accordionItems.forEach((i) => {
      i.classList.remove("active");
      i.querySelector(".accordion-content").style.maxHeight = null;
    });

    // OPEN IF IT IS CLOSED
    if (!isOpen) {
      item.classList.add("active");
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".accordion-item.active").forEach((item) => {
    const content = item.querySelector(".accordion-content");
    content.style.maxHeight = content.scrollHeight + "px";
  });
});
