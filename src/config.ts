export type ConfigProps = {
    Sidebar_drawer: any;
    Customizer_drawer: boolean;
    mini_sidebar: boolean;
    setHorizontalLayout: boolean;
    setRTLLayout: boolean;
    actTheme: string;
    inputBg:string;
    boxed: boolean;
    setBorderCard: boolean;
};

const config: ConfigProps = {
    Sidebar_drawer: null,
    Customizer_drawer: false,
    mini_sidebar: false,
    // setHorizontalLayout: false, // Horizontal layout
    setHorizontalLayout: true, // Horizontal layout
    setRTLLayout: false, // RTL layout
    actTheme: 'BLUE_THEME',
    inputBg: 'BLUE_THEME',
    boxed: true,
    setBorderCard: false
};

export default config;
