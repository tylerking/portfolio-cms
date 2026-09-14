export const supportsOklch = () => CSS.supports('color', 'oklch(50% 0.1 200)')

export const supportsPopover = () => 'popover' in HTMLElement.prototype

export const supportsViewTransitions = () => typeof document.startViewTransition === 'function'

export const supportsContrastColor = () => CSS.supports('color', 'contrast-color(red)')

export const supportsWebAnimations = () => 'animate' in Element.prototype
