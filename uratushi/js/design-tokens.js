/**
 * ============================================
 * URATUSHI DESIGN TOKENS - JAVASCRIPT
 * ============================================
 * Version: 1.0
 * Date: 04.04.2026
 * 
 * Use these tokens in JavaScript for dynamic
 * styling and programmatic access to design values.
 * ============================================
 */

export const DesignTokens = {
    // === COLORS ===
    colors: {
        // Primary
        primary: '#8B5A2B',
        primaryDark: '#6B4423',
        primaryLight: '#C4956A',
        
        // Secondary & Accent
        secondary: '#2E7D32',
        accentGold: '#D4AF37',
        accentCopper: '#B87333',
        
        // Semantic
        success: '#43A047',
        successLight: '#66BB6A',
        warning: '#F9A825',
        warningLight: '#FDD835',
        danger: '#C62828',
        dangerLight: '#EF5350',
        info: '#1976D2',
        infoLight: '#42A5F5',
        
        // Neutrals
        bg: '#FAF7F2',
        surface: '#FFFFFF',
        border: '#E8E0D5',
        borderLight: '#F5F0E8',
        borderDark: '#D4CCC0',
        
        // Text
        textPrimary: '#2D2A26',
        textSecondary: '#6B6560',
        textMuted: '#9E9891',
        textInverse: '#FFFFFF',
        textLink: '#8B5A2B',
        
        // Zone backgrounds
        zoneMainBg: '#F5EDE3',
        zoneMiddleBg: '#E8E0D5',
        zoneBasementBg: '#2D2A26',
        zoneDancefloorBg: '#1A1816',
        
        // Overlays
        overlay: 'rgba(0, 0, 0, 0.5)',
        overlayLight: 'rgba(0, 0, 0, 0.3)',
        overlayDark: 'rgba(0, 0, 0, 0.7)',
    },
    
    // === TYPOGRAPHY ===
    typography: {
        fonts: {
            heading: "'Playfair Display', Georgia, 'Times New Roman', serif",
            body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        },
        
        weights: {
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
        
        sizes: {
            display: '48px',
            h1: '36px',
            h2: '28px',
            h3: '22px',
            h4: '18px',
            h5: '16px',
            bodyLg: '18px',
            body: '16px',
            bodySm: '14px',
            caption: '12px',
            overline: '11px',
        },
        
        lineHeights: {
            none: 1,
            tight: 1.1,
            snug: 1.25,
            normal: 1.5,
            relaxed: 1.625,
            loose: 1.75,
        },
        
        letterSpacing: {
            tighter: '-0.02em',
            tight: '-0.01em',
            normal: '0',
            wide: '0.02em',
            wider: '0.05em',
            widest: '0.08em',
        },
    },
    
    // === SPACING (8px Grid) ===
    spacing: {
        0: '0px',
        px: '1px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        11: '44px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        32: '128px',
    },
    
    // === BORDER RADIUS ===
    borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
        full: '9999px',
    },
    
    // === SHADOWS ===
    shadows: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
    },
    
    // === ANIMATIONS ===
    animations: {
        durations: {
            fast: '100ms',
            normal: '200ms',
            slow: '300ms',
            slower: '400ms',
            slowest: '500ms',
        },
        
        easings: {
            default: 'cubic-bezier(0.4, 0, 0.2, 1)',
            'in': 'cubic-bezier(0.4, 0, 1, 1)',
            out: 'cubic-bezier(0, 0, 0.2, 1)',
            'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        },
    },
    
    // === LAYOUT ===
    layout: {
        containerMax: '1280px',
        headerHeight: '72px',
        headerHeightMobile: '64px',
        sidebarWidth: '280px',
        
        hallMapHeights: {
            mobile: '400px',
            tablet: '450px',
            desktop: '550px',
        },
    },
    
    // === Z-INDEX ===
    zIndex: {
        base: 0,
        dropdown: 100,
        sticky: 200,
        fixed: 300,
        modalBackdrop: 400,
        modal: 500,
        popover: 600,
        tooltip: 700,
        notification: 800,
    },
    
    // === TABLE STATUS ===
    tableStatus: {
        available: {
            bg: '#43A047',
            bgGradient: 'linear-gradient(135deg, #43A047 0%, #66BB6A 100%)',
            border: '#2E7D32',
            glow: '0 0 20px rgba(67, 160, 71, 0.5)',
            shadow: '0 4px 12px rgba(67, 160, 71, 0.3)',
        },
        pending: {
            bg: '#F9A825',
            bgGradient: 'linear-gradient(135deg, #F9A825 0%, #FDD835 100%)',
            border: '#F57F17',
            glow: '0 0 20px rgba(249, 168, 37, 0.5)',
            shadow: '0 4px 12px rgba(249, 168, 37, 0.3)',
        },
        confirmed: {
            bg: '#C62828',
            bgGradient: 'linear-gradient(135deg, #C62828 0%, #EF5350 100%)',
            border: '#B71C1C',
            shadow: '0 4px 12px rgba(198, 40, 40, 0.3)',
        },
        maintenance: {
            bg: '#78909C',
            bgGradient: 'linear-gradient(135deg, #78909C 0%, #90A4AE 100%)',
            border: '#607D8B',
            shadow: '0 4px 12px rgba(120, 144, 156, 0.3)',
        },
    },
    
    // === TABLE SIZES ===
    tableSizes: {
        xs: '48px',
        sm: '56px',
        md: '64px',
        lg: '80px',
    },
    
    // === BUTTON SIZES ===
    buttonSizes: {
        sm: {
            height: '32px',
            padding: '4px 12px',
            fontSize: '12px',
        },
        md: {
            height: '44px',
            padding: '12px 20px',
            fontSize: '16px',
        },
        lg: {
            height: '52px',
            padding: '16px 24px',
            fontSize: '18px',
        },
    },
    
    // === ICON SIZES ===
    iconSizes: {
        xs: '12px',
        sm: '16px',
        md: '20px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
    },
    
    // === BREAKPOINTS ===
    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },
};

