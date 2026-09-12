// Skrip Pertahanan Klien (Anti-Inspection & Anti-F12)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault(); // Menyekat klik kanan tetikus
});

document.addEventListener('keydown', function(e) {
    // Menyekat kekunci F12, Ctrl+Shift+I, Ctrl+Shift+J, dan Ctrl+U (View Source)
    if (
        e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || 
        (e.ctrlKey && e.keyCode === 85)
    ) {
        e.preventDefault();
        alert('Akses kod sumber sistem ini dilindungi oleh keselamatan Architech Laboratory.');
        return false;
    }
});