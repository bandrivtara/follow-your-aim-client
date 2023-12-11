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
  activity: {
    path: "/activity",
    list: "/activity/list",
    add: "/activity/add",
    edit: "/activity/edit",
    statistic: "/activity/statistic",
  },
  aims: {
    path: "/aims",
    calendar: "/aims/calendar",
    list: "/aims/list",
    add: "/aims/add",
    edit: "aims/edit",
    statistic: "/aims/statistic",
  },
  lifeSpheres: {
    path: "/life-spheres",
    list: "/life-spheres/list",
    add: "/life-spheres/add",
    edit: "/life-spheres/edit",
    statistic: "/life-spheres/statistic",
  },
};

export default routes;
