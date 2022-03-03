export default [
  {
    name: 'systemManage',
    path: '/systemManage',
    label: '系统管理',
    redirect: '/systemManage/userManage',
    component: {render: (e) => e("router-view")},
    children: [
      {
        name: 'userManage',
        path: '/systemManage/userManage',
        label: '用户管理',
        component: () => import('@/views/systemManage/index.vue'),
      },
    ],
  },
]
