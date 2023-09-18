//navbar toogle
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const titles = document.querySelectorAll(".title");

  const toggleSidebarBtn = document.getElementById("toggleSidebar");
  let sidebarOpen = true;

  toggleSidebarBtn.addEventListener("click", function () {
    if (sidebarOpen) {
      sidebar.style.width = "5%"; // Adjust the width as needed
      titles.forEach((title) => (title.style.display = "none"));
    } else {
      sidebar.style.width = "15%"; // Adjust the width as needed
      titles.forEach((title) => (title.style.display = ""));
    }
    sidebarOpen = !sidebarOpen;
  });
});
