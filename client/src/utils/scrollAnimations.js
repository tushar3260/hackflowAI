import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Animate an element to fade in and slide up when scrolling into view.
 * @param {HTMLElement} element - The DOM element to animate
 * @param {Object} options - GSAP options overrides
 */
export const animateCardReveal = (element, options = {}) => {
    if (!element) return;

    gsap.fromTo(element,
        {
            y: 50,
            opacity: 0,
            scale: 0.95
        },
        {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
                trigger: element,
                start: "top 85%", // Start when top of element hits 85% of viewport
                toggleActions: "play none none reverse",
                ...options.scrollTrigger
            },
            ...options
        }
    );
};

/**
 * Stagger animate a grid of child elements.
 * @param {HTMLElement} container - The parent container
 * @param {string} childSelector - CSS selector for children (e.g., '.card')
 */
export const animateStaggerGrid = (container, childSelector = '> *') => {
    if (!container) return;

    let children;
    if (childSelector === '> *') {
        children = Array.from(container.children);
    } else {
        children = container.querySelectorAll(childSelector);
    }

    gsap.fromTo(children,
        {
            y: 30,
            opacity: 0
        },
        {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: container,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        }
    );
};

/**
 * Animate a number counting up from 0 to its target value.
 * @param {HTMLElement} element - Element containing the number
 * @param {number} endValue - Final value
 * @param {string} suffix - Optional suffix (e.g., '+', '%')
 */
export const animateNumberCounter = (element, endValue, suffix = '') => {
    if (!element) return;

    const obj = { val: 0 };

    gsap.to(obj, {
        val: endValue,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
            trigger: element,
            start: "top 90%",
            once: true // Only run once
        },
        onUpdate: () => {
            element.innerText = Math.floor(obj.val) + suffix;
        }
    });
};

/**
 * Create a parallax scrolling effect on an element.
 * @param {HTMLElement} element - The element to move
 * @param {number} yDistance - Max distance to move in pixels (negative to move up)
 */
export const animateParallax = (element, yDistance = -100) => {
    if (!element) return;

    gsap.to(element, {
        y: yDistance,
        ease: "none",
        scrollTrigger: {
            trigger: element,
            start: "top bottom", // Start when top of element hits bottom of viewport
            end: "bottom top",   // End when bottom of element hits top of viewport
            scrub: true          // Link animation smooth directly to scrollbar
        }
    });
};

/**
 * Animate a continuous glow pulse effect triggered by scroll.
 * @param {HTMLElement} element - The element to glow
 * @param {string} color - Hex color for box-shadow
 */
export const animateGlowPulse = (element, color = '#00f3ff') => {
    if (!element) return;

    gsap.to(element, {
        boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
        repeat: -1,
        yoyo: true,
        duration: 1.5,
        ease: "sine.inOut",
        scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play pause resume pause"
        }
    });
};

/*
USAGE EXAMPLES:

// In a React Component:
import { useEffect, useRef } from 'react';
import { animateCardReveal, animateStaggerGrid } from '../utils/scrollAnimations';

const MySection = () => {
    const cardRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        animateCardReveal(cardRef.current);
        animateStaggerGrid(gridRef.current, '.grid-item');
    }, []);

    return (
        <div>
            <div ref={cardRef} className="card">Hello</div>
            <div ref={gridRef} className="grid">
                <div className="grid-item">1</div>
                <div className="grid-item">2</div>
            </div>
        </div>
    );
};
*/
