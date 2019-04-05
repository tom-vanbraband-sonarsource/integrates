import React from "react";
import { ButtonToolbar, Col, Row } from "react-bootstrap";
import FontAwesome from "react-fontawesome";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Button } from "../../../../components/Button";
import { default as Modal } from "../../../../components/Modal/index";
import translate from "../../../../utils/translations/translate";
import { IDashboardState } from "../../reducer";
import { closeReportsModal, openReportsModal, ThunkDispatcher } from "./actions";
import style from "./index.css";

type IProjectFindingsBaseProps = Pick<RouteComponentProps<{ projectName: string }>, "match">;

type IProjectFindingsStateProps = IDashboardState["findings"];

interface IProjectFindingsDispatchProps {
  onCloseReportsModal(): void;
  onOpenReportsModal(): void;
}

type IProjectFindingsProps = IProjectFindingsBaseProps & (IProjectFindingsStateProps & IProjectFindingsDispatchProps);

const projectFindingsView: React.SFC<IProjectFindingsProps> = (props: IProjectFindingsProps): JSX.Element => {
  const { projectName } = props.match.params;

  const handleOpenReportsClick: (() => void) = (): void => { props.onOpenReportsModal(); };
  const handleCloseReportsClick: (() => void) = (): void => { props.onCloseReportsModal(); };
  const handleTechPdfClick: (() => void) = (): void => {
    location.assign(`/integrates/pdf/en/project/${projectName}/tech/`);
  };
  const handleTechXlsClick: (() => void) = (): void => {
    location.assign(`/integrates/xls/en/project/${projectName}`);
  };
  const handleExecPdfClick: (() => void) = (): void => {
    location.assign(`/integrates/pdf/en/project/${projectName}/presentation/`);
  };

  const modalFooter: JSX.Element = (
    <ButtonToolbar className="pull-right">
      <Button onClick={handleCloseReportsClick}>{translate.t("project.findings.report.modal_close")}</Button>
    </ButtonToolbar>
  );
  const execDownloadBtn: JSX.Element = (
    <Col md={12} className={style.downloadButtonsContainer}>
      <ButtonToolbar>
        <Button onClick={handleExecPdfClick}>
          <FontAwesome name="file-pdf-o" />&nbsp;PDF
        </Button>
      </ButtonToolbar>
    </Col>
  );

  return (
    <React.StrictMode>
      <ButtonToolbar className="pull-right">
        <Button onClick={handleOpenReportsClick}>{translate.t("project.findings.report.btn")}</Button>
      </ButtonToolbar>
      <Modal
        open={props.reportsModal.isOpen}
        footer={modalFooter}
        headerTitle={translate.t("project.findings.report.modal_title")}
      >
        <Row className={style.modalContainer}>
          <Col md={6} className={style.techReportContainer}>
            <h3>{translate.t("project.findings.report.tech_title")}</h3>
            <p>{translate.t("project.findings.report.tech_description")}</p>
            <br />
            <p>{translate.t("project.findings.report.tech_example")}</p>
            <Row>
              <Col md={12} className={style.downloadButtonsContainer}>
                <ButtonToolbar>
                  <Button onClick={handleTechPdfClick}>
                    <FontAwesome name="file-pdf-o" />&nbsp;PDF
                  </Button>
                  <Button onClick={handleTechXlsClick}>
                    <FontAwesome name="file-excel-o" />&nbsp;XLS
                  </Button>
                </ButtonToolbar>
              </Col>
            </Row>
          </Col>
          <Col md={6}>
            <h3>{translate.t("project.findings.report.exec_title")}</h3>
            {props.reportsModal.hasExecutive ? execDownloadBtn : <p>{translate.t("project.findings.report.exec_n")}</p>}
          </Col>
        </Row>
      </Modal>
    </React.StrictMode>
  );
};

interface IState { dashboard: IDashboardState; }
const mapStateToProps: MapStateToProps<IProjectFindingsStateProps, IProjectFindingsBaseProps, IState> =
  (state: IState): IProjectFindingsStateProps => ({
    ...state.dashboard.findings,
  });

const mapDispatchToProps: MapDispatchToProps<IProjectFindingsDispatchProps, IProjectFindingsBaseProps> =
  (dispatch: ThunkDispatcher): IProjectFindingsDispatchProps => ({
    onCloseReportsModal: (): void => { dispatch(closeReportsModal()); },
    onOpenReportsModal: (): void => { dispatch(openReportsModal()); },
  });

export = connect(mapStateToProps, mapDispatchToProps)(projectFindingsView);