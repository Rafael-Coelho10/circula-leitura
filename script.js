document.addEventListener('DOMContentLoaded', () => {

    // --- UTILITIES ---
    // Helper para verificar se um elemento existe antes de usá-lo
    const getElement = (selector, parent = document) => parent.querySelector(selector);
    const getAllElements = (selector, parent = document) => parent.querySelectorAll(selector);

    // --- SMOOTH SCROLLING FOR NAVIGATION LINKS ---
    // Seleciona todos os links que começam com '#'
    getAllElements('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Previne o comportamento padrão do link

            const targetId = this.getAttribute('href'); // Obtém o ID do alvo (ex: '#sobre')
            const targetElement = getElement(targetId); // Encontra o elemento alvo

            if (targetElement) {
                // Calcula a altura da navbar dinamicamente
                const navbarWrapper = getElement('.navbar-wrapper');
                const navbarHeight = navbarWrapper ? navbarWrapper.offsetHeight : 0;
                
                // Posição de rolagem com offset para a navbar e padding extra
                const offsetPosition = targetElement.offsetTop - navbarHeight - 20; 

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth' // Rolagem suave
                });

                // Fecha o menu mobile se estiver aberto após clicar em um link
                closeMobileMenu();
            }
        });
    });

    // --- NAVBAR BACKGROUND CHANGE ON SCROLL ---
    const navbarWrapper = getElement('.navbar-wrapper');
    // Verifica se a navbar existe antes de adicionar o listener
    if (navbarWrapper) {
        let scrollTimeoutNavbar; // Variável para controlar o timeout do scroll

        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeoutNavbar); // Limpa o timeout anterior para otimização
            scrollTimeoutNavbar = setTimeout(() => {
                // Adiciona ou remove a classe 'scrolled' com base na posição de rolagem
                if (window.scrollY > 50) { // Se o scroll for maior que 50px
                    navbarWrapper.classList.add('scrolled');
                } else {
                    navbarWrapper.classList.remove('scrolled');
                }
            }, 100); // Pequeno atraso para evitar execuções excessivas durante a rolagem
        }, { passive: true }); // Usar { passive: true } para melhor performance de scroll
    }

    // --- MOBILE MENU (OFF-CANVAS) LOGIC ---
    const mobileMenuToggle = getElement('#mobile-menu');
    const mobileNavContainer = getElement('#mobile-nav');
    const closeMenuButton = getElement('#close-menu');
    const menuOverlay = getElement('#menu-overlay');
    const mobileNavLinks = getAllElements('#mobile-nav .mobile-nav-links a');

    // Função para abrir o menu mobile
    function openMobileMenu() {
        if (mobileMenuToggle && mobileNavContainer && menuOverlay) {
            mobileMenuToggle.classList.add('is-active');
            mobileNavContainer.classList.add('is-active');
            menuOverlay.classList.add('is-active');
            document.body.classList.add('no-scroll'); // Previne rolagem do corpo
            // Define aria-hidden para acessibilidade
            mobileNavContainer.setAttribute('aria-hidden', 'false');
            menuOverlay.setAttribute('aria-hidden', 'false');
        }
    }

    // Função para fechar o menu mobile
    function closeMobileMenu() {
        if (mobileMenuToggle && mobileNavContainer && menuOverlay) {
            mobileMenuToggle.classList.remove('is-active');
            mobileNavContainer.classList.remove('is-active');
            menuOverlay.classList.remove('is-active');
            document.body.classList.remove('no-scroll'); // Permite rolagem do corpo
            // Define aria-hidden para acessibilidade
            mobileNavContainer.setAttribute('aria-hidden', 'true');
            menuOverlay.setAttribute('aria-hidden', 'true');
        }
    }

    // Adiciona listeners de evento para o menu mobile, apenas se os elementos existirem
    if (mobileMenuToggle && mobileNavContainer && closeMenuButton && menuOverlay) {
        mobileMenuToggle.addEventListener('click', openMobileMenu);
        closeMenuButton.addEventListener('click', closeMobileMenu);
        menuOverlay.addEventListener('click', closeMobileMenu);

        // Fecha o menu quando um link interno é clicado no menu mobile
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Inicializa o estado aria-hidden para o menu mobile e overlay
        mobileNavContainer.setAttribute('aria-hidden', 'true');
        menuOverlay.setAttribute('aria-hidden', 'true');
    }

    // --- INFINITE CAROUSEL LOGIC ---
    const carouselTrack = getElement('#carouselTrack');
    if (carouselTrack) {
        const carouselItems = Array.from(carouselTrack.children);
        const itemCount = carouselItems.length;

        // Duplica os itens para criar o efeito de rolagem infinita
        // Cria um fragmento de documento para melhor performance ao adicionar múltiplos clones
        const fragment = document.createDocumentFragment();
        carouselItems.forEach(item => {
            fragment.appendChild(item.cloneNode(true));
        });
        carouselTrack.appendChild(fragment); // Adiciona todos os clones de uma vez

        // Calcula a largura total de um conjunto de slides + gaps
        // Certifique-se de que as variáveis CSS são números válidos
        const itemWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--carousel-item-width')) || 0;
        const itemGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--carousel-item-gap')) || 0;
        
        // A distância total para rolar é o dobro do conjunto original para que a duplicação se encaixe perfeitamente
        // Se 6 itens, a distância é a largura de 6 itens + 6 gaps
        const scrollDistance = -(itemCount * (itemWidth + itemGap)); 

        // Define a variável CSS para a distância de rolagem da animação
        carouselTrack.style.setProperty('--scroll-distance', `${scrollDistance}px`);
        
        // Ajusta a duração da animação com base na quantidade de itens para manter a velocidade constante
        const baseDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--carousel-animation-duration')) || 50;
        // Ajusta a duração para que a velocidade seja a mesma, independente do número de itens
        // Ex: se 6 itens originais (e duplicados, total de 12), a animação completa leva 50s.
        // Se houverem 3 itens originais (e duplicados, total de 6), a animação deve ser 25s.
        // Isso assume que '--carousel-animation-duration' é para 6 itens.
        const originalItemCountAssumption = 6; // Base para o cálculo da duração
        carouselTrack.style.animationDuration = `${baseDuration * (itemCount / originalItemCountAssumption)}s`;
    }

    // --- SCROLL REVEAL LOGIC FOR '.scroll-animate' ELEMENTS ---
    const scrollAnimateElements = getAllElements('.scroll-animate');

    // Callback para o IntersectionObserver
    const handleIntersection = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                // Remove 'is-visible' quando o elemento SAI da tela, permitindo a repetição da animação
                entry.target.classList.remove('is-visible');
            }
        });
    };

    // Configuração do IntersectionObserver
    const scrollObserver = new IntersectionObserver(handleIntersection, {
        root: null, // viewport como root
        rootMargin: '0px',
        threshold: 0.1 // 10% do elemento visível é suficiente para acionar
    });

    // Observa todos os elementos com a classe .scroll-animate
    scrollAnimateElements.forEach(element => {
        scrollObserver.observe(element);
    });
    
});