// Credits page - Interactive elements and navigation
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const backToGameBtn = document.getElementById('backToGameBtn');
        const howToPlayBtn = document.getElementById('howToPlayBtn');
        
        // ---- BACK TO GAME FUNCTIONALITY ----
        function backToGame() {
            if (window.parent !== window) {
                window.parent.postMessage({ type: 'CLOSE_CREDITS', source: 'credits' }, '*');
            } else {
                window.location.href = '../../../index.html';
            }
        }
        
        // ---- GO TO HOW TO PLAY PAGE ----
        function goToHowToPlay() {
            if (window.parent !== window) {
                window.parent.postMessage({ type: 'OPEN_HOWTOPLAY', source: 'credits' }, '*');
            } else {
                window.location.href = '../index/h2p.html';
            }
        }
        
        if (backToGameBtn) {
            backToGameBtn.addEventListener('click', backToGame);
        }
        
        if (howToPlayBtn) {
            howToPlayBtn.addEventListener('click', goToHowToPlay);
        }
        
        // ---- ESCAPE KEY SHORTCUT ----
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                backToGame();
            }
        });
        
        // ---- TOAST NOTIFICATION ----
        function showToast(message, duration = 1800) {
            const existingToast = document.querySelector('.custom-toast');
            if (existingToast) existingToast.remove();
            
            const toast = document.createElement('div');
            toast.className = 'custom-toast';
            toast.innerText = message;
            toast.style.cssText = `
                position: fixed;
                bottom: 20%;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #ffaa33, #ff6600);
                color: #0a0010;
                font-weight: bold;
                padding: 12px 24px;
                border-radius: 60px;
                font-family: 'Orbitron', monospace;
                font-size: 0.8rem;
                z-index: 10000;
                border: 1px solid #ffdd99;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                animation: fadeUp 0.3s ease-out;
                white-space: nowrap;
            `;
            document.body.appendChild(toast);
            
            if (!document.querySelector('#toast-keyframes')) {
                const style = document.createElement('style');
                style.id = 'toast-keyframes';
                style.textContent = `
                    @keyframes fadeUp {
                        0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                        15% { opacity: 1; transform: translateX(-50%) translateY(0); }
                        85% { opacity: 1; transform: translateX(-50%) translateY(0); }
                        100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            setTimeout(() => toast.remove(), duration);
        }
        
        // ---- INTERACTIVE CARD EFFECTS ----
        const creditCards = document.querySelectorAll('.credit-card, .thanks-card, .char-credit-card, .creator-card');
        creditCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('h3, h4, p')?.innerText || '';
                showToast(`✨ ${title.substring(0, 50)}`, 1500);
            });
        });
        
        // ---- TECH BADGE INTERACTION ----
        const techBadges = document.querySelectorAll('.tech-badge');
        techBadges.forEach(badge => {
            badge.addEventListener('click', () => {
                showToast(`🛠️ ${badge.innerText} — Core technology`, 1200);
            });
        });
        
        // ---- VERSION CARD INTERACTION ----
        const versionCards = document.querySelectorAll('.version-card');
        versionCards.forEach(card => {
            card.addEventListener('click', () => {
                const version = card.querySelector('.version-number')?.innerText || '';
                showToast(`📦 Battle Arena ${version} — Ready to fight!`, 1500);
            });
        });
        
        // ---- WELCOME TOAST ----
        setTimeout(() => {
            showToast('✨ Created by Izabela & Francisco — Thanks for playing! ✨', 3000);
        }, 500);
        
        // ---- PARALLAX EFFECT ON HEADER ----
        const header = document.querySelector('.header');
        if (header) {
            document.addEventListener('mousemove', (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 8;
                const y = (e.clientY / window.innerHeight - 0.5) * 4;
                header.style.transform = `translate(${x}px, ${y}px)`;
            });
            document.addEventListener('mouseleave', () => {
                header.style.transform = '';
            });
        }
        
        // ---- IFRAME MESSAGE HANDLING ----
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'REQUEST_CLOSE') {
                if (window.parent !== window) {
                    window.parent.postMessage({ type: 'CREDITS_CLOSED' }, '*');
                } else {
                    backToGame();
                }
            }
        });
        
        console.log('🎮 BATTLE ARENA - Credits page | Created by Izabela Dorinne Ronquillo & Francisco Nicolai Lim');
    });
})();