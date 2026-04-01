import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const defaultOptions = {
    duration: 0.8,
    ease: "power3.out",
    triggerStart: "top 85%",
    once: true,
};

export const animateFadeUp = (element, options = {}) => {
    if (!element) return;
    
    const config = { ...defaultOptions, ...options };
    
    gsap.fromTo(element, 
        { opacity: 0, y: 40 },
        {
            opacity: 1,
            y: 0,
            duration: config.duration,
            ease: config.ease,
            delay: config.delay || 0,
            scrollTrigger: {
                trigger: element,
                start: config.triggerStart,
                toggleActions: "play none none none",
                once: config.once
            }
        }
    );
};

export const animateSlideLeft = (element, options = {}) => {
    if (!element) return;
    
    const config = { ...defaultOptions, ...options };
    
    gsap.fromTo(element, 
        { opacity: 0, x: -40 },
        {
            opacity: 1,
            x: 0,
            duration: config.duration,
            ease: config.ease,
            delay: config.delay || 0,
            scrollTrigger: {
                trigger: element,
                start: config.triggerStart,
                toggleActions: "play none none none",
                once: config.once
            }
        }
    );
};

export const animateSlideRight = (element, options = {}) => {
    if (!element) return;
    
    const config = { ...defaultOptions, ...options };
    
    gsap.fromTo(element, 
        { opacity: 0, x: 40 },
        {
            opacity: 1,
            x: 0,
            duration: config.duration,
            ease: config.ease,
            delay: config.delay || 0,
            scrollTrigger: {
                trigger: element,
                start: config.triggerStart,
                toggleActions: "play none none none",
                once: config.once
            }
        }
    );
};

export const animateScaleIn = (element, options = {}) => {
    if (!element) return;
    
    const config = { ...defaultOptions, ...options };
    
    gsap.fromTo(element, 
        { opacity: 0, scale: 0.9 },
        {
            opacity: 1,
            scale: 1,
            duration: config.duration,
            ease: config.ease,
            delay: config.delay || 0,
            scrollTrigger: {
                trigger: element,
                start: config.triggerStart,
                toggleActions: "play none none none",
                once: config.once
            }
        }
    );
};

export const animateStaggerGrid = (elements, parentTrigger, options = {}) => {
    if (!elements || elements.length === 0 || !parentTrigger) return;
    
    const config = { ...defaultOptions, ...options };
    
    gsap.fromTo(elements,
        { opacity: 0, y: 40 },
        {
            opacity: 1,
            y: 0,
            duration: config.duration,
            ease: config.ease,
            stagger: config.stagger || 0.08,
            scrollTrigger: {
                trigger: parentTrigger,
                start: config.triggerStart,
                toggleActions: "play none none none",
                once: config.once
            }
        }
    );
};
