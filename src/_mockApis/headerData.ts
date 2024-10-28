// project imports
import mock from './mockAdapter';

import type { notificationType, profileType, languageType,searchType } from '@/types/HeaderTypes'
// 
// Notification
// 
import user1 from '@/assets/images/profile/user-1.jpg';
import user2 from '@/assets/images/profile/user-2.jpg';
import user3 from '@/assets/images/profile/user-3.jpg';
import user4 from '@/assets/images/profile/user-4.jpg';
import user5 from '@/assets/images/profile/user-5.jpg';

const notifications:notificationType[] = [
    {
        avatar: user1,
        title: 'Roman Joined the Team!',
        subtitle: 'Congratulate him'
    },
    {
        avatar: user2,
        title: 'New message received',
        subtitle: 'Salma sent you new message'
    },
    {
        avatar: user3,
        title: 'New Payment received',
        subtitle: 'Check your earnings'
    },
    {
        avatar: user4,
        title: 'Jolly completed tasks',
        subtitle: 'Assign her new tasks'
    },
    {
        avatar: user5,
        title: 'New Payment received',
        subtitle: 'Check your earnings'
    },
    {
        avatar: user1,
        title: 'Roman Joined the Team!',
        subtitle: 'Congratulate him'
    }
];

// 
// Profile 
// 
import proUser1 from '@/assets/images/svgs/icon-account.svg';
import proUser2 from '@/assets/images/svgs/icon-inbox.svg';
import proUser3 from '@/assets/images/svgs/icon-tasks.svg';
const profileDD: profileType[] = [
    {
        avatar: proUser1,
        title: '내 정보 관리',
        subtitle: '내 개인 정보',
        href: '/apps/user/mypage'
    },
    {
        avatar: proUser2,
        title: '고객 관리',
        subtitle: '담당 고객 정보',
        href: '/apps/user/mypage/customers'
    },
    {
        avatar: proUser3,
        title: '잠재고객 관리',
        subtitle: '담당 잠재고객 정보',
        href: '/apps/user/mypage/pcustomers'
    }
];

// 
// Language
// 
import flag1 from '@/assets/images/flag/icon-flag-en.svg';
import flag2 from '@/assets/images/flag/icon-flag-fr.svg';
import flag3 from '@/assets/images/flag/icon-flag-ro.svg';
import flag4 from '@/assets/images/flag/icon-flag-zh.svg';
const languageDD: languageType[] = [
    { title: 'English', subtext: 'UK', value: 'en', avatar: flag1 },
    { title: 'français', subtext: 'French', value: 'fr', avatar: flag2 },
    { title: 'عربي', subtext: 'Arbic', value: 'ro', avatar: flag3 },
    { title: '中国人', subtext: 'Chinese', value: 'zh', avatar: flag4 }
];




// 
// Search Data
// 
const searchSugg: searchType[] = [
    {
        title: 'Modern',
        href: '/dashboards/modern'
    },
    {
        title: 'eCommerce',
        href: '/dashboards/ecommerce'
    },
    {
        title: 'Contacts',
        href: '/apps/contacts'
    },
    {
        title: 'Shop',
        href: '/ecommerce/shop'
    },
    {
        title: 'Checkout',
        href: '/ecommerce/checkout'
    },
    {
        title: 'Chats',
        href: '/apps/chats'
    },
    {
        title: 'Notes',
        href: '/apps/notes'
    },
    {
        title: 'Pricing',
        href: '/pages/pricing'
    },
    {
        title: 'Account Setting',
        href: '/pages/account-settings'
    },
];

export { notifications, profileDD, languageDD, searchSugg };

