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
    BrandAsanaIcon,
    HomeIcon,
    ClipboardIcon,
    FileDescriptionIcon,
    BrandAirtableIcon
} from 'vue-tabler-icons';
import type { boolean } from 'yup';

export interface menu {
    header?: string;
    title?: string;
    icon?: any;
    to?: string;
    divider?: boolean;
    chip?: string;
    chipColor?: string;
    chipVariant?: string;
    chipIcon?: string;
    children?: menu[];
    disabled?: boolean;
    subCaption?: string;
    class?: string;
    extraclass?: string;
    type?: string;
    adminOnly?: boolean;
}

const horizontalItems: menu[] = [
    {
        title: 'Home',
        icon: HomeIcon,
        to: '/sales/main'
    },
    {
        title: '영업기회',
        icon: AppsIcon,
        to: '/sales/lead'
    },
    {
        title: '일정관리',
        icon: CalendarIcon,
        to: '/apps/calendar',
        children: [
            {
                title: '캘린더',
                icon: CalendarIcon,
                to: '/apps/calendar'
            },
            {
                title: '할 일',
                icon: CircleDotIcon,
                to: '/apps/todo/list'
            },
            {
                title: '일정',
                icon: CircleDotIcon,
                to: '/apps/plan/list'
            },
            {
                title: '영업활동',
                icon: CircleDotIcon,
                to: '/apps/act/list'
            }
        ]
    },

    {
        title: '고객',
        icon: UsersIcon,
        to: '/sales/contact',
        children: [
            {
                title: '고객',
                icon: CircleDotIcon,
                to: '/sales/contact'
            },
            {
                title: '잠재고객',
                icon: CircleDotIcon,
                to: '/sales/prospect'
            }
        ]
    },
    {
        title: '영업관리',
        icon: BrandAsanaIcon,
        to: '/',
        children: [
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
                to: '/apps/contract'
            },
            {
                title: '매출',
                icon: CircleDotIcon,
                to: '/apps/sales'
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
                title: '영업 예측',
                icon: CircleDotIcon,
                to: '/apps/chart/lead'
            },
            {
                title: '활동 차트',
                icon: CircleDotIcon,
                to: '/apps/chart/act'
            },
            {
                title: '계약 차트',
                icon: CircleDotIcon,
                to: '/apps/chart/status'
            },
            {
                title: '실적 매출 차트',
                icon: CircleDotIcon,
                to: '/apps/chart/status/performanceandsales'
            },
            {
                title: '매출 차트',
                icon: CircleDotIcon,
                to: '/',
                children: [
                    {
                        title: '매출 현황 차트',
                        icon: ChartAreaIcon,
                        to: '/apps/chart/sales/status'
                    },
                    {
                        title: '목표 매출 차트',
                        icon: ChartAreaIcon,
                        to: '/apps/chart/targetsales/status'
                    },
                    {
                        title: '매출 예측 차트',
                        icon: ChartAreaIcon,
                        to: '/apps/chart/sales/pridictions'
                    }
                ]
            }
        ]
    },

    {
        title: '관리자',
        icon: SocialIcon,
        to: '/',
        adminOnly: true,
        children: [
            {
                title: '부서',
                icon: CircleDotIcon,
                to: '/admin/departments'
            },
            {
                title: '제품',
                icon: CircleDotIcon,
                to: '/admin/products'
            },
            {
                title: '프로세스',
                icon: CircleDotIcon,
                to: '/admin/processes'
            },
            {
                title: '목표 매출',
                icon: CircleDotIcon,
                to: '/admin/targetsales'
            }
        ]
    }
];

export default horizontalItems;
