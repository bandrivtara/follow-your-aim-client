const routes = {
  main: "/",
  schedule: "/schedule",
  chatGpt: "/chat-gpt",
  profile: "/profile",
  calendar: {
    path: "/calendar",
    scheduler: "/calendar/scheduler",
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
  english: {
    vocabulary: {
      group: {
        path: "/english/vocabulary/groups",
        list: "/english/vocabulary/groups/list",
        add: "/english/vocabulary/groups/add",
        edit: "/english/vocabulary/groups/edit",
        statistic: "/english/vocabulary/groups/statistic",
      },
      word: {
        path: "/english/vocabulary/words",
        list: "/english/vocabulary/words/list",
        add: "/english/vocabulary/words/add",
        edit: "/english/vocabulary/words/edit",
        statistic: "/english/vocabulary/words/statistic",
      },
    },
    tests: { words: "english/tests/words" },
  },
};

export default routes;
