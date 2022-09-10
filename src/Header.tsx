import { FC, memo } from 'react';
import { AppBar, darken, IconButton, Toolbar, Button } from "@mui/material"
import { makeStyles } from 'tss-react/mui';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useAtom } from 'jotai';
import { tabsAtom } from './atoms';
import { gte, inc } from 'ramda';

const useStyles = makeStyles()((theme) => ({
  appBar: {
    backgroundColor: darken(theme.palette.primary.main, 0.6),
  }
}));

const isGreaterOrEqualsTo6 = (tabs: number) => gte(tabs, 6);

const Header: FC = () => {
  const { classes } = useStyles();

  const [tabs, setTabs] = useAtom(tabsAtom);

  const addColumn = () => setTabs((currentTabs) => isGreaterOrEqualsTo6(currentTabs) ? currentTabs : inc(currentTabs));

  const goToGithub = (): void => {
    window.open('https://github.com/Thebarda/Thebardabot', '_blank', 'noreferrer noopener')
  }

  return (
    <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton onClick={goToGithub}><GitHubIcon /></IconButton>
          <Button variant="contained" onClick={addColumn} sx={{ ml: 4 }} disabled={isGreaterOrEqualsTo6(tabs)}>Add a column</Button>
        </Toolbar>
      </AppBar>
  )
}

export default memo(Header);