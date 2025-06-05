import { createRouter, createWebHistory } from "vue-router";
import {
  HomeView,
  ProfileView,
  BrowseView,
  SwapView,
  MessageView,
} from "../views";
import { useAuthStore } from "../store";

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/browse", name: "browse", component: BrowseView },
  { path: "/swap", name: "swap", component: SwapView },
  { path: "/messages", name: "messages", component: MessageView },
  {
    path: "/profile/:id",
    name: "Userprofile",
    component: ProfileView,
    props: true,
  },
  {
    path: "/profile",
    name: "Myprofile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
];

/**Initialize here */
const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach(async (to, from) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ["/", "/login"];
  const authRequired = !publicPages.includes(to.path);
  const auth = useAuthStore();

  /**add function to check if user is logged in */
  if (authRequired && !auth.user) {
    auth.returnUrl = to.fullPath;
    auth.isLoginModalOpen = true;
    return from.fullPath;
    // return "/login";
  }
});

export default router;
