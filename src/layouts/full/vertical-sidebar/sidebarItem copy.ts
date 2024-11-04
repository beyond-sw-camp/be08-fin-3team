import {
    ChartPieIcon,
    CoffeeIcon,
    CpuIcon,
    FlagIcon,
    BasketIcon,
    ApertureIcon,
    LayoutGridIcon,
    BoxIcon,
    Message2Icon,
    FilesIcon,
    CalendarIcon,
    UserCircleIcon,
    ChartBarIcon,
    ShoppingCartIcon,
    ChartLineIcon,
    ChartAreaIcon,
    ChartDotsIcon,
    ChartArcsIcon,
    ChartCandleIcon,
    ChartDonut3Icon,
    ChartRadarIcon,
    LayoutIcon,
    CardboardsIcon,
    PhotoIcon,
    FileTextIcon,
    BoxAlignBottomIcon,
    BoxAlignLeftIcon,
    FileDotsIcon,
    EditCircleIcon,
    AppsIcon,
    BorderAllIcon,
    BorderHorizontalIcon,
    BorderInnerIcon,
    BorderTopIcon,
    BorderVerticalIcon,
    BorderStyle2Icon,
    LoginIcon,
    CircleDotIcon,
    UserPlusIcon,
    RotateIcon,
    ZoomCodeIcon,
    SettingsIcon,
    AlertCircleIcon,
    BrandTablerIcon,
    CodeAsterixIcon,
    BrandCodesandboxIcon,
    ColumnsIcon,
    RowInsertBottomIcon,
    EyeTableIcon,
    SortAscendingIcon,
    PageBreakIcon,
    FilterIcon,
    BoxModelIcon,
    ServerIcon,
    JumpRopeIcon,
    LayoutKanbanIcon,
    PhotoAiIcon,
    SearchIcon,
    SocialIcon,
    BrandTidalIcon,
    UsersIcon,
    ToolIcon,
    BrandAsanaIcon
} from 'vue-tabler-icons';

export interface menu {
    header?: string;
    title?: string;
    icon?: any;
    to?: string;
    chip?: string;
    chipBgColor?: string;
    chipColor?: string;
    chipVariant?: string;
    chipIcon?: string;
    children?: menu[];
    disabled?: boolean;
    type?: string;
    subCaption?: string;
}

