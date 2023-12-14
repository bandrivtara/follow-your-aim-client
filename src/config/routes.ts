const routes = {
  main: "/",
  schedule: "/schedule",
  chatGpt: "/chat-gpt",
  profile: "/profile",
  taskGroups: {
    path: "/task-groups",
    calendar: "/task-groups/calendar",
    list: "/task-groups/list",
    add: "/task-groups/add",
    edit: "/task-groups/edit",
    statistic: "/task-groups/statistic",
  },
  habit: {
    path: "/habit",
    calendar: "/habit/calendar",
    list: "/habit/list",
    add: "/habit/add",
    edit: "/habit/edit",
    statistic: "/habit/statistic",
  },
  aims: {
    path: "/aims",
    calendar: "/aims/calendar",
    list: "/aims/list",
    add: "/aims/add",
    edit: "aims/edit",
    statistic: "/aims/statistic",
  },
  lifeCategories: {
    path: "/categories",
    list: "/categories/list",
    add: "/categories/add",
    edit: "/categories/edit",
    statistic: "/categories/statistic",
  },
};

export default routes;
