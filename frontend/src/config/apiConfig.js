export const API_BASE_URL = "https://household-sustainability-system.onrender.com/api";

export const API_ENDPOINTS = {
    AUTH: {
        REGISTER_INITIATE: "/auth/register/initiate",
        REGISTER_VERIFY: "/auth/register/verify",
        REGISTER_COMPLETE: "/auth/register/complete",
        LOGIN: "/auth/login",
        FORGOT_PASSWORD: "/auth/forgot-password",
        RESET_PASSWORD: "/auth/reset-password",
        USER_PROFILE: "/user/profile",
    },

    ADMIN: {
        DASHBOARD: "/admin/dashboard",
        USERS: "/admin/users",
        SCORING_CONFIG: "/admin/scoring-config",
    },

    // ✅ DISASTER ENDPOINTS (UPDATED)
    DISASTERS: "/disasters",

    DISASTER_EXTERNAL: {
        LIVE_FEMA: "/disasters/live-fema",
        IMPORT_FEMA: "/disasters/import-fema"
    },

    AUDIT: {
        BASE: "/audit",
        ALL: "/audit/all",
        BY_ID: "/audit",
    },

    WASTE: {
        BASE: "/waste",
        ALL: "/waste/all",
        BY_ID: "/waste",
        BINS: "/waste/bins",
        MY_BIN: "/waste/my-bin",
        BIN_STATUS: "/waste/bins",
        CALENDAR: "/waste/calendar",
    },

    ACTIONS: "/actions",
    ARTICLES: "/articles",
    GEMINI: "/gemini",
    WEATHER: "/weather",
    WEATHER_FORECAST: "/weather/forecast",
    SETTINGS: "/settings",

    ORDERS: {
        BASE: "/orders",
        MY: "/orders/my",
        REPORT: "/orders/report",
        ORDER_STATUS: "/orders/",
        ADMIN: "/orders/admin"
    },

    PRODUCTS: {
        BASE: "/products",
        MY: "/products/my",
        BY_ID: "/products/",
        ADMIN: "/products/admin",
        NEARBY: "/products/nearby"
    },
    
    ISSUES: {
        BASE: "/issues",
        MY: "/issues/my",
        BY_ID: "/issues",
        MESSAGES: "/issues",
    },
};