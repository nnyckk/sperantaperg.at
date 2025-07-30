function handleCookieConsent(accepted) {
  localStorage.setItem("cookieConsent", accepted ? "accepted" : "refused");
  document.getElementById("cookie-banner").style.display = "none";

  if (accepted) {
    console.log("Cookies accepted");

    // Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());

    gtag("config", "G-KE98B3X7E5");
  } else {
    console.log("Cookies declined");
  }
}

window.addEventListener("load", function () {
  const consent = localStorage.getItem("cookieConsent");
  if (!consent) {
    setTimeout(() => {
      document.getElementById("cookie-banner").style.display = "block";
    }, 3000); // delay 3 seconds
  }
});