const sidebarItem: menu[] = [
    { header: 'Sales' },
    {
        title: '캘린더',
        icon: CalendarIcon,
        to: '/apps/calendar'
    },
    {
        title: '영업기회',
        // icon: CalendarIcon,
        to: '/sales/lead'
    },
    {
        title: '고객',
        icon: UsersIcon,
        to: '/sales/contact'
    },
    {
        title: '영업관리',
        icon: BrandAsanaIcon,
        to: '/',
        children: [
            {
                title: '잠재고객',
                icon: CircleDotIcon,
                to: '/sales/prospect'
            },
            {
                title: '제안',
                icon: CircleDotIcon,
                to: '/proposals'
            },
            {
                title: '견적',
                icon: CircleDotIcon,
                to: '/estimates'
            },
            {
                title: '계약',
                icon: CircleDotIcon,
                to: '/apps/contracts'
            },
            {
                title: '매출',
                icon: CircleDotIcon,
                to: '/apps/sales'
            },
            {
                title: '부서',
                icon: CircleDotIcon,
                to: '/sales/departments'
            },
            {
                title: '제품',
                icon: CircleDotIcon,
                to: '/sales/products'
            },
            {
                title: '프로세스',
                icon: CircleDotIcon,
                to: '/sales/processes'
            },
            {
                title: '목표 매출',
                icon: CircleDotIcon,
                to: '/sales/targetsales'
            }
        ]
    },
    {
        title: '영업도구',
        icon: ToolIcon,
        to: '/',
        children: [
            {
                title: '보고',
                icon: CircleDotIcon,
                to: '/apps/blog/posts'
            },
            {
                title: '공지',
                icon: CircleDotIcon,
                to: '/apps/blog/early-black-friday-amazon-deals-cheap-tvs-headphones'
            },
            {
                title: '영업활동',
                icon: CircleDotIcon,
                to: '/apps/act/list'
            }
        ]
    },
    {
        title: '차트',
        icon: ChartBarIcon,
        to: '/',
        children: [
            {
                title: '매출 차트',
                icon: ChartLineIcon,
                to: '/',
                children:[
                    {
                        title: '매출 현황 차트',
                        icon: ChartAreaIcon,
                        to: '/apps/chart/sales/status'
                    },
                    {
                        title: '매출 예측 차트',
                        icon: ChartAreaIcon,
                        to: '/apps/chart/sales/pridictions'
                    },
                ]
            },
            {
                title: '활동 차트',
                icon: ChartLineIcon,
                to: '/apps/chart/act'
            },
        ]
    },
    { header: 'Home' },
    {
        title: 'Analytical',
        icon: ChartPieIcon,
        to: '/dashboards/analytical'
    },
    {
        title: 'Classic',
        icon: CoffeeIcon,
        to: '/dashboards/classic'
    },
    {
        title: 'Demographical',
        icon: CpuIcon,
        to: '/dashboards/demographical'
    },
    {
        title: 'Minimal',
        icon: FlagIcon,
        to: '/dashboards/minimal'
    },
    {
        title: 'eCommerce',
        icon: ShoppingCartIcon,
        to: '/dashboards/ecommerce'
    },
    {
        title: 'Modern',
        icon: ApertureIcon,
        to: '/dashboards/modern'
    },
    { header: 'Apps' },
    {
        title: 'Contact',
        icon: BoxIcon,
        to: '/apps/contacts',
        chip: '2',
        chipColor: 'surface',
        chipBgColor: 'secondary'
    },

    {
        title: 'Blog',
        icon: ChartDonut3Icon,
        to: '/',
        children: [
            {
                title: 'Posts',
                icon: CircleDotIcon,
                to: '/apps/blog/posts'
            },
            {
                title: 'Detail',
                icon: CircleDotIcon,
                to: '/apps/blog/early-black-friday-amazon-deals-cheap-tvs-headphones'
            }
        ]
    },
    {
        title: 'E-Commerce',
        icon: BasketIcon,
        to: '/ecommerce/',
        children: [
            {
                title: 'Shop',
                icon: CircleDotIcon,
                to: '/ecommerce/products'
            },
            {
                title: 'Detail',
                icon: CircleDotIcon,
                to: '/ecommerce/product/detail/1'
            },
            {
                title: 'List',
                icon: CircleDotIcon,
                to: '/ecommerce/productlist'
            },
            {
                title: 'Checkout',
                icon: CircleDotIcon,
                to: '/ecommerce/checkout'
            },
            {
                title: 'Add Product',
                icon: CircleDotIcon,
                to: '/ecommerce/add-product'
            },
            {
                title: 'Edit Product',
                icon: CircleDotIcon,
                to: '/ecommerce/edit-product'
            }
        ]
    },
    {
        title: 'Chats',
        icon: Message2Icon,
        to: '/apps/chats'
    },
    {
        title: 'User Profile',
        icon: UserCircleIcon,
        to: '/',
        children: [
            {
                title: 'Profile',
                icon: CircleDotIcon,
                to: '/apps/user/profile'
            },
            {
                title: 'Followers',
                icon: CircleDotIcon,
                to: '/apps/user/profile/followers'
            },
            {
                title: 'Friends',
                icon: CircleDotIcon,
                to: '/apps/user/profile/friends'
            },
            {
                title: 'Gallery',
                icon: CircleDotIcon,
                to: '/apps/user/profile/gallery'
            }
        ]
    },
    {
        title: 'Notes',
        icon: FilesIcon,
        to: '/apps/notes'
    },
    {
        title: 'Calendar',
        icon: CalendarIcon,
        to: '/apps/calendarTemp'
    },
    {
        title: 'Kanban',
        icon: LayoutKanbanIcon,
        to: '/apps/kanban'
    },
    { header: 'Pages' },
    {
        title: 'Gallery Lightbox',
        icon: PhotoAiIcon,
        to: '/pages/gallery-lightbox'
    },
    {
        title: 'Search Results',
        icon: SearchIcon,
        to: '/pages/search-results'
    },
    {
        title: 'Social Contacts',
        icon: SocialIcon,
        to: '/pages/social-media-contacts'
    },
    {
        title: 'Treeview',
        icon: BrandTidalIcon,
        to: '/pages/treeview'
    },

    { header: 'Components' },
    {
        title: 'Ui Components',
        icon: LayoutGridIcon,
        to: '/components/',
        children: [
            {
                title: 'Alert',
                icon: CircleDotIcon,
                to: '/ui-components/alert'
            },
            {
                title: 'Accordion',
                icon: CircleDotIcon,
                to: '/ui-components/accordion'
            },
            {
                title: 'Avatar',
                icon: CircleDotIcon,
                to: '/ui-components/avatar'
            },
            {
                title: 'Chip',
                icon: CircleDotIcon,
                to: '/ui-components/chip'
            },
            {
                title: 'Dialog',
                icon: CircleDotIcon,
                to: '/ui-components/dialogs'
            },
            {
                title: 'List',
                icon: CircleDotIcon,
                to: '/ui-components/list'
            },
            {
                title: 'Menus',
                icon: CircleDotIcon,
                to: '/ui-components/menus'
            },
            {
                title: 'Rating',
                icon: CircleDotIcon,
                to: '/ui-components/rating'
            },
            {
                title: 'Tabs',
                icon: CircleDotIcon,
                to: '/ui-components/tabs'
            },
            {
                title: 'Tooltip',
                icon: CircleDotIcon,
                to: '/ui-components/tooltip'
            },
            {
                title: 'Typography',
                icon: CircleDotIcon,
                to: '/ui-components/typography'
            }
        ]
    },
    { header: 'Charts' },
    {
        title: 'Line',
        icon: ChartLineIcon,
        to: '/charts/line-chart'
    },
    {
        title: 'Gredient',
        icon: ChartArcsIcon,
        to: '/charts/gredient-chart'
    },
    {
        title: 'Area',
        icon: ChartAreaIcon,
        to: '/charts/area-chart'
    },
    {
        title: 'Candlestick',
        icon: ChartCandleIcon,
        to: '/charts/candlestick-chart'
    },
    {
        title: 'Column',
        icon: ChartDotsIcon,
        to: '/charts/column-chart'
    },
    {
        title: 'Doughnut & Pie',
        icon: ChartDonut3Icon,
        to: '/charts/doughnut-pie-chart'
    },
    {
        title: 'Radialbar & Radar',
        icon: ChartRadarIcon,
        to: '/charts/radialbar-chart'
    },
    { header: 'Forms' },
    {
        title: 'Form Elements',
        icon: AppsIcon,
        to: '/components/',
        children: [
            {
                title: 'Autocomplete',
                icon: CircleDotIcon,
                to: '/forms/form-elements/autocomplete'
            },
            {
                title: 'Combobox',
                icon: CircleDotIcon,
                to: '/forms/form-elements/combobox'
            },
            {
                title: 'Button',
                icon: CircleDotIcon,
                to: '/forms/form-elements/button'
            },
            {
                title: 'Checkbox',
                icon: CircleDotIcon,
                to: '/forms/form-elements/checkbox'
            },
            {
                title: 'Custom Inputs',
                icon: CircleDotIcon,
                to: '/forms/form-elements/custominputs'
            },
            {
                title: 'File Inputs',
                icon: CircleDotIcon,
                to: '/forms/form-elements/fileinputs'
            },
            {
                title: 'Radio',
                icon: CircleDotIcon,
                to: '/forms/form-elements/radio'
            },
            {
                title: 'Date Time',
                icon: CircleDotIcon,
                to: '/forms/form-elements/date-time'
            },
            {
                title: 'Select',
                icon: CircleDotIcon,
                to: '/forms/form-elements/select'
            },
            {
                title: 'Slider',
                icon: CircleDotIcon,
                to: '/forms/form-elements/slider'
            },
            {
                title: 'Switch',
                icon: CircleDotIcon,
                to: '/forms/form-elements/switch'
            },
            {
                title: 'Time Picker',
                icon: CircleDotIcon,
                to: '/forms/form-elements/time-picker'
            },
            {
                title: 'Stepper',
                icon: CircleDotIcon,
                to: '/forms/form-elements/stepper'
            }
        ]
    },
    {
        title: 'Form Layout',
        icon: FileTextIcon,
        to: '/forms/form-layouts'
    },
    {
        title: 'Form Horizontal',
        icon: BoxAlignBottomIcon,
        to: '/forms/form-horizontal'
    },
    {
        title: 'Form Vertical',
        icon: BoxAlignLeftIcon,
        to: '/forms/form-vertical'
    },
    {
        title: 'Form Custom',
        icon: FileDotsIcon,
        to: '/forms/form-custom'
    },
    {
        title: 'Form Validation',
        icon: FilesIcon,
        to: '/forms/form-validation'
    },
    {
        title: 'Editor',
        icon: EditCircleIcon,
        to: '/forms/editor'
    },
    { header: 'Widgets' },
    {
        title: 'Cards',
        icon: CardboardsIcon,
        to: '/widgets/cards'
    },
    {
        title: 'Banners',
        icon: PhotoIcon,
        to: '/widgets/banners'
    },
    {
        title: 'Charts',
        icon: ChartBarIcon,
        to: '/widgets/charts'
    },
    { header: 'Tables' },
    {
        title: 'Basic Table',
        icon: BorderAllIcon,
        to: '/tables/basic'
    },
    {
        title: 'Dark Table',
        icon: BorderHorizontalIcon,
        to: '/tables/dark'
    },
    {
        title: 'Density Table',
        icon: BorderInnerIcon,
        to: '/tables/density'
    },
    {
        title: 'Fixed Header Table',
        icon: BorderTopIcon,
        to: '/tables/fixed-header'
    },
    {
        title: 'Height Table',
        icon: BorderVerticalIcon,
        to: '/tables/height'
    },
    {
        title: 'Editable Table',
        icon: BorderStyle2Icon,
        to: '/tables/editable'
    },
    { header: 'Data Tables' },
    {
        title: 'Basic Table',
        icon: ColumnsIcon,
        to: '/datatables/basic'
    },
    {
        title: 'Header Table',
        icon: RowInsertBottomIcon,
        to: '/datatables/header'
    },
    {
        title: 'Selection Table',
        icon: EyeTableIcon,
        to: '/datatables/selection'
    },
    {
        title: 'Sorting Table',
        icon: SortAscendingIcon,
        to: '/datatables/sorting'
    },
    {
        title: 'Pagination Table',
        icon: PageBreakIcon,
        to: '/datatables/pagination'
    },
    {
        title: 'Filtering Table',
        icon: FilterIcon,
        to: '/datatables/filtering'
    },
    {
        title: 'Grouping Table',
        icon: BoxModelIcon,
        to: '/datatables/grouping'
    },
    {
        title: 'Table Slots',
        icon: ServerIcon,
        to: '/datatables/slots'
    },
    {
        title: 'CRUD Table',
        icon: JumpRopeIcon,
        to: '/tables/datatables/crudtable'
    },
    { header: 'Authentication' },

    {
        title: 'Login',
        icon: LoginIcon,
        to: '#',
        children: [
            {
                title: 'Side Login',
                icon: CircleDotIcon,
                to: '/auth/login'
            },
            {
                title: 'Boxed Login',
                icon: CircleDotIcon,
                to: '/auth/login2'
            }
        ]
    },
    {
        title: 'Register',
        icon: UserPlusIcon,
        to: '#',
        children: [
            {
                title: 'Side Register',
                icon: CircleDotIcon,
                to: '/auth/register'
            },
            {
                title: 'Boxed Register',
                icon: CircleDotIcon,
                to: '/auth/register2'
            }
        ]
    },
    {
        title: 'Forgot Password',
        icon: RotateIcon,
        to: '#',
        children: [
            {
                title: 'Side Forgot Password',
                icon: CircleDotIcon,
                to: '/auth/forgot-password'
            },
            {
                title: 'Boxed Forgot Password',
                icon: CircleDotIcon,
                to: '/auth/forgot-password2'
            }
        ]
    },
    {
        title: 'Two Steps',
        icon: ZoomCodeIcon,
        to: '#',
        children: [
            {
                title: 'Side Two Steps',
                icon: SettingsIcon,
                to: '/auth/two-step'
            },
            {
                title: 'Boxed Two Steps',
                icon: SettingsIcon,
                to: '/auth/two-step2'
            }
        ]
    },

    {
        title: 'Error',
        icon: AlertCircleIcon,
        to: '/auth/404'
    },
    {
        title: 'Maintenance',
        icon: SettingsIcon,
        to: '/auth/maintenance'
    },
    { header: 'Icons' },
    {
        title: 'Material',
        icon: BrandCodesandboxIcon,
        to: '/icons/material'
    },
    {
        title: 'Tabler',
        icon: BrandTablerIcon,
        to: '/icons/tabler'
    }
];

export default sidebarItem;
