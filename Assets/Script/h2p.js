// How to Play page - Fully Responsive Interactive Guide
(function() {
    'use strict';
    
    // Wait for DOM and all assets to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Check if we're on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(navigator.userAgent) || window.innerWidth < 768;
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // DOM Elements
        const fightBtn = document.getElementById('vibeBtn');
        const creditsBtn = document.getElementById('creditsBtn');
        const header = document.querySelector('.header');
        
        // ---- NAVIGATION FUNCTIONS ----
        function backToGame() {
            try {
                if (window.parent !== window) {
                    window.parent.postMessage({ type: 'CLOSE_HELP', source: 'howto' }, '*');
                } else {
                    // Try multiple paths for compatibility
                    const paths = ['../../index.html', '../index.html', 'index.html'];
                    let success = false;
                    
                    for (const path of paths) {
                        const testUrl = new URL(path, window.location.href);
                        if (testUrl.protocol === 'file:' || testUrl.hostname === window.location.hostname) {
                            window.location.href = path;
                            success = true;
                            break;
                        }
                    }
                    
                    if (!success) {
                        window.location.href = '../../index.html';
                    }
                }
            } catch (error) {
                console.warn('Navigation error:', error);
                window.location.href = '../../index.html';
            }
        }
        
        function goToCredits() {
            try {
                if (window.parent !== window) {
                    window.parent.postMessage({ type: 'OPEN_CREDITS', source: 'howto' }, '*');
                } else {
                    window.location.href = 'credits.html';
                }
            } catch (error) {
                console.warn('Credits navigation error:', error);
                window.location.href = 'credits.html';
            }
        }
        
        // Attach button events with touch support
        if (fightBtn) {
            fightBtn.addEventListener(isTouch ? 'touchstart' : 'click', function(e) {
                e.preventDefault();
                backToGame();
            });
        }
        
        if (creditsBtn) {
            creditsBtn.addEventListener(isTouch ? 'touchstart' : 'click', function(e) {
                e.preventDefault();
                goToCredits();
            });
        }
        
        // ---- RESPONSIVE TOAST NOTIFICATION ----
        function showToast(message, duration = 2000) {
            const existingToast = document.querySelector('.custom-toast');
            if (existingToast) existingToast.remove();
            
            const toast = document.createElement('div');
            toast.className = 'custom-toast';
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'polite');
            toast.innerText = message;
            
            // Responsive toast styles
            const isSmallScreen = window.innerWidth < 500;
            const isTablet = window.innerWidth >= 500 && window.innerWidth < 768;
            
            let fontSize = '0.8rem';
            let padding = '12px 24px';
            let bottom = '20%';
            
            if (isSmallScreen) {
                fontSize = '0.7rem';
                padding = '10px 18px';
                bottom = '15%';
            } else if (isTablet) {
                fontSize = '0.75rem';
                padding = '11px 22px';
            }
            
            toast.style.cssText = `
                position: fixed;
                bottom: ${bottom};
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #ffaa33, #ff6600);
                color: #0a0010;
                font-weight: bold;
                padding: ${padding};
                border-radius: 60px;
                font-family: 'Orbitron', monospace;
                font-size: ${fontSize};
                z-index: 10000;
                border: 1px solid #ffdd99;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                animation: fadeUp 0.3s ease-out;
                white-space: normal;
                max-width: 90%;
                text-align: center;
                line-height: 1.4;
                backdrop-filter: blur(4px);
            `;
            
            document.body.appendChild(toast);
            
            // Add keyframes if not exists
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
            
            setTimeout(() => {
                if (toast && toast.parentNode) toast.remove();
            }, duration);
        }
        
        // ---- FIGHTER CARD INTERACTION (Responsive touch/click) ----
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
            const eventType = isTouch ? 'touchstart' : 'click';
            
            card.addEventListener(eventType, (e) => {
                // Prevent double-firing on touch devices
                if (isTouch && e.type === 'touchstart') {
                    e.preventDefault();
                }
                
                const fighter = card.getAttribute('data-fighter');
                if (fighter && fighterTips[fighter]) {
                    showToast(fighterTips[fighter], 2200);
                }
                
                // Visual feedback
                card.style.transform = 'scale(0.97)';
                setTimeout(() => { 
                    if (card) card.style.transform = ''; 
                }, 150);
                
                // Add haptic feedback on supported devices
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(50);
                }
            });
        });
        
        // ---- CONTROL BUTTON INTERACTIONS ----
        const ctrlBtns = document.querySelectorAll('.ctrl-btn');
        ctrlBtns.forEach(btn => {
            const eventType = isTouch ? 'touchstart' : 'click';
            
            btn.addEventListener(eventType, (e) => {
                if (isTouch && e.type === 'touchstart') {
                    e.preventDefault();
                }
                e.stopPropagation();
                
                const kbd = btn.querySelector('kbd');
                if (kbd) {
                    kbd.style.transform = 'scale(0.9)';
                    setTimeout(() => { 
                        if (kbd) kbd.style.transform = ''; 
                    }, 100);
                }
                
                const btnText = btn.querySelector('span')?.innerText || '';
                let message = '';
                let duration = 1800;
                
                if (btnText.includes('SUPER')) {
                    message = '🌟 SUPER requires 100% gauge! Deal/take damage to charge it.';
                } else if (btnText.includes('BLOCK')) {
                    message = '🛡️ Block reduces damage and builds super gauge!';
                } else if (btnText.includes('PUNCH')) {
                    message = '💥 Punch: Fast attack, medium damage. Great for combos!';
                } else if (btnText.includes('KICK')) {
                    message = '🦶 Kick: Longer range, good for poking!';
                } else if (btnText.includes('MOVE')) {
                    message = '🎮 Move to control spacing and positioning!';
                } else if (btnText.includes('JUMP')) {
                    message = '⬆️ Jump to avoid attacks and approach from above!';
                } else {
                    message = '⚡ Press this button during battle!';
                    duration = 1200;
                }
                
                showToast(message, duration);
                
                // Haptic feedback
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(30);
                }
            });
        });
        
        // ---- MODE CARDS INTERACTION ----
        const modeCards = document.querySelectorAll('.mode-card');
        modeCards.forEach(card => {
            const eventType = isTouch ? 'touchstart' : 'click';
            
            card.addEventListener(eventType, (e) => {
                if (isTouch && e.type === 'touchstart') {
                    e.preventDefault();
                }
                
                const title = card.querySelector('h3')?.innerText || '';
                let message = '';
                
                if (title.includes('VS AI')) {
                    message = '🤖 VS AI: Battle against 4 difficulty levels! Available from main menu.';
                } else if (title.includes('2 PLAYER')) {
                    message = '👥 2 Player Mode: Challenge a friend on the same keyboard!';
                } else {
                    message = `🎮 ${title} mode — available from main menu!`;
                }
                
                showToast(message, 2000);
                
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(30);
                }
            });
        });
        
        // ---- TIP CARDS INTERACTION ----
        const tipCards = document.querySelectorAll('.tip-card');
        tipCards.forEach(card => {
            const eventType = isTouch ? 'touchstart' : 'click';
            
            card.addEventListener(eventType, (e) => {
                if (isTouch && e.type === 'touchstart') {
                    e.preventDefault();
                }
                
                const title = card.querySelector('h4')?.innerText || '';
                let message = '';
                
                if (title.includes('COMBO')) {
                    message = '💥 COMBO TIP: Rapid hits build combo counter. Higher combos = more pressure!';
                } else if (title.includes('BLOCK')) {
                    message = '🛡️ BLOCK TIP: Hold block to reduce damage and build SUPER GAUGE!';
                } else if (title.includes('SUPER')) {
                    message = '🌟 SUPER TIP: Guard break + invincible frames. Best used when opponent attacks!';
                } else {
                    message = `💡 TIP: ${title} — master this to win battles!`;
                }
                
                showToast(message, 2200);
                
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(30);
                }
            });
        });
        
        // ---- RESPONSIVE PARALLAX (Disabled on mobile for performance) ----
        if (header && !isMobile && window.innerWidth > 768) {
            let ticking = false;
            
            document.addEventListener('mousemove', (e) => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const x = (e.clientX / window.innerWidth - 0.5) * 6;
                        const y = (e.clientY / window.innerHeight - 0.5) * 3;
                        header.style.transform = `translate(${x}px, ${y}px)`;
                        ticking = false;
                    });
                    ticking = true;
                }
            });
            
            document.addEventListener('mouseleave', () => {
                header.style.transform = '';
            });
        } else if (header && isMobile) {
            // Simple static style for mobile
            header.style.transition = 'none';
        }
        
        // ---- RESPONSIVE WELCOME TOAST (Delayed based on device) ----
        const welcomeDelay = isMobile ? 1000 : 500;
        setTimeout(() => {
            const welcomeMessage = isMobile 
                ? '✨ Tap any card for tips! Swipe to explore ✨'
                : '✨ Click any fighter, control, or card for tips! ✨';
            showToast(welcomeMessage, 2800);
        }, welcomeDelay);
        
        // ---- KEYBOARD SHORTCUTS (Desktop only) ----
        if (!isTouch) {
            document.addEventListener('keydown', (e) => {
                // ESC key to go back
                if (e.key === 'Escape') {
                    e.preventDefault();
                    backToGame();
                }
                
                // M key for mute reminder
                if (e.key === 'm' || e.key === 'M') {
                    showToast('🔇 Mute works IN-GAME (press M during actual gameplay)', 1800);
                }
                
                // C key for credits
                if (e.key === 'c' || e.key === 'C') {
                    e.preventDefault();
                    goToCredits();
                }
                
                // H key for help (reloads current page)
                if (e.key === 'h' || e.key === 'H') {
                    showToast('📖 You\'re already on the How to Play page!', 1500);
                }
            });
        }
        
        // ---- IFRAME MESSAGE HANDLING ----
        window.addEventListener('message', function(event) {
            // Security: Only accept messages from same origin
            if (event.origin !== window.location.origin && event.origin !== 'null') {
                return;
            }
            
            if (event.data && event.data.type === 'REQUEST_CLOSE') {
                if (window.parent !== window) {
                    window.parent.postMessage({ type: 'HELP_CLOSED' }, '*');
                } else {
                    backToGame();
                }
            }
        });
        
        // ---- RESPONSIVE RESIZE HANDLER ----
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Re-check mobile status on resize
                const newIsMobile = window.innerWidth < 768;
                
                // Adjust toast positioning if needed
                const toast = document.querySelector('.custom-toast');
                if (toast) {
                    toast.remove();
                }
                
                console.log(`Window resized: ${window.innerWidth}x${window.innerHeight} | Mobile: ${newIsMobile}`);
            }, 250);
        });
        
        // ---- PERFORMANCE: Lazy load any heavy content ----
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });
            
            document.querySelectorAll('.fighter-card, .mode-card, .tip-card').forEach(el => {
                observer.observe(el);
            });
        }
        
        // ---- CONSOLE LOGS FOR DEBUGGING (Optional, remove in production) ----
        console.log('🔥 BATTLE ARENA - How to Play | Fully Responsive Guide Loaded');
        console.log(`📱 Device: ${isMobile ? 'Mobile' : 'Desktop'} | Touch: ${isTouch ? 'Yes' : 'No'}`);
        console.log(`📐 Viewport: ${window.innerWidth}x${window.innerHeight}`);
        console.log('📍 Navigation: Back to Game -> ../../index.html | Credits -> credits.html');
        
        // Add touch-friendly CSS class to body
        if (isTouch) {
            document.body.classList.add('touch-device');
        }
    });
})();