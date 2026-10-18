/* ================================================================
   STUDIO EVOLUTION TECH · efeitos (fundo vivo, botões, cartões, textos)
   ================================================================ */
(function () {
    const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const toque = matchMedia('(hover: none)').matches;

    /* ===== 1) Fundo: rede de partículas que se conectam (e fogem do mouse) ===== */
    const tela = document.getElementById('rede');
    if (tela && !calmo) {
        const ctx = tela.getContext('2d');
        let L, A, pontos = [], mouse = { x: -999, y: -999 };
        const dpr = Math.min(devicePixelRatio || 1, 2);
        function medir() {
            L = innerWidth; A = innerHeight;
            tela.width = L * dpr; tela.height = A * dpr; tela.style.width = L + 'px'; tela.style.height = A + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const n = Math.round(Math.min(110, L * A / 14000));
            pontos = Array.from({ length: n }, () => ({ x: Math.random() * L, y: Math.random() * A, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6 }));
        }
        medir(); addEventListener('resize', medir);
        addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
        (function quadro() {
            ctx.clearRect(0, 0, L, A);
            for (const p of pontos) {
                const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
                if (d < 140) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > L) p.vx *= -1;
                if (p.y < 0 || p.y > A) p.vy *= -1;
            }
            for (let i = 0; i < pontos.length; i++) {
                const a = pontos[i];
                for (let j = i + 1; j < pontos.length; j++) {
                    const b = pontos[j], d = Math.hypot(a.x - b.x, a.y - b.y);
                    if (d < 130) { ctx.strokeStyle = `rgba(56,189,248,${(1 - d / 130) * .28})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
                }
                const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
                if (dm < 200) { ctx.strokeStyle = `rgba(34,211,238,${(1 - dm / 200) * .5})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
                ctx.fillStyle = 'rgba(147,197,253,.85)'; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
            }
            requestAnimationFrame(quadro);
        })();
    }

    /* ===== 2) Luz que acompanha o cursor ===== */
    const luz = document.querySelector('.cursor-luz');
    if (luz && !toque) addEventListener('pointermove', e => { luz.style.opacity = 1; luz.style.left = e.clientX + 'px'; luz.style.top = e.clientY + 'px'; }, { passive: true });

    /* ===== 3) Botões: brilho no ponto do mouse + efeito magnético ===== */
    document.querySelectorAll('.botao').forEach(b => {
        b.addEventListener('pointermove', e => {
            const r = b.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
            b.style.setProperty('--mx', x + 'px'); b.style.setProperty('--my', y + 'px');
            if (!toque && !calmo) b.style.transform = `translate(${(x - r.width / 2) * .15}px, ${(y - r.height / 2) * .25}px)`;
        });
        b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });

    /* ===== 4) Cartões de vidro: luz que segue o mouse + inclinação 3D ===== */
    document.querySelectorAll('.vidro').forEach(c => {
        c.addEventListener('pointermove', e => {
            const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
            c.style.setProperty('--x', x + 'px'); c.style.setProperty('--y', y + 'px');
            if (c.dataset.inclinar !== undefined && !toque && !calmo) c.style.transform = `perspective(900px) rotateX(${(y / r.height - .5) * -8}deg) rotateY(${(x / r.width - .5) * 8}deg) translateY(-6px)`;
        });
        c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });

    /* ===== 5) Aparecer ao rolar ===== */
    const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); obs.unobserve(e.target); } }), { threshold: .12 });
    document.querySelectorAll('.revelar').forEach((el, i) => { el.style.transitionDelay = (+el.dataset.atraso || 0) + 's'; obs.observe(el); });

    /* ===== 6) Texto digitando (palavras que se trocam) ===== */
    document.querySelectorAll('[data-digitar]').forEach(el => {
        const palavras = el.dataset.digitar.split('|');
        let p = 0, c = 0, apagando = false;
        if (calmo) { el.textContent = palavras[0]; return; }
        (function passo() {
            const w = palavras[p];
            el.textContent = w.slice(0, c);
            if (!apagando && c < w.length) { c++; setTimeout(passo, 70); }
            else if (!apagando) { apagando = true; setTimeout(passo, 1800); }
            else if (c > 0) { c--; setTimeout(passo, 35); }
            else { apagando = false; p = (p + 1) % palavras.length; setTimeout(passo, 300); }
        })();
    });

    /* ===== 7) Números que contam ===== */
    const cont = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, fim = +el.dataset.contar, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
        const t0 = performance.now();
        (function f(t) { const k = Math.min(1, (t - t0) / 1400); el.textContent = pre + Math.round(fim * (1 - Math.pow(1 - k, 3))).toLocaleString('pt-BR') + suf; if (k < 1) requestAnimationFrame(f); })(t0);
        cont.unobserve(el);
    }), { threshold: .5 });
    document.querySelectorAll('[data-contar]').forEach(el => cont.observe(el));

    /* ===== 8) Código que se escreve sozinho no terminal da capa ===== */
    const term = document.getElementById('codigo');
    if (term) {
        const linhas = term.dataset.linhas.split('\n');
        term.innerHTML = '';
        let i = 0;
        (function prox() {
            if (i >= linhas.length) { setTimeout(() => { term.innerHTML = ''; i = 0; prox(); }, 4000); return; }
            const d = document.createElement('div'); d.innerHTML = linhas[i]; term.appendChild(d);
            d.animate([{ opacity: 0, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 300, fill: 'both' });
            i++; setTimeout(prox, calmo ? 0 : 420);
        })();
    }

    /* ===== 9) Topo some ao descer e volta ao subir ===== */
    let ultimo = 0; const topo = document.querySelector('.topo');
    addEventListener('scroll', () => { const y = scrollY; if (topo) topo.style.transform = y > ultimo && y > 300 ? 'translateY(-100%)' : ''; ultimo = y; }, { passive: true });
    if (topo) topo.style.transition = 'transform .35s ease';
})();
