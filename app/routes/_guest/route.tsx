import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  styled,
} from "@mui/material";
import { Outlet } from "@remix-run/react";

const appBarHeight = 64;

const AppBar_ = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  height: appBarHeight,
}));

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
      <Container component="main">
        <Toolbar />
        <Outlet />
      </Container>
    </Box>
  );
}
