import { Typography } from "@mui/material";

const Placeholder = () => (
  <Typography sx={{ color: (theme) => theme.palette.text.disabled }}>
    Send a message
  </Typography>
);

export default Placeholder;
