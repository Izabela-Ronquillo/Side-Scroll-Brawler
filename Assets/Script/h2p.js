// How to Play page - Interactive micro-experiences + Back to Game navigation
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const fightBtn = document.getElementById('vibeBtn');
        
        // ---- BACK TO GAME FUNCTIONALITY ----
        function backToGame() {
            if (window.parent !== window) {
                window.parent.postMessage({ type: 'CLOSE_HELP', source: 'howto' }, '*');
            } else {
                // Navigate back to the main game (index.html in SIDEBRAWL root)
                // Current path: /SIDEBRAWL/Assets/index/h2p.html
                // Need to go up 3 levels to reach SIDEBRAWL root
                window.location.href = '../../../index.html';
            }
        }
        
        if (fightBtn) {
            fightBtn.addEventListener('click', backToGame);
        }
        
        // ---- ESCAPE KEY SHORTCUT ----
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                backToGame();
            }
            
            if (e.key === 'm' || e.key === 'M') {
                showToast('🔇 Mute works IN-GAME (press M during fight)', 1500);
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
        
        // ---- FIGHTER CARD INTERACTION ----
        const fighterCards = document.querySelectorAll('.fighter-card');
        const fighterTips = {
            kazuya: '🔥 Kazuya: Balanced fighter with powerful punches. Super: INFERNO STRIKE!',
            reiji: '🌑 Reiji: High mobility, shadow techniques. Super: VOID RUPTURE!',
            sakura: '🌸 Sakura: Fastest combos in the game. Super: PETAL STORM!',
            darius: '⚙️ Darius: Heavy armor, massive damage. Super: TITAN CRASH!',
            lyra: '⚡ Lyra: Elemental mage with long range. Super: THUNDER SURGE!',
            kira: '👻 Kira: Teleport tricks, unpredictable attacks. Super: PHASE SHIFT!'
        };
        
        fighterCards.forEach(card => {
            card.addEventListener('click', () => {
                const fighter = card.getAttribute('data-fighter');
                if (fighter && fighterTips[fighter]) {
                    showToast(fighterTips[fighter], 2000);
                }
                card.style.transform = 'scale(0.98)';
                setTimeout(() => { card.style.transform = ''; }, 150);
            });
        });
        
        // ---- CONTROL BUTTON INTERACTIONS ----
        const ctrlBtns = document.querySelectorAll('.ctrl-btn');
        ctrlBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const kbd = btn.querySelector('kbd');
                if (kbd) {
                    kbd.style.transform = 'scale(0.9)';
                    setTimeout(() => { kbd.style.transform = ''; }, 100);
                }
                
                const btnText = btn.querySelector('span')?.innerText || '';
                if (btnText.includes('SUPER')) {
                    showToast('🌟 SUPER requires 100% gauge! Deal/take damage to charge it.', 1800);
                } else if (btnText.includes('BLOCK')) {
                    showToast('🛡️ Block reduces damage and builds super gauge!', 1500);
                } else if (btnText.includes('PUNCH') || btnText.includes('KICK')) {
                    showToast('💥 Land hits to build combo meter and super gauge!', 1500);
                }
            });
        });
        
        // ---- MODE CARDS INTERACTION ----
        const modeCards = document.querySelectorAll('.mode-card');
        modeCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('h3')?.innerText || '';
                showToast(`🎮 ${title} mode — available from main menu!`, 1800);
            });
        });
        
        // ---- TIP CARDS INTERACTION ----
        const tipCards = document.querySelectorAll('.tip-card');
        tipCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('h4')?.innerText || '';
                showToast(`💡 TIP: ${title} — master this to win!`, 1800);
            });
        });
        
        // ---- WELCOME TOAST ----
        setTimeout(() => {
            showToast('✨ Click any fighter, control, or card for tips!', 2800);
        }, 500);
        
        // ---- IFRAME MESSAGE HANDLING ----
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'REQUEST_CLOSE') {
                if (window.parent !== window) {
                    window.parent.postMessage({ type: 'HELP_CLOSED' }, '*');
                } else {
                    backToGame();
                }
            }
        });
        
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
        
        console.log('🔥 BATTLE ARENA - How to Play | Interactive guide loaded');
    });
})();