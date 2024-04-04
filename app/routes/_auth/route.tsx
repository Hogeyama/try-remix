import {
  FiberNew as FiberNewIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  drawerClasses,
  styled,
} from "@mui/material";
import { Outlet, useNavigate } from "@remix-run/react";

type NavItem = {
  text: string;
  icon: React.ReactNode;
  link: string;
};

type NavGroup = {
  id: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    id: "メニュー",
    items: [
      { text: "About", icon: <StarIcon />, link: "/about" },
      { text: "検索", icon: <SearchIcon />, link: "/about" },
      { text: "設定", icon: <SettingsIcon />, link: "/about" },
    ],
  },
  {
    id: "アカウント",
    items: [
      { text: "ログイン", icon: <LoginIcon />, link: "/login" },
      { text: "ログアウト", icon: <LogoutIcon />, link: "/logout" },
      { text: "サインアップ", icon: <FiberNewIcon />, link: "/signup" },
    ],
  },
];

function NavGroups({ navGroups }: { navGroups: NavGroup[] }) {
  const navigate = useNavigate();
  return (
    <Box sx={{ overflow: "auto" }}>
      {navGroups.map((navGroup, i) => (
        <List key={navGroup.id}>
          {i > 0 && <Divider sx={{ mb: 2 }} />}
          {navGroup.items.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.link);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ))}
    </Box>
  );
}

const drawerWidth = 240;
const appBarHeight = 64;

const AppBar_ = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  height: appBarHeight,
}));

const Drawer_ = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function Mui() {
  return (
    <Box sx={{ display: "flex" }}>
      <AppBar_ position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            サンプル
          </Typography>
        </Toolbar>
      </AppBar_>
      <Drawer_ variant="permanent">
        <Toolbar />
        <NavGroups navGroups={navGroups} />
      </Drawer_>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100%",
          maxWidth: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
