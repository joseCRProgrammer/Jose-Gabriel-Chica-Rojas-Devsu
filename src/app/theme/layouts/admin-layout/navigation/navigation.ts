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
        id: 'Reportes',
        title: 'Reportes',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/reports',
        icon: 'dashboard',
        breadcrumbs: false
      },
      {
        id: 'Buscar e importar',
        title: 'Buscar e importar',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/search-import',
        icon: 'dashboard',
        breadcrumbs: false
      }
    ]
  },
];
