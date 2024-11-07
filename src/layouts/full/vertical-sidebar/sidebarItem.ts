import {
		// 홈
    HomeIcon,
		//영업기회
    AppsIcon,
		// 일정관리
    CalendarIcon,
		ListCheckIcon,
		ClockCheckIcon,
		RunIcon,
		// 고객
    UsersIcon,
		UserIcon,
		// 영업관리
		FilesIcon,
		ClipboardCopyIcon,
		FilePencilIcon,
		CashBanknoteIcon,
		// 차트
		ChartHistogramIcon,
		ChartAreaLineIcon,
    ChartBarIcon,
    ChartLineIcon,
    ChartDonut3Icon,
		// 관리자
		SitemapIcon,
		BrandProducthuntIcon,
		TargetArrowIcon,
		TimelineIcon
		
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
    adminOnly?: boolean;
}

const sidebarItem: menu[] = [
    { header: 'Home' },
    {
        title: 'Home',
        icon: HomeIcon,
        to: '/sales/main'
    },
    { header: '영업기회' },
    {
        title: '영업기회',
        icon: AppsIcon,
        to: '/sales/lead'
    },
    { header: '일정관리' },
			{
					title: '캘린더',
					icon: CalendarIcon,
					to: '/apps/calendar'
			},
			{
					title: '할 일',
					icon: ListCheckIcon,
					to: '/apps/todo/list'
			},
			{
					title: '일정',
					icon: ClockCheckIcon,
					to: '/apps/plan/list'
			},
			{
					title: '영업활동',
					icon: RunIcon,
					to: '/apps/act/list'
    },

    { header: '고객' },
			{
					title: '고객',
					icon: UserIcon,
					to: '/sales/contact'
			},
			{
					title: '잠재고객',
					icon: UsersIcon,
					to: '/sales/prospect'
			},
    { header: '영업관리' },
			{
					title: '제안',
					icon: ClipboardCopyIcon,
					to: '/proposals'
			},
			{
					title: '견적',
					icon: FilesIcon,
					to: '/estimates'
			},
			{
					title: '계약',
					icon: FilePencilIcon,
					to: '/apps/contract'
			},
			{
					title: '매출',
					icon: CashBanknoteIcon,
					to: '/apps/sales'
			},

    // { header: '영업도구' },
		// 	{
		// 			title: '보고',
		// 			icon: CircleDotIcon,
		// 			to: '/apps/blog/posts'
		// 	},
		// 	{
		// 			title: '공지',
		// 			icon: CircleDotIcon,
		// 			to: '/apps/blog/early-black-friday-amazon-deals-cheap-tvs-headphones'
		// 	},
		// 	{
		// 			title: '영업활동',
		// 			icon: CircleDotIcon,
		// 			to: '/apps/act/list'
    // },
    { header: '차트'},
				{
						title: '영업 예측',
						icon: ChartHistogramIcon,
						to: '/apps/chart/lead'
				},
				{
						title: '활동 차트',
						icon: ChartDonut3Icon,
						to: '/apps/chart/act',
				},
				{
						title: '계약 차트',
						icon: ChartLineIcon,
						to: '/apps/chart/status'
				},
				{
					title: '실적 매출 차트',
					icon: ChartLineIcon,
					to: '/apps/chart/status/performanceandsales',
					adminOnly: true
				},
				{
						title: '매출 차트',
						icon: ChartHistogramIcon,
						to: '/',
						children: [
								{
										title: '매출 현황 차트',
										icon: ChartAreaLineIcon,
										to: '/apps/chart/sales/status',
										adminOnly: true
								},
								{
										title: '목표 매출 차트',
										icon: ChartBarIcon,
										to: '/apps/chart/targetsales/status',
										adminOnly: true
								},
								{
										title: '매출 예측 차트',
										icon: ChartLineIcon,
										to: '/apps/chart/sales/pridictions'
								}
        ]
    },

	{ header: '관리자', adminOnly: true},
		{
				title: '부서',
				icon: SitemapIcon,
				to: '/admin/departments'
		},
		{
				title: '제품',
				icon: BrandProducthuntIcon,
				to: '/admin/products'
		},
		{
				title: '프로세스',
				icon: TimelineIcon,
				to: '/admin/processes'
		},
		{
				title: '목표 매출',
				icon: TargetArrowIcon,
				to: '/admin/targetsales'
		}
];

export default sidebarItem;
