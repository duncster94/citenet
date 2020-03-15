import React from "react";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import example from "./example-img.PNG";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    position: "absolute",
    paddingTop: theme.spacing(2),
    width: "inherit"
    // overflow: "auto"
  },
  card: {
    padding: theme.spacing(2)
  },
  homeLink: {
    position: "absolute",
    top: "15px",
    left: "20px",
    fontSize: "14px"
  },
  textSection: {
    paddingTop: theme.spacing(4)
  }
}));

const Bold = ({ children }) => (
  <Box
    fontWeight="fontWeightBold"
    style={{
      display: "inline-block"
    }}
  >
    {children}
  </Box>
);

export default function AboutPage() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Container maxWidth="md">
        <Card raised className={classes.card}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              CiteNet is an interactive <Bold>search</Bold> and{" "}
              <Bold>visualization</Bold> tool for biomedical literature.
            </Typography>
            {/* <hr /> */}
            <Typography gutterBottom>
              Papers are being published at an incredible rate. The
              ever-increasing body of literature makes sorting through
              irrelevant research while at the same time not missing critically
              important results a daunting task. The traditional literature
              search paradigm is slow, fragmented and difficult to mentally
              organize (so many browser tabs!).
            </Typography>
            <Typography gutterBottom>
              We've developed <Bold>CiteNet</Bold> in an attempt to alleviate
              the time-consuming and often frustrating process of finding
              relevant papers for your research. Keyword-based searches often
              require specific, technical terms to yield interesting results,
              which can be a major problem if you just want to{" "}
              <Bold>explore</Bold> the research around a topic. CiteNet
              introduces an alternative paradigm to keyword searching, namely
              "keypaper" searching. Here you can use a set of papers as your
              search query and CiteNet will give you a larger set of related
              papers. Implicity, you define a set of topics by the papers you
              input and CiteNet attempts to find papers at the intersection of
              these topics.
            </Typography>

            <Typography
              variant="h5"
              gutterBottom
              className={classes.textSection}
            >
              How to use CiteNet
            </Typography>
            <Typography gutterBottom>
              A CiteNet search starts by seeding the search algorithm with
              papers from fields you are interested in. You can add these papers
              directly by entering the PubMed ID of the article into the search
              bar, or by entering the article title, journal, author(s) or
              publication date into the search bar and selecting the correct
              paper from the dropdown. The more papers you input, the more
              refined your search will be. After selecting your seed papers you
              can optionally choose which visualization you'd like to see by
              clicking the view dropdown button beside the search button.
            </Typography>
            <Typography gutterBottom>
              CiteNet currently offers two visualizations: a{" "}
              <Bold>rank view</Bold> (default) and a <Bold>network view</Bold>.
            </Typography>

            <Section
              img={example}
              alt="example image"
              text={[...new Array(30)].map(() => "lorem ipsum something ")}
              imgPosition='top'
            />

            <Section
              img={example}
              alt="example image"
              text={[...new Array(30)].map(() => "lorem ipsum something ")}
              imgPosition='left'
            />

            <Section
              img={example}
              alt="example image"
              text={[...new Array(30)].map(() => "lorem ipsum something ")}
              imgPosition='right'
            />

            <Section
              img={example}
              alt="example image"
              text={[...new Array(30)].map(() => "lorem ipsum something ")}
              imgPosition='bottom'
            />

            <Typography className={classes.homeLink}>
              <Link href="/">Home</Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}

const Section = ({ img, alt, text, imgPosition }) => {
  const classes = useStyles()

  if (imgPosition === "left") {
    return (
      <Grid container className={classes.textSection}>
        <Grid item xs={6} style={{ paddingRight: "10px" }}>
          <img src={img} alt={alt} width="100%" />
        </Grid>

        <Grid item xs={6} style={{ paddingLeft: "10px" }}>
          <Typography>{text}</Typography>
        </Grid>
      </Grid>
    )
  } else if (imgPosition === "right") {
    return (
      <Grid container className={classes.textSection}>
        <Grid item xs={6} style={{ paddingRight: "10px" }}>
          <Typography>{text}</Typography>
        </Grid>

        <Grid item xs={6} style={{ paddingLeft: "10px" }}>
          <img src={img} alt={alt} width="100%" />
        </Grid>
      </Grid>
    )
  } else if (imgPosition === 'top') {
    return (
      <>
        <Grid
          container
          className={classes.textSection}
          direction="column"
          alignItems="center"
        >
          <Grid item xs>
            <img src={img} alt={alt} height="100%" />
          </Grid>
        </Grid>

        <Typography gutterBottom>{text}</Typography>
      </>
    )
  } else {
    return (
      <>
        <Typography gutterBottom className={classes.textSection}>{text}</Typography>
        <Grid
          container
          direction="column"
          alignItems="center"
        >
          <Grid item xs>
            <img src={img} alt={alt} height="100%" />
          </Grid>
        </Grid>
      </>
    )
  }
}
