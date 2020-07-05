import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
    id: 'application',
    title: 'Application',
    translate: 'NAV.APPLICATION',
    type: 'group',
    children: [
      //{
      //  id: 'sample',
      //  title: 'Sample',
      //  translate: 'NAV.SAMPLE.TITLE',
      //  type: 'item',
      //  icon: 'account_balance',
      //  url: '/sample',
      //  badge: {
      //    title: '25',
      //    translate: 'NAV.SAMPLE.BADGE',
      //    bg: '#F44336',
      //    fg: '#FFFFFF'
      //  }
      //},
      {
        id: 'user',
        title: 'Users',
        translate: 'NAV.USER.TITLE',
        type: 'item',
        icon: 'account_box',
        url: '/user'

      },
      {
        id: 'userRole',
        title: 'User Role',
        translate: 'NAV.USERROLE.TITLE',
        type: 'item',
        icon: 'how_to_reg',
        url: '/role'

      },
      //{
      //  id: 'tax',
      //  title: 'Tax',
      //  translate: 'NAV.TAX.TITLE',
      //  type: 'item',
      //  icon: 'receipt',
      //  url: '/tax'

      //},
      {
        id: 'seller',
        title: 'Seller',
        translate: 'NAV.SELLER.TITLE',
        type: 'item',
        icon: 'location_city',
        url: '/seller'

      },
      {
        id: 'property',
        title: 'Property',
        translate: 'NAV.PROPERTY.TITLE',
        type: 'item',
        icon: 'business',
        url: '/property'

      }
    ]
    },
    {
        id: 'customers',
        title: 'Customers',
        translate: 'NAV.CUSTOMERS',
        type: 'group',
        children: [
            {
                id: 'add_customer',
                title: 'Customer Details',
                translate: 'NAV.ADD_CUSTOMER.TITLE',
                type: 'item',
                icon: 'people',
                url: '/client'
               
            }
        ]
    }
];
