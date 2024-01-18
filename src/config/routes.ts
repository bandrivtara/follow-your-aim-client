const routes = {
  main: "/",
  schedule: "/schedule",
  chatGpt: "/chat-gpt",
  profile: "/profile",
  calendar: {
    path: "/calendar",
    routine: "/calendar/routine",
    tracker: "/calendar/tracker",
    aims: "/calendar/aims",
  },
  taskGroups: {
    path: "/task-groups",
    list: "/task-groups/list",
    add: "/task-groups/add",
    edit: "/task-groups/edit",
    statistic: "/task-groups/statistic",
  },
  habit: {
    path: "/habit",
    list: "/habit/list",
    add: "/habit/add",
    edit: "/habit/edit",
    statistic: "/habit/statistic",
    categories: {
      path: "/habit/categories",
      list: "/habit/categories/list",
      add: "/habit/categories/add",
      edit: "/habit/categories/edit",
    },
  },
  aims: {
    path: "/aims",
    list: "/aims/list",
    add: "/aims/add",
    edit: "aims/edit",
    statistic: "/aims/statistic",
    categories: {
      path: "/aims/categories",
      list: "/aims/categories/list",
      add: "/aims/categories/add",
      edit: "/aims/categories/edit",
    },
  },
  spheres: {
    path: "/spheres",
    list: "/spheres/list",
    add: "/spheres/add",
    edit: "/spheres/edit",
    statistic: "/spheres/statistic",
  },
};

export default routes;
