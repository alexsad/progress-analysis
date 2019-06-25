import React, { FunctionComponent, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Link } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import AppBar from '@material-ui/core/AppBar';
import { Toolbar, Typography, IconButton, Icon } from '@material-ui/core';
import LinkUI from '@material-ui/core/Link';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    iconStyle: {
        color:'#efefef'
    }
  }),
);


const UserProfile: FunctionComponent<{idUser:string}> & { Head: FunctionComponent<{}>, Body: FunctionComponent<{}>} = () => {
    const [logged, setLogged] = useState(false);

    if (!logged) {
        setLogged(true);
    }

    return (
        <>
            <UserProfile.Head/>
            <UserProfile.Body/>
        </>
    );
}

const Head = () => {
    const classes = useStyles();
    return(
        <AppBar position="fixed" color="inherit">
            <Toolbar>
                <LinkUI style={{marginRight:"4px"}} component={Link} to="/">
                    <Icon className={classes.iconStyle}>keyboard_backspace</Icon>
                </LinkUI>
                <Avatar>
                    <Icon>face</Icon>
                </Avatar>

                <Typography style={{ flexGrow: 1, color:"#efefef", paddingLeft:"4px"}} variant="subtitle2">
                    user
                </Typography>

                <IconButton
                    color="default"
                    aria-label="Open drawer"
                    edge="end"
                    to={`/qr-code/url/${encodeURIComponent('/party/id')}`}
                    component={Link}
                >
                    <Icon className={classes.iconStyle}>share</Icon>
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}

const Body = () => {
    return(
        <main>
            <Container maxWidth="lg">
                <section>

                </section>
            </Container>
        </main>
    )
}

UserProfile.Head = Head;
UserProfile.Body = Body;

export default UserProfile;