export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: '1',
        title: 'Listar Productos',
        type: 'item',
        classes: 'nav-item',
        url: 'dashboard/products/list',
        icon: 'dashboard',
        breadcrumbs: false
      },
      {
        id: '2',
        title: 'Crear Productos',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/products/create',
        icon: 'dashboard',
        breadcrumbs: false
      }
    ]
  },
];
