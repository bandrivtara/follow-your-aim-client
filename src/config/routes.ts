const routes = {
  main: "/",
  schedule: "/schedule",
  chatGpt: "/chat-gpt",
  profile: "/profile",
  calendar: "/calendar",
  tasks: {
    path: "/tasks",
    list: "/tasks/list",
    add: "/tasks/add",
    statistic: "/tasks/statistic",
  },
  habit: {
    path: "/habit",
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
