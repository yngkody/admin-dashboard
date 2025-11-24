import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import {
  SettingsOutlined,
  ChevronLeft,
  ChevronRightOutlined,
} from "@mui/icons-material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import DocumentScannerRoundedIcon from "@mui/icons-material/DocumentScannerRounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import LabelImportantRoundedIcon from "@mui/icons-material/LabelImportantRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";

import { useLocation, useNavigate } from "react-router-dom";
import FlexBetween from "./FlexBetween";

const navItems = [
  { text: "Overview", icon: null },
  { text: "Dashboard", icon: <DashboardRoundedIcon /> },
  { text: "Data & Input", icon: null },
  { text: "Upload", icon: <UploadFileRoundedIcon /> },
  { text: "Scan", icon: <DocumentScannerRoundedIcon /> },
  { text: "Prep Management", icon: null },
  { text: "Preplist", icon: <ListAltRoundedIcon /> },
  { text: "Labels", icon: <LabelImportantRoundedIcon /> },
  { text: "Shortlist", icon: <StarRoundedIcon /> },
  { text: "Progress", icon: <TrendingUpRoundedIcon /> },
  { text: "Admin", icon: null },
  { text: "Users", icon: <GroupRoundedIcon /> },
  { text: "Reports", icon: <AssessmentRoundedIcon /> },
  { text: "Settings", icon: <SettingsOutlined /> },
];

const Sidebar = ({
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
}) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant="persistent"
          anchor="left"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              backgroundColor: theme.palette.background.alt,
              color: theme.palette.text.primary, // 👈 base text color
              borderWidth: isNonMobile ? 0 : "2px",
            },
          }}
        >
          <Box width="100%">
            {/* Header */}
            <Box m="1.5rem 2rem 2rem 3rem">
              <FlexBetween color={theme.palette.text.primary}>
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <Typography variant="h4" fontWeight="bold">
                    PrepDeck
                  </Typography>
                </Box>
                {!isNonMobile && (
                  <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <ChevronLeft />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>

            {/* Nav Items */}
            <List>
              {navItems.map(({ text, icon }) => {
                if (!icon) {
                  // SECTION LABEL
                  return (
                    <Typography
                      key={text}
                      sx={{
                        m: "1.75rem 0 0.75rem 3rem",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        color: theme.palette.text.secondary, // 👈 visible but subtle
                      }}
                    >
                      {text}
                    </Typography>
                  );
                }

                const lcText = text.toLowerCase();
                const selected = active === lcText;

                return (
                  <ListItem key={text} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(`/${lcText}`);
                        setActive(lcText);
                      }}
                      sx={{
                        borderRadius: 0,
                        px: "2.5rem",
                        backgroundColor: selected
                          ? (isDark
                              ? theme.palette.grey[800]
                              : theme.palette.grey[200]) // purple-ish but higher contrast
                          : "transparent",
                        "&:hover": {
                          backgroundColor: isDark
                            ? theme.palette.grey[800]
                            : theme.palette.grey[100],
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: "auto",
                          mr: "1.25rem",
                          color: selected
                            ? theme.palette.primary.main // strong accent
                            : theme.palette.text.secondary, // readable
                        }}
                      >
                        {icon}
                      </ListItemIcon>

                      <ListItemText
                        primary={text}
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: selected ? 600 : 500,
                          color: selected
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                        }}
                      />

                      {selected && (
                        <ChevronRightOutlined
                          sx={{
                            ml: "auto",
                            color: theme.palette.primary.main,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
