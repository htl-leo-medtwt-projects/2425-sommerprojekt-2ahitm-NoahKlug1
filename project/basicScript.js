function showPage(pageId) {
    document.querySelectorAll('.content').forEach(div => {
        div.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}