// Helper function to get computed token value
export function getToken(tokenPath) {
    const pathParts = tokenPath.split('.');
    let value = DesignTokens;
    
    for (const part of pathParts) {
        if (value && typeof value === 'object' && part in value) {
            value = value[part];
        } else {
            return undefined;
        }
    }
    
    return value;
}

// Helper to apply CSS custom properties to root
export function applyTokensToCSS() {
    const root = document.documentElement;
    
    // Colors
    Object.entries(DesignTokens.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
    });
    
    // Spacing
    Object.entries(DesignTokens.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--space-${key}`, value);
    });
    
    // Border Radius
    Object.entries(DesignTokens.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--radius-${key}`, value);
    });
    
    // Shadows
    Object.entries(DesignTokens.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value);
    });
}

// Export zones configuration
export const zones = [
    { 
        id: 'main', 
        name: 'Основной зал', 
        icon: 'fa-utensils',
        background: '#F5EDE3',
        decorations: ['windows', 'bar', 'entrance']
    },
    { 
        id: 'middle', 
        name: 'Средний зал', 
        icon: 'fa-couch',
        background: '#E8E0D5',
        decorations: ['windows']
    },
    { 
        id: 'basement', 
        name: 'Подвал', 
        icon: 'fa-wine-glass',
        background: '#2D2A26',
        textColor: '#FFFFFF',
        decorations: ['candles']
    },
    { 
        id: 'dancefloor', 
        name: 'Танцпол', 
        icon: 'fa-music',
        background: '#1A1816',
        textColor: '#FFFFFF',
        decorations: ['discoBall', 'dancefloor']
    },
];

// Export booking statuses
export const bookingStatuses = {
    pending: {
        label: 'Ожидает подтверждения',
        color: '#F9A825',
        bgColor: '#FFF3E0',
        icon: 'fa-clock',
    },
    confirmed: {
        label: 'Подтверждено',
        color: '#43A047',
        bgColor: '#E8F5E9',
        icon: 'fa-check-circle',
    },
    completed: {
        label: 'Завершено',
        color: '#1976D2',
        bgColor: '#E3F2FD',
        icon: 'fa-flag-checkered',
    },
    cancelled: {
        label: 'Отменено',
        color: '#C62828',
        bgColor: '#FFEBEE',
        icon: 'fa-xmark-circle',
    },
};

// Export default export for convenience
export default DesignTokens;
