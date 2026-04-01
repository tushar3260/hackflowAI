import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initializes parallax effects for the Hero section.
 * Moves background layers at different speeds relative to scroll.
 */
export const initHeroParallax = (options = {}) => {
    const { container, background, midLayer, foreground } = options;

    // Mobile fallback: Disable or reduce complex parallax
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
        if (!container) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: "bottom top",
                scrub: 1, // Smooth scrubbing
            }
        });

        // Background moves slower (simulated distance)
        if (background) {
            gsap.set(background, { willChange: "transform" });
            tl.to(background, { yPercent: 30, ease: "none" }, 0);
        }

        // Mid layer (particles, etc.) moves at a medium pace
        if (midLayer) {
            gsap.set(midLayer, { willChange: "transform" });
            tl.to(midLayer, { yPercent: 50, ease: "none" }, 0);
        }

        // Foreground elements can move faster or differently if needed, 
        // though usually we just let document flow handle fg.
        if (foreground) {
             gsap.set(foreground, { willChange: "transform" });
             tl.to(foreground, { yPercent: -15, ease: "none" }, 0);
        }

        return () => tl.kill(); 
    });

    mm.add("(max-width: 767px)", () => {
        // Provide a vastly simplified or disabled version for mobile
        if(background && container) {
            gsap.to(background, {
                yPercent: 10,
                ease: "none",
                scrollTrigger: {
                    trigger: container,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }
    });

    return mm; // Return matchMedia instance so it can be reverted if needed standalone
};

/**
 * Initializes subtle background shifts for promo banners.
 */
export const initBannerParallax = (options = {}) => {
    const { container, elements } = options;
    
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
        if (!container || !elements || !elements.length) return;

        elements.forEach((el, index) => {
            if (!el) return;
            gsap.set(el, { willChange: "transform" });
            
            // Alternate movement directions based on index to create dynamic feel
            const yMove = index % 2 === 0 ? 40 : -40;

            gsap.to(el, {
                y: yMove,
                ease: "none",
                scrollTrigger: {
                    trigger: container,
                    start: "top bottom", // Start when container hits bottom of viewport
                    end: "bottom top",   // End when container leaves top
                    scrub: 1,
                }
            });
        });
    });

    return mm;
};

/**
 * Initializes parallax depth shift for cards like the hackathon grid.
 * Applies a slight translation on scroll and handles setting up hover tilt logic.
 */
export const initCardParallax = (options = {}) => {
    const { cards, container } = options;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
        if (!cards || !cards.length || !container) return;

        // 1. Scroll Parallax (Depth Shift)
        cards.forEach((card, index) => {
            if (!card) return;
            
            // Stagger the movement slightly based on index
            const moveAmount = 20 + (index % 3) * 10; 
            
            gsap.set(card, { willChange: "transform" });

            gsap.to(card, {
                y: -moveAmount,
                ease: "none",
                scrollTrigger: {
                    trigger: container,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });

            // 2. Hover Tilt Effect (3D)
            const handleMouseMove = (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate position relative to center (-1 to 1)
                const xPct = (x / rect.width - 0.5) * 2;
                const yPct = (y / rect.height - 0.5) * 2;

                gsap.to(card, {
                    rotationY: xPct * 5, // Small rotation
                    rotationX: -yPct * 5,
                    transformPerspective: 1000,
                    ease: "power2.out",
                    duration: 0.5
                });
            };

            const handleMouseLeave = () => {
                gsap.to(card, {
                    rotationY: 0,
                    rotationX: 0,
                    ease: "power2.out",
                    duration: 0.5
                });
            };

            card.addEventListener('mousemove', handleMouseMove);
            card.addEventListener('mouseleave', handleMouseLeave);

            // Return a cleanup function for hover events specifically if needed
            card._parallaxCleanup = () => {
                card.removeEventListener('mousemove', handleMouseMove);
                card.removeEventListener('mouseleave', handleMouseLeave);
            };
        });
    });

    return mm;
};

/**
 * Cleanup function to safely remove hover listeners attached during card parallax
 */
export const cleanupCardParallax = (cards) => {
    if(!cards || !cards.length) return;
    cards.forEach(card => {
        if(card && card._parallaxCleanup) {
            card._parallaxCleanup();
            delete card._parallaxCleanup;
        }
    });
};

/**
 * Floating effect for elements like logos
 */
export const initFloatingParallax = (options = {}) => {
     const { elements, container } = options;
     const mm = gsap.matchMedia();

     mm.add("(min-width: 768px)", () => {
         if (!elements || !elements.length || !container) return;

         elements.forEach((el, index) => {
             if(!el) return;
             
             // Base float animation
             gsap.to(el, {
                 y: `random(-10, 10)`,
                 duration: `random(2, 4)`,
                 repeat: -1,
                 yoyo: true,
                 ease: "sine.inOut",
                 delay: index * 0.2
             });
             
             // Scroll-based overall slight drift
             gsap.to(el, {
                 yPercent: -20,
                 ease: "none",
                 scrollTrigger: {
                     trigger: container,
                     start: "top bottom",
                     end: "bottom top",
                     scrub: true
                 }
             });
         });
     });
     
     return mm;
}
