
import React from "react";
import { Button, Col, Grid, Row } from "react-bootstrap";
import FontAwesome from "react-fontawesome";
import NotificationSystem from "react-notification-system";
import style from "./index.css";
// tslint:disable-next-line: match-default-export-name
import logo from "./logo.png";

// tslint:disable-next-line: no-any
declare var mixpanel: any;

interface ILoginState {
  azureBtn: string;
  googleBtn: string;
  message: string;
  recommend: string;
  title: string;
}

interface INotificationStyle {
  NotificationItem: {
    info: {
      backgroundColor: string;
      color: string;
    };
  };
}

/**
 * Class for Integrate's web login
 */
class Access extends React.Component<{}, ILoginState, {}> {

  /**
   * Define english translations
   */
  public enTranslations: object = {
    azureBtn: "Log in with Azure/Office365",
    googleBtn: "Log in with Google",
    message: "If you are a new user, you must call a " +
      "FLUID representative to register.",
    recommend: "We strongly recommend you to use 2-Step " +
      "verification. For more information please visit:",
    title: "Please log in to proceed.",
  };

  /**
   * Define spanish translations
   */
  public esTranslations: object = {
    azureBtn: "Ingresar con Azure/Office365",
    googleBtn: "Ingresar con Google",
    message: "Si eres un usuario nuevo, debes llamar a tu " +
      "representante de FLUID para registrarte.",
    recommend: "Te recomendamos encarecidamente el uso de un " +
      "segundo factor de autenticación, para más " +
      "información visita:",
    title: "Por favor ingresa.",
  };

  /**
   * Define def or production environment
   */
  // tslint:disable-next-line: no-inferrable-types
  public isProduction: boolean = false;

  /**
   * Component constructor
   */
  // tslint:disable-next-line: no-any
  public constructor(props: any) {
    super(props);
    this.handleLang();
    mixpanel.init("7a7ceb75ff1eed29f976310933d1cc3e");
    this.isProduction = window
      .location
      .toString()
      .indexOf("localhost:8000") === -1;
  }

  /**
   * Handle lang when component will mount
   * @return void
   */
  public componentWillMount(): void {
    this.handleLang();
  }

  /**
   * Raise social login (Azure)
   * @return void
   */
  public handleAzureLogin = (): void => {
    if (this.isProduction) {
      mixpanel.track("Login Azure");
    }
    window.location.href = "/oauth/login/azuread-oauth2/?username=&registered=&role=";
  }

  /**
   * Init language change (English)
   * @return void
   */
  public handleEN = (): void => {
    localStorage.setItem("lang", "en");
    this.setState(this.enTranslations);
    this.forceUpdate();
  }

  /**
   * Init language change (Spanish)
   * @return void
   */
  public handleES = (): void => {
    localStorage.setItem("lang", "es");
    this.setState(this.esTranslations);
    this.forceUpdate();
  }

  /**
   * Raise social login (Google)
   * @return void
   */
  public handleGoogleLogin = (): void => {
    if (this.isProduction) {
      mixpanel.track("Login Google");
    }
    window.location.href = "/oauth/login/google-oauth2/?username=&registered=&role=";
  }

  /**
   * Change the app's lang
   * @return void
   */
  public handleLang = (): void => {
    if (localStorage.getItem("lang") === "es") {
      localStorage.setItem("lang", "es");
      this.setState(this.esTranslations);
    } else {
      localStorage.setItem("lang", "en");
      this.setState(this.enTranslations);
    }
  }

  /**
   * Throw notification popup when ComponentDidUpdate
   * @param i any used as notification reference
   * @return void
   */
  // tslint:disable-next-line: no-any
  public notification = (i: any): void => {
    i.addNotification({
      children: (
        <div className={style.white}>
          <Grid>
            <Row className={style.text_center}>
              {this.state.recommend}
            </Row>
            <Row className={style.text_center}>
              <Col xs={12} md={6}>
                <Button
                  href="http://bit.ly/2Gpjt6h"
                  bsStyle="danger"
                  block={true}
                >
                  <FontAwesome name="google" className={style.near_top} stack="2x"/>&nbsp;
                </Button>
              </Col>
              <Col xs={12} md={6}>
                <Button
                  href="http://bit.ly/2Gp1L2X"
                  bsStyle="primary"
                  block={true}
                >
                  <FontAwesome name="windows" className={style.near_top} stack="2x"/>&nbsp;
                </Button>
              </Col>
            </Row>
          </Grid>
        </div>
      ),
      level: "info",
    });
  }

  /**
   * Return login tag
   * @return JSX.Element
   */
  public render(): JSX.Element {

    const notyStyle: INotificationStyle = {
      NotificationItem: {
        info: {
          backgroundColor: "#3D3C3C",
          color: "white",
        },
      },
    };

    return (
      <div>
        <Grid>
          <NotificationSystem ref={this.notification} style={notyStyle}/>
          <Row className={`show-grid ${style.text_center} ${style.first_row}`}>
            <Col md={4} lg={4}/>
            <Col md={4} lg={4} lgOffset={4} mdOffset={4}>
              <img  src={logo} alt="logo"/>
            </Col>
          </Row>
          <Row className={`show-grid ${style.white} ${style.top_space}`}>
            <Col md={4} lg={4}/>
            <Col md={4} lg={4} lgOffset={4} mdOffset={4}>
              <p className={style.text_center}>
                {this.state.title}
              </p>
              <p className={style.text_center}>
                {this.state.message}
              </p>
            </Col>
          </Row>
          <Row className={`show-grid ${style.top_space}`}>
            <Col md={4} lg={4}/>
            <Col md={4} lg={4} lgOffset={4} mdOffset={4}>
              <Button
                bsStyle="danger text-right"
                className={style.google_btn}
                onClick={this.handleGoogleLogin}
                block={true}
              >
                <FontAwesome name="google" stack="2x" className={style.fleft}/>
                {this.state.googleBtn}
              </Button>
            </Col>
          </Row>
          <Row className={`show-grid ${style.top_space}`}>
            <Col md={4} lg={4}/>
            <Col md={4} lg={4} lgOffset={4} mdOffset={4}>
            <Button
              bsStyle="primary text-right"
              className={style.azure_btn}
              onClick={this.handleAzureLogin}
              block={true}
            >
              <FontAwesome name="windows" stack="2x" className={style.fleft} />
              {this.state.azureBtn}
            </Button>
            </Col>
          </Row>
          <Row className={`show-grid ${style.top_space} ${style.text_center} ${style.white}`}>
            <Col md={4} lg={4}/>
            <Col
              md={4}
              lg={4}
              className={style.text_center}
            >
              <a
                onClick={this.handleES}
                className={style.lang_text}
              >
              ES
              </a>
              &nbsp;|&nbsp;
              <a
                onClick={this.handleEN}
                className={style.lang_text}
              >
              EN
              </a>
            </Col>
          </Row>
        </Grid>
      </div>

    );
  }
}

export = Access;